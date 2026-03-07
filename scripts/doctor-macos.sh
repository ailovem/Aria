#!/usr/bin/env bash
set -euo pipefail

ok=0
fail=0

warn() {
  printf '[warn] %s\n' "$1"
}

check_cmd() {
  local name="$1"
  local cmd="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    printf '[ok]   %s: %s\n' "$name" "$($cmd --version 2>/dev/null | head -n 1 || echo found)"
    ok=$((ok + 1))
  else
    printf '[fail] %s: missing (%s)\n' "$name" "$cmd"
    fail=$((fail + 1))
  fi
}

check_homebrew_optional() {
  if command -v brew >/dev/null 2>&1; then
    printf '[ok]   Homebrew: %s\n' "$(brew --version | head -n 1)"
    ok=$((ok + 1))
    return
  fi
  warn "Homebrew: missing (optional in no-sudo mode)"
}

check_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    printf '[ok]   pnpm: %s\n' "$(pnpm --version | head -n 1)"
    ok=$((ok + 1))
    return
  fi
  if command -v corepack >/dev/null 2>&1; then
    if corepack pnpm --version >/dev/null 2>&1; then
      printf '[ok]   pnpm: %s (via corepack)\n' "$(corepack pnpm --version | head -n 1)"
      ok=$((ok + 1))
      return
    fi
  fi
  printf '[fail] pnpm: missing (pnpm/corepack pnpm)\n'
  fail=$((fail + 1))
}

check_tauri() {
  if command -v tauri >/dev/null 2>&1; then
    printf '[ok]   Tauri CLI: %s\n' "$(tauri --version 2>/dev/null | head -n 1 || echo found)"
    ok=$((ok + 1))
    return
  fi
  if [[ -f "apps/desktop/package.json" ]] && grep -q '"@tauri-apps/cli"' "apps/desktop/package.json"; then
    printf '[ok]   Tauri CLI: project local dependency detected\n'
    ok=$((ok + 1))
    return
  fi
  printf '[fail] Tauri CLI: missing (tauri)\n'
  fail=$((fail + 1))
}

check_pod() {
  if command -v pod >/dev/null 2>&1; then
    printf '[ok]   CocoaPods: %s\n' "$(pod --version 2>/dev/null | head -n 1 || echo found)"
    ok=$((ok + 1))
    return
  fi
  local user_pod
  user_pod="$(find "$HOME/.gem" -type f -path '*/bin/pod' 2>/dev/null | head -n 1 || true)"
  if [[ -n "$user_pod" ]]; then
    printf '[ok]   CocoaPods: %s (user install)\n' "$("$user_pod" --version 2>/dev/null | head -n 1 || echo found)"
    ok=$((ok + 1))
    return
  fi
  printf '[fail] CocoaPods: missing (pod)\n'
  fail=$((fail + 1))
}

check_flutter() {
  if command -v flutter >/dev/null 2>&1; then
    printf '[ok]   Flutter: found in PATH\n'
    ok=$((ok + 1))
    return
  fi
  if [[ -x "$HOME/flutter/bin/flutter" ]]; then
    printf '[ok]   Flutter: binary found at $HOME/flutter/bin/flutter\n'
    ok=$((ok + 1))
    return
  fi
  printf '[fail] Flutter: missing (flutter)\n'
  fail=$((fail + 1))
}

echo "== Aria macOS doctor =="

if xcode-select -p >/dev/null 2>&1; then
  echo "[ok]   Xcode CLT: $(xcode-select -p)"
  ok=$((ok + 1))
else
  echo "[fail] Xcode CLT: missing"
  fail=$((fail + 1))
fi

if command -v xcodebuild >/dev/null 2>&1; then
  echo "[ok]   Xcode: $(xcodebuild -version | head -n 1)"
  ok=$((ok + 1))
else
  echo "[fail] Xcode: missing"
  fail=$((fail + 1))
fi

check_homebrew_optional
check_cmd "Git" git
check_cmd "Node.js" node
check_pnpm
check_cmd "jq" jq
check_cmd "ffmpeg" ffmpeg
check_cmd "Rust" rustc
check_cmd "Cargo" cargo
check_tauri
check_pod
check_flutter

echo
echo "Passed: $ok"
echo "Failed: $fail"

if [[ "$fail" -gt 0 ]]; then
  echo "Some dependencies are missing."
  echo "Try: bash scripts/setup-macos.sh"
  echo "Fallback (no sudo): bash scripts/setup-macos-userland.sh"
  exit 1
fi

echo "Environment looks good."
echo "Optional: run permission doctor with bash scripts/doctor-permissions-macos.sh"
