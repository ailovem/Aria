#!/usr/bin/env bash
set -euo pipefail

if ! command -v ipconfig >/dev/null 2>&1; then
  echo "ipconfig command not found."
  exit 1
fi

echo "Wi-Fi IPv4: $(ipconfig getifaddr en0 2>/dev/null || echo unavailable)"
echo "Ethernet IPv4: $(ipconfig getifaddr en1 2>/dev/null || echo unavailable)"
