import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

function normalizeExtension(fileName) {
  const ext = extname(fileName || "").toLowerCase().replace(".", "");
  if (!ext) {
    return "no_ext";
  }
  if (ext.length > 12) {
    return "other";
  }
  return ext;
}

function isUnderAllowedRoot(targetPath, allowedRoots) {
  const resolvedPath = resolve(targetPath);
  return allowedRoots.some((root) => {
    const resolvedRoot = resolve(root);
    return resolvedPath === resolvedRoot || resolvedPath.startsWith(`${resolvedRoot}/`);
  });
}

function normalizeCommandPrefix(input) {
  return String(input || "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeCommand(input) {
  return String(input || "")
    .trim()
    .replace(/\s+/g, " ");
}

const COMMAND_RECURSION_GUARD_KEYWORDS = (() => {
  const defaults = [
    "scripts/run-autonomy-smoke.sh",
    "scripts/web4-inspection.sh",
    "scripts/doctor-macos.sh",
    "scripts/ensure-runtime-up.sh",
    "scripts/dev-runtime.sh",
    "scripts/run-desktop-demo.sh",
    "services/api/mock-server.mjs",
    "services/bridge/bridge-server.mjs"
  ];
  const extra = String(process.env.ARIA_BRIDGE_COMMAND_RECURSION_GUARD || "")
    .split(",")
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...extra]));
})();

function matchesCommandRecursionGuard(command) {
  const normalized = normalizeCommand(command).toLowerCase();
  if (!normalized) {
    return false;
  }
  return COMMAND_RECURSION_GUARD_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isCommandAllowed(command, prefixes) {
  const normalizedCommand = normalizeCommand(command);
  if (!normalizedCommand) {
    return false;
  }
  const normalizedPrefixes = Array.isArray(prefixes)
    ? prefixes.map((item) => normalizeCommandPrefix(item)).filter(Boolean)
    : [];
  if (normalizedPrefixes.length === 0) {
    return false;
  }
  return normalizedPrefixes.some((prefix) => (
    normalizedCommand === prefix || normalizedCommand.startsWith(`${prefix} `)
  ));
}

function parseInteger(input, fallback, min, max) {
  const parsed = Number.parseInt(String(input ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function normalizeSearchTokens(input) {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);
  }
  return String(input || "")
    .toLowerCase()
    .split(/[\s,，。！？;；|/\\]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 36)
    .slice(0, 12);
}

function normalizeSearchExtensions(input) {
  const source = Array.isArray(input) ? input : String(input || "").split(/[\s,，;；|/\\]+/);
  const extensions = source
    .map((item) => String(item || "").trim().toLowerCase().replace(/^\./, ""))
    .filter((item) => item && item.length <= 12)
    .slice(0, 16);
  return Array.from(new Set(extensions));
}

function parseIsoTimeMs(input) {
  if (!input) {
    return 0;
  }
  const ms = Date.parse(String(input));
  return Number.isFinite(ms) ? ms : 0;
}

function buildSearchRoots(payload, allowedRoots) {
  const fromPayload = [];
  const normalizePath = (item) =>
    resolve(String(item || "").replace(/^~(?=\/)/, process.env.HOME || "~"));
  if (Array.isArray(payload?.targets)) {
    for (const target of payload.targets) {
      const normalized = normalizePath(target);
      if (normalized) {
        fromPayload.push(normalized);
      }
    }
  }
  if (payload?.target) {
    fromPayload.push(normalizePath(payload.target));
  }
  if (fromPayload.length === 0) {
    return allowedRoots;
  }
  const deduped = Array.from(new Set(fromPayload));
  return deduped.filter((item) => isUnderAllowedRoot(item, allowedRoots));
}

function fileMatchScore(nameLower, fullPathLower, tokens) {
  if (tokens.length === 0) {
    return 1;
  }
  let score = 0;
  let matchedTokens = 0;
  for (const token of tokens) {
    if (!token) continue;
    if (nameLower.includes(token)) {
      score += 3;
      matchedTokens += 1;
      continue;
    }
    if (fullPathLower.includes(token)) {
      score += 1;
      matchedTokens += 1;
    }
  }
  if (matchedTokens === 0) {
    return 0;
  }
  if (matchedTokens === tokens.length) {
    score += 2;
  }
  return score;
}

function searchFilesInRoots(roots, options = {}) {
  const maxScan = parseInteger(options.maxScan, 2500, 200, 40000);
  const maxDepth = parseInteger(options.maxDepth, 8, 1, 24);
  const maxResults = parseInteger(options.maxResults, 20, 1, 120);
  const tokens = normalizeSearchTokens(options.keywords || options.query || "");
  const extFilters = normalizeSearchExtensions(options.extensions || []);
  const modifiedAfterMs = parseIsoTimeMs(options.modifiedAfter);
  const modifiedBeforeMs = parseIsoTimeMs(options.modifiedBefore);
  const stack = roots.map((root) => ({
    dir: resolve(root),
    depth: 0
  }));
  const matches = [];
  let scanned = 0;

  while (stack.length > 0 && scanned < maxScan) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    let entries = [];
    try {
      entries = readdirSync(current.dir, {
        withFileTypes: true
      });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const fullPath = join(current.dir, entry.name);
      if (entry.isDirectory()) {
        if (current.depth + 1 <= maxDepth) {
          stack.push({
            dir: fullPath,
            depth: current.depth + 1
          });
        }
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      scanned += 1;
      if (scanned > maxScan) {
        break;
      }
      const ext = normalizeExtension(entry.name);
      if (extFilters.length > 0 && !extFilters.includes(ext)) {
        continue;
      }
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }
      const modifiedMs = stat.mtimeMs;
      if (modifiedAfterMs > 0 && modifiedMs < modifiedAfterMs) {
        continue;
      }
      if (modifiedBeforeMs > 0 && modifiedMs > modifiedBeforeMs) {
        continue;
      }
      const nameLower = entry.name.toLowerCase();
      const fullPathLower = fullPath.toLowerCase();
      const score = fileMatchScore(nameLower, fullPathLower, tokens);
      if (score <= 0) {
        continue;
      }
      matches.push({
        path: fullPath,
        name: entry.name,
        ext,
        sizeBytes: stat.size,
        modifiedAt: new Date(modifiedMs).toISOString(),
        score
      });
    }
  }

  matches.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return Date.parse(right.modifiedAt) - Date.parse(left.modifiedAt);
  });

  return {
    matches: matches.slice(0, maxResults),
    metrics: {
      scanned,
      matched: matches.length,
      maxScan,
      maxResults
    },
    keywords: tokens,
    extensions: extFilters
  };
}

