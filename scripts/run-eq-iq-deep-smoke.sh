#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"

cd "$ROOT_DIR"
bash "$ROOT_DIR/scripts/ensure-runtime-up.sh" >/dev/null

TOKEN="$({
  DEVICE_ID="eq-iq-deep-smoke-$(date +%s)"
  curl -fsS -X POST "$API_BASE/v1/auth/guest" \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\":\"$DEVICE_ID\",\"platform\":\"desktop-web\"}"
} | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.token||"")')"

if [[ -z "$TOKEN" ]]; then
  echo "[eq-iq-deep] FAIL auth token missing"
  exit 1
fi

ARIA_API_BASE="$API_BASE" ARIA_TOKEN="$TOKEN" node <<'NODE'
const base = String(process.env.ARIA_API_BASE || "").trim();
const token = String(process.env.ARIA_TOKEN || "").trim();

if (!base || !token) {
  console.error("[eq-iq-deep] missing API base or token");
  process.exit(1);
}

const EQ_TEMPLATE_PATTERNS = [
  /执行策略模板/i,
  /固定模板/i,
  /占位回复/i,
  /无法处理你的请求/i
];

const EQ_EMPATHY_PATTERNS = [
  /我在/i,
  /陪你/i,
  /理解/i,
  /听起来/i,
  /辛苦/i,
  /抱抱/i,
  /别急/i,
  /先/i,
  /一起/i,
  /没关系/i,
  /放心/i
];

const CONTINUITY_PATTERNS = [
  /我记得/i,
  /我记着/i,
  /记着呢/i,
  /记得的/i,
  /刚才/i,
  /刚刚/i,
  /前面/i,
  /之前/i,
  /你说过/i,
  /一直陪着你/i,
  /怕失败/i,
  /怕的不是失败/i
];

const latencyP95 = (items) => {
  if (!items.length) return 0;
  const sorted = [...items].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[idx];
};

const latencyAvg = (items) => {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + item, 0) / items.length);
};

