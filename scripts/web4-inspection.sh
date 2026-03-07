#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"
REPORT_DIR="${ROOT_DIR}/output/reports"
mkdir -p "$REPORT_DIR"

RUN_ID="$(date +%Y%m%d-%H%M%S)"
TMP_DIR="$(mktemp -d "/tmp/aria-web4-inspection-${RUN_ID}.XXXXXX")"
REPORT_FILE="${REPORT_DIR}/web4-inspection-${RUN_ID}.md"
trap 'rm -rf "$TMP_DIR"' EXIT

CURL_OPTS=(
  -fsS
  --connect-timeout 3
  --max-time 45
)

STREAM_CURL_OPTS=(
  -fsS
  --connect-timeout 3
  --max-time 90
  -N
)

cd "$ROOT_DIR"
bash scripts/ensure-runtime-up.sh >/tmp/aria-web4-runtime.log 2>&1

DEVICE_ID="web4-inspection-${RUN_ID}"
TOKEN_PAYLOAD="$(curl "${CURL_OPTS[@]}" -X POST "${API_BASE}/v1/auth/guest" \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\":\"${DEVICE_ID}\",\"platform\":\"desktop-web\"}")"
TOKEN="$(echo "$TOKEN_PAYLOAD" | node -e 'const fs=require("fs");const text=fs.readFileSync(0,"utf8").trim();if(!text){process.exit(0);}const d=JSON.parse(text);process.stdout.write(String(d.token||""));' 2>/dev/null || true)"
if [[ -z "$TOKEN" ]]; then
  echo "[web4-inspection] 无法获取 token"
  echo "[web4-inspection] payload=${TOKEN_PAYLOAD:-<empty>}"
  exit 1
fi

curl "${CURL_OPTS[@]}" "${API_BASE}/v1/runtime/health" \
  -H "Authorization: Bearer ${TOKEN}" >"${TMP_DIR}/runtime-health.json"
curl "${CURL_OPTS[@]}" "${API_BASE}/v1/capability/assessment" \
  -H "Authorization: Bearer ${TOKEN}" >"${TMP_DIR}/capability-assessment.json"
curl "${CURL_OPTS[@]}" "${API_BASE}/v1/capability/fusion" \
  -H "Authorization: Bearer ${TOKEN}" >"${TMP_DIR}/capability-fusion.json"
curl "${CURL_OPTS[@]}" "${API_BASE}/v1/capability/super-autonomy" \
  -H "Authorization: Bearer ${TOKEN}" >"${TMP_DIR}/capability-super-autonomy.json"
curl "${CURL_OPTS[@]}" "${API_BASE}/v1/aria-kernel/gateway/status" \
  -H "Authorization: Bearer ${TOKEN}" >"${TMP_DIR}/gateway-status.json"
curl "${STREAM_CURL_OPTS[@]}" -X POST "${API_BASE}/v1/message/stream" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"text":"Web4.0 检修链路测试：请回传一句状态。","scene":"coding","taskType":"autonomy_dispatch"}' \
  >"${TMP_DIR}/stream.sse" 2>"${TMP_DIR}/stream.stderr" || true

