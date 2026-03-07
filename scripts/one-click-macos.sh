#!/usr/bin/env bash
set -euo pipefail

echo "[one-click-macos] Step 1/3: setup"
if ! bash "$(dirname "$0")/setup-macos.sh"; then
  echo "[one-click-macos] admin setup failed. Switching to no-sudo mode."
  bash "$(dirname "$0")/setup-macos-userland.sh"
fi

echo "[one-click-macos] Step 2/3: doctor"
bash "$(dirname "$0")/doctor-macos.sh"

echo "[one-click-macos] Step 3/3: permission doctor"
bash "$(dirname "$0")/doctor-permissions-macos.sh" || true

echo "[one-click-macos] Complete."
