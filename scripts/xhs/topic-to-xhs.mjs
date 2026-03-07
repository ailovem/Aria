import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

const DEFAULT_XHS_URL = "https://creator.xiaohongshu.com/publish/publish";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"]);

function safeText(input, fallback = "") {
  const value = String(input ?? "").trim();
  return value || fallback;
}

function nowStamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function parseArgs(argv = []) {
  const output = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = String(argv[index] || "");
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    if (["publish", "headless", "skip-upload", "help", "non-interactive"].includes(key)) {
      output[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || String(value).startsWith("--")) {
      output[key] = "";
      continue;
    }
    output[key] = String(value);
    index += 1;
  }
  return output;
}

function printHelp() {
  process.stdout.write(
    [
      "用法：",
      "node scripts/xhs/topic-to-xhs.mjs --theme \"主题\" --assets /path/to/assets [--publish] [--skip-upload] [--headless]",
      "",
      "参数：",
      "--theme         内容主题（必填，除非使用 --config）",
      "--assets        素材目录（图片/视频）",
      "--config        JSON 配置文件路径",
      "--out           输出目录（默认 output/xhs-pipeline）",
      "--publish       自动点击发布（默认仅上传并停留在发布页）",
      "--skip-upload   仅执行文案+剪辑，不做浏览器上传",
      "--headless      无头浏览器模式（首次登录不建议）",
      "--model         文案模型（默认 gpt-4.1-mini）"
    ].join("\n") + "\n"
  );
}

function loadJsonConfig(filePathInput = "") {
  const filePath = resolve(String(filePathInput || "").trim());
  if (!filePathInput) {
    return {};
  }
  if (!existsSync(filePath)) {
    throw new Error(`配置文件不存在: ${filePath}`);
  }
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("配置文件内容非法");
  }
  return parsed;
}

function mergeConfig(cliInput = {}, fileConfig = {}) {
  const cwd = process.cwd();
  const runtimeDefault = {
    theme: "",
    assetsDir: resolve(cwd, "output/xhs-assets"),
    outputRoot: resolve(cwd, "output/xhs-pipeline"),
    tempKeep: false,
    maxAssets: 8,
    clipDurationImageSec: 2.8,
    clipDurationVideoSec: 6.0,
    publish: false,
    headless: false,
    skipUpload: false,
    nonInteractive: false,
    model: safeText(process.env.XHS_COPY_MODEL, "gpt-4.1-mini"),
    openaiBaseUrl: safeText(process.env.OPENAI_BASE_URL || process.env.ARIA_MODEL_OPENAI_BASE, "https://api.openai.com/v1"),
    openaiApiKey: safeText(process.env.OPENAI_API_KEY),
    xhs: {
      publishUrl: DEFAULT_XHS_URL,
      userDataDir: resolve(cwd, ".runtime/xhs-playwright-profile")
    }
  };
  const combined = {
    ...runtimeDefault,
    ...fileConfig,
    ...Object.fromEntries(
      Object.entries(cliInput).map(([key, value]) => {
        if (key === "assets") return ["assetsDir", value];
        if (key === "out") return ["outputRoot", value];
        if (key === "skip-upload") return ["skipUpload", true];
        return [key, value];
      })
    )
  };
  combined.theme = safeText(combined.theme);
  combined.assetsDir = resolve(String(combined.assetsDir || runtimeDefault.assetsDir));
  combined.outputRoot = resolve(String(combined.outputRoot || runtimeDefault.outputRoot));
  combined.publish = combined.publish === true;
  combined.headless = combined.headless === true;
  combined.skipUpload = combined.skipUpload === true;
  combined.nonInteractive = combined.nonInteractive === true;
  combined.maxAssets = Math.max(1, Math.min(24, Number(combined.maxAssets || runtimeDefault.maxAssets)));
  combined.clipDurationImageSec = Math.max(1, Math.min(20, Number(combined.clipDurationImageSec || runtimeDefault.clipDurationImageSec)));
  combined.clipDurationVideoSec = Math.max(1, Math.min(30, Number(combined.clipDurationVideoSec || runtimeDefault.clipDurationVideoSec)));
  combined.xhs = {
    publishUrl: safeText(combined?.xhs?.publishUrl, DEFAULT_XHS_URL),
    userDataDir: resolve(String(combined?.xhs?.userDataDir || runtimeDefault.xhs.userDataDir))
  };
  return combined;
}

