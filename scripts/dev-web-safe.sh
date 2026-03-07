#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="$ROOT_DIR/apps/desktop"
WEB_HOST="${ARIA_WEB_HOST:-0.0.0.0}"
WEB_PORT="${ARIA_WEB_PORT:-1420}"

bash "$ROOT_DIR/scripts/ensure-runtime-up.sh"
HTTPS_INFO="$(bash "$ROOT_DIR/scripts/setup-local-https.sh")"
CERT_FILE="$(echo "$HTTPS_INFO" | awk -F= '/^CERT_FILE=/{print $2}')"
KEY_FILE="$(echo "$HTTPS_INFO" | awk -F= '/^KEY_FILE=/{print $2}')"

if command -v lsof >/dev/null 2>&1; then
  EXISTING_PID="$(lsof -ti tcp:"$WEB_PORT" -sTCP:LISTEN | head -n 1 || true)"
  if [[ -n "${EXISTING_PID}" ]]; then
    EXISTING_CMD="$(ps -p "$EXISTING_PID" -o command= | sed 's/^ *//')"
    if [[ "$EXISTING_CMD" == *"vite"* ]]; then
      echo "[dev-web] Vite already running on https://127.0.0.1:${WEB_PORT} (pid ${EXISTING_PID})."
      echo "[dev-web] If the browser shows a local certificate warning, choose 'Advanced -> Continue'."
      echo "[dev-web] Open the HTTPS URL directly; no need to start a second process."
      exit 0
    fi
    echo "[dev-web] Port ${WEB_PORT} is occupied by non-Vite process: pid=${EXISTING_PID}"
    echo "[dev-web] ${EXISTING_CMD}"
    echo "[dev-web] Run cleanup: bash \"$ROOT_DIR/scripts/cleanup-dev-runtime.sh\""
    exit 1
  fi
fi

cd "$DESKTOP_DIR"
ARIA_WEB_HTTPS=true ARIA_WEB_CERT_FILE="$CERT_FILE" ARIA_WEB_KEY_FILE="$KEY_FILE" \
  exec npx vite --host "$WEB_HOST" --port "$WEB_PORT"
