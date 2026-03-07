#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_BIND_HOST="${ARIA_RUNTIME_BIND_HOST:-0.0.0.0}"
API_HOST="${ARIA_API_HOST:-127.0.0.1}"
API_PORT="${ARIA_API_PORT:-8787}"
BRIDGE_HOST="${ARIA_BRIDGE_HOST:-127.0.0.1}"
BRIDGE_PORT="${ARIA_BRIDGE_PORT:-8788}"
API_BASE="http://${API_HOST}:${API_PORT}"
BRIDGE_BASE="http://${BRIDGE_HOST}:${BRIDGE_PORT}"
LOG_DIR="$ROOT_DIR/.runtime/logs"

MODEL_ENV_FILE="${ARIA_MODEL_ENV_FILE:-}"
if [[ -z "$MODEL_ENV_FILE" ]]; then
  if [[ -f "$ROOT_DIR/.runtime/secrets/model-providers.env" ]]; then
    MODEL_ENV_FILE="$ROOT_DIR/.runtime/secrets/model-providers.env"
  elif [[ -f "$ROOT_DIR/.runtime/model-providers.env" ]]; then
    MODEL_ENV_FILE="$ROOT_DIR/.runtime/model-providers.env"
  fi
fi
if [[ -n "$MODEL_ENV_FILE" && -f "$MODEL_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$MODEL_ENV_FILE"
fi

mkdir -p "$LOG_DIR"

wait_http() {
  local label="$1"
  local url="$2"
  local retries="${3:-40}"
  local delay_sec="${4:-0.25}"
  local i

  if ! command -v curl >/dev/null 2>&1; then
    return 0
  fi

  for ((i = 1; i <= retries; i += 1)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay_sec"
  done
  echo "[runtime] ${label} failed health check: ${url}"
  return 1
}

kill_port_if_busy() {
  local port="$1"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  lsof -ti tcp:"$port" | xargs -r kill >/dev/null 2>&1 || true
}

start_bridge_if_needed() {
  if wait_http "bridge" "${BRIDGE_BASE}/health" 1 0.1; then
    echo "[runtime] bridge already ready: ${BRIDGE_BASE}"
    return 0
  fi

  kill_port_if_busy "$BRIDGE_PORT"
  ARIA_BRIDGE_HOST="$RUNTIME_BIND_HOST" nohup node "$ROOT_DIR/services/bridge/bridge-server.mjs" >"$LOG_DIR/bridge.log" 2>&1 &
  echo "$!" > "$ROOT_DIR/.runtime/bridge.pid"
  wait_http "bridge" "${BRIDGE_BASE}/health" 40 0.25
  echo "[runtime] bridge started: ${BRIDGE_BASE}"
}

start_api_if_needed() {
  if wait_http "api" "${API_BASE}/health" 1 0.1; then
    echo "[runtime] api already ready: ${API_BASE}"
    return 0
  fi

  kill_port_if_busy "$API_PORT"
  ARIA_API_HOST="$RUNTIME_BIND_HOST" ARIA_BRIDGE_BASE="$BRIDGE_BASE" nohup node "$ROOT_DIR/services/api/mock-server.mjs" >"$LOG_DIR/api.log" 2>&1 &
  echo "$!" > "$ROOT_DIR/.runtime/api.pid"
  wait_http "api" "${API_BASE}/health" 40 0.25
  echo "[runtime] api started: ${API_BASE}"
}

start_bridge_if_needed
start_api_if_needed

echo "[runtime] ready: API=${API_BASE} BRIDGE=${BRIDGE_BASE}"
