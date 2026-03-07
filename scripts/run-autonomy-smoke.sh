#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"
BRIDGE_HOST="${ARIA_BRIDGE_HOST:-127.0.0.1}"
BRIDGE_PORT="${ARIA_BRIDGE_PORT:-8788}"
BRIDGE_BASE="http://${BRIDGE_HOST}:${BRIDGE_PORT}"
CURL_OPTS=(
  -fsS
  --connect-timeout 3
  --max-time 30
)

cd "$ROOT_DIR"
export ARIA_BRIDGE_BASE="$BRIDGE_BASE"
export ARIA_AUTONOMY_QUEUE_RETRY_BASE_MS="${ARIA_AUTONOMY_QUEUE_RETRY_BASE_MS:-200}"
export ARIA_AUTONOMY_QUEUE_MAX_ATTEMPTS="${ARIA_AUTONOMY_QUEUE_MAX_ATTEMPTS:-2}"
BRIDGE_PID=""
API_PID=""
BRIDGE_STARTED_BY_SMOKE=0
API_STARTED_BY_SMOKE=0

wait_http() {
  local label="$1"
  local url="$2"
  local retries="${3:-50}"
  local sleep_sec="${4:-0.2}"
  local i=1
  while [[ "$i" -le "$retries" ]]; do
    if curl "${CURL_OPTS[@]}" "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$sleep_sec"
    i=$((i + 1))
  done
  echo "[autonomy-smoke] ${label} not ready: ${url}"
  return 1
}

start_if_needed() {
  local label="$1"
  local health_url="$2"
  local command="$3"
  local log_file="$4"
  if curl "${CURL_OPTS[@]}" "$health_url" >/dev/null 2>&1; then
    echo "[autonomy-smoke] ${label} already ready"
    return 0
  fi
  echo "[autonomy-smoke] starting ${label}..."
  eval "$command" >"$log_file" 2>&1 &
  local pid=$!
  if [[ "$label" == "bridge" ]]; then
    BRIDGE_PID="$pid"
    BRIDGE_STARTED_BY_SMOKE=1
  else
    API_PID="$pid"
    API_STARTED_BY_SMOKE=1
  fi
}

cleanup() {
  if [[ "$BRIDGE_STARTED_BY_SMOKE" -eq 1 ]] && [[ -n "$BRIDGE_PID" ]] && kill -0 "$BRIDGE_PID" >/dev/null 2>&1; then
    kill "$BRIDGE_PID" >/dev/null 2>&1 || true
  fi
  if [[ "$API_STARTED_BY_SMOKE" -eq 1 ]] && [[ -n "$API_PID" ]] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

start_if_needed "bridge" "${BRIDGE_BASE}/health" "node services/bridge/bridge-server.mjs" "/tmp/aria-bridge-smoke.log"
start_if_needed "api" "${API_BASE}/health" "node services/api/mock-server.mjs" "/tmp/aria-autonomy-smoke.log"

wait_http "bridge" "${BRIDGE_BASE}/health" 80 0.2
wait_http "api" "${API_BASE}/health" 80 0.2

TOKEN_PAYLOAD="$(
  DEVICE_ID="autonomy-smoke-$(date +%s)"
  curl "${CURL_OPTS[@]}" -X POST "$API_BASE/v1/auth/guest" \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\":\"$DEVICE_ID\",\"platform\":\"desktop-web\"}"
)"
TOKEN="$(echo "$TOKEN_PAYLOAD" | node -e 'const fs=require("fs");const text=fs.readFileSync(0,"utf8").trim();if(!text){process.stdout.write("");process.exit(0);}const d=JSON.parse(text);process.stdout.write(d.token||"")' 2>/dev/null || true)"

if [[ -z "$TOKEN" ]]; then
  echo "[autonomy-smoke] failed to get token"
  echo "[autonomy-smoke] auth payload: ${TOKEN_PAYLOAD:-<empty>}"
  exit 1
fi

echo "[autonomy-smoke] token ok"

curl -s "$BRIDGE_BASE/health" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] bridge adapters="+(d.adapters??0)+" actions="+(d.actions??0));'

curl -s "$API_BASE/v1/autonomy/status" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] tick="+(d.autonomy?.tickCount??0)+" generated="+(d.autonomy?.generatedCount??0));'

