#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_LOG_DIR="$ROOT_DIR/.runtime/logs"

echo "[restart-web] cleanup old processes..."
bash "$ROOT_DIR/scripts/cleanup-dev-runtime.sh"

echo "[restart-web] apply generated outfits..."
export ARIA_OUTFIT_AUTO_BIND="${ARIA_OUTFIT_AUTO_BIND:-true}"
bash "$ROOT_DIR/scripts/apply-generated-outfits.sh"

echo "[restart-web] ensure runtime..."
bash "$ROOT_DIR/scripts/ensure-runtime-up.sh"

echo "[restart-web] setup local https cert..."
HTTPS_INFO="$(bash "$ROOT_DIR/scripts/setup-local-https.sh")"
CERT_FILE="$(echo "$HTTPS_INFO" | awk -F= '/^CERT_FILE=/{print $2}')"
KEY_FILE="$(echo "$HTTPS_INFO" | awk -F= '/^KEY_FILE=/{print $2}')"
LAN_IP="$(echo "$HTTPS_INFO" | awk -F= '/^LAN_IP=/{print $2}')"

mkdir -p "$WEB_LOG_DIR"

echo "[restart-web] start vite dev server..."
(
  cd "$ROOT_DIR/apps/desktop"
  ARIA_WEB_HTTPS=true ARIA_WEB_CERT_FILE="$CERT_FILE" ARIA_WEB_KEY_FILE="$KEY_FILE" \
    nohup npx vite --host 0.0.0.0 --port 1420 > "$WEB_LOG_DIR/web.log" 2>&1 &
  echo "$!" > "$ROOT_DIR/.runtime/web.pid"
)

sleep 1

if command -v lsof >/dev/null 2>&1; then
  lsof -nP -iTCP:1420 -sTCP:LISTEN || true
fi

echo "[restart-web] done"
echo "[restart-web] open: https://127.0.0.1:1420"
echo "[restart-web] open-lan: https://${LAN_IP}:1420"
echo "[restart-web] log:  $WEB_LOG_DIR/web.log"