export const adapter = {
  id: "workspace",
  name: "Workspace Organizer",
  capabilities: [
    {
      id: "desktop.file_organize",
      platform: "desktop",
      name: "桌面文件整理",
      risk: "medium"
    },
    {
      id: "desktop.file_search",
      platform: "desktop",
      name: "自然语言文件检索",
      risk: "medium"
    },
    {
      id: "mobile.photos_organize",
      platform: "mobile",
      name: "相册整理（目录模拟）",
      risk: "medium"
    },
    {
      id: "desktop.shell_automation",
      platform: "desktop",
      name: "命令行自动化",
      risk: "high"
    }
  ],
  actions: {
    "workspace.organize": async ({ payload, policy }) => {
      const defaultRoot = resolve(process.env.HOME || ".", "Desktop");
      const target = resolve(String(payload?.target || defaultRoot));
      const dryRun = payload?.dryRun !== false;
      const apply = payload?.apply === true && !dryRun;
      const maxItems = Number(policy?.workspace?.maxPlanItems || 300);
      const allowedRoots = Array.isArray(policy?.workspace?.allowedRoots)
        ? policy.workspace.allowedRoots.map((item) =>
            resolve(String(item || "").replace(/^~(?=\/)/, process.env.HOME || "~"))
          )
        : [defaultRoot];

      if (!existsSync(target) || !statSync(target).isDirectory()) {
        return {
          ok: false,
          reason: "target_not_directory",
          summary: "整理失败：目标目录不存在。",
          target
        };
      }
      if (!isUnderAllowedRoot(target, allowedRoots)) {
        return {
          ok: false,
          reason: "target_not_allowed",
          summary: "整理失败：目标目录不在允许范围内。",
          target,
          allowedRoots
        };
      }

      const entries = readdirSync(target, {
        withFileTypes: true
      }).filter((entry) => entry.isFile());
      const plans = [];
      for (const entry of entries.slice(0, maxItems)) {
        const ext = normalizeExtension(entry.name);
        const destinationDir = join(target, "Aria-Sorted", ext);
        const from = join(target, entry.name);
        const to = join(destinationDir, entry.name);
        plans.push({
          from,
          to,
          bucket: ext
        });
      }

      const moved = [];
      const skipped = [];
      if (apply) {
        for (const plan of plans) {
          try {
            mkdirSync(dirname(plan.to), {
              recursive: true
            });
            if (existsSync(plan.to)) {
              skipped.push({
                ...plan,
                reason: "destination_exists"
              });
              continue;
            }
            renameSync(plan.from, plan.to);
            moved.push(plan);
          } catch (error) {
            skipped.push({
              ...plan,
              reason: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }

      const summary = apply
        ? `整理执行完成：移动 ${moved.length} 项，跳过 ${skipped.length} 项。`
        : `整理规划完成：可处理 ${plans.length} 项（dry-run）。`;

      return {
        ok: true,
        summary,
        metrics: {
          planned: plans.length,
          moved: moved.length,
          skipped: skipped.length
        },
        plans: dryRun ? plans.slice(0, 60) : undefined,
        moved: moved.slice(0, 60),
        skipped: skipped.slice(0, 60),
        target,
        dryRun,
        apply
      };
    },
    "workspace.find_files": async ({ payload, policy }) => {
      const defaultRoot = resolve(process.env.HOME || ".", "Desktop");
      const allowedRoots = Array.isArray(policy?.workspace?.allowedRoots)
        ? policy.workspace.allowedRoots.map((item) =>
            resolve(String(item || "").replace(/^~(?=\/)/, process.env.HOME || "~"))
          )
        : [defaultRoot];
      const roots = buildSearchRoots(payload, allowedRoots)
        .filter((item) => existsSync(item))
        .filter((item) => statSync(item).isDirectory());
      if (roots.length === 0) {
        return {
          ok: false,
          reason: "target_not_allowed_or_missing",
          summary: "文件检索失败：目标目录不存在或不在允许范围内。",
          allowedRoots
        };
      }

      const searchResult = searchFilesInRoots(roots, {
        query: payload?.query || "",
        keywords: payload?.keywords || [],
        extensions: payload?.extensions || [],
        modifiedAfter: payload?.modifiedAfter || "",
        modifiedBefore: payload?.modifiedBefore || "",
        maxResults: payload?.maxResults,
        maxScan: payload?.maxScan,
        maxDepth: payload?.maxDepth
      });

      const summary = searchResult.matches.length > 0
        ? `文件检索完成：找到 ${searchResult.matches.length} 个候选结果。`
        : "文件检索完成：未命中结果，可放宽关键词或时间范围。";

      return {
        ok: true,
        reason: "file_search_completed",
        summary,
        query: String(payload?.query || ""),
        keywords: searchResult.keywords,
        extensions: searchResult.extensions,
        targets: roots,
        metrics: searchResult.metrics,
        matches: searchResult.matches
      };
    },
    "workspace.command": async ({ payload, policy, runCommand }) => {
      const defaultRoot = resolve(process.env.HOME || ".", "Desktop");
      const command = String(payload?.command || payload?.cmd || "").trim();
      if (!command) {
        return {
          ok: false,
          reason: "command_required",
          summary: "执行失败：缺少 command。"
        };
      }
      if (command.length > 800) {
        return {
          ok: false,
          reason: "command_too_long",
          summary: "执行失败：命令长度超出限制。"
        };
      }
      if (matchesCommandRecursionGuard(command)) {
        return {
          ok: false,
          reason: "command_recursive_guard_blocked",
          summary: "执行失败：命中递归防护闸，禁止触发运行时自检/拉起脚本链路。",
          command
        };
      }

      const allowedRoots = Array.isArray(policy?.workspace?.allowedRoots)
        ? policy.workspace.allowedRoots.map((item) =>
            resolve(String(item || "").replace(/^~(?=\/)/, process.env.HOME || "~"))
          )
        : [defaultRoot];
      const commandPrefixes = Array.isArray(policy?.workspace?.allowedCommandPrefixes)
        ? policy.workspace.allowedCommandPrefixes
        : [];
      const cwd = resolve(String(payload?.cwd || defaultRoot));
      const timeoutMs = Number.isFinite(Number(payload?.timeoutMs))
        ? Math.max(1000, Math.min(600000, Number(payload.timeoutMs)))
        : Number(policy?.workspace?.commandTimeoutMs || 120000);

      if (!isUnderAllowedRoot(cwd, allowedRoots)) {
        return {
          ok: false,
          reason: "cwd_not_allowed",
          summary: "执行失败：cwd 不在允许目录内。",
          cwd,
          allowedRoots
        };
      }
      if (!isCommandAllowed(command, commandPrefixes)) {
        return {
          ok: false,
          reason: "command_prefix_not_allowed",
          summary: "执行失败：命令前缀不在 allowlist。",
          command,
          allowedPrefixes: commandPrefixes
        };
      }

      const result = await runCommand(
        "/bin/zsh",
        ["-lc", command],
        {
          ignoreError: true,
          timeoutMs,
          cwd
        }
      );

      return {
        ok: result.ok,
        reason: result.ok ? "command_executed" : "command_failed",
        summary: result.ok
          ? `命令执行成功：${command}`
          : `命令执行失败（exit ${result.code}）：${command}`,
        command,
        cwd,
        exitCode: result.code,
        stdout: String(result.stdout || "").slice(0, 12000),
        stderr: String(result.stderr || "").slice(0, 12000),
        error: result.error || ""
      };
    }
  }
};
