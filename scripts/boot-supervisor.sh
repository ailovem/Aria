#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.runtime/logs"
SUPERVISOR_LOG="$LOG_DIR/supervisor.log"
LOCK_ROOT="$ROOT_DIR/.runtime/locks"
LOCK_DIR="$LOCK_ROOT/boot-supervisor.lock"
LOCK_PID_FILE="$LOCK_DIR/pid"
RUNTIME_BIND_HOST="${ARIA_RUNTIME_BIND_HOST:-0.0.0.0}"
API_PORT="${ARIA_API_PORT:-8787}"
BRIDGE_PORT="${ARIA_BRIDGE_PORT:-8788}"
WEB_PORT="${ARIA_WEB_PORT:-1420}"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

mkdir -p "$LOG_DIR" "$LOCK_ROOT"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  local line="[$(timestamp)] [supervisor] $*"
  echo "$line" >> "$SUPERVISOR_LOG"
  if [[ -t 1 ]]; then
    echo "$line"
  fi
}

pid_alive() {
  local pid="$1"
  [[ -n "${pid:-}" ]] && kill -0 "$pid" >/dev/null 2>&1
}

acquire_lock() {
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "$$" > "$LOCK_PID_FILE"
    return 0
  fi

  local existing_pid=""
  if [[ -f "$LOCK_PID_FILE" ]]; then
    existing_pid="$(cat "$LOCK_PID_FILE" 2>/dev/null || true)"
  fi

  if pid_alive "$existing_pid"; then
    log "another supervisor already running pid=${existing_pid}; skip duplicate start"
    exit 0
  fi

  rm -rf "$LOCK_DIR" >/dev/null 2>&1 || true
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "$$" > "$LOCK_PID_FILE"
    log "recovered stale supervisor lock"
    return 0
  fi

  log "failed to acquire supervisor lock: $LOCK_DIR"
  exit 1
}

kill_port_if_busy() {
  local port="$1"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  lsof -ti tcp:"$port" | xargs -r kill >/dev/null 2>&1 || true
}

ensure_https_cert() {
  local cert_info
  cert_info="$(bash "$ROOT_DIR/scripts/setup-local-https.sh")"
  WEB_CERT_FILE="$(echo "$cert_info" | awk -F= '/^CERT_FILE=/{print $2}')"
  WEB_KEY_FILE="$(echo "$cert_info" | awk -F= '/^KEY_FILE=/{print $2}')"
  WEB_LAN_IP="$(echo "$cert_info" | awk -F= '/^LAN_IP=/{print $2}')"
  export WEB_CERT_FILE WEB_KEY_FILE WEB_LAN_IP
}

start_bridge() {
  kill_port_if_busy "$BRIDGE_PORT"
  ARIA_BRIDGE_HOST="$RUNTIME_BIND_HOST" \
    node "$ROOT_DIR/services/bridge/bridge-server.mjs" >>"$LOG_DIR/bridge.log" 2>&1 &
  BRIDGE_PID=$!
  log "bridge started pid=${BRIDGE_PID} port=${BRIDGE_PORT}"
}

start_api() {
  kill_port_if_busy "$API_PORT"
  ARIA_API_HOST="$RUNTIME_BIND_HOST" ARIA_BRIDGE_BASE="http://127.0.0.1:${BRIDGE_PORT}" \
    node "$ROOT_DIR/services/api/mock-server.mjs" >>"$LOG_DIR/api.log" 2>&1 &
  API_PID=$!
  log "api started pid=${API_PID} port=${API_PORT}"
}

start_web() {
  kill_port_if_busy "$WEB_PORT"
  local vite_bin="$ROOT_DIR/apps/desktop/node_modules/.bin/vite"
  if [[ ! -x "$vite_bin" ]]; then
    log "vite binary missing: $vite_bin (run: cd $ROOT_DIR/apps/desktop && npm install)"
    WEB_PID=""
    return 1
  fi
  (
    cd "$ROOT_DIR/apps/desktop"
    ARIA_WEB_HTTPS=true \
    ARIA_WEB_CERT_FILE="$WEB_CERT_FILE" \
    ARIA_WEB_KEY_FILE="$WEB_KEY_FILE" \
      "$vite_bin" --host 0.0.0.0 --port "$WEB_PORT"
  ) >>"$LOG_DIR/web.log" 2>&1 &
  WEB_PID=$!
  log "web started pid=${WEB_PID} port=${WEB_PORT} https=true lan=${WEB_LAN_IP:-unknown}"
  return 0
}

cleanup() {
  for pid in "${WEB_PID:-}" "${API_PID:-}" "${BRIDGE_PID:-}"; do
    if pid_alive "$pid"; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
  if [[ -f "$LOCK_PID_FILE" ]]; then
    local owner_pid
    owner_pid="$(cat "$LOCK_PID_FILE" 2>/dev/null || true)"
    if [[ "$owner_pid" == "$$" ]]; then
      rm -rf "$LOCK_DIR" >/dev/null 2>&1 || true
    fi
  fi
}

trap cleanup EXIT INT TERM

acquire_lock
log "boot supervisor starting"
ensure_https_cert
start_bridge
start_api
start_web || true

while true; do
  if ! pid_alive "${BRIDGE_PID:-}"; then
    log "bridge not alive, restarting"
    start_bridge
  fi

  if ! pid_alive "${API_PID:-}"; then
    log "api not alive, restarting"
    start_api
  fi

  if ! pid_alive "${WEB_PID:-}"; then
    log "web not alive, restarting"
    ensure_https_cert
    start_web || true
  fi

  sleep 3
done