function ensureDir(pathInput = "") {
  const target = resolve(String(pathInput || "."));
  mkdirSync(target, {
    recursive: true
  });
  return target;
}

function ensureCommandAvailable(command) {
  const probe = spawnSync("bash", ["-lc", `command -v ${command}`], {
    encoding: "utf8"
  });
  if (probe.status !== 0) {
    throw new Error(`缺少命令: ${command}`);
  }
  return String(probe.stdout || "").trim();
}

function runProcess(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
    ...options
  });
  return {
    ok: result.status === 0,
    status: result.status ?? -1,
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || ""),
    signal: result.signal || ""
  };
}

function collectAssets(assetsDir, maxAssets = 8) {
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
    return [];
  }
  const entries = readdirSync(assetsDir)
    .map((name) => {
      const fullPath = resolve(assetsDir, name);
      const ext = extname(name).toLowerCase();
      const type = IMAGE_EXTENSIONS.has(ext) ? "image" : VIDEO_EXTENSIONS.has(ext) ? "video" : "";
      if (!type) {
        return null;
      }
      let stat = null;
      try {
        stat = statSync(fullPath);
      } catch {
        stat = null;
      }
      if (!stat || !stat.isFile()) {
        return null;
      }
      return {
        type,
        ext,
        name,
        path: fullPath,
        mtimeMs: stat.mtimeMs
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.mtimeMs - left.mtimeMs)
    .slice(0, maxAssets);
  return entries;
}

function buildFallbackCopy(themeInput = "") {
  const theme = safeText(themeInput, "今日灵感");
  const title = `${theme}｜3个可直接上手的要点`;
  const tags = ["效率提升", "经验分享", "干货笔记", "小红书运营"];
  const content = [
    `今天围绕「${theme}」做了一个实操拆解：`,
    "1) 先明确目标结果，避免只做表面动作；",
    "2) 把流程拆成可执行清单，降低启动成本；",
    "3) 用一个最小闭环先跑通，再做优化迭代。",
    "如果你也在做类似事情，评论区告诉我你的卡点，我给你做下一版模板。"
  ].join("\n");
  return {
    title,
    content,
    tags,
    source: "fallback-template"
  };
}

function extractJsonPayload(textInput = "") {
  const text = String(textInput || "").trim();
  if (!text) {
    return null;
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    return null;
  }
  const candidate = text.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

async function generateCopyByModel(config) {
  const model = safeText(config.model, "gpt-4.1-mini");
  const apiKey = safeText(config.openaiApiKey);
  const baseUrl = safeText(config.openaiBaseUrl, "https://api.openai.com/v1").replace(/\/+$/, "");
  if (!apiKey) {
    return buildFallbackCopy(config.theme);
  }
  const payload = {
    model,
    temperature: 0.7,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content: "你是小红书内容策划助手。只输出 JSON，不要额外解释。"
      },
      {
        role: "user",
        content: [
          "请根据给定主题生成一条小红书视频笔记文案。",
          `主题：${config.theme}`,
          "返回 JSON 结构：",
          "{\"title\":\"\",\"content\":\"\",\"tags\":[\"标签1\",\"标签2\"]}",
          "要求：标题 20~26 字；正文 160~260 字；标签 3~6 个，不带 #。"
        ].join("\n")
      }
    ]
  };
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    const raw = await response.text();
    if (!response.ok) {
      return buildFallbackCopy(config.theme);
    }
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    const text = String(
      parsed?.choices?.[0]?.message?.content
      || parsed?.choices?.[0]?.text
      || ""
    ).trim();
    const extracted = extractJsonPayload(text);
    if (!extracted || typeof extracted !== "object") {
      return buildFallbackCopy(config.theme);
    }
    const title = safeText(extracted.title, `${config.theme}｜实操清单`);
    const content = safeText(extracted.content, buildFallbackCopy(config.theme).content);
    const tags = Array.isArray(extracted.tags)
      ? extracted.tags.map((item) => safeText(item)).filter(Boolean).slice(0, 6)
      : [];
    return {
      title,
      content,
      tags: tags.length > 0 ? tags : buildFallbackCopy(config.theme).tags,
      source: `model:${model}`
    };
  } catch {
    return buildFallbackCopy(config.theme);
  }
}