curl -s -X POST "$API_BASE/v1/autonomy/tick" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] manual tick changed="+String(d.changed));'

curl -s -X POST "$API_BASE/v1/autonomy/repair" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] manual repair="+String(d.repaired));'

curl -s "$API_BASE/v1/autonomy/inbox" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] inbox="+(d.total??0));'

PROACTIVE_JSON="$(curl -s -X POST "$API_BASE/v1/proactive/next" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scene":"smoke","localHour":10}')"
echo "$PROACTIVE_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] proactive decision="+d.decision+" confidence="+String(d.trigger_confidence));'

SUGGESTION_ID="$(echo "$PROACTIVE_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.suggestion?.id||"")')"
if [[ -n "$SUGGESTION_ID" ]]; then
  curl -s -X POST "$API_BASE/v1/proactive/feedback" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"feedback\":\"executed\",\"suggestionId\":\"$SUGGESTION_ID\"}" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] feedback applied="+String(d.applied));'
fi

curl -s -X POST "$API_BASE/v1/message" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"提醒我明晚给妈妈打电话"}' >/dev/null

curl -s "$API_BASE/v1/memory/search?q=%E5%A6%88%E5%A6%88&limit=2" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const first=(d.items||[])[0]||{};console.log("[autonomy-smoke] memory fields="+Object.keys(first).filter(k=>k.includes("score")||k.includes("confidence")).join(","));'

WORKDAY_JSON="$(curl -s "$API_BASE/v1/workday/state" -H "Authorization: Bearer $TOKEN")"
echo "$WORKDAY_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] workday clarity="+(d.workday?.clarityScore??0)+" quests="+(d.workday?.quests?.length??0));'
QUEST_ID="$(echo "$WORKDAY_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write((d.workday?.quests||[])[0]?.id||"")')"
if [[ -n "$QUEST_ID" ]]; then
  curl -s -X POST "$API_BASE/v1/workday/quest/complete" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"questId\":\"$QUEST_ID\"}" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] quest complete reason="+(d.reason||""));'
fi

curl -s -X POST "$API_BASE/v1/device/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"capabilityId":"mobile.photos_organize","status":"granted","reason":"smoke"}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] photo permission="+(d.deviceOps?.permissions?.["mobile.photos_organize"]||""));'

PLAN_JSON="$(curl -s -X POST "$API_BASE/v1/device/tasks/plan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskType":"mobile_album_cleanup","payload":{"target":"camera-roll"}}')"
TASK_ID="$(echo "$PLAN_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.task?.id||"")')"
if [[ -n "$TASK_ID" ]]; then
  curl -s -X POST "$API_BASE/v1/device/tasks/execute" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"taskId\":\"$TASK_ID\"}" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] device task status="+(d.task?.status||"unknown"));'
fi

curl -s "$API_BASE/v1/device/audit?limit=2" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] device audit="+(d.total??0));'

curl -s "$API_BASE/v1/hardware/status" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const cpu=d.snapshot?.cpu?.cores??0;const mem=d.snapshot?.memory?.usedGb??0;console.log("[autonomy-smoke] hardware ok="+String(d.ok)+" cpu="+cpu+" memUsed="+mem);'

curl -s -X POST "$API_BASE/v1/voice/tts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Aria bridge smoke test","dryRun":true}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] voice tts ok="+String(d.ok));'

curl -s -X POST "$API_BASE/v1/device/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"capabilityId":"desktop.global_control","status":"granted","reason":"dispatch smoke"}' >/dev/null

curl -s -X POST "$API_BASE/v1/autonomy/dispatch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"调用API GET https://raw.githubusercontent.com/github/gitignore/main/README.md 并执行命令: node --version","execute":true}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const steps=d.dispatch?.steps||[];console.log("[autonomy-smoke] dispatch status="+(d.dispatch?.status||"unknown")+" steps="+steps.length);'

curl -s -X POST "$API_BASE/v1/autonomy/queue/policy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"autoProcessOnTick":true,"processLimit":5,"strategies":{"api_call":{"maxAttempts":2,"baseDelayMs":200,"maxDelayMs":400,"circuitBreakerThreshold":10}}}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] queue policy api_call attempts="+(d.policy?.strategies?.api_call?.maxAttempts??0));'

