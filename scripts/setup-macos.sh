#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() {
  printf '[setup-macos] %s\n' "$1"
}

install_homebrew() {
  if command -v brew >/dev/null 2>&1; then
    log "Homebrew already installed."
    return
  fi

  log "Installing Homebrew..."
  /bin/bash -c \
    "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
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

log "Project root: $ROOT_DIR"

if ! id -Gn "$USER" | grep -qw admin; then
  log "Current account is not in the macOS admin group."
  log "Please use an administrator account to run this installer."
  exit 1
fi

if ! xcode-select -p >/dev/null 2>&1; then
  log "Xcode Command Line Tools missing. Installing..."
  xcode-select --install || true
  log "Please finish Xcode tools installation, then rerun this script."
  exit 1
fi

install_homebrew

log "Updating Homebrew..."
brew update

log "Installing core dependencies..."
brew install git node pnpm rustup-init cocoapods ffmpeg jq
brew install --cask flutter

if ! command -v rustup >/dev/null 2>&1 && command -v rustup-init >/dev/null 2>&1; then
  log "Bootstrapping Rust with rustup-init..."
  rustup-init -y
fi

if [[ -f "$HOME/.cargo/env" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.cargo/env"
fi

if ! command -v rustup >/dev/null 2>&1; then
  log "rustup is still unavailable. Restart terminal and rerun this script."
  exit 1
fi

log "Configuring Rust toolchain..."
rustup toolchain install stable
rustup default stable

ensure_path_line 'export PATH="$HOME/.cargo/bin:$PATH"' "$HOME/.zshrc"

log "Installing Tauri CLI..."
if command -v cargo >/dev/null 2>&1; then
  cargo install tauri-cli --locked
else
  log "cargo missing after Rust setup. Please restart terminal and rerun."
  exit 1
fi

log "Installing global JavaScript tooling..."
npm install -g pnpm

log "Running flutter doctor (informational)..."
flutter doctor || true

log "Done. Next run:"
log "  bash scripts/doctor-macos.sh"
log "  bash scripts/doctor-permissions-macos.sh"
