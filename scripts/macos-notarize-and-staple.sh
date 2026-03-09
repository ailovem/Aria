#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-apps/desktop/src-tauri/target}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "[macos-notary] FAIL this script must run on macOS"
  exit 1
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "[macos-notary] FAIL xcrun not found"
  exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "[macos-notary] FAIL target dir not found: $TARGET_DIR"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

notary_args=()
if [[ -n "${APPLE_NOTARY_PROFILE:-}" ]]; then
  notary_args=(--keychain-profile "$APPLE_NOTARY_PROFILE")
elif [[ -n "${APPLE_ID:-}" && -n "${APPLE_APP_SPECIFIC_PASSWORD:-}" && -n "${APPLE_TEAM_ID:-}" ]]; then
  notary_args=(
    --apple-id "$APPLE_ID"
    --password "$APPLE_APP_SPECIFIC_PASSWORD"
    --team-id "$APPLE_TEAM_ID"
  )
elif [[ -n "${APPLE_API_KEY_BASE64:-}" && -n "${APPLE_API_KEY_ID:-}" && -n "${APPLE_API_ISSUER:-}" ]]; then
  API_KEY_PATH="$TMP_DIR/AuthKey_${APPLE_API_KEY_ID}.p8"
  if base64 --help 2>/dev/null | grep -q -- "--decode"; then
    printf '%s' "$APPLE_API_KEY_BASE64" | base64 --decode >"$API_KEY_PATH"
  else
    printf '%s' "$APPLE_API_KEY_BASE64" | base64 -D >"$API_KEY_PATH"
  fi
  chmod 600 "$API_KEY_PATH"
  notary_args=(
    --key "$API_KEY_PATH"
    --key-id "$APPLE_API_KEY_ID"
    --issuer "$APPLE_API_ISSUER"
  )
elif [[ -n "${APPLE_API_KEY_PATH:-}" && -n "${APPLE_API_KEY_ID:-}" && -n "${APPLE_API_ISSUER:-}" ]]; then
  notary_args=(
    --key "$APPLE_API_KEY_PATH"
    --key-id "$APPLE_API_KEY_ID"
    --issuer "$APPLE_API_ISSUER"
  )
else
  echo "[macos-notary] FAIL missing notarization credentials"
  echo "[macos-notary] Provide one of:"
  echo "  1) APPLE_NOTARY_PROFILE"
  echo "  2) APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD + APPLE_TEAM_ID"
  echo "  3) APPLE_API_KEY_BASE64 + APPLE_API_KEY_ID + APPLE_API_ISSUER"
  echo "  4) APPLE_API_KEY_PATH + APPLE_API_KEY_ID + APPLE_API_ISSUER"
  exit 1
fi

mapfile -t DMG_FILES < <(find "$TARGET_DIR" -type f -name '*.dmg' | sort)
mapfile -t APP_TGZ_FILES < <(find "$TARGET_DIR" -type f -name '*.app.tar.gz' | sort)
mapfile -t APP_BUNDLES < <(find "$TARGET_DIR" -type d -name '*.app' | sort)

if [[ ${#DMG_FILES[@]} -eq 0 ]]; then
  echo "[macos-notary] FAIL no dmg found under $TARGET_DIR"
  exit 1
fi

if [[ ${#APP_TGZ_FILES[@]} -eq 0 ]]; then
  echo "[macos-notary] WARN no .app.tar.gz found; will notarize dmg only"
fi

submit_one() {
  local path="$1"
  echo "[macos-notary] submit: $path"
  xcrun notarytool submit "$path" "${notary_args[@]}" --wait
}

for archive in "${APP_TGZ_FILES[@]}"; do
  submit_one "$archive"
done

for dmg in "${DMG_FILES[@]}"; do
  submit_one "$dmg"
done

for app in "${APP_BUNDLES[@]}"; do
  echo "[macos-notary] staple app: $app"
  xcrun stapler staple "$app" || true
done

for dmg in "${DMG_FILES[@]}"; do
  echo "[macos-notary] staple dmg: $dmg"
  xcrun stapler staple "$dmg"
done

echo "[macos-notary] PASS notarized=$(( ${#APP_TGZ_FILES[@]} + ${#DMG_FILES[@]} )) stapled_dmg=${#DMG_FILES[@]}"