node - <<'NODE' "${TMP_DIR}/stream.sse" >"${TMP_DIR}/stream-summary.json"
const fs = require("fs");
const file = process.argv[2];
const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const blocks = raw.split(/\r?\n\r?\n/).filter((item) => item.trim());
let metaSeen = false;
let chunkCount = 0;
let doneSeen = false;
let errorSeen = false;
let doneAssistantText = "";
let streamId = "";
for (const block of blocks) {
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let event = "message";
  const dataLines = [];
  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  const data = dataLines.join("\n");
  let payload = null;
  if (data) {
    try {
      payload = JSON.parse(data);
    } catch {
      payload = null;
    }
  }
  if (event === "meta") {
    metaSeen = true;
    if (payload && payload.streamId) {
      streamId = String(payload.streamId);
    }
  } else if (event === "chunk") {
    chunkCount += 1;
    if (!streamId && payload && payload.streamId) {
      streamId = String(payload.streamId);
    }
  } else if (event === "done") {
    doneSeen = true;
    if (!streamId && payload && payload.streamId) {
      streamId = String(payload.streamId);
    }
    const assistant = payload && payload.delta && payload.delta.assistantMessage
      ? String(payload.delta.assistantMessage.text || "")
      : "";
    doneAssistantText = assistant.slice(0, 120);
  } else if (event === "error") {
    errorSeen = true;
  }
}
process.stdout.write(JSON.stringify({
  ok: doneSeen && !errorSeen,
  metaSeen,
  chunkCount,
  doneSeen,
  errorSeen,
  streamId,
  assistantPreview: doneAssistantText
}, null, 2));
NODE

HEAL_DECISION="$(node - <<'NODE' "${TMP_DIR}/runtime-health.json" "${TMP_DIR}/gateway-status.json"
const fs = require("fs");
const runtimeHealth = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const gateway = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const runtime = runtimeHealth.runtime || {};
const queue = runtime.queue || {};
const outage = runtime.outage || {};
const bridgeStatus = String(runtime.bridge?.status || "unknown");
const gatewayStatus = String(gateway.gateway?.status || "unknown");
const outageStatus = String(outage.status || "ok");
const pending = Number(queue.pending || 0);
const deadLetters = Number(queue.deadLetters || 0);
const needFullHeal = bridgeStatus !== "up" || gatewayStatus === "down" || outageStatus === "error";
const needQueueReplay = pending >= 8 || deadLetters >= 24 || outageStatus === "warning";
if (needFullHeal) {
  process.stdout.write("full_heal");
  process.exit(0);
}
if (needQueueReplay) {
  process.stdout.write("queue_replay");
  process.exit(0);
}
process.stdout.write("none");
NODE
)"

if [[ "$HEAL_DECISION" != "none" ]]; then
  curl "${CURL_OPTS[@]}" -X POST "${API_BASE}/v1/runtime/guardian/heal" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"${HEAL_DECISION}\",\"executeRepair\":true,\"executeQueue\":true,\"queueLimit\":12,\"source\":\"web4_inspection\"}" \
    >"${TMP_DIR}/runtime-heal.json" || echo '{"ok":false,"reason":"heal_request_failed"}' >"${TMP_DIR}/runtime-heal.json"
else
  echo '{"ok":true,"reason":"no_heal_needed","summary":"No heal action required."}' >"${TMP_DIR}/runtime-heal.json"
fi

curl "${CURL_OPTS[@]}" "${API_BASE}/v1/runtime/health" \
  -H "Authorization: Bearer ${TOKEN}" >"${TMP_DIR}/runtime-health-after.json"

MINI_SMOKE_STATUS="passed"
{
  echo "[mini-smoke] /v1/autonomy/status"
  if curl "${CURL_OPTS[@]}" "${API_BASE}/v1/autonomy/status" -H "Authorization: Bearer ${TOKEN}" >/dev/null; then
    echo "[mini-smoke] ok /v1/autonomy/status"
  else
    echo "[mini-smoke] fail /v1/autonomy/status"
    MINI_SMOKE_STATUS="failed"
  fi
  echo "[mini-smoke] /v1/message"
  if curl "${CURL_OPTS[@]}" -X POST "${API_BASE}/v1/message" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"text":"Web4.0 mini smoke: 请回复OK。","scene":"coding"}' >/dev/null; then
    echo "[mini-smoke] ok /v1/message"
  else
    echo "[mini-smoke] fail /v1/message"
    MINI_SMOKE_STATUS="failed"
  fi
  echo "[mini-smoke] /v1/runtime/health"
  if curl "${CURL_OPTS[@]}" "${API_BASE}/v1/runtime/health" -H "Authorization: Bearer ${TOKEN}" >/dev/null; then
    echo "[mini-smoke] ok /v1/runtime/health"
  else
    echo "[mini-smoke] fail /v1/runtime/health"
    MINI_SMOKE_STATUS="failed"
  fi
} >"${TMP_DIR}/autonomy-smoke.log"
echo "{\"status\":\"${MINI_SMOKE_STATUS}\"}" >"${TMP_DIR}/smoke-status.json"

