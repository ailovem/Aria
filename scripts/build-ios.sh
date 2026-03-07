#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-apps/mobile}"
SIGN_AND_EXPORT="${SIGN_AND_EXPORT:-0}"
EXPORT_OPTIONS_PLIST="${EXPORT_OPTIONS_PLIST:-ios/ExportOptions.plist}"
FLUTTER_BIN="${FLUTTER_BIN:-}"
POD_BIN="${POD_BIN:-}"

if [[ -z "$FLUTTER_BIN" ]]; then
  if command -v flutter >/dev/null 2>&1; then
    FLUTTER_BIN="flutter"
  elif [[ -x "$HOME/flutter/bin/flutter" ]]; then
    FLUTTER_BIN="$HOME/flutter/bin/flutter"
  fi
fi

echo "[build-ios] Using app dir: $APP_DIR"

if [[ ! -d "$APP_DIR" ]]; then
  echo "[build-ios] ERROR: directory not found: $APP_DIR"
  exit 1
fi

if [[ ! -f "$APP_DIR/pubspec.yaml" ]]; then
  echo "[build-ios] ERROR: pubspec.yaml not found in $APP_DIR"
  exit 1
fi

if [[ -z "$FLUTTER_BIN" ]]; then
  echo "[build-ios] ERROR: flutter missing. Run setup script first."
  exit 1
fi

if [[ -z "$POD_BIN" ]]; then
  if command -v pod >/dev/null 2>&1; then
    POD_BIN="pod"
  else
    POD_BIN="$(find "$HOME/.gem" -type f -path '*/bin/pod' 2>/dev/null | head -n 1 || true)"
  fi
fi

if [[ -z "$POD_BIN" ]]; then
  echo "[build-ios] ERROR: CocoaPods missing."
  echo "[build-ios] Install with: sudo gem install cocoapods"
  exit 1
fi

pushd "$APP_DIR" >/dev/null

if [[ ! -d ios ]]; then
  echo "[build-ios] iOS wrapper missing. Bootstrapping with flutter create..."
  "$FLUTTER_BIN" create --platforms=ios .
fi

"$FLUTTER_BIN" pub get

if [[ -d ios ]]; then
  pushd ios >/dev/null
  "$POD_BIN" install
  popd >/dev/null
fi

if [[ "$SIGN_AND_EXPORT" == "1" ]]; then
  if [[ ! -f "$EXPORT_OPTIONS_PLIST" ]]; then
    echo "[build-ios] ERROR: export options not found: $EXPORT_OPTIONS_PLIST"
    exit 1
  fi
  "$FLUTTER_BIN" build ipa --release --export-options-plist="$EXPORT_OPTIONS_PLIST"
  echo "[build-ios] Signed ipa export done."
else
  "$FLUTTER_BIN" build ios --release --no-codesign
  echo "[build-ios] Unsigned iOS build done."
fi

popd >/dev/null
