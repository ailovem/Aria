#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/apps/desktop/public"
AUTO_BIND_FLAG="${ARIA_OUTFIT_AUTO_BIND:-true}"
SCAN_DEPTH="${ARIA_OUTFIT_SCAN_DEPTH:-3}"

if [[ ! -d "$PUBLIC_DIR" ]]; then
  echo "[outfit-bind] public dir not found: $PUBLIC_DIR"
  exit 1
fi

if [[ "$AUTO_BIND_FLAG" != "1" && "$AUTO_BIND_FLAG" != "true" && "$AUTO_BIND_FLAG" != "TRUE" ]]; then
  echo "[outfit-bind] skipped (set ARIA_OUTFIT_AUTO_BIND=true to enable auto binding)"
  exit 0
fi

declare -a SOURCE_DIRS
if [[ -n "${ARIA_OUTFIT_SOURCE_DIRS:-}" ]]; then
  normalized_dirs="${ARIA_OUTFIT_SOURCE_DIRS//,/\\n}"
  normalized_dirs="${normalized_dirs//;/\\n}"
  while IFS= read -r line; do
    trimmed="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [[ -n "$trimmed" ]] && SOURCE_DIRS+=("$trimmed")
  done <<< "$(printf '%b' "$normalized_dirs")"
else
  SOURCE_DIRS+=("$PUBLIC_DIR")
  SOURCE_DIRS+=("$HOME/Desktop")
  SOURCE_DIRS+=("$HOME/Desktop/我的超级女友文件")
fi

shopt -s nullglob
tmp_index_file="$(mktemp)"
tmp_selected_file="$(mktemp)"
cleanup_tmp() {
  rm -f "$tmp_index_file" "$tmp_selected_file"
}
trap cleanup_tmp EXIT

add_candidate() {
  local candidate="$1"
  local file_name persona scene generated_ts ext key mtime
  file_name="$(basename "$candidate")"
  persona=""
  scene=""
  generated_ts=""
  ext=""

  if [[ "$file_name" =~ ^avatar_([A-Za-z0-9-]+)_(work|fun|life|love)_([0-9]+)\.(png|jpg|jpeg|webp)$ ]]; then
    persona="${BASH_REMATCH[1]}"
    scene="${BASH_REMATCH[2]}"
    generated_ts="${BASH_REMATCH[3]}"
    ext="${BASH_REMATCH[4]}"
  elif [[ "$file_name" =~ ^([A-Za-z0-9-]+)_(work|fun|life|love)_([A-Za-z0-9-]+)_([0-9]+)\.(png|jpg|jpeg|webp)$ ]]; then
    persona="${BASH_REMATCH[1]}"
    scene="${BASH_REMATCH[2]}"
    generated_ts="${BASH_REMATCH[4]}"
    ext="${BASH_REMATCH[5]}"
  elif [[ "$file_name" =~ ^([A-Za-z0-9-]+)_(work|fun|life|love)_([0-9]+)\.(png|jpg|jpeg|webp)$ ]]; then
    persona="${BASH_REMATCH[1]}"
    scene="${BASH_REMATCH[2]}"
    generated_ts="${BASH_REMATCH[3]}"
    ext="${BASH_REMATCH[4]}"
  fi

  [[ -n "$persona" && -n "$scene" ]] || return 0

  mtime="$(stat -f %m "$candidate" 2>/dev/null || echo 0)"
  key="${persona}/${scene}"
  printf '%s|%s|%s|%s|%s\n' "$key" "$generated_ts" "$mtime" "$ext" "$candidate" >> "$tmp_index_file"
}

source_count=0
for source_dir in "${SOURCE_DIRS[@]}"; do
  [[ -d "$source_dir" ]] || continue
  source_count=$((source_count + 1))
  while IFS= read -r -d '' candidate; do
    add_candidate "$candidate"
  done < <(
    find "$source_dir" -maxdepth "$SCAN_DEPTH" -type f \
      \( -name "avatar_*_*_*.*" -o -name "*_work_*.*" -o -name "*_fun_*.*" -o -name "*_life_*.*" -o -name "*_love_*.*" \) \
      -print0 2>/dev/null
  )
done

if [[ ! -s "$tmp_index_file" ]]; then
  echo "[outfit-bind] done: no generated outfit files found (sources scanned: $source_count)"
  exit 0
fi

sort -t'|' -k1,1 -k2,2nr -k3,3nr "$tmp_index_file" | awk -F'|' '!seen[$1]++ {print}' > "$tmp_selected_file"

updated_count=0
converted_count=0
while IFS='|' read -r key _generated_ts _mtime source_ext source_file; do
  persona="${key%%/*}"
  scene="${key##*/}"
  source_ext="$(echo "$source_ext" | tr '[:upper:]' '[:lower:]')"
  target_file="$PUBLIC_DIR/avatar-$persona-$scene.png"

  if [[ "$source_ext" == "png" ]]; then
    cp "$source_file" "$target_file"
    echo "[outfit-bind] $persona/$scene -> $(basename "$source_file")"
    updated_count=$((updated_count + 1))
    continue
  fi

  if command -v sips >/dev/null 2>&1; then
    if sips -s format png "$source_file" --out "$target_file" >/dev/null 2>&1; then
      echo "[outfit-bind] $persona/$scene -> $(basename "$source_file") (converted ${source_ext} -> png)"
      updated_count=$((updated_count + 1))
      converted_count=$((converted_count + 1))
      continue
    fi
  fi

  cp "$source_file" "$target_file"
  echo "[outfit-bind] $persona/$scene -> $(basename "$source_file") (copied without conversion)"
  updated_count=$((updated_count + 1))
done < "$tmp_selected_file"

echo "[outfit-bind] done: updated $updated_count outfit(s), converted $converted_count file(s), sources scanned $source_count"
