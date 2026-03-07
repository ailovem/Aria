#!/usr/bin/env bash
set -euo pipefail

ok=0
warn=0

print_ok() {
  printf '[ok]   %s\n' "$1"
  ok=$((ok + 1))
}

print_warn() {
  printf '[warn] %s\n' "$1"
  warn=$((warn + 1))
}

echo "== Aria macOS permission doctor =="

if osascript -e 'tell application "System Events" to get name of first process' >/dev/null 2>&1; then
  print_ok "Accessibility / Automation to System Events is available."
else
  print_warn "Accessibility permission seems missing (System Events denied)."
fi

if osascript -e 'tell application "Mail" to return "ok"' >/dev/null 2>&1; then
  print_ok "Mail automation is allowed."
else
  print_warn "Mail automation not granted yet."
fi

if osascript -e 'tell application "Messages" to return "ok"' >/dev/null 2>&1; then
  print_ok "Messages automation is allowed."
else
  print_warn "Messages automation not granted yet."
fi

if command -v ffmpeg >/dev/null 2>&1; then
  print_ok "ffmpeg installed (used for audio capability checks)."
else
  print_warn "ffmpeg missing, install with: brew install ffmpeg"
fi

if say -v "?" >/dev/null 2>&1; then
  print_ok "System TTS voices are available."
else
  print_warn "System TTS voices unavailable."
fi

echo
echo "Passed: $ok"
echo "Warnings: $warn"

if [[ "$warn" -gt 0 ]]; then
  echo
  echo "To grant permissions quickly:"
  echo "1) open 'System Settings -> Privacy & Security'"
  echo "2) enable: Accessibility, Automation, Microphone"
  echo "3) reopen terminal and rerun this doctor"
fi