function appendTagsToContent(contentInput = "", tagsInput = []) {
  const content = safeText(contentInput);
  const tags = Array.isArray(tagsInput)
    ? tagsInput.map((item) => safeText(item)).filter(Boolean)
    : [];
  if (tags.length === 0) {
    return content;
  }
  const tagText = tags.map((tag) => `#${tag}`).join(" ");
  if (content.includes("#")) {
    return content;
  }
  return `${content}\n\n${tagText}`.trim();
}

function buildVideoScaleFilter() {
  return "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30,format=yuv420p";
}

function renderImageClip(ffmpegBin, inputPath, outputPath, durationSec) {
  const args = [
    "-y",
    "-loop",
    "1",
    "-t",
    String(durationSec),
    "-i",
    inputPath,
    "-vf",
    buildVideoScaleFilter(),
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    outputPath
  ];
  return runProcess(ffmpegBin, args);
}

function renderVideoClip(ffmpegBin, inputPath, outputPath, durationSec) {
  const args = [
    "-y",
    "-ss",
    "0",
    "-t",
    String(durationSec),
    "-i",
    inputPath,
    "-vf",
    buildVideoScaleFilter(),
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    outputPath
  ];
  return runProcess(ffmpegBin, args);
}

function concatClips(ffmpegBin, clipPaths = [], outputPath = "") {
  if (clipPaths.length === 1) {
    const args = [
      "-y",
      "-i",
      clipPaths[0],
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      outputPath
    ];
    return runProcess(ffmpegBin, args);
  }
  const filterInput = clipPaths.map((_, index) => `[${index}:v]`).join("");
  const filter = `${filterInput}concat=n=${clipPaths.length}:v=1:a=0[v]`;
  const args = [
    "-y",
    ...clipPaths.flatMap((path) => ["-i", path]),
    "-filter_complex",
    filter,
    "-map",
    "[v]",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    outputPath
  ];
  return runProcess(ffmpegBin, args);
}

function buildFallbackClip(ffmpegBin, outputPath = "", durationSec = 8) {
  const seconds = Math.max(4, Math.min(30, Number(durationSec || 8)));
  const args = [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=0x111111:s=1080x1920:d=${seconds}`,
    "-vf",
    "fps=30,format=yuv420p",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    outputPath
  ];
  return runProcess(ffmpegBin, args);
}

function buildEditedVideo(config, assets, runtimeDir) {
  const ffmpegBin = ensureCommandAvailable("ffmpeg");
  if (!Array.isArray(assets) || assets.length === 0) {
    const outputVideo = resolve(runtimeDir, "edited-video.mp4");
    const fallbackResult = buildFallbackClip(
      ffmpegBin,
      outputVideo,
      Number(config.clipDurationImageSec || 2.8) * 3
    );
    if (!fallbackResult.ok) {
      throw new Error(`无素材兜底视频生成失败: ${fallbackResult.stderr}`);
    }
    return {
      outputVideo,
      clipPaths: [outputVideo],
      clipLogs: [
        {
          type: "fallback",
          ok: true,
          status: 0,
          stderr: "",
          note: "素材目录无图片/视频，已生成纯色占位视频继续流程。"
        }
      ]
    };
  }
  const clipDir = ensureDir(resolve(runtimeDir, "clips"));
  const clipPaths = [];
  const clipLogs = [];
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    const outputClip = resolve(clipDir, `clip-${String(index + 1).padStart(2, "0")}.mp4`);
    const result = asset.type === "image"
      ? renderImageClip(ffmpegBin, asset.path, outputClip, config.clipDurationImageSec)
      : renderVideoClip(ffmpegBin, asset.path, outputClip, config.clipDurationVideoSec);
    clipLogs.push({
      asset: asset.path,
      type: asset.type,
      ok: result.ok,
      status: result.status,
      stderr: safeText(result.stderr).slice(0, 400)
    });
    if (!result.ok) {
      throw new Error(`素材转码失败: ${basename(asset.path)}\n${result.stderr}`);
    }
    clipPaths.push(outputClip);
  }
  const outputVideo = resolve(runtimeDir, "edited-video.mp4");
  const concatResult = concatClips(ffmpegBin, clipPaths, outputVideo);
  if (!concatResult.ok) {
    throw new Error(`视频拼接失败: ${concatResult.stderr}`);
  }
  return {
    outputVideo,
    clipPaths,
    clipLogs
  };
}

async function waitForManualContinue(promptText = "") {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  try {
    await rl.question(`${promptText}\n完成后按 Enter 继续...`);
  } finally {
    rl.close();
  }
}

async function findFirstLocator(page, selectors = []) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count() > 0) {
        return {
          selector,
          locator
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fillFirst(page, selectors = [], value = "") {
  const content = String(value || "");
  if (!content) {
    return "";
  }
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count() === 0) {
        continue;
      }
      await locator.click({
        timeout: 3000
      });
      await locator.fill(content, {
        timeout: 3000
      });
      return selector;
    } catch {
      continue;
    }
  }
  return "";
}

async function fillFirstContentEditable(page, selectors = [], value = "") {
  const content = String(value || "");
  if (!content) {
    return "";
  }
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count() === 0) {
        continue;
      }
      await locator.click({
        timeout: 3000
      });
      await locator.evaluate((node, text) => {
        node.innerText = text;
        node.dispatchEvent(new Event("input", {
          bubbles: true
        }));
      }, content);
      return selector;
    } catch {
      continue;
    }
  }
  return "";
}

async function clickByText(page, labels = []) {
  for (const raw of labels) {
    const label = safeText(raw);
    if (!label) {
      continue;
    }
    const selectors = [
      `button:has-text("${label.replace(/"/g, "\\\"")}")`,
      `div:has-text("${label.replace(/"/g, "\\\"")}")`,
      `span:has-text("${label.replace(/"/g, "\\\"")}")`,
      `text=${label.replace(/"/g, "\\\"")}`
    ];
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector).first();
        if (await locator.count() === 0) {
          continue;
        }
        await locator.click({
          timeout: 3000
        });
        return selector;
      } catch {
        continue;
      }
    }
  }
  return "";
}

