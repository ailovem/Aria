#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
API_BASE="http://${API_HOST}:${API_PORT}"

pass_count=0
fail_count=0

run_check() {
  local name="$1"
  shift
  if "$@"; then
    printf '[button-smoke] PASS %s\n' "$name"
    pass_count=$((pass_count + 1))
  else
    printf '[button-smoke] FAIL %s\n' "$name"
    fail_count=$((fail_count + 1))
  fi
}

check_json_field() {
  local method="$1"
  local path="$2"
  local body="$3"
  local expr="$4"

  local output
  if [[ -n "$body" ]]; then
    output="$(curl -fsS -X "$method" "$API_BASE$path" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$body")" || return 1
  else
    output="$(curl -fsS -X "$method" "$API_BASE$path" \
      -H "Authorization: Bearer $TOKEN")" || return 1
  fi
  printf '%s' "$output" | node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));const ok=(function(){${expr}})();if(!ok){process.exit(1);}"
}

check_incident_remember() {
  local status
  status="$(curl -s -o /tmp/aria-button-incident.json -w '%{http_code}' -X POST "$API_BASE/v1/aria-kernel/incidents/remember" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{}')"
  node -e 'const fs=require("fs");const status=String(process.argv[1]||"");const d=JSON.parse(fs.readFileSync("/tmp/aria-button-incident.json","utf8"));const ok=((status==="200"&&d.ok===true)||(status==="404"&&d.reason==="incident_not_found"));process.exit(ok?0:1);' "$status"
}

cd "$ROOT_DIR"

bash "$ROOT_DIR/scripts/ensure-runtime-up.sh" >/dev/null

run_check "root endpoint" bash -lc "curl -fsS '$API_BASE/' | node -e \"const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.exit(d.ok===true?0:1)\""
run_check "v1 index" bash -lc "curl -fsS '$API_BASE/v1' | node -e \"const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.exit(Array.isArray(d.keyEndpoints)?0:1)\""
run_check "health endpoint" bash -lc "curl -fsS '$API_BASE/health' | node -e \"const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.exit(d.ok===true?0:1)\""

TOKEN="$({
  DEVICE_ID="button-smoke-$(date +%s)"
  curl -fsS -X POST "$API_BASE/v1/auth/guest" \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\":\"$DEVICE_ID\",\"platform\":\"desktop-web\"}"
} | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.token||"")')"

if [[ -z "$TOKEN" ]]; then
  echo "[button-smoke] FAIL auth token missing"
  exit 1
fi

run_check "state snapshot" check_json_field GET "/v1/state" "" "return Boolean(d.state && Array.isArray(d.state.messages));"
run_check "grant desktop control" check_json_field POST "/v1/device/permissions" '{"capabilityId":"desktop.global_control","status":"granted","reason":"button-smoke"}' "return d.ok===true;"
run_check "grant mobile album" check_json_field POST "/v1/device/permissions" '{"capabilityId":"mobile.photos_organize","status":"granted","reason":"button-smoke"}' "return d.ok===true;"

# Desktop: chat / memory / brain button flows
run_check "chat send message" check_json_field POST "/v1/message" '{"text":"请帮我整理今天工作任务，并自动执行可执行项"}' "return Boolean(d.state && d.state.messages && d.state.messages.length > 0);"
run_check "memory search" check_json_field GET "/v1/memory/search?q=%E5%B7%A5%E4%BD%9C&limit=3" "" "return Array.isArray(d.items);"
run_check "runtime health" check_json_field GET "/v1/runtime/health" "" "return Boolean(d.runtime && d.failureInsights);"
run_check "incident playbook" check_json_field GET "/v1/aria-kernel/incidents/playbook" "" "return Boolean(d.playbook && Array.isArray(d.playbook.matched));"
run_check "incident remember" check_incident_remember

# Desktop: workbench and device buttons
run_check "workbench intent" check_json_field POST "/v1/workbench/intent" '{"text":"生成一份按钮功能验收计划并执行"}' "return d.ok===true && Boolean(d.workbench);"
run_check "workbench tool run" check_json_field POST "/v1/workbench/tool/run" '{"toolId":"plugin_center","payload":{"source":"button-smoke"}}' "return d.ok===true;"
run_check "device plan" check_json_field POST "/v1/device/tasks/plan" '{"taskType":"desktop_focus_cleanup","payload":{"source":"button-smoke"}}' "return d.ok===true && Boolean(d.task && d.task.id);"

TASK_ID="$(curl -fsS -X POST "$API_BASE/v1/device/tasks/plan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskType":"mobile_album_cleanup","payload":{"source":"button-smoke"}}' \
  | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));process.stdout.write(d.task?.id||"")')"
if [[ -n "$TASK_ID" ]]; then
  run_check "device execute" check_json_field POST "/v1/device/tasks/execute" "{\"taskId\":\"$TASK_ID\"}" "return d.ok===true && Boolean(d.task);"
else
  echo "[button-smoke] FAIL device execute (task id missing)"
  fail_count=$((fail_count + 1))
fi

# Desktop: autonomy panel buttons
run_check "autonomy tick" check_json_field POST "/v1/autonomy/tick" '{}' "return typeof d.changed==='boolean';"
run_check "autonomy repair" check_json_field POST "/v1/autonomy/repair" '{}' "return typeof d.repaired==='boolean';"
run_check "autonomy dispatch" check_json_field POST "/v1/autonomy/dispatch" '{"text":"调用API GET https://example.com 并汇总要点","execute":true}' "return Boolean(d.dispatch) && Boolean(d.autonomy);"
run_check "autonomy queue process" check_json_field POST "/v1/autonomy/queue/process" '{"limit":5}' "return Boolean(d.result);"
run_check "autonomy queue policy" check_json_field POST "/v1/autonomy/queue/policy" '{"enabled":true,"autoProcessOnTick":true}' "return d.ok===true && Boolean(d.policy);"

# Desktop: system config buttons
run_check "system config fetch" check_json_field GET "/v1/system/config" "" "return Boolean(d.modelRoutingPolicy && d.runtime);"
run_check "system config sync aria-kernel" check_json_field POST "/v1/system/config/sync-aria-kernel" '{"persist":false,"mode":"merge","includeLocal":false,"operatorSource":"button-smoke"}' "return d.ok===true && Array.isArray(d.syncedProviders);"
run_check "system config history" check_json_field GET "/v1/system/config/history?limit=4" "" "return Boolean(d.history && Array.isArray(d.history.timeline));"
run_check "system config rollback" check_json_field POST "/v1/system/config/rollback" '{"persist":false,"mode":"previous_stable","operatorSource":"button-smoke"}' "return d.ok===true || d.reason==='already_latest';"

# Mobile service center button mappings
run_check "mobile create memory" check_json_field POST "/v1/memory" '{"content":"移动端能力涌现：button smoke"}' "return Boolean(d.item && d.item.id);"
run_check "mobile permissions" check_json_field POST "/v1/device/permissions" '{"capabilityId":"mobile.voice_assistant","status":"granted","reason":"button-smoke"}' "return d.ok===true;"
run_check "mobile voice tts" check_json_field POST "/v1/voice/tts" '{"text":"button smoke voice check","dryRun":true}' "return d.ok===true;"
run_check "mobile timeline" check_json_field GET "/v1/timeline/unified?limit=60" "" "return Boolean(d.timeline && Array.isArray(d.timeline.events));"

printf '[button-smoke] DONE pass=%d fail=%d\n' "$pass_count" "$fail_count"
if [[ "$fail_count" -gt 0 ]]; then
  exit 1
fi
