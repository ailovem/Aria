#!/usr/bin/env bash
set -euo pipefail

KEYCHAIN_NAME="${APPLE_KEYCHAIN_NAME:-aria-signing.keychain-db}"
KEYCHAIN_PASSWORD="${APPLE_KEYCHAIN_PASSWORD:-}"
CERT_BASE64="${APPLE_CERTIFICATE_BASE64:-${APPLE_CERTIFICATE:-}}"
CERT_PASSWORD="${APPLE_CERTIFICATE_PASSWORD:-}"

if [[ -z "$CERT_BASE64" ]]; then
  echo "[macos-sign] FAIL missing APPLE_CERTIFICATE_BASE64 (or APPLE_CERTIFICATE)"
  exit 1
fi

if [[ -z "$CERT_PASSWORD" ]]; then
  echo "[macos-sign] FAIL missing APPLE_CERTIFICATE_PASSWORD"
  exit 1
fi

if [[ -z "$KEYCHAIN_PASSWORD" ]]; then
  echo "[macos-sign] FAIL missing APPLE_KEYCHAIN_PASSWORD"
  exit 1
fi

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "[macos-sign] FAIL this script must run on macOS"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
CERT_PATH="$TMP_DIR/signing-cert.p12"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if base64 --help 2>/dev/null | grep -q -- "--decode"; then
  printf '%s' "$CERT_BASE64" | base64 --decode >"$CERT_PATH"
else
  printf '%s' "$CERT_BASE64" | base64 -D >"$CERT_PATH"
fi

security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME" || true
security set-keychain-settings -lut 21600 "$KEYCHAIN_NAME"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"

security import "$CERT_PATH" \
  -k "$KEYCHAIN_NAME" \
  -P "$CERT_PASSWORD" \
  -T /usr/bin/codesign \
  -T /usr/bin/security \
  -T /usr/bin/productbuild \
  -T /usr/bin/xcrun

security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"

CURRENT_KEYCHAINS="$(security list-keychains -d user | tr -d '"')"
security list-keychains -d user -s "$KEYCHAIN_NAME" $CURRENT_KEYCHAINS
security default-keychain -d user -s "$KEYCHAIN_NAME"

echo "[macos-sign] installed identities:"
security find-identity -v -p codesigning "$KEYCHAIN_NAME"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "keychain_name=$KEYCHAIN_NAME"
  } >>"$GITHUB_OUTPUT"
fi

echo "[macos-sign] PASS keychain=$KEYCHAIN_NAME"
