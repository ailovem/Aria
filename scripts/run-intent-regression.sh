#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"

cd "$ROOT_DIR"
bash "$ROOT_DIR/scripts/ensure-runtime-up.sh" >/dev/null

TOKEN="$(
  DEVICE_ID="intent-regression-$(date +%s)"
  curl -s -X POST "$API_BASE/v1/auth/guest" \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\":\"$DEVICE_ID\",\"platform\":\"desktop-web\"}" \
    | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.token||"")'
)"

if [[ -z "$TOKEN" ]]; then
  echo "[intent-regression] failed to get auth token"
  exit 1
fi

ARIA_API_BASE="$API_BASE" ARIA_TOKEN="$TOKEN" node <<'NODE'
const base = String(process.env.ARIA_API_BASE || "").trim();
const token = String(process.env.ARIA_TOKEN || "").trim();
if (!base || !token) {
  console.error("[intent-regression] missing API base or token");
  process.exit(1);
}

async function post(path, payload) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
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
    throw new Error(`${path} -> HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  return data;
}

function assert(condition, message, failures) {
  if (!condition) {
    failures.push(message);
  }
}

async function run() {
  const failures = [];

  const previewCases = [
    {
      id: "work-news-intent",
      payload: { scene: "work", text: "帮我查今天的AI新闻，并给我链接" },
      expect: { intentFamily: "retrieval", mustTypes: ["web_research"] }
    },
    {
      id: "life-file-delivery-intent",
      payload: { scene: "life", text: "从桌面找一张图片发给我" },
      expect: { intentFamily: "delivery", mustTypes: ["file_search", "channel_send"] }
    },
    {
      id: "work-template-intent",
      payload: { scene: "work", text: "帮我做一份每日AI资讯图文卡片" },
      expect: { intentFamily: "content_delivery", mustTypes: ["structured_template"] }
    }
  ];

  for (const testCase of previewCases) {
    const result = await post("/v1/intent/preview", testCase.payload);
    const validation = result.intentValidation || {};
    const contract = result.intentContract || {};
    const operationTypes = Array.isArray(result.planPreview?.operationTypes)
      ? result.planPreview.operationTypes
      : [];
    assert(validation.ok === true, `[${testCase.id}] intent validation not ok`, failures);
    assert(validation.fallbackApplied !== true, `[${testCase.id}] fallback applied unexpectedly`, failures);
    assert(
      String(contract?.objective?.intentFamily || "") === testCase.expect.intentFamily,
      `[${testCase.id}] intentFamily mismatch: got=${String(contract?.objective?.intentFamily || "")}`,
      failures
    );
    for (const type of testCase.expect.mustTypes) {
      assert(
        operationTypes.includes(type),
        `[${testCase.id}] missing operation type: ${type} | got=${operationTypes.join(",")}`,
        failures
      );
    }
    console.log(`[intent-regression] preview ${testCase.id} ok`);
  }

  const gameCases = [
    { id: "game-match3", text: "帮我做个消消乐游戏", scene: "fun", expectBlueprint: "match3" },
    { id: "game-tetris", text: "帮我做个俄罗斯方块", scene: "fun", expectBlueprint: "tetris" },
    { id: "game-snake", text: "再做一个贪吃蛇", scene: "fun", expectBlueprint: "snake" }
  ];

  for (const testCase of gameCases) {
    const result = await post("/v1/message", {
      text: testCase.text,
      scene: testCase.scene
    });
    const funGame = result.funGame || {};
    const blueprint = String(funGame.blueprint || "").trim();
    const playUrl = String(funGame.playUrl || "").trim();
    assert(blueprint === testCase.expectBlueprint, `[${testCase.id}] blueprint mismatch: got=${blueprint}`, failures);
    assert(playUrl.includes("/fun/games/"), `[${testCase.id}] missing playable URL`, failures);
    console.log(`[intent-regression] execute ${testCase.id} ok -> ${playUrl}`);
  }

  if (failures.length > 0) {
    console.error("[intent-regression] FAILED");
    for (const item of failures) {
      console.error(` - ${item}`);
    }
    process.exit(1);
  }
  console.log("[intent-regression] PASS");
}

run().catch((error) => {
  console.error("[intent-regression] runtime error:", error && error.message ? error.message : String(error));
  process.exit(1);
});
NODE
