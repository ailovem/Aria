#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "[staging-validation] running release doctor"
NODE_ENV=production \
ARIA_AUTH_MODE="${ARIA_AUTH_MODE:-external}" \
ARIA_EXTERNAL_AUTH_SHARED_SECRET="${ARIA_EXTERNAL_AUTH_SHARED_SECRET:-staging-shared-secret-change-before-prod}" \
ARIA_ENABLE_GUEST_AUTH=false \
ARIA_ENABLE_DEMO_ENDPOINTS=false \
ARIA_TOKEN_SECRET="${ARIA_TOKEN_SECRET:-production-secret-key-1234567890}" \
ARIA_DATA_FILE="${ARIA_DATA_FILE:-runtime-state.json}" \
bash scripts/check-production-readiness.sh

echo "[staging-validation] running extended UAT"
bash scripts/run-30-user-acceptance.sh

echo "[staging-validation] DONE"
