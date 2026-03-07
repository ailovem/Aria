#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRIDGE_PORT="${ARIA_BRIDGE_PORT:-8788}"

if ! command -v node >/dev/null 2>&1; then
  echo "[run-bridge-macos] ERROR: node is missing."
  exit 1
fi

if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:"$BRIDGE_PORT" | xargs -r kill >/dev/null 2>&1 || true
fi

cd "$ROOT_DIR"
echo "[run-bridge-macos] starting native bridge at http://127.0.0.1:${BRIDGE_PORT}"
node services/bridge/bridge-server.mjs