async function uploadToXiaohongshu(config, runtimeDir, copyPayload, videoPath) {
  const playwright = await import("playwright");
  const chromium = playwright.chromium;
  ensureDir(config.xhs.userDataDir);
  const context = await chromium.launchPersistentContext(config.xhs.userDataDir, {
    headless: config.headless,
    viewport: {
      width: 1440,
      height: 960
    },
    args: ["--disable-blink-features=AutomationControlled"]
  });
  const page = context.pages()[0] || await context.newPage();
  const result = {
    ok: false,
    reason: "unknown",
    summary: "",
    url: config.xhs.publishUrl,
    executedAt: new Date().toISOString(),
    selectors: {}
  };
  try {
    await page.goto(config.xhs.publishUrl, {
      waitUntil: "domcontentloaded",
      timeout: 90000
    });
    await page.waitForTimeout(1500);
    const uploadSelectors = [
      'input[type="file"][accept*="video"]',
      'input[type="file"]'
    ];
    let uploadTarget = await findFirstLocator(page, uploadSelectors);
    if (!uploadTarget) {
      if (config.nonInteractive) {
        throw new Error("未检测到上传控件，且当前为非交互模式。请先完成登录，或改为交互模式重试。");
      }
      await waitForManualContinue("未检测到上传控件，请先在浏览器完成登录。");
      await page.bringToFront();
      await page.waitForTimeout(1000);
      uploadTarget = await findFirstLocator(page, uploadSelectors);
    }
    if (!uploadTarget) {
      throw new Error("找不到小红书上传控件，请确认发布页已登录。");
    }
    await uploadTarget.locator.setInputFiles(videoPath);
    result.selectors.upload = uploadTarget.selector;
    await page.waitForTimeout(4000);
    const titleSelectors = [
      'input[placeholder*="标题"]',
      'input[placeholder*="填写标题"]',
      'textarea[placeholder*="标题"]'
    ];
    const contentSelectors = [
      'textarea[placeholder*="描述"]',
      'textarea[placeholder*="正文"]',
      'div[contenteditable="true"]',
      ".ql-editor"
    ];
    const postContent = appendTagsToContent(copyPayload.content, copyPayload.tags);
    result.selectors.title = await fillFirst(page, titleSelectors, copyPayload.title);
    result.selectors.content = await fillFirst(page, contentSelectors, postContent);
    if (!result.selectors.content) {
      result.selectors.content = await fillFirstContentEditable(page, contentSelectors, postContent);
    }
    await page.waitForTimeout(1000);
    if (config.publish) {
      const publishSelector = await clickByText(page, ["发布", "立即发布", "发布笔记"]);
      result.selectors.publish = publishSelector;
      if (!publishSelector) {
        throw new Error("未找到发布按钮，请检查发布页结构是否变化。");
      }
      await page.waitForTimeout(3500);
      result.ok = true;
      result.reason = "uploaded_and_published";
      result.summary = "已自动上传并尝试点击发布。";
    } else {
      result.ok = true;
      result.reason = "uploaded_waiting_publish";
      result.summary = "已自动上传并填充文案，等待人工确认发布。";
    }
    const screenshotPath = resolve(runtimeDir, "xhs-upload.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    result.screenshotPath = screenshotPath;
  } catch (error) {
    result.ok = false;
    result.reason = "upload_failed";
    result.summary = "小红书上传流程失败。";
    result.error = error instanceof Error ? error.message : String(error);
    try {
      const screenshotPath = resolve(runtimeDir, "xhs-upload-error.png");
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      result.screenshotPath = screenshotPath;
    } catch {
      result.screenshotPath = "";
    }
  } finally {
    await context.close().catch(() => {});
  }
  return result;
}

function writeJson(filePath, payload) {
  ensureDir(resolve(filePath, ".."));
  writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function runPipeline(config) {
  if (!config.theme) {
    throw new Error("缺少主题参数：--theme");
  }
  ensureCommandAvailable("ffmpeg");
  const runId = `xhs-${nowStamp()}-${randomUUID().slice(0, 8)}`;
  const runtimeDir = ensureDir(resolve(config.outputRoot, runId));
  const artifacts = {
    runId,
    runtimeDir,
    startedAt: new Date().toISOString(),
    config: {
      theme: config.theme,
      assetsDir: config.assetsDir,
      publish: config.publish,
      headless: config.headless,
      skipUpload: config.skipUpload,
      model: config.model
    }
  };

  const assets = collectAssets(config.assetsDir, config.maxAssets);
  artifacts.assets = assets.map((item) => ({
    type: item.type,
    name: item.name,
    path: item.path
  }));
  writeJson(resolve(runtimeDir, "assets.json"), artifacts.assets);

  const copyPayload = await generateCopyByModel(config);
  writeJson(resolve(runtimeDir, "copy.json"), copyPayload);
  artifacts.copy = copyPayload;

  const videoResult = buildEditedVideo(config, assets, runtimeDir);
  writeJson(resolve(runtimeDir, "edit-log.json"), {
    outputVideo: videoResult.outputVideo,
    clipLogs: videoResult.clipLogs
  });
  artifacts.video = {
    output: videoResult.outputVideo,
    clipCount: videoResult.clipPaths.length
  };

  if (config.skipUpload) {
    artifacts.upload = {
      ok: true,
      reason: "skip_upload",
      summary: "已按参数跳过小红书上传。"
    };
  } else {
    const uploadResult = await uploadToXiaohongshu(config, runtimeDir, copyPayload, videoResult.outputVideo);
    writeJson(resolve(runtimeDir, "upload-result.json"), uploadResult);
    artifacts.upload = uploadResult;
    if (!uploadResult.ok) {
      throw new Error(uploadResult.error || uploadResult.summary || "上传失败");
    }
  }

  artifacts.finishedAt = new Date().toISOString();
  artifacts.ok = true;
  writeJson(resolve(runtimeDir, "pipeline-result.json"), artifacts);
  if (!config.tempKeep) {
    rmSync(resolve(runtimeDir, "clips"), {
      recursive: true,
      force: true
    });
  }
  return artifacts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  const fileConfig = args.config ? loadJsonConfig(args.config) : {};
  const config = mergeConfig(args, fileConfig);
  const result = await runPipeline(config);
  process.stdout.write(
    `${[
      "✅ XHS 自动化流水线完成",
      `RunID: ${result.runId}`,
      `输出目录: ${result.runtimeDir}`,
      `视频文件: ${result.video.output}`,
      `上传状态: ${result.upload.reason}`
    ].join("\n")}\n`
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`❌ XHS 自动化流水线失败: ${message}\n`);
  process.exit(1);
});
