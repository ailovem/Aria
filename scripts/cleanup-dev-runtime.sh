#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_DIR="$ROOT_DIR/.runtime/locks"

echo "[cleanup] stopping Aria dev processes..."

if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:8787 | xargs -r kill >/dev/null 2>&1 || true
  lsof -ti tcp:8788 | xargs -r kill >/dev/null 2>&1 || true
  lsof -ti tcp:1420 | xargs -r kill >/dev/null 2>&1 || true
fi

pkill -f '/scripts/dev-runtime.sh' >/dev/null 2>&1 || true
pkill -f '/scripts/run-desktop-demo.sh' >/dev/null 2>&1 || true
pkill -f '/scripts/run-mobile-demo.sh' >/dev/null 2>&1 || true
pkill -f 'npm run dev:web' >/dev/null 2>&1 || true
pkill -f 'npx vite build' >/dev/null 2>&1 || true
pkill -f '/apps/desktop/node_modules/.bin/vite' >/dev/null 2>&1 || true
pkill -f 'node services/api/mock-server.mjs' >/dev/null 2>&1 || true
pkill -f 'node services/bridge/bridge-server.mjs' >/dev/null 2>&1 || true

if [[ -d "$LOCK_DIR" ]]; then
  rm -rf "$LOCK_DIR"/dev-runtime.lock "$LOCK_DIR"/run-desktop-demo.lock "$LOCK_DIR"/run-mobile-demo.lock
fi

rm -f "$ROOT_DIR/.runtime/api.pid" "$ROOT_DIR/.runtime/bridge.pid"

echo "[cleanup] done."
echo "[cleanup] verify:"
ps -Ao pid,ppid,etime,command \
  | egrep '/scripts/(dev-runtime|run-desktop-demo|run-mobile-demo)\\.sh|npm run dev:web|vite --host 0.0.0.0 --port 1420|mock-server.mjs|bridge-server.mjs' \
  | grep -v egrep \
  || true