node - <<'NODE' "${TMP_DIR}" "${REPORT_FILE}"
const fs = require("fs");
const path = require("path");
const tmpDir = process.argv[2];
const reportFile = process.argv[3];

const readJson = (name, fallback = {}) => {
  const file = path.join(tmpDir, name);
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, "utf8").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const runtimeBefore = readJson("runtime-health.json");
const runtimeAfter = readJson("runtime-health-after.json");
const assessment = readJson("capability-assessment.json");
const fusion = readJson("capability-fusion.json");
const superAutonomy = readJson("capability-super-autonomy.json");
const gateway = readJson("gateway-status.json");
const streamSummary = readJson("stream-summary.json");
const heal = readJson("runtime-heal.json");
const smoke = readJson("smoke-status.json");
const smokeLogPath = path.join(tmpDir, "autonomy-smoke.log");
const smokeLog = fs.existsSync(smokeLogPath) ? fs.readFileSync(smokeLogPath, "utf8") : "";
const smokeTail = smokeLog.split(/\r?\n/).filter(Boolean).slice(-18).join("\n");

const runtimeBeforeData = runtimeBefore.runtime || {};
const runtimeAfterData = runtimeAfter.runtime || {};
const queueBefore = runtimeBeforeData.queue || {};
const queueAfter = runtimeAfterData.queue || {};
const outageBefore = runtimeBeforeData.outage || {};
const outageAfter = runtimeAfterData.outage || {};
const bridgeStatus = String(runtimeAfterData.bridge?.status || runtimeBeforeData.bridge?.status || "unknown");
const apiStatus = String(runtimeAfterData.api?.status || runtimeBeforeData.api?.status || "unknown");
const gatewayStatus = String(gateway.gateway?.status || "unknown");
const watchdogProbe = String(runtimeAfterData.watchdog?.lastProbeStatus || runtimeBeforeData.watchdog?.lastProbeStatus || "unknown");
const assessmentScore = Number(assessment.assessment?.independenceScore || 0);
const fusionScore = Number(fusion.fusion?.readinessScore || 0);
const superScore = Number(superAutonomy.runtime?.readinessScore || 0);
const smokePassed = String(smoke.status || "") === "passed";
const streamOk = Boolean(streamSummary.ok);
const queuePending = Number(queueAfter.pending ?? queueBefore.pending ?? 0);
const queueDead = Number(queueAfter.deadLetters ?? queueBefore.deadLetters ?? 0);
const queueDeadRecent24h = Number(queueAfter.deadLettersRecent24h ?? queueBefore.deadLettersRecent24h ?? queueDead);

let score = 100;
if (apiStatus !== "up") score -= 25;
if (bridgeStatus !== "up") score -= 25;
if (gatewayStatus !== "up") score -= 20;
if (watchdogProbe !== "up") score -= 10;
if (String(outageAfter.status || outageBefore.status || "ok") === "warning") score -= 8;
if (String(outageAfter.status || outageBefore.status || "ok") === "error") score -= 16;
if (queuePending >= 8) score -= Math.min(12, 2 + Math.floor(queuePending / 4) * 2);
if (queueDeadRecent24h >= 24) score -= Math.min(18, 4 + Math.floor((queueDeadRecent24h - 24) / 8) * 2);
if (!streamOk) score -= 22;
if (!smokePassed) score -= 20;
if (assessmentScore < 90) score -= Math.min(12, Math.ceil((90 - assessmentScore) / 3));
if (fusionScore < 90) score -= Math.min(8, Math.ceil((90 - fusionScore) / 4));
if (superScore < 90) score -= Math.min(12, Math.ceil((90 - superScore) / 3));
score = Math.max(0, Math.min(100, score));

