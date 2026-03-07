#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-apps/desktop}"

echo "[build-desktop] Using app dir: $APP_DIR"

if [[ ! -d "$APP_DIR" ]]; then
  echo "[build-desktop] ERROR: directory not found: $APP_DIR"
  exit 1
fi

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "[build-desktop] ERROR: package.json not found in $APP_DIR"
  exit 1
fi

pushd "$APP_DIR" >/dev/null

if command -v pnpm >/dev/null 2>&1; then
  pnpm install --no-frozen-lockfile
  if pnpm run | grep -qE '(^|\\s)tauri(\\s|$)'; then
    pnpm run tauri build
  else
    pnpm dlx tauri build
  fi
else
  echo "[build-desktop] pnpm missing. Falling back to npm."
  npm install
  if npm run | grep -q ' tauri'; then
    npm run tauri -- build
  else
    npx tauri build
  fi
fi

popd >/dev/null

echo "[build-desktop] Done. Installer output is under:"
echo "[build-desktop] $APP_DIR/src-tauri/target/release/bundle"
