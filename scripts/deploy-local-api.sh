#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy-local-api] ERROR: docker is missing."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[deploy-local-api] ERROR: docker compose is missing."
  exit 1
fi

cd "$ROOT_DIR/deploy"
docker compose -f docker-compose.api.yml up -d --build
echo "[deploy-local-api] started aria-api-v3 at http://127.0.0.1:8787"