curl -s -X POST "$API_BASE/v1/autonomy/dispatch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"调用API GET https://raw.githubusercontent.com/github/gitignore/main/__aria_missing__.md","execute":true}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const failed=(d.dispatch?.steps||[]).filter(s=>s.status==="failed").length;console.log("[autonomy-smoke] dispatch retry seed failed="+failed);'

sleep 1

for round in 1 2 3; do
  curl -s -X POST "$API_BASE/v1/autonomy/queue/process" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"limit":5}' \
    | node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));const r=d.result||{};console.log('[autonomy-smoke] queue process #$round processed='+(r.processed??0)+' retried='+(r.retried??0)+' dead='+(r.deadLettered??0));"
  sleep 1
done

QUEUE_JSON="$(curl -s "$API_BASE/v1/autonomy/queue" -H "Authorization: Bearer $TOKEN")"
echo "$QUEUE_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] queue pending="+(d.pending??0)+" dead="+(d.deadLetters??0));'
DEAD_LETTER_ID="$(echo "$QUEUE_JSON" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write((d.queue?.deadLetters||[])[0]?.id||"")')"
if [[ -n "$DEAD_LETTER_ID" ]]; then
  curl -s -X POST "$API_BASE/v1/autonomy/queue/dead-letter/retry" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"$DEAD_LETTER_ID\"}" \
    | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] dead letter retried="+String(d.ok));'
fi

curl -s "$API_BASE/v1/autonomy/status" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const timeline=(d.autonomy?.timeline||[]).length;const layers=(d.autonomy?.failureInsights?.layers||[]).map(i=>i.id+":"+i.count).join(",");console.log("[autonomy-smoke] timeline="+timeline+" failureLayers="+layers);'

curl -s "$API_BASE/v1/capability/assessment" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] independence="+(d.assessment?.independenceScore??0)+" cores="+((d.assessment?.cores||[]).length));'

curl -s "$API_BASE/v1/capability/fusion" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const score=d.fusion?.readinessScore??0;const dup=d.fusion?.summary?.duplicateRiskCount??0;console.log("[autonomy-smoke] fusion readiness="+score+" duplicateRisk="+dup);'

curl -s "$API_BASE/v1/capability/super-autonomy" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const score=d.runtime?.readinessScore??0;const skill=d.runtime?.summary?.skillReadiness??0;const missing=d.runtime?.summary?.missingRequiredSkillCount??0;console.log("[autonomy-smoke] super autonomy readiness="+score+" skillReadiness="+skill+" missing="+missing);'

curl -s "$API_BASE/v1/aria-kernel/gateway/status" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] gateway status="+(d.gateway?.status||"unknown")+" probe="+(d.gateway?.watchdog?.lastProbeStatus||"unknown"));'

SESSION_ID="$(curl -s -X POST "$API_BASE/v1/aria-kernel/session/spawn" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"runtime":"subagent","mode":"session","purpose":"smoke"}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.session?.id||"")')"
if [[ -n "$SESSION_ID" ]]; then
  curl -s -X POST "$API_BASE/v1/aria-kernel/session/send" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"$SESSION_ID\",\"text\":\"smoke task\"}" \
    | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] session send="+String(d.ok)+" receipt="+(d.receipt?.sessionId||""));'
fi

curl -s "$API_BASE/v1/aria-kernel/task-center" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const p=d.taskCenter?.summary?.pendingCount??0;const c=d.taskCenter?.summary?.completedCount??0;console.log("[autonomy-smoke] task center pending="+p+" completed="+c);'

curl -s "$API_BASE/v1/aria-kernel/execution-center" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const e=d.executionCenter?.summary?.executionCount??0;const dc=d.executionCenter?.summary?.deliveryCount??0;console.log("[autonomy-smoke] execution center exec="+e+" delivery="+dc);'

curl -s "$API_BASE/v1/aria-kernel/model/fallback/status" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const ready=d.fallback?.summary?.fallbackReady??false;console.log("[autonomy-smoke] model fallback ready="+String(ready));'

curl -s "$API_BASE/v1/aria-kernel/progress/protocol" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const t=d.protocol?.status?.longTaskThresholdSec??0;const i=d.protocol?.status?.intervalSec??0;console.log("[autonomy-smoke] progress protocol threshold="+t+" interval="+i);'

curl -s "$API_BASE/v1/aria-kernel/incidents/playbook" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const m=d.playbook?.matchedCount??0;const t=d.playbook?.totalIncidents??0;console.log("[autonomy-smoke] incident playbook matched="+m+"/"+t);'

