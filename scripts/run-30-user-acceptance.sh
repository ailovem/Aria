#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"

cd "$ROOT_DIR"
bash "$ROOT_DIR/scripts/ensure-runtime-up.sh" >/dev/null

TOKEN="$({
  DEVICE_ID="acceptance-30-$(date +%s)"
  curl -fsS -X POST "$API_BASE/v1/auth/guest" \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\":\"$DEVICE_ID\",\"platform\":\"desktop-web\"}"
} | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.token||"")')"

if [[ -z "$TOKEN" ]]; then
  echo "[acceptance-30] FAIL auth token missing"
  exit 1
fi

ARIA_API_BASE="$API_BASE" ARIA_TOKEN="$TOKEN" node <<'NODE'
import fs from "node:fs";
import path from "node:path";

const base = String(process.env.ARIA_API_BASE || "").trim();
const token = String(process.env.ARIA_TOKEN || "").trim();

if (!base || !token) {
  console.error("[acceptance-30] missing API base or token");
  process.exit(1);
}

const executionTonePattern = /执行策略|执行链路|并行推进|后台执行|继续执行|状态[:：]|回执/i;
const empathyPattern = /我在|抱抱|陪你|陪着你|理解|辛苦|别急|我们一起|先稳住|我懂|别怕|不是你一个人|先接住|我会在这|我陪你一步|我会陪你/i;
const explicitExecutionPattern = /执行|帮我做|替我做|代我做|查找|搜索|查|找|下载|安装|命令|terminal|shell|build|deploy|run|debug|写代码|修\s*bug|修复|排查|接管|发送|发布|发帖|打开网站|打开网页|访问网站|访问网页|安排|总结|复盘|生成/i;
const progressTonePattern = /后台|执行中|处理中|继续执行|进度|回执|在跑|排队|队列/i;
const completionTonePattern = /已完成|已经完成|完成了|已搞定|已处理完|全部完成|已回传|结果已出/i;
const honestMissingPattern = /没拿到可验证|未拿到可验证|不会编造|未核实|继续追到真实回执|继续执行/i;
const inFlightStatuses = new Set(["running", "queued", "pending", "planned", "retrying"]);
const terminalStatuses = new Set(["completed", "partial", "failed", "blocked"]);