async function request(method, path, body) {
  const startedAt = Date.now();
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${method} ${path} -> HTTP ${response.status}: ${text.slice(0, 280)}`);
  }
  return { data, latencyMs: Date.now() - startedAt };
}

function extractLastAriaReply(payload) {
  const messages = Array.isArray(payload?.state?.messages) ? payload.state.messages : [];
  for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
    const item = messages[idx];
    if (item && item.role === "aria") {
      return String(item.text || "").trim();
    }
  }
  return "";
}

function previewText(text, max = 84) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  return raw.length > max ? `${raw.slice(0, max)}...` : raw;
}

async function runEqSuite() {
  const cases = [
    { id: "eq-love-fatigue", scene: "love", text: "我今天真的很累，感觉什么都做不好" },
    { id: "eq-love-no-lecture", scene: "love", text: "你别讲大道理，先抱抱我就好" },
    { id: "eq-life-family-care", scene: "life", text: "我妈最近睡不好，我有点担心，帮我安排今晚怎么照顾她" },
    { id: "eq-work-shame", scene: "work", text: "我今天被老板批评了，很难受，先安慰我再给我一小步行动" },
    { id: "eq-love-continuity", scene: "love", text: "我们刚刚聊到我怕失败，你还记得吗？给我一句稳住的话" }
  ];

  const rows = [];
  const latencies = [];
  let templateHitCount = 0;
  let empathyMissCount = 0;
  let continuityMissCount = 0;
  let fallbackCount = 0;

  for (const testCase of cases) {
    const { data, latencyMs } = await request("POST", "/v1/message", {
      scene: testCase.scene,
      text: testCase.text
    });
    latencies.push(latencyMs);

    const reply = extractLastAriaReply(data);
    const isFallback = Boolean(data?.modelRoute?.fallback);
    const templateHit = EQ_TEMPLATE_PATTERNS.some((pattern) => pattern.test(reply));
    const empathyHit = EQ_EMPATHY_PATTERNS.some((pattern) => pattern.test(reply));
    const continuityNeeded = testCase.id === "eq-love-continuity";
    const continuityHit = !continuityNeeded || CONTINUITY_PATTERNS.some((pattern) => pattern.test(reply));

    if (isFallback) fallbackCount += 1;
    if (templateHit) templateHitCount += 1;
    if (!empathyHit) empathyMissCount += 1;
    if (!continuityHit) continuityMissCount += 1;

    rows.push({
      id: testCase.id,
      latencyMs,
      fallback: isFallback,
      templateHit,
      empathyHit,
      continuityHit,
      replyPreview: previewText(reply)
    });
  }

  return {
    rows,
    count: cases.length,
    templateHitCount,
    empathyMissCount,
    continuityMissCount,
    fallbackCount,
    fallbackRate: Number((fallbackCount / Math.max(cases.length, 1)).toFixed(2)),
    p95LatencyMs: latencyP95(latencies),
    avgLatencyMs: latencyAvg(latencies)
  };
}

async function runIqSuite() {
  const previewCases = [
    {
      id: "iq-preview-research",
      payload: { scene: "work", text: "帮我查今天AI新闻，并给我链接" },
      expectFamily: "retrieval",
      expectOps: ["web_research"]
    },
    {
      id: "iq-preview-delivery",
      payload: { scene: "work", text: "帮我从桌面找最近的png图片并回传路径" },
      expectFamily: "delivery",
      expectOps: ["file_search", "channel_send"]
    },
    {
      id: "iq-preview-template",
      payload: { scene: "work", text: "帮我生成一份今天工作复盘卡片" },
      expectFamily: "content_delivery",
      expectOps: ["structured_template"]
    }
  ];

  const previewRows = [];
  let previewPassCount = 0;

  for (const testCase of previewCases) {
    const { data, latencyMs } = await request("POST", "/v1/intent/preview", testCase.payload);
    const family = String(data?.intentContract?.objective?.intentFamily || "");
    const opTypes = Array.isArray(data?.planPreview?.operationTypes) ? data.planPreview.operationTypes : [];
    const validationOk = Boolean(data?.intentValidation?.ok);
    const fallbackApplied = Boolean(data?.intentValidation?.fallbackApplied);
    const familyOk = family === testCase.expectFamily;
    const opsOk = testCase.expectOps.every((item) => opTypes.includes(item));
    const passed = validationOk && !fallbackApplied && familyOk && opsOk;
    if (passed) previewPassCount += 1;

    previewRows.push({
      id: testCase.id,
      latencyMs,
      family,
      opTypes,
      validationOk,
      fallbackApplied,
      passed
    });
  }

  const executeRows = [];
  const executeLatencies = [];
  let executedCount = 0;
  let executeSuccessCount = 0;

  for (let round = 1; round <= 4; round += 1) {
    const { data, latencyMs } = await request("POST", "/v1/message", {
      scene: "work",
      text: `第${round}次执行：帮我从桌面找最近的png图片并回传路径`
    });
    executeLatencies.push(latencyMs);
    const autoExecution = data?.autoExecution || {};
    const executed = Boolean(autoExecution?.executed);
    const dispatchStatus = String(autoExecution?.dispatchStatus || "").trim();
    const dispatchStatusLower = dispatchStatus.toLowerCase();
    const reply = extractLastAriaReply(data);
    const hasPathSignal = /\/Users\/|https?:\/\/|\.png/i.test(reply);
    const hasProgressSignal = /后台|执行中|处理中|继续执行|进度|回执|在跑|排队/i.test(reply);
    const evidence = autoExecution?.evidence && typeof autoExecution.evidence === "object"
      ? autoExecution.evidence
      : null;
    const evidenceVerifiedCount = Number(evidence?.verifiedArtifactCount || 0);
    const evidenceMissing = evidence?.missingVerifiedArtifact === true;
    const inFlight = ["running", "queued", "pending", "planned", "retrying"].includes(dispatchStatusLower);
    const terminal = ["completed", "partial", "failed", "blocked"].includes(dispatchStatusLower);
    const success = executed && (
      (inFlight && hasProgressSignal && !hasPathSignal)
      || (terminal && (
        dispatchStatusLower === "failed"
        || dispatchStatusLower === "blocked"
        || evidenceVerifiedCount > 0
        || evidenceMissing
      ))
    );

    if (executed) executedCount += 1;
    if (success) executeSuccessCount += 1;

    executeRows.push({
      id: `iq-exec-delivery-${round}`,
      latencyMs,
      executed,
      dispatchStatus,
      inFlight,
      terminal,
      hasPathSignal,
      hasProgressSignal,
      evidenceVerifiedCount,
      evidenceMissing,
      success,
      replyPreview: previewText(reply)
    });
  }

  const { data: dispatchOk, latencyMs: dispatchOkLatency } = await request("POST", "/v1/autonomy/dispatch", {
    text: "调用API GET https://raw.githubusercontent.com/github/gitignore/main/README.md 并执行命令: node --version",
    execute: true
  });
  const dispatchHappyPath = {
    latencyMs: dispatchOkLatency,
    status: String(dispatchOk?.dispatch?.status || ""),
    stepCount: Array.isArray(dispatchOk?.dispatch?.steps) ? dispatchOk.dispatch.steps.length : 0,
    passed: ["completed", "partial", "running", "queued", "pending"].includes(String(dispatchOk?.dispatch?.status || ""))
  };

  await request("POST", "/v1/autonomy/queue/policy", {
    enabled: true,
    autoProcessOnTick: true,
    processLimit: 5,
    strategies: {
      api_call: {
        maxAttempts: 2,
        baseDelayMs: 200,
        maxDelayMs: 400,
        circuitBreakerThreshold: 10
      }
    }
  });

  const { data: dispatchFailSeed } = await request("POST", "/v1/autonomy/dispatch", {
    text: "调用API GET https://raw.githubusercontent.com/github/gitignore/main/__aria_missing__.md",
    execute: true
  });
  const dispatchFailSeedFailedSteps = (Array.isArray(dispatchFailSeed?.dispatch?.steps) ? dispatchFailSeed.dispatch.steps : [])
    .filter((step) => String(step.status || "") === "failed").length;

  const queueProcessRounds = [];
  for (let round = 1; round <= 3; round += 1) {
    const { data } = await request("POST", "/v1/autonomy/queue/process", { limit: 5 });
    const result = data?.result || {};
    queueProcessRounds.push({
      round,
      processed: Number(result?.processed || 0),
      retried: Number(result?.retried || 0),
      deadLettered: Number(result?.deadLettered || 0)
    });
  }

  const { data: queueState } = await request("GET", "/v1/autonomy/queue");
  const deadLetters = Array.isArray(queueState?.queue?.deadLetters) ? queueState.queue.deadLetters : [];
  const deadLetterId = String(deadLetters[0]?.id || "").trim();
  let deadLetterRetryOk = deadLetters.length === 0;
  if (deadLetterId) {
    const { data: retryData } = await request("POST", "/v1/autonomy/queue/dead-letter/retry", { id: deadLetterId });
    deadLetterRetryOk = Boolean(retryData?.ok);
  }

  return {
    previewRows,
    previewPassCount,
    previewTotal: previewCases.length,
    executeRows,
    executeCount: 4,
    executedCount,
    executeSuccessCount,
    executeSuccessRate: Number((executeSuccessCount / 4).toFixed(2)),
    executeP95LatencyMs: latencyP95(executeLatencies),
    executeAvgLatencyMs: latencyAvg(executeLatencies),
    dispatchHappyPath,
    dispatchFailSeedFailedSteps,
    queueProcessRounds,
    queuePending: Number(queueState?.pending || 0),
    queueDeadLetters: Number(queueState?.deadLetters || 0),
    deadLetterRetryOk
  };
}

async function main() {
  const eq = await runEqSuite();
  const iq = await runIqSuite();

  const warnings = [];
  const failures = [];

  if (eq.templateHitCount > 0) {
    warnings.push(`EQ 模板化命中 ${eq.templateHitCount}/${eq.count}`);
  }
  if (eq.fallbackRate > 0.3) {
    warnings.push(`EQ 回落本地 fallback 比例偏高: ${eq.fallbackRate}`);
  }
  if (eq.p95LatencyMs > 7000) {
    warnings.push(`EQ 延迟偏高 p95=${eq.p95LatencyMs}ms`);
  }

  if (eq.empathyMissCount >= 2) {
    failures.push(`EQ 共情缺失过多 ${eq.empathyMissCount}/${eq.count}`);
  }
  if (eq.continuityMissCount > 1) {
    failures.push(`EQ 连续性场景命中不足 ${eq.continuityMissCount}`);
  }

  if (iq.previewPassCount < iq.previewTotal) {
    failures.push(`IQ 意图预检未全通过 ${iq.previewPassCount}/${iq.previewTotal}`);
  }
  if (iq.executeSuccessRate < 0.67) {
    failures.push(`IQ 执行成功率过低 ${iq.executeSuccessRate}`);
  }
  if (!iq.dispatchHappyPath.passed) {
    failures.push(`IQ happy-path dispatch 未 completed`);
  }
  if (!iq.deadLetterRetryOk) {
    failures.push(`IQ dead-letter 重试未成功`);
  }

  console.log("[eq-iq-deep] === EQ Rows ===");
  for (const row of eq.rows) {
    console.log(
      `[eq-iq-deep] ${row.id} latency=${row.latencyMs}ms fallback=${row.fallback} empathy=${row.empathyHit} template=${row.templateHit} continuity=${row.continuityHit} reply="${row.replyPreview}"`
    );
  }
  console.log(`[eq-iq-deep] EQ summary avg=${eq.avgLatencyMs}ms p95=${eq.p95LatencyMs}ms fallbackRate=${eq.fallbackRate} empathyMiss=${eq.empathyMissCount} templateHit=${eq.templateHitCount}`);

  console.log("[eq-iq-deep] === IQ Preview Rows ===");
  for (const row of iq.previewRows) {
    console.log(
      `[eq-iq-deep] ${row.id} latency=${row.latencyMs}ms passed=${row.passed} family=${row.family} ops=${row.opTypes.join(",")}`
    );
  }

  console.log("[eq-iq-deep] === IQ Execute Rows ===");
  for (const row of iq.executeRows) {
    console.log(
      `[eq-iq-deep] ${row.id} latency=${row.latencyMs}ms executed=${row.executed} status=${row.dispatchStatus} pathSignal=${row.hasPathSignal} success=${row.success} reply="${row.replyPreview}"`
    );
  }

  console.log(`[eq-iq-deep] IQ summary preview=${iq.previewPassCount}/${iq.previewTotal} execSuccess=${iq.executeSuccessCount}/${iq.executeCount} execAvg=${iq.executeAvgLatencyMs}ms execP95=${iq.executeP95LatencyMs}ms dispatchHappy=${iq.dispatchHappyPath.passed} queuePending=${iq.queuePending} queueDead=${iq.queueDeadLetters} deadRetry=${iq.deadLetterRetryOk}`);
  console.log(`[eq-iq-deep] IQ queue rounds ${iq.queueProcessRounds.map((row) => `#${row.round}(p${row.processed}/r${row.retried}/d${row.deadLettered})`).join(" ")}`);

  if (warnings.length > 0) {
    console.log("[eq-iq-deep] WARNINGS:");
    for (const item of warnings) {
      console.log(`[eq-iq-deep]  - ${item}`);
    }
  }

  if (failures.length > 0) {
    console.error("[eq-iq-deep] FAILED:");
    for (const item of failures) {
      console.error(`[eq-iq-deep]  - ${item}`);
    }
    process.exit(1);
  }

  console.log("[eq-iq-deep] PASS");
}

main().catch((error) => {
  console.error("[eq-iq-deep] runtime error:", error && error.message ? error.message : String(error));
  process.exit(1);
});
NODE
