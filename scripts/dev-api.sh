#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
echo "[dev-api] starting mock API at http://127.0.0.1:8787"
echo "[dev-api] tip: run bridge in another shell -> node services/bridge/bridge-server.mjs"
node services/api/mock-server.mjs