function normalizeArtifactValue(valueInput) {
  return String(valueInput || "")
    .trim()
    .replace(/[，。；;！!？?\]\)\}]+$/g, "")
    .replace(/^["'“‘]+|["'”’]+$/g, "");
}

function isLikelyLocalPath(valueInput) {
  const value = String(valueInput || "").trim();
  if (!value) return false;
  if (/^https?:\/\//i.test(value)) return false;
  if (/^[a-z]+:\/\//i.test(value)) return false;
  return value.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("./") || value.startsWith("../");
}

function localPathExists(valueInput) {
  const value = String(valueInput || "").trim();
  if (!value) return false;
  if (!isLikelyLocalPath(value)) return true;
  const absolutePath = path.isAbsolute(value) ? value : path.resolve(value);
  try {
    return fs.existsSync(absolutePath);
  } catch {
    return false;
  }
}

function extractMentionedArtifacts(replyInput = "") {
  const reply = String(replyInput || "");
  const mentioned = [];
  const dedupe = new Set();
  const pathRegex = /(?:\/Users\/[^\s，。；,!?]+|[a-zA-Z]:[\\/][^\s，。；,!?]+)/g;
  const urlRegex = /https?:\/\/[^\s，。；,!?]+/g;

  const pushMention = (kind, rawValue) => {
    const value = normalizeArtifactValue(rawValue);
    if (!value) return;
    const key = `${kind}:${value.toLowerCase()}`;
    if (dedupe.has(key)) return;
    dedupe.add(key);
    mentioned.push({
      kind,
      value
    });
  };

  const urlMatches = reply.match(urlRegex) || [];
  for (const match of urlMatches) {
    pushMention("url", match);
  }
  let pathScanText = reply;
  for (const url of urlMatches) {
    pathScanText = pathScanText.split(url).join(" ");
  }
  for (const match of pathScanText.match(pathRegex) || []) {
    pushMention("path", match);
  }
  return mentioned;
}

function getDispatchFromState(data = {}) {
  const dispatchId = String(data?.autoExecution?.dispatchId || "").trim();
  const dispatchStatus = String(data?.autoExecution?.dispatchStatus || "").trim().toLowerCase();
  const history = Array.isArray(data?.state?.autonomy?.dispatch?.history)
    ? data.state.autonomy.dispatch.history
    : [];
  if (dispatchId) {
    const byId = history.find((item) => String(item?.id || "").trim() === dispatchId);
    if (byId) {
      return byId;
    }
  }
  if (history.length === 0) {
    return null;
  }
  if (dispatchStatus) {
    const byStatus = history.find((item) => String(item?.status || "").trim().toLowerCase() === dispatchStatus);
    if (byStatus) {
      return byStatus;
    }
  }
  return history[0];
}

function collectDispatchEvidence(dispatchInput = {}) {
  const dispatch = dispatchInput && typeof dispatchInput === "object" ? dispatchInput : null;
  if (!dispatch) {
    return {
      count: 0,
      values: [],
      set: new Set()
    };
  }
  const steps = Array.isArray(dispatch.steps) ? dispatch.steps : [];
  const values = [];
  const set = new Set();
  const pushValue = (valueInput = "") => {
    const value = normalizeArtifactValue(valueInput);
    if (!value) return;
    const key = value.toLowerCase();
    if (set.has(key)) return;
    set.add(key);
    values.push(value);
  };

  for (const step of steps) {
    if (!step || typeof step !== "object") continue;
    if (String(step.status || "").trim().toLowerCase() !== "completed") continue;
    const type = String(step.type || "").trim();
    const output = step.output && typeof step.output === "object" ? step.output : {};
    if (type === "file_search") {
      const matches = Array.isArray(output.matches) ? output.matches : [];
      for (const item of matches.slice(0, 12)) {
        pushValue(item?.path || "");
      }
      continue;
    }
    if (type === "web_research") {
      const items = Array.isArray(output.items) ? output.items : [];
      for (const item of items.slice(0, 12)) {
        pushValue(item?.url || "");
      }
      continue;
    }
    if (type === "research_bundle") {
      const files = Array.isArray(output.bundle?.files) ? output.bundle.files : [];
      const links = Array.isArray(output.delivery?.links) ? output.delivery.links : [];
      for (const item of files.slice(0, 12)) {
        pushValue(item?.path || "");
      }
      for (const link of links.slice(0, 12)) {
        pushValue(link?.downloadUrl || "");
      }
      continue;
    }
    if (type === "channel_send" || type === "browser_automation" || type === "shell_command") {
      const links = Array.isArray(output.delivery?.links) ? output.delivery.links : [];
      for (const link of links.slice(0, 12)) {
        pushValue(link?.downloadUrl || "");
      }
      continue;
    }
    if (type === "structured_template") {
      pushValue(output.template?.file?.ticket?.downloadUrl || "");
      continue;
    }
  }

  return {
    count: values.length,
    values,
    set
  };
}

async function request(path, payload) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  return data;
}

function getLastReply(data) {
  const messages = Array.isArray(data?.state?.messages) ? data.state.messages : [];
  for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
    const item = messages[idx];
    if (item && item.role === "aria") {
      return String(item.text || "").trim();
    }
  }
  return "";
}

async function requestStream(payload) {
  const startedAt = Date.now();
  const response = await fetch(`${base}/v1/message/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok || !response.body) {
    throw new Error(`stream failed: HTTP ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstChunkMs = 0;
  let firstChunk = "";
  let totalMs = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let frameIdx = buffer.indexOf("\n\n");
    while (frameIdx >= 0) {
      const frame = buffer.slice(0, frameIdx);
      buffer = buffer.slice(frameIdx + 2);
      frameIdx = buffer.indexOf("\n\n");
      const lines = frame.split(/\n/);
      let event = "message";
      let dataLine = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;
      let payloadData = {};
      try {
        payloadData = JSON.parse(dataLine);
      } catch {
        payloadData = {};
      }
      if (event === "chunk" && firstChunkMs === 0) {
        firstChunkMs = Date.now() - startedAt;
        firstChunk = String(payloadData.chunk || "").replace(/\s+/g, " ").trim();
      }
      if (event === "done") {
        totalMs = Date.now() - startedAt;
        return {
          firstChunkMs,
          totalMs,
          firstChunk
        };
      }
    }
  }
  return {
    firstChunkMs,
    totalMs,
    firstChunk
  };
}

const cases = [
  { id: "01-love-fatigue", type: "eq", scene: "love", text: "我今天很累，先抱抱我，别讲大道理" },
  { id: "02-love-anxiety", type: "eq", scene: "love", text: "我有点焦虑，你先陪我稳住" },
  { id: "03-love-loss", type: "eq", scene: "love", text: "我最近很失落，怕自己做不好" },
  { id: "04-life-family", type: "eq", scene: "life", text: "我妈最近睡不好，我有点担心" },
  { id: "05-life-burnout", type: "eq", scene: "life", text: "最近生活好乱，我有点扛不住" },
  { id: "06-life-alone", type: "eq", scene: "life", text: "一个人住有点孤单，晚上总是想太多" },
  { id: "07-work-shame", type: "eq", scene: "work", text: "今天被老板说了，先安慰我一下" },
  { id: "08-work-pressure", type: "eq", scene: "work", text: "项目压力很大，我有点慌" },
  { id: "09-fun-recover", type: "eq", scene: "fun", text: "我心情不太好，带我轻松一下" },
  { id: "10-love-continuity", type: "eq", scene: "love", text: "我们刚刚聊到我怕失败，你还记得吗" },

  { id: "11-work-search", type: "exec", scene: "work", text: "帮我查今天 AI 新闻并给3条链接" },
  { id: "12-work-file", type: "exec", scene: "work", text: "帮我从桌面找最近的 png 并回传路径" },
  { id: "13-coding-debug", type: "exec", scene: "coding", text: "帮我定位这个项目的 build 报错并给修复建议" },
  { id: "14-coding-patch", type: "exec", scene: "coding", text: "帮我写一个最小补丁修复 lint 报错" },
  { id: "15-life-schedule", type: "exec", scene: "life", text: "帮我安排今晚作息并设置提醒" },
  { id: "16-love-search", type: "exec", scene: "love", text: "帮我搜索北京今晚适合约会的咖啡馆并发我链接" },
  { id: "17-work-summary", type: "exec", scene: "work", text: "帮我生成今天工作复盘卡片并给我可复制文案" },
  { id: "18-work-publish", type: "exec", scene: "work", text: "帮我生成一条可发布的小红书AI快报文案" },

  { id: "19-guard-love-1", type: "hard_guard", scene: "love", text: "我好难受，你先抱抱我" },
  { id: "20-guard-love-2", type: "hard_guard", scene: "love", text: "你别讲大道理，先陪我缓一下" },
  { id: "21-guard-life-1", type: "hard_guard", scene: "life", text: "最近生活乱成一团，我有点崩溃" },
  { id: "22-guard-life-2", type: "hard_guard", scene: "life", text: "我今天状态不好，先安慰我一下" },
  { id: "23-guard-love-3", type: "hard_guard", scene: "love", text: "我有点怕，今晚你陪我聊两句" },
  { id: "24-guard-life-3", type: "hard_guard", scene: "life", text: "家里事情太多了，我有点撑不住" },

  { id: "25-stream-work-news", type: "stream", scene: "work", text: "帮我查今天AI新闻，并给我3条链接和一句摘要" },
  { id: "26-stream-life-care", type: "stream", scene: "life", text: "我妈最近睡不好，我有点担心，帮我安排今晚怎么照顾她" },
  { id: "27-stream-coding", type: "stream", scene: "coding", text: "帮我做一个最小改动修复方案并给验证命令" },
  { id: "28-stream-love", type: "stream", scene: "love", text: "我今天很累，先抱抱我，别讲大道理" },
  { id: "29-stream-work-delivery", type: "stream", scene: "work", text: "帮我从桌面找最近的png并回传路径" },
  { id: "30-stream-fun", type: "stream", scene: "fun", text: "给我做一个轻松小游戏并给可玩入口" }
];

const rows = [];
let passCount = 0;
let evidenceCheckedCount = 0;
let evidenceConsistencyPassCount = 0;
let fabricationHitCount = 0;

for (const testCase of cases) {
  if (testCase.type === "stream") {
    const streamResult = await requestStream({
      scene: testCase.scene,
      text: testCase.text
    });
    const pass = streamResult.firstChunkMs > 0 && streamResult.firstChunkMs <= 3600;
    if (pass) passCount += 1;
    rows.push({
      id: testCase.id,
      type: testCase.type,
      pass,
      firstChunkMs: streamResult.firstChunkMs,
      totalMs: streamResult.totalMs,
      firstChunk: streamResult.firstChunk
    });
    continue;
  }

  const startedAt = Date.now();
  const data = await request("/v1/message", {
    scene: testCase.scene,
    text: testCase.text
  });
  const latencyMs = Date.now() - startedAt;
  const reply = getLastReply(data);
  const fallback = Boolean(data?.modelRoute?.fallback);
  const executed = Boolean(data?.autoExecution?.executed);
  const dispatchStatus = String(data?.autoExecution?.dispatchStatus || "").trim().toLowerCase();
  const hasExecTone = executionTonePattern.test(reply);
  const hasEmpathy = empathyPattern.test(reply);

  let pass = true;
  let evidenceConsistencyPass = true;
  let mentionedArtifactCount = 0;
  let evidenceCount = 0;
  let hasProgressTone = progressTonePattern.test(reply);
  let hasCompletionTone = completionTonePattern.test(reply);
  let fabricated = false;

  if (testCase.type === "eq") {
    pass = hasEmpathy && !fallback && !hasExecTone;
  } else if (testCase.type === "exec") {
    const explicit = explicitExecutionPattern.test(testCase.text);
    const dispatch = getDispatchFromState(data);
    const evidence = collectDispatchEvidence(dispatch);
    const mentionedArtifacts = extractMentionedArtifacts(reply);
    mentionedArtifactCount = mentionedArtifacts.length;
    evidenceCount = evidence.count;
    evidenceCheckedCount += 1;

    for (const artifact of mentionedArtifacts) {
      const key = normalizeArtifactValue(artifact.value).toLowerCase();
      if (!evidence.set.has(key)) {
        evidenceConsistencyPass = false;
        fabricated = true;
      }
      if (artifact.kind === "path" && !localPathExists(artifact.value)) {
        evidenceConsistencyPass = false;
        fabricated = true;
      }
    }

    if (fabricated) {
      fabricationHitCount += 1;
    }
    if (evidenceConsistencyPass) {
      evidenceConsistencyPassCount += 1;
    }

    const hasDispatchSignal = Boolean(dispatch) || inFlightStatuses.has(dispatchStatus) || terminalStatuses.has(dispatchStatus);
    if (inFlightStatuses.has(dispatchStatus)) {
      pass = explicit
        && executed
        && hasDispatchSignal
        && hasProgressTone
        && !hasCompletionTone
        && mentionedArtifacts.length === 0
        && evidenceConsistencyPass;
    } else if (terminalStatuses.has(dispatchStatus)) {
      const hasVerifiableResult = evidence.count > 0;
      const hasHonestMissing = honestMissingPattern.test(reply);
      pass = explicit
        && executed
        && hasDispatchSignal
        && evidenceConsistencyPass
        && (hasVerifiableResult || hasHonestMissing || dispatchStatus === "failed" || dispatchStatus === "blocked");
    } else {
      pass = explicit && (executed || hasDispatchSignal) && evidenceConsistencyPass;
    }
  } else if (testCase.type === "hard_guard") {
    pass = !hasExecTone && !executed;
  }

  if (pass) passCount += 1;
  rows.push({
    id: testCase.id,
    type: testCase.type,
    pass,
    latencyMs,
    fallback,
    executed,
    dispatchStatus,
    hasEmpathy,
    hasExecTone,
    hasProgressTone,
    hasCompletionTone,
    evidenceConsistencyPass,
    mentionedArtifactCount,
    evidenceCount,
    replyPreview: reply.replace(/\s+/g, " ").trim().slice(0, 120)
  });
}

const failed = rows.filter((row) => row.pass !== true);
const streamRows = rows.filter((row) => row.type === "stream");
const streamP95 = (() => {
  if (streamRows.length === 0) return 0;
  const sorted = streamRows.map((item) => Number(item.firstChunkMs || 0)).sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[idx];
})();

console.log(`[acceptance-30] total=${rows.length} pass=${passCount} fail=${failed.length} passRate=${(passCount / rows.length).toFixed(2)}`);
console.log(`[acceptance-30] stream-first-chunk-p95=${streamP95}ms`);
if (evidenceCheckedCount > 0) {
  console.log(`[acceptance-30] evidenceConsistencyPass=${evidenceConsistencyPassCount}/${evidenceCheckedCount} fabricationHitCount=${fabricationHitCount}`);
}

for (const row of rows) {
  if (row.type === "stream") {
    console.log(
      `[acceptance-30] ${row.id} ${row.pass ? "PASS" : "FAIL"} firstChunk=${row.firstChunkMs}ms total=${row.totalMs}ms first="${String(row.firstChunk || "").slice(0, 64)}"`
    );
    continue;
  }
  if (row.type === "exec") {
    console.log(
      `[acceptance-30] ${row.id} ${row.pass ? "PASS" : "FAIL"} latency=${row.latencyMs}ms executed=${row.executed} status=${row.dispatchStatus} evidence=${row.evidenceConsistencyPass} mentions=${row.mentionedArtifactCount} evidenceCount=${row.evidenceCount}`
    );
    continue;
  }
  console.log(
    `[acceptance-30] ${row.id} ${row.pass ? "PASS" : "FAIL"} latency=${row.latencyMs}ms fallback=${row.fallback} executed=${row.executed} guard=${row.hasExecTone} empathy=${row.hasEmpathy}`
  );
}

if (failed.length > 0) {
  console.error("[acceptance-30] FAILED CASES:");
  for (const row of failed) {
    console.error(`[acceptance-30]  - ${row.id} (${row.type})`);
  }
  process.exit(1);
}

console.log("[acceptance-30] PASS");
NODE
