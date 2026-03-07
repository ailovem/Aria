#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_DIR="$ROOT_DIR/.runtime/locks"
DESKTOP_DIR="$ROOT_DIR/apps/desktop"

echo "[antigravity-ui] 1/4 清理残留进程与锁..."
bash "$ROOT_DIR/scripts/cleanup-dev-runtime.sh"

if [[ -d "$LOCK_DIR" ]]; then
  find "$LOCK_DIR" -mindepth 1 -maxdepth 1 -type d -name "*.lock" -exec rm -rf {} + >/dev/null 2>&1 || true
fi

echo "[antigravity-ui] 2/4 清理陈旧 pid 文件..."
rm -f "$ROOT_DIR/.runtime/api.pid" "$ROOT_DIR/.runtime/bridge.pid"

echo "[antigravity-ui] 3/4 同步换装图并验证 UI 可构建..."
export ARIA_OUTFIT_AUTO_BIND="${ARIA_OUTFIT_AUTO_BIND:-true}"
bash "$ROOT_DIR/scripts/apply-generated-outfits.sh"
cd "$DESKTOP_DIR"
npm install --no-audit --no-fund
npm run build:web >/tmp/aria-ui-build.log 2>&1
tail -n 8 /tmp/aria-ui-build.log

echo "[antigravity-ui] 4/4 完成。可直接启动预览："
echo "  bash \"$ROOT_DIR/scripts/run-desktop-demo.sh\""
echo "如只想启动前端（API 已在跑）："
echo "  cd \"$DESKTOP_DIR\" && npm run dev:web"
