#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"
ROUNDS="${1:-80}"

cd "$ROOT_DIR"
bash "$ROOT_DIR/scripts/ensure-runtime-up.sh" >/dev/null

TOKEN="$({
  DEVICE_ID="ux-stability-audit-$(date +%s)"
  curl -fsS -X POST "$API_BASE/v1/auth/guest" \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\":\"$DEVICE_ID\",\"platform\":\"desktop-web\"}"
} | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.token||"")')"

if [[ -z "$TOKEN" ]]; then
  echo "[ux-audit] FAIL auth token missing"
  exit 1
fi

ARIA_API_BASE="$API_BASE" ARIA_TOKEN="$TOKEN" ARIA_ROUNDS="$ROUNDS" node <<'NODE'
const base = String(process.env.ARIA_API_BASE || "").trim();
const token = String(process.env.ARIA_TOKEN || "").trim();
const rounds = Math.max(8, Number.parseInt(String(process.env.ARIA_ROUNDS || "80"), 10) || 80);

if (!base || !token) {
  console.error("[ux-audit] missing API base or token");
  process.exit(1);
}

const suite = [
  { id: "love-support", scene: "love", text: "我今天心好累，先抱抱我" },
  { id: "love-continuity", scene: "love", text: "我怕失败，你还记得我们刚聊的吗" },
  { id: "life-family", scene: "life", text: "我妈最近睡不好，我很担心" },
  { id: "life-lonely", scene: "life", text: "一个人住有点孤单，晚上想太多" },
  { id: "work-shame", scene: "work", text: "今天被老板说了，我有点难受" },
  { id: "work-pressure", scene: "work", text: "项目压力太大，我有点慌" },
  { id: "fun-recover", scene: "fun", text: "我心情有点差，带我轻松一下" },
  { id: "fun-game", scene: "fun", text: "我们玩点小游戏吧" }
];

const empathyPattern = /我在|抱抱|陪你|陪着你|理解|辛苦|别急|我们一起|先稳住|我懂|别怕|先接住|我会在这/i;
const executionTonePattern = /执行策略|执行链路|并行推进|后台执行|继续执行|状态[:：]|回执/i;
const continuityPattern = /我记得|我记着|记得的|刚刚|刚才|前面|之前|你说过|一直陪着你/i;
const metaLeakPattern = /\[(?:共情|执行|当前任务|执行动作|步骤|empty|无)\]/i;

async function post(path, payload) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload || {})
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}: ${text.slice(0, 280)}`);
  }
  return data;
}

function getReply(data) {
  const messages = Array.isArray(data?.state?.messages) ? data.state.messages : [];
  for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
    const item = messages[idx];
    if (item && item.role === "aria") {
      return String(item.text || "").trim();
    }
  }
  return "";
}

const anomalies = [];
const firstLineHistogram = new Map();
const metrics = {
  rounds,
  emptyLike: 0,
  metaLeaks: 0,
  execToneLeaks: 0,
  empathyMiss: 0,
  continuityMiss: 0
};

for (let index = 0; index < rounds; index += 1) {
  const test = suite[index % suite.length];
  const startedAt = Date.now();
  const data = await post("/v1/message", {
    scene: test.scene,
    text: test.text
  });
  const latencyMs = Date.now() - startedAt;
  const reply = getReply(data);
  const normalized = reply.replace(/\s+/g, " ").trim();
  const firstLine = reply.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
  if (firstLine) {
    firstLineHistogram.set(firstLine, Number(firstLineHistogram.get(firstLine) || 0) + 1);
  }
  const flags = [];
  if (!reply || metaLeakPattern.test(reply)) {
    metrics.emptyLike += 1;
    flags.push("empty_or_meta_leak");
  }
  if (metaLeakPattern.test(reply)) {
    metrics.metaLeaks += 1;
  }
  if ((test.scene === "love" || test.scene === "life") && !/执行|搜索|下载|安装|发送|回传|打开网站|命令/i.test(test.text) && executionTonePattern.test(reply)) {
    metrics.execToneLeaks += 1;
    flags.push("exec_tone_leak");
  }
  if (/心好累|抱抱|孤单|担心|难受|慌|心情有点差|怕失败/.test(test.text) && !empathyPattern.test(reply)) {
    metrics.empathyMiss += 1;
    flags.push("empathy_miss");
  }
  if (/还记得|刚聊/.test(test.text) && !continuityPattern.test(reply)) {
    metrics.continuityMiss += 1;
    flags.push("continuity_miss");
  }
  if (flags.length > 0) {
    anomalies.push({
      turn: index + 1,
      id: test.id,
      scene: test.scene,
      latencyMs,
      providerId: String(data?.modelRoute?.providerId || ""),
      taskType: String(data?.modelRoute?.taskType || ""),
      flags,
      replyPreview: normalized.slice(0, 180)
    });
  }
}

const repeatedOpenings = Array.from(firstLineHistogram.entries())
  .filter(([, count]) => count >= Math.max(6, Math.round(rounds * 0.08)))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .map(([line, count]) => ({ line, count }));

const summary = {
  ...metrics,
  anomalyCount: anomalies.length,
  anomalyRate: Number((anomalies.length / Math.max(1, rounds)).toFixed(3)),
  repeatedOpenings
};

console.log("[ux-audit] summary");
console.log(JSON.stringify(summary, null, 2));

if (anomalies.length > 0) {
  console.log("[ux-audit] anomaly-samples");
  for (const row of anomalies.slice(0, 20)) {
    console.log(JSON.stringify(row));
  }
  process.exit(1);
}

console.log("[ux-audit] PASS");
NODE
