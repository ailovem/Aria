import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOST = process.env.ARIA_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.ARIA_BRIDGE_PORT || 8788);
const BRIDGE_TIMEOUT_MS = Number(process.env.ARIA_BRIDGE_COMMAND_TIMEOUT_MS || 20000);
const VOICE_CHANNEL_LEASE_DEFAULT_MS = Number(process.env.ARIA_BRIDGE_VOICE_CHANNEL_LEASE_MS || 30000);
const VOICE_CHANNEL_LEASE_MIN_MS = Number(process.env.ARIA_BRIDGE_VOICE_CHANNEL_LEASE_MIN_MS || 5000);
const VOICE_CHANNEL_LEASE_MAX_MS = Number(process.env.ARIA_BRIDGE_VOICE_CHANNEL_LEASE_MAX_MS || 120000);
const OPENCLAW_BIN = String(process.env.ARIA_BRIDGE_OPENCLAW_BIN || "openclaw").trim() || "openclaw";
const OPENCLAW_VOICEWAKE_HOLD_TRIGGERS = String(
  process.env.ARIA_BRIDGE_OPENCLAW_VOICEWAKE_HOLD_TRIGGERS || "__aria_voice_hold__"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const OPENCLAW_VOICEWAKE_MUTEX_ENABLED = process.env.ARIA_BRIDGE_OPENCLAW_VOICEWAKE_MUTEX !== "false";
const VOICE_PRESET_LIBRARY = Object.freeze([
  {
    id: "gentle_female",
    label: "温柔女生",
    voice: "Flo (中文（中国大陆）)",
    rate: 178,
    description: "温柔自然，适合陪伴对话。"
  },
  {
    id: "natural_female",
    label: "真人女声",
    voice: "Meijia",
    rate: 176,
    description: "偏真人质感，语速更柔和。"
  },
  {
    id: "steady_male",
    label: "稳重男声",
    voice: "Eddy (中文（中国大陆）)",
    rate: 182,
    description: "稳定清晰，适合播报场景。"
  }
]);

const __dirname = dirname(fileURLToPath(import.meta.url));
const adaptersDir = resolve(__dirname, "adapters");
const policyFile = resolve(__dirname, "bridge-policy.json");

const runtime = {
  loadedAt: "",
  policy: {},
  adapters: [],
  capabilities: [],
  actionHandlers: new Map()
};

const voiceChannelRuntime = {
  owner: "",
  token: "",
  acquiredAt: "",
  leaseMs: 0,
  expiresAtMs: 0,
  lastReason: "idle",
  lastUpdatedAt: "",
  openclaw: {
    holdApplied: false,
    previousTriggers: null,
    lastError: "",
    lastSyncedAt: ""
  }
};

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function sanitizeVoiceNameInput(input, fallback) {
  const value = String(input || "").trim();
  if (!value) {
    return fallback;
  }
  if (value.length > 80 || /[\r\n\t]/.test(value)) {
    return fallback;
  }
  return value;
}

function resolveVoicePreset(inputId) {
  const presetId = String(inputId || "").trim();
  if (!presetId) {
    return null;
  }
  return VOICE_PRESET_LIBRARY.find((item) => item.id === presetId) || null;
}

function normalizeVoiceRateInput(value, fallback = 178) {
  return clampInteger(value, fallback, 120, 320);
}

function buildVoiceProfileSnapshot() {
  const defaultVoice = String(runtime.policy?.voice?.defaultVoice || VOICE_PRESET_LIBRARY[0].voice);
  const defaultRate = normalizeVoiceRateInput(runtime.policy?.voice?.defaultRate, VOICE_PRESET_LIBRARY[0].rate);
  const allowMicCapture = runtime.policy?.voice?.allowMicCapture !== false;
  const exactMatch = VOICE_PRESET_LIBRARY.find(
    (item) => item.voice === defaultVoice && item.rate === defaultRate
  );
  const looseMatch = exactMatch || VOICE_PRESET_LIBRARY.find((item) => item.voice === defaultVoice) || null;
  return {
    defaultVoice,
    defaultRate,
    allowMicCapture,
    activePresetId: looseMatch?.id || "",
    presets: VOICE_PRESET_LIBRARY.map((item) => ({
      ...item
    }))
  };
}

function persistVoiceProfilePatch(patch = {}) {
  const nextVoice = {
    ...runtime.policy?.voice,
    ...patch
  };
  const sourcePolicy = (() => {
    if (!existsSync(policyFile)) {
      return {};
    }
    try {
      return JSON.parse(readFileSync(policyFile, "utf8"));
    } catch {
      return {};
    }
  })();
  const persisted = normalizePolicy({
    ...sourcePolicy,
    voice: nextVoice
  });
  writeFileSync(policyFile, `${JSON.stringify(persisted, null, 2)}\n`, "utf8");
  runtime.policy = persisted;
  runtime.loadedAt = new Date().toISOString();
  return buildVoiceProfileSnapshot();
}

function asIsoTimestamp(valueMs = Date.now()) {
  return new Date(valueMs).toISOString();
}

function parseJsonObject(raw, fallback = null) {
  try {
    const parsed = JSON.parse(String(raw || ""));
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function normalizeTriggerList(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function compactMessage(input, maxLength = 220) {
  const normalized = String(input || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(40, maxLength - 3))}...`;
}

function isOpenclawUnavailableMessage(input) {
  const text = String(input || "").toLowerCase();
  if (!text) {
    return false;
  }
  return (
    text.includes("config invalid")
    || text.includes("invalid config")
    || text.includes("gateway closed")
    || text.includes("econnrefused")
    || text.includes("command not found")
    || text.includes("enoent")
  );
}

function isVoiceChannelActive() {
  return Boolean(voiceChannelRuntime.token)
    && Number.isFinite(voiceChannelRuntime.expiresAtMs)
    && voiceChannelRuntime.expiresAtMs > Date.now();
}

function buildVoiceChannelSnapshot({ includeToken = false } = {}) {
  const active = isVoiceChannelActive();
  const expiresInMs = active ? Math.max(0, voiceChannelRuntime.expiresAtMs - Date.now()) : 0;
  return {
    active,
    owner: active ? voiceChannelRuntime.owner : "",
    token: includeToken && active ? voiceChannelRuntime.token : "",
    tokenPreview:
      active && voiceChannelRuntime.token
        ? `${voiceChannelRuntime.token.slice(0, 8)}...${voiceChannelRuntime.token.slice(-4)}`
        : "",
    acquiredAt: active ? voiceChannelRuntime.acquiredAt : "",
    leaseMs: active ? voiceChannelRuntime.leaseMs : 0,
    expiresAt: active ? asIsoTimestamp(voiceChannelRuntime.expiresAtMs) : "",
    expiresInMs,
    lastReason: voiceChannelRuntime.lastReason || "idle",
    lastUpdatedAt: voiceChannelRuntime.lastUpdatedAt || "",
    openclaw: {
      mutexEnabled: OPENCLAW_VOICEWAKE_MUTEX_ENABLED,
      holdApplied: voiceChannelRuntime.openclaw.holdApplied === true,
      previousTriggers:
        voiceChannelRuntime.openclaw.previousTriggers === null
          ? []
          : normalizeTriggerList(voiceChannelRuntime.openclaw.previousTriggers),
      lastError: String(voiceChannelRuntime.openclaw.lastError || ""),
      lastSyncedAt: String(voiceChannelRuntime.openclaw.lastSyncedAt || "")
    }
  };
}

function updateVoiceChannelLease(owner, token, leaseMs) {
  const nowMs = Date.now();
  voiceChannelRuntime.owner = owner;
  voiceChannelRuntime.token = token;
  voiceChannelRuntime.leaseMs = clampInteger(
    leaseMs,
    VOICE_CHANNEL_LEASE_DEFAULT_MS,
    VOICE_CHANNEL_LEASE_MIN_MS,
    VOICE_CHANNEL_LEASE_MAX_MS
  );
  voiceChannelRuntime.acquiredAt = voiceChannelRuntime.acquiredAt || asIsoTimestamp(nowMs);
  voiceChannelRuntime.expiresAtMs = nowMs + voiceChannelRuntime.leaseMs;
  voiceChannelRuntime.lastUpdatedAt = asIsoTimestamp(nowMs);
}

function clearVoiceChannelLease(reason = "released") {
  voiceChannelRuntime.owner = "";
  voiceChannelRuntime.token = "";
  voiceChannelRuntime.acquiredAt = "";
  voiceChannelRuntime.leaseMs = 0;
  voiceChannelRuntime.expiresAtMs = 0;
  voiceChannelRuntime.lastReason = reason;
  voiceChannelRuntime.lastUpdatedAt = asIsoTimestamp();
}

async function queryOpenclawVoicewakeTriggers() {
  const response = await runCommand(
    OPENCLAW_BIN,
    ["gateway", "call", "voicewake.get", "--json"],
    {
      ignoreError: true,
      timeoutMs: 8000
    }
  );
  if (!response.ok) {
    return {
      ok: false,
      error: compactMessage(response.error || response.stderr || "voicewake_get_failed"),
      triggers: []
    };
  }
  const payload = parseJsonObject(response.stdout, {}) || {};
  return {
    ok: true,
    triggers: normalizeTriggerList(payload.triggers)
  };
}

async function setOpenclawVoicewakeTriggers(triggers = []) {
  const normalized = normalizeTriggerList(triggers);
  const params = JSON.stringify({
    triggers: normalized
  });
  const response = await runCommand(
    OPENCLAW_BIN,
    ["gateway", "call", "voicewake.set", "--params", params, "--json"],
    {
      ignoreError: true,
      timeoutMs: 10000
    }
  );
  if (!response.ok) {
    return {
      ok: false,
      error: compactMessage(response.error || response.stderr || "voicewake_set_failed"),
      triggers: normalized
    };
  }
  const payload = parseJsonObject(response.stdout, {}) || {};
  return {
    ok: true,
    triggers: normalizeTriggerList(payload.triggers)
  };
}

async function applyOpenclawVoicewakeHold() {
  if (!OPENCLAW_VOICEWAKE_MUTEX_ENABLED) {
    return {
      ok: true,
      reason: "voicewake_mutex_disabled"
    };
  }
  if (voiceChannelRuntime.openclaw.holdApplied) {
    return {
      ok: true,
      reason: "voicewake_hold_already_applied"
    };
  }
  if (OPENCLAW_VOICEWAKE_HOLD_TRIGGERS.length === 0) {
    return {
      ok: false,
      reason: "voicewake_hold_trigger_missing",
      error: "ARIA_BRIDGE_OPENCLAW_VOICEWAKE_HOLD_TRIGGERS is empty"
    };
  }

  const current = await queryOpenclawVoicewakeTriggers();
  if (!current.ok) {
    const compactError = compactMessage(current.error || "voicewake_get_failed");
    voiceChannelRuntime.openclaw.lastError = compactError;
    if (isOpenclawUnavailableMessage(compactError)) {
      voiceChannelRuntime.openclaw.lastSyncedAt = asIsoTimestamp();
      return {
        ok: true,
        reason: "voicewake_unavailable_skip",
        skipped: true
      };
    }
    return {
      ok: false,
      reason: "voicewake_get_failed",
      error: compactError
    };
  }
  voiceChannelRuntime.openclaw.previousTriggers = current.triggers;

  const applied = await setOpenclawVoicewakeTriggers(OPENCLAW_VOICEWAKE_HOLD_TRIGGERS);
  if (!applied.ok) {
    const compactError = compactMessage(applied.error || "voicewake_set_failed");
    voiceChannelRuntime.openclaw.lastError = compactError;
    if (isOpenclawUnavailableMessage(compactError)) {
      voiceChannelRuntime.openclaw.lastSyncedAt = asIsoTimestamp();
      return {
        ok: true,
        reason: "voicewake_unavailable_skip",
        skipped: true
      };
    }
    return {
      ok: false,
      reason: "voicewake_set_failed",
      error: compactError
    };
  }

  voiceChannelRuntime.openclaw.holdApplied = true;
  voiceChannelRuntime.openclaw.lastError = "";
  voiceChannelRuntime.openclaw.lastSyncedAt = asIsoTimestamp();
  return {
    ok: true,
    reason: "voicewake_hold_applied",
    triggers: applied.triggers
  };
}

async function restoreOpenclawVoicewakeHold() {
  if (!OPENCLAW_VOICEWAKE_MUTEX_ENABLED) {
    return {
      ok: true,
      reason: "voicewake_mutex_disabled"
    };
  }
  if (!voiceChannelRuntime.openclaw.holdApplied) {
    return {
      ok: true,
      reason: "voicewake_hold_not_active"
    };
  }
  if (voiceChannelRuntime.openclaw.previousTriggers === null) {
    voiceChannelRuntime.openclaw.holdApplied = false;
    return {
      ok: true,
      reason: "voicewake_restore_skipped"
    };
  }

  const restored = await setOpenclawVoicewakeTriggers(voiceChannelRuntime.openclaw.previousTriggers);
  if (!restored.ok) {
    voiceChannelRuntime.openclaw.lastError = compactMessage(restored.error || "voicewake_restore_failed");
    return {
      ok: false,
      reason: "voicewake_restore_failed",
      error: compactMessage(restored.error || "voicewake_restore_failed")
    };
  }

  voiceChannelRuntime.openclaw.holdApplied = false;
  voiceChannelRuntime.openclaw.previousTriggers = null;
  voiceChannelRuntime.openclaw.lastError = "";
  voiceChannelRuntime.openclaw.lastSyncedAt = asIsoTimestamp();
  return {
    ok: true,
    reason: "voicewake_restore_done",
    triggers: restored.triggers
  };
}

async function clearVoiceChannelLock(reason = "released") {
  const restore = await restoreOpenclawVoicewakeHold();
  if (!restore.ok) {
    voiceChannelRuntime.lastReason = `${reason}_voicewake_restore_failed`;
    voiceChannelRuntime.lastUpdatedAt = asIsoTimestamp();
    return {
      ok: false,
      reason: "voicewake_restore_failed",
      summary: "语音通道释放时，OpenClaw 唤醒词恢复失败。",
      restore,
      channel: buildVoiceChannelSnapshot()
    };
  }
  clearVoiceChannelLease(reason);
  return {
    ok: true,
    reason: "voice_channel_released",
    summary: "语音通道已释放。",
    channel: buildVoiceChannelSnapshot(),
    restore
  };
}

async function reconcileVoiceChannelExpiry() {
  if (!voiceChannelRuntime.token) {
    return;
  }
  if (isVoiceChannelActive()) {
    return;
  }
  await clearVoiceChannelLock("expired");
}

async function acquireVoiceChannel(payload = {}) {
  await reconcileVoiceChannelExpiry();

  const owner = String(payload?.owner || "").trim() || "aria-desktop";
  const requestedLeaseMs = clampInteger(
    payload?.leaseMs,
    VOICE_CHANNEL_LEASE_DEFAULT_MS,
    VOICE_CHANNEL_LEASE_MIN_MS,
    VOICE_CHANNEL_LEASE_MAX_MS
  );

  if (isVoiceChannelActive()) {
    if (voiceChannelRuntime.owner !== owner) {
      voiceChannelRuntime.lastReason = "voice_channel_busy";
      voiceChannelRuntime.lastUpdatedAt = asIsoTimestamp();
      return {
        ok: false,
        reason: "voice_channel_busy",
        summary: `语音通道正在被 ${voiceChannelRuntime.owner} 占用。`,
        channel: buildVoiceChannelSnapshot()
      };
    }
    updateVoiceChannelLease(owner, voiceChannelRuntime.token, requestedLeaseMs);
    voiceChannelRuntime.lastReason = "voice_channel_renewed";
    return {
      ok: true,
      reason: "voice_channel_renewed",
      summary: "语音通道续租成功。",
      channel: buildVoiceChannelSnapshot({
        includeToken: true
      })
    };
  }

  updateVoiceChannelLease(owner, randomUUID(), requestedLeaseMs);
  voiceChannelRuntime.lastReason = "voice_channel_acquired";
  const hold = await applyOpenclawVoicewakeHold();
  const holdSkipped = hold && typeof hold === "object" && hold.skipped === true;
  return {
    ok: true,
    reason: hold.ok ? "voice_channel_acquired" : "voice_channel_acquired_with_warning",
    summary: hold.ok
      ? holdSkipped
        ? "语音通道已独占（OpenClaw 未在线，已跳过挂起）。"
        : "语音通道已独占，OpenClaw 语音已挂起。"
      : "语音通道已独占，但 OpenClaw 语音挂起失败，请手动检查。",
    warning: hold.ok ? "" : compactMessage(hold.error || hold.reason || "voicewake_hold_failed"),
    channel: buildVoiceChannelSnapshot({
      includeToken: true
    }),
    hold
  };
}

async function renewVoiceChannel(payload = {}) {
  await reconcileVoiceChannelExpiry();
  const token = String(payload?.token || "").trim();
  if (!token) {
    return {
      ok: false,
      reason: "token_required",
      summary: "续租失败：缺少 token。",
      channel: buildVoiceChannelSnapshot()
    };
  }
  if (!isVoiceChannelActive()) {
    return {
      ok: false,
      reason: "voice_channel_inactive",
      summary: "续租失败：语音通道已失效。",
      channel: buildVoiceChannelSnapshot()
    };
  }
  if (token !== voiceChannelRuntime.token) {
    return {
      ok: false,
      reason: "token_mismatch",
      summary: "续租失败：token 不匹配。",
      channel: buildVoiceChannelSnapshot()
    };
  }
  const leaseMs = clampInteger(
    payload?.leaseMs,
    voiceChannelRuntime.leaseMs || VOICE_CHANNEL_LEASE_DEFAULT_MS,
    VOICE_CHANNEL_LEASE_MIN_MS,
    VOICE_CHANNEL_LEASE_MAX_MS
  );
  updateVoiceChannelLease(voiceChannelRuntime.owner, token, leaseMs);
  voiceChannelRuntime.lastReason = "voice_channel_renewed";
  const hold = await applyOpenclawVoicewakeHold();
  const holdSkipped = hold && typeof hold === "object" && hold.skipped === true;
  return {
    ok: true,
    reason: hold.ok ? "voice_channel_renewed" : "voice_channel_renewed_with_warning",
    summary: hold.ok
      ? holdSkipped
        ? "语音通道续租成功（OpenClaw 未在线，跳过挂起）。"
        : "语音通道续租成功。"
      : "语音通道续租成功，但 OpenClaw 语音挂起失败。",
    warning: hold.ok ? "" : compactMessage(hold.error || hold.reason || "voicewake_hold_failed"),
    channel: buildVoiceChannelSnapshot({
      includeToken: true
    }),
    hold
  };
}

async function releaseVoiceChannel(payload = {}) {
  await reconcileVoiceChannelExpiry();
  if (!voiceChannelRuntime.token || !isVoiceChannelActive()) {
    return {
      ok: true,
      reason: "voice_channel_already_idle",
      summary: "语音通道当前空闲。",
      channel: buildVoiceChannelSnapshot()
    };
  }
  const token = String(payload?.token || "").trim();
  if (!token) {
    return {
      ok: false,
      reason: "token_required",
      summary: "释放失败：缺少 token。",
      channel: buildVoiceChannelSnapshot()
    };
  }
  if (token !== voiceChannelRuntime.token) {
    return {
      ok: false,
      reason: "token_mismatch",
      summary: "释放失败：token 不匹配。",
      channel: buildVoiceChannelSnapshot()
    };
  }
  return clearVoiceChannelLock("released");
}

function normalizePolicy(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const defaultRoots = [resolve(process.env.HOME || ".", "Desktop")];
  const defaultCommandPrefixes = [
    "npm run",
    "npm install",
    "node",
    "python3",
    "bash",
    "git status",
    "git diff",
    "git log",
    "flutter pub get",
    "flutter run"
  ];
  return {
    version: String(source.version || "2026.3.3"),
    workspace: {
      allowedRoots: Array.isArray(source.workspace?.allowedRoots)
        ? source.workspace.allowedRoots.map((item) =>
            String(item || "").replace(/^~(?=\/)/, process.env.HOME || "~")
          )
        : defaultRoots,
      maxPlanItems: clampInteger(source.workspace?.maxPlanItems, 300, 10, 1000),
      allowedCommandPrefixes: Array.isArray(source.workspace?.allowedCommandPrefixes)
        ? source.workspace.allowedCommandPrefixes
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        : defaultCommandPrefixes,
      commandTimeoutMs: clampInteger(source.workspace?.commandTimeoutMs, 120000, 1000, 600000)
    },
    voice: {
      defaultVoice: String(source.voice?.defaultVoice || "Flo (中文（中国大陆）)"),
      defaultRate: clampInteger(source.voice?.defaultRate, 178, 120, 320),
      allowMicCapture: source.voice?.allowMicCapture !== false
    },
    actions: source.actions && typeof source.actions === "object" ? source.actions : {}
  };
}

function loadPolicy() {
  if (!existsSync(policyFile)) {
    runtime.policy = normalizePolicy({});
    return;
  }
  try {
    const parsed = JSON.parse(readFileSync(policyFile, "utf8"));
    runtime.policy = normalizePolicy(parsed);
  } catch {
    runtime.policy = normalizePolicy({});
  }
}

async function runCommand(bin, args = [], options = {}) {
  const timeoutMs = clampInteger(options.timeoutMs, BRIDGE_TIMEOUT_MS, 500, 300000);
  const cwd =
    typeof options.cwd === "string" && options.cwd.trim()
      ? resolve(options.cwd.trim())
      : undefined;
  return new Promise((resolveRun) => {
    execFile(
      bin,
      args,
      {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 6,
        cwd
      },
      (error, stdout, stderr) => {
        if (!error) {
          resolveRun({
            ok: true,
            stdout: String(stdout || "").trim(),
            stderr: String(stderr || "").trim(),
            code: 0
          });
          return;
        }
        if (options.ignoreError) {
          resolveRun({
            ok: false,
            stdout: String(stdout || "").trim(),
            stderr: String(stderr || "").trim(),
            code: typeof error.code === "number" ? error.code : -1,
            error: error.message
          });
          return;
        }
        resolveRun({
          ok: false,
          stdout: String(stdout || "").trim(),
          stderr: String(stderr || "").trim(),
          code: typeof error.code === "number" ? error.code : -1,
          error: error.message
        });
      }
    );
  });
}

async function loadAdapters() {
  runtime.adapters = [];
  runtime.capabilities = [];
  runtime.actionHandlers = new Map();

  if (!existsSync(adaptersDir) || !statSync(adaptersDir).isDirectory()) {
    return;
  }

  const files = readdirSync(adaptersDir)
    .filter((item) => item.endsWith(".mjs"))
    .sort();

  for (const fileName of files) {
    const filePath = resolve(adaptersDir, fileName);
    try {
      const imported = await import(`${pathToFileURL(filePath).href}?v=${Date.now()}`);
      const adapter = imported.adapter;
      if (!adapter || typeof adapter !== "object") {
        continue;
      }
      const id = String(adapter.id || fileName.replace(/\.mjs$/, ""));
      const name = String(adapter.name || id);
      const capabilities = Array.isArray(adapter.capabilities) ? adapter.capabilities : [];
      const actions = adapter.actions && typeof adapter.actions === "object" ? adapter.actions : {};

      runtime.adapters.push({
        id,
        name,
        file: fileName
      });
      for (const capability of capabilities) {
        runtime.capabilities.push({
          ...capability,
          adapterId: id
        });
      }
      for (const [action, handler] of Object.entries(actions)) {
        if (typeof handler !== "function") {
          continue;
        }
        runtime.actionHandlers.set(action, {
          adapterId: id,
          handler
        });
      }
    } catch (error) {
      runtime.adapters.push({
        id: fileName.replace(/\.mjs$/, ""),
        name: "load_failed",
        file: fileName,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

function toJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024 * 2) {
        rejectBody(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolveBody({});
        return;
      }
      try {
        resolveBody(JSON.parse(raw));
      } catch {
        rejectBody(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", rejectBody);
  });
}

function isActionEnabled(action) {
  const config = runtime.policy.actions[action];
  if (!config || typeof config !== "object") {
    return true;
  }
  return config.enabled !== false;
}

async function executeAction(action, payload = {}) {
  if (!isActionEnabled(action)) {
    return {
      ok: false,
      reason: "action_disabled_by_policy",
      summary: `Action ${action} is disabled by policy.`
    };
  }

  const actionEntry = runtime.actionHandlers.get(action);
  if (!actionEntry) {
    return {
      ok: false,
      reason: "action_not_found",
      summary: `Action ${action} not found.`
    };
  }

  try {
    const result = await actionEntry.handler({
      payload,
      policy: runtime.policy,
      runCommand,
      now: new Date().toISOString(),
      platform: process.platform
    });
    if (!result || typeof result !== "object") {
      return {
        ok: true,
        summary: "Action executed.",
        adapterId: actionEntry.adapterId
      };
    }
    return {
      ...result,
      adapterId: actionEntry.adapterId
    };
  } catch (error) {
    return {
      ok: false,
      reason: "action_exception",
      summary: `Action ${action} failed with exception.`,
      error: error instanceof Error ? error.message : String(error),
      adapterId: actionEntry.adapterId
    };
  }
}

async function bootstrap() {
  loadPolicy();
  await loadAdapters();
  runtime.loadedAt = new Date().toISOString();
}

await bootstrap();

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    toJson(res, 400, {
      error: "Bad request"
    });
    return;
  }

  if (req.method === "OPTIONS") {
    toJson(res, 204, {});
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  try {
    if (req.method === "GET" && pathname === "/health") {
      toJson(res, 200, {
        ok: true,
        service: "aria-bridge",
        loadedAt: runtime.loadedAt,
        adapters: runtime.adapters.length,
        actions: runtime.actionHandlers.size,
        policyVersion: runtime.policy.version
      });
      return;
    }

    if (req.method === "GET" && pathname === "/v1/policy") {
      toJson(res, 200, {
        policy: runtime.policy,
        loadedAt: runtime.loadedAt
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/policy/reload") {
      await bootstrap();
      toJson(res, 200, {
        ok: true,
        loadedAt: runtime.loadedAt,
        policy: runtime.policy,
        adapters: runtime.adapters
      });
      return;
    }

    if (req.method === "GET" && pathname === "/v1/capabilities") {
      toJson(res, 200, {
        capabilities: runtime.capabilities,
        actions: Array.from(runtime.actionHandlers.keys()).sort(),
        adapters: runtime.adapters
      });
      return;
    }

    if (req.method === "GET" && pathname === "/v1/hardware/snapshot") {
      const result = await executeAction("hardware.snapshot", {});
      toJson(res, 200, {
        ok: result.ok !== false,
        result,
        snapshot: result.snapshot || null
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/voice/tts") {
      const body = await parseBody(req);
      const result = await executeAction("voice.tts", body || {});
      toJson(res, 200, {
        ok: result.ok !== false,
        result
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/voice/stt") {
      const body = await parseBody(req);
      const result = await executeAction("voice.stt", body || {});
      toJson(res, 200, {
        ok: result.ok !== false,
        result
      });
      return;
    }

    if (req.method === "GET" && pathname === "/v1/voice/profile") {
      toJson(res, 200, {
        ok: true,
        profile: buildVoiceProfileSnapshot()
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/voice/profile") {
      const body = await parseBody(req);
      const preset = resolveVoicePreset(body?.presetId);
      if (String(body?.presetId || "").trim() && !preset) {
        toJson(res, 400, {
          ok: false,
          error: "invalid_preset_id",
          presets: VOICE_PRESET_LIBRARY.map((item) => ({
            id: item.id,
            label: item.label
          }))
        });
        return;
      }
      const currentVoice = String(runtime.policy?.voice?.defaultVoice || VOICE_PRESET_LIBRARY[0].voice);
      const currentRate = normalizeVoiceRateInput(runtime.policy?.voice?.defaultRate, VOICE_PRESET_LIBRARY[0].rate);
      const nextVoice = preset
        ? preset.voice
        : sanitizeVoiceNameInput(body?.defaultVoice ?? body?.voice, currentVoice);
      const nextRate = preset
        ? preset.rate
        : normalizeVoiceRateInput(body?.defaultRate ?? body?.rate, currentRate);
      const nextAllowMicCapture = body?.allowMicCapture === undefined
        ? runtime.policy?.voice?.allowMicCapture !== false
        : body.allowMicCapture === true;
      const profile = persistVoiceProfilePatch({
        defaultVoice: nextVoice,
        defaultRate: nextRate,
        allowMicCapture: nextAllowMicCapture
      });
      toJson(res, 200, {
        ok: true,
        result: {
          ok: true,
          reason: "voice_profile_updated",
          summary: `默认音色已切换为 ${profile.defaultVoice}（${profile.defaultRate}）`,
          profile
        }
      });
      return;
    }

    if (req.method === "GET" && pathname === "/v1/voice/channel/status") {
      await reconcileVoiceChannelExpiry();
      toJson(res, 200, {
        ok: true,
        channel: buildVoiceChannelSnapshot()
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/voice/channel/acquire") {
      const body = await parseBody(req);
      const result = await acquireVoiceChannel(body || {});
      toJson(res, 200, {
        ok: result.ok !== false,
        result
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/voice/channel/renew") {
      const body = await parseBody(req);
      const result = await renewVoiceChannel(body || {});
      toJson(res, 200, {
        ok: result.ok !== false,
        result
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/voice/channel/release") {
      const body = await parseBody(req);
      const result = await releaseVoiceChannel(body || {});
      toJson(res, 200, {
        ok: result.ok !== false,
        result
      });
      return;
    }

    if (req.method === "POST" && pathname === "/v1/actions/execute") {
      const body = await parseBody(req);
      const action = String(body.action || "").trim();
      if (!action) {
        toJson(res, 400, {
          error: "action is required"
        });
        return;
      }
      const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
      const result = await executeAction(action, payload);
      toJson(res, 200, {
        ok: result.ok !== false,
        action,
        result
      });
      return;
    }

    toJson(res, 404, {
      error: "Not found"
    });
  } catch (error) {
    toJson(res, 500, {
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[aria-bridge] listening on http://${HOST}:${PORT}`);
  console.log(`[aria-bridge] adapters: ${runtime.adapters.length}, actions: ${runtime.actionHandlers.size}`);
  console.log(`[aria-bridge] policy version: ${runtime.policy.version}`);
});
