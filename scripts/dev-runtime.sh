#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_BIND_HOST="${ARIA_RUNTIME_BIND_HOST:-0.0.0.0}"
BRIDGE_PORT="${ARIA_BRIDGE_PORT:-8788}"
LOCK_ROOT="$ROOT_DIR/.runtime/locks"
LOCK_DIR="$LOCK_ROOT/dev-runtime.lock"
LOCK_STALE_SEC="${ARIA_RUNTIME_LOCK_STALE_SEC:-10800}"

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

mkdir -p "$LOCK_ROOT"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  LOCK_MTIME="$(stat -f %m "$LOCK_DIR" 2>/dev/null || echo 0)"
  NOW_SEC="$(date +%s)"
  if [[ "$LOCK_MTIME" =~ ^[0-9]+$ ]] && (( NOW_SEC - LOCK_MTIME > LOCK_STALE_SEC )); then
    rm -rf "$LOCK_DIR" 2>/dev/null || true
    mkdir "$LOCK_DIR"
  else
    echo "[dev-runtime] Another runtime process is already running."
    echo "[dev-runtime] If this is stale, run: rm -rf \"$LOCK_DIR\""
    exit 1
  fi
fi

if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:8787 | xargs -r kill >/dev/null 2>&1 || true
  lsof -ti tcp:"$BRIDGE_PORT" | xargs -r kill >/dev/null 2>&1 || true
fi

cd "$ROOT_DIR"
export ARIA_BRIDGE_BASE="http://127.0.0.1:${BRIDGE_PORT}"
ARIA_BRIDGE_HOST="$RUNTIME_BIND_HOST" node services/bridge/bridge-server.mjs &
BRIDGE_PID=$!
ARIA_API_HOST="$RUNTIME_BIND_HOST" node services/api/mock-server.mjs &
API_PID=$!

wait_for_http() {
  local label="$1"
  local url="$2"
  local retries="${3:-40}"
  local delay_sec="${4:-0.25}"
  if ! command -v curl >/dev/null 2>&1; then
    return 0
  fi
  local i
  for ((i = 1; i <= retries; i += 1)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[dev-runtime] $label ready: $url"
      return 0
    fi
    sleep "$delay_sec"
  done
  echo "[dev-runtime] ERROR: $label failed to start: $url"
  return 1
}

cleanup() {
  if kill -0 "$BRIDGE_PID" >/dev/null 2>&1; then
    kill "$BRIDGE_PID" >/dev/null 2>&1 || true
  fi
  if kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
  rmdir "$LOCK_DIR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[dev-runtime] bridge pid: $BRIDGE_PID"
echo "[dev-runtime] api pid: $API_PID"
wait_for_http "bridge" "http://127.0.0.1:${BRIDGE_PORT}/health"
wait_for_http "api" "http://127.0.0.1:8787/health"
echo "[dev-runtime] press Ctrl+C to stop"

wait "$API_PID"