const grade = score >= 90
  ? "A (稳定可用)"
  : score >= 75
    ? "B (可用但需持续优化)"
    : score >= 60
      ? "C (存在明显风险)"
      : "D (需立即修复)";

const actions = [];
if (!streamOk) actions.push("流式链路仍不稳定：优先检查 `/v1/message/stream` 与前端 `AbortController` 退避重试。");
if (!smokePassed) actions.push("自治烟测失败：先复跑 `bash scripts/run-autonomy-smoke.sh` 并修复失败项。");
if (queueDeadRecent24h >= 24) actions.push("近24小时死信偏高：执行 `POST /v1/runtime/guardian/heal`（queue_replay）并定位失败根因。");
if (queuePending >= 8) actions.push("待处理队列偏高：提升 watchdog 队列限额或扩容执行并发。");
if (bridgeStatus !== "up" || gatewayStatus !== "up") actions.push("Bridge/Gateway 异常：优先恢复到 up，避免自治执行链中断。");
if (assessmentScore < 90 || superScore < 90) actions.push("能力完整度未达标：补齐缺失技能包与关键端点连通性。");
if (actions.length === 0) actions.push("当前通过 Web4.0 检修基线，可进入持续压测与容量建模阶段。");

const now = new Date().toISOString();
const healReason = String(heal.reason || "none");
const healSummary = String(heal.summary || "");
const streamPreview = String(streamSummary.assistantPreview || "");

const report = [
  `# Aria Web4.0 全检报告`,
  ``,
  `- 检修时间: ${now}`,
  `- 工程评分: **${score}/100**`,
  `- 等级: **${grade}**`,
  ``,
  `## 核心健康`,
  `- API: ${apiStatus}`,
  `- Bridge: ${bridgeStatus}`,
  `- Gateway: ${gatewayStatus}`,
  `- Watchdog Probe: ${watchdogProbe}`,
  `- Outage(前): ${String(outageBefore.status || "unknown")} · ${String(outageBefore.summary || "")}`,
  `- Outage(后): ${String(outageAfter.status || "unknown")} · ${String(outageAfter.summary || "")}`,
  `- Queue(前): pending=${Number(queueBefore.pending || 0)} dead=${Number(queueBefore.deadLetters || 0)}`,
  `- Queue(后): pending=${queuePending} dead=${queueDead} recent24h=${queueDeadRecent24h}`,
  ``,
  `## 能力基线`,
  `- Independence Score: ${assessmentScore}`,
  `- Fusion Readiness: ${fusionScore}`,
  `- Super-Autonomy Readiness: ${superScore}`,
  ``,
  `## 流式对话链路`,
  `- Stream OK: ${streamOk}`,
  `- Meta Seen: ${Boolean(streamSummary.metaSeen)}`,
  `- Chunk Count: ${Number(streamSummary.chunkCount || 0)}`,
  `- Done Seen: ${Boolean(streamSummary.doneSeen)}`,
  `- Error Event: ${Boolean(streamSummary.errorSeen)}`,
  `- Assistant Preview: ${streamPreview || "N/A"}`,
  ``,
  `## 自动修复动作`,
  `- Heal Reason: ${healReason}`,
  `- Heal Summary: ${healSummary || "N/A"}`,
  ``,
  `## 端到端烟测`,
  `- Smoke Status: ${smokePassed ? "passed" : "failed"}`,
  ``,
  `### Smoke Tail`,
  "```text",
  smokeTail || "no smoke log",
  "```",
  ``,
  `## 下一步建议`,
  ...actions.map((item) => `- ${item}`),
  ``
].join("\n");

fs.writeFileSync(reportFile, report);
process.stdout.write(reportFile);
NODE

echo
echo "[web4-inspection] report: ${REPORT_FILE}"
