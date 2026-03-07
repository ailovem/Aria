#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"
bash "$PROJECT_DIR/scripts/run-desktop-demo.sh"

echo
echo "Done. Press Enter to close."
read -r _
