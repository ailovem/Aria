#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[setup-macos-userland] %s\n' "$1"
}

ensure_path_line() {
  local line="$1"
  local target="$2"
  if [[ ! -f "$target" ]]; then
    touch "$target"
  fi
  if ! grep -Fq "$line" "$target"; then
    printf '\n%s\n' "$line" >> "$target"
  fi
}

log "Running no-sudo setup mode."

mkdir -p "$HOME/.local/bin"
ensure_path_line 'export PATH="$HOME/.local/bin:$PATH"' "$HOME/.zshrc"
ensure_path_line 'export PATH="$HOME/.cargo/bin:$PATH"' "$HOME/.zshrc"

if ! command -v rustup >/dev/null 2>&1; then
  log "Installing Rust (user scope)..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
fi

if [[ -f "$HOME/.cargo/env" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.cargo/env"
fi

if command -v corepack >/dev/null 2>&1; then
  log "Preparing pnpm via corepack..."
  corepack prepare pnpm@9.15.4 --activate || true
  cat > "$HOME/.local/bin/pnpm" <<'EOF'
#!/usr/bin/env bash
exec corepack pnpm "$@"
EOF
  chmod +x "$HOME/.local/bin/pnpm"
fi

if command -v cargo >/dev/null 2>&1 && [[ "${SKIP_TAURI_INSTALL:-0}" != "1" ]]; then
  log "Installing Tauri CLI (user scope, may take a while)..."
  cargo install tauri-cli --locked || true
fi

if ! command -v pod >/dev/null 2>&1 && [[ "${SKIP_COCOAPODS_INSTALL:-0}" != "1" ]]; then
  log "Installing CocoaPods in user scope..."
  gem install --user-install cocoapods || true
  local_gem_bin="$(find "$HOME/.gem" -type d -path '*/bin' 2>/dev/null | head -n 1 || true)"
  if [[ -n "$local_gem_bin" ]]; then
    ensure_path_line "export PATH=\"$local_gem_bin:\$PATH\"" "$HOME/.zshrc"
  fi
fi

if [[ ! -x "$HOME/flutter/bin/flutter" ]] && [[ "${SKIP_FLUTTER_INSTALL:-0}" != "1" ]]; then
  log "Installing Flutter SDK to $HOME/flutter ..."
  rm -rf "$HOME/flutter"
  git clone --depth 1 https://github.com/flutter/flutter.git -b stable "$HOME/flutter" || true
fi

if [[ -x "$HOME/flutter/bin/flutter" ]]; then
  ensure_path_line 'export PATH="$HOME/flutter/bin:$PATH"' "$HOME/.zshrc"
fi

log "Done. Restart terminal, then run:"
log "  bash scripts/doctor-macos.sh"
