#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/apps/desktop/public"

if [[ $# -ne 3 ]]; then
  echo "Usage: bash scripts/map-outfit-to-persona.sh <persona_id> <scene(work|fun|life|love)> <image_path>"
  exit 1
fi

persona_id="$1"
scene="$2"
source_path="$3"

case "$scene" in
  work|fun|life|love) ;;
  *)
    echo "[outfit-map] invalid scene: $scene"
    exit 1
    ;;
esac

if [[ ! -f "$source_path" ]]; then
  echo "[outfit-map] source not found: $source_path"
  exit 1
fi

mkdir -p "$PUBLIC_DIR"

ext="${source_path##*.}"
ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
target="$PUBLIC_DIR/avatar-${persona_id}-${scene}.png"

if [[ "$ext" == "png" ]]; then
  cp "$source_path" "$target"
else
  if command -v sips >/dev/null 2>&1; then
    sips -s format png "$source_path" --out "$target" >/dev/null 2>&1
  else
    cp "$source_path" "$target"
  fi
fi

echo "[outfit-map] applied: ${persona_id}/${scene} -> $target"