INCIDENT_REMEMBER_STATUS="$(
  curl -s -o /tmp/aria-autonomy-incident-remember.json -w '%{http_code}' -X POST "$API_BASE/v1/aria-kernel/incidents/remember" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{}'
)"
node -e 'const fs=require("fs");const status=String(process.argv[1]||"");const d=JSON.parse(fs.readFileSync("/tmp/aria-autonomy-incident-remember.json","utf8"));const ok=((status==="200"&&d.ok===true)||(status==="404"&&d.reason==="incident_not_found"));console.log("[autonomy-smoke] incident remember ok="+String(ok)+" status="+status+" remembered="+(d.remembered??0));' "$INCIDENT_REMEMBER_STATUS"

curl -s -X POST "$API_BASE/v1/system/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persist":false,"operatorName":"autonomy-smoke","operatorSource":"smoke","changeReason":"history-check","modelRoutingPatch":{"degradeStrategy":{"maxRetries":4}}}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] config update changed="+String(d.changed)+" sections="+(d.changedSections||[]).join(","));'

curl -s -X POST "$API_BASE/v1/system/config/sync-aria-kernel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persist":false,"mode":"merge","includeLocal":false,"operatorName":"autonomy-smoke","operatorSource":"smoke","note":"sync-aria-kernel-smoke"}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] sync aria-kernel ok="+String(d.ok)+" reason="+(d.reason||"")+" providers="+((d.syncedProviders||[]).length));'

curl -s "$API_BASE/v1/system/config/history?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const total=(d.history?.timeline||[]).length;console.log("[autonomy-smoke] config history timeline="+total+" latest="+(d.history?.latestSnapshotId||""));'

curl -s -X POST "$API_BASE/v1/system/config/rollback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persist":false,"mode":"previous_stable","operatorName":"autonomy-smoke","operatorSource":"smoke","note":"rollback-check"}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] config rollback changed="+String(d.changed)+" reason="+(d.reason||""));'

curl -s "$API_BASE/v1/expansion/security" \
  -H "Authorization: Bearer $TOKEN" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const profile=d.expansionSecurityPolicy?.defaultSandboxProfile||"unknown";const limit=d.expansionSecurityPolicy?.whitelist?.maxDownloadBytes??0;console.log("[autonomy-smoke] expansion security profile="+profile+" maxDownload="+limit);'

curl -s -X POST "$API_BASE/v1/expansion/security" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persist":false,"expansionSecurityPatch":{"sandboxProfiles":{"standard":{"maxCapabilities":2}}}}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const cap=d.expansionSecurityPolicy?.sandboxProfiles?.standard?.maxCapabilities??0;console.log("[autonomy-smoke] sandbox cap standard="+cap);'

SEC_PACK_ID="pack.smoke.$(date +%s)"
curl -s -X POST "$API_BASE/v1/expansion/packs/install" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"packId\":\"$SEC_PACK_ID\",\"name\":\"Smoke Security Pack\",\"source\":\"smoke\",\"sandboxProfile\":\"standard\",\"capabilities\":[\"web.fetch\",\"file.download\",\"runtime.exec\",\"skill.route\"]}" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const granted=(d.pack?.capabilities||[]).length;const restricted=(d.pack?.security?.restrictedCapabilities||[]).length;console.log("[autonomy-smoke] sandbox install granted="+granted+" restricted="+restricted+" ok="+String(d.ok));'

curl -s -X POST "$API_BASE/v1/expansion/security" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persist":false,"expansionSecurityPatch":{"enforceSignedPacks":true}}' >/dev/null

curl -s -X POST "$API_BASE/v1/expansion/packs/install" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"packId\":\"pack.smoke.unsigned.$(date +%s)\",\"name\":\"Unsigned Pack\",\"source\":\"smoke\",\"sandboxProfile\":\"standard\",\"capabilities\":[\"web.fetch\"]}" \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));console.log("[autonomy-smoke] signature enforce ok="+String(d.ok)+" reason="+(d.reason||""));'

curl -s -X POST "$API_BASE/v1/expansion/security" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"persist":false,"expansionSecurityPatch":{"enforceSignedPacks":false,"sandboxProfiles":{"standard":{"maxCapabilities":12}}}}' >/dev/null

echo "[autonomy-smoke] done"
