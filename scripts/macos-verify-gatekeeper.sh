#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-apps/desktop/src-tauri/target}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "[macos-verify] FAIL this script must run on macOS"
  exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "[macos-verify] FAIL target dir not found: $TARGET_DIR"
  exit 1
fi

mapfile -t DMG_FILES < <(find "$TARGET_DIR" -type f -name '*.dmg' | sort)
mapfile -t APP_BUNDLES < <(find "$TARGET_DIR" -type d -name '*.app' | sort)

if [[ ${#DMG_FILES[@]} -eq 0 && ${#APP_BUNDLES[@]} -eq 0 ]]; then
  echo "[macos-verify] FAIL no app/dmg artifacts found under $TARGET_DIR"
  exit 1
fi

for app in "${APP_BUNDLES[@]}"; do
  echo "[macos-verify] codesign verify app: $app"
  codesign --verify --deep --strict --verbose=2 "$app"
  echo "[macos-verify] spctl assess app: $app"
  spctl --assess --type execute --verbose=4 "$app"
done

for dmg in "${DMG_FILES[@]}"; do
  echo "[macos-verify] spctl assess dmg: $dmg"
  spctl --assess --type open --verbose=4 "$dmg"
done

echo "[macos-verify] PASS app_count=${#APP_BUNDLES[@]} dmg_count=${#DMG_FILES[@]}"
