#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -z "${ARIA_API_BASE:-}" ]]; then
  MAC_IP="$(ipconfig getifaddr en1 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")"
  API_BASE="http://${MAC_IP}:8787"
else
  API_BASE="$ARIA_API_BASE"
fi
BRIDGE_PORT="${ARIA_BRIDGE_PORT:-8788}"
export ARIA_API_HOST="0.0.0.0"
export ARIA_BRIDGE_HOST="0.0.0.0"
FLUTTER_BIN="${FLUTTER_BIN:-}"
POD_BIN="${POD_BIN:-}"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
MOBILE_RUN_MODE="${ARIA_MOBILE_RUN_MODE:-debug}"
IOS_PREFER_SIMULATOR="${ARIA_IOS_PREFER_SIMULATOR:-1}"
IOS_ALLOW_PHYSICAL="${ARIA_IOS_ALLOW_PHYSICAL:-0}"
IOS_SIMULATOR_ID="${ARIA_IOS_SIMULATOR_ID:-}"
LOCK_ROOT="$ROOT_DIR/.runtime/locks"
LOCK_DIR="$LOCK_ROOT/run-mobile-demo.lock"
LOCK_STALE_SEC="${ARIA_DEMO_LOCK_STALE_SEC:-10800}"

MODEL_ENV_FILE="${ARIA_MODEL_ENV_FILE:-}"
if [[ -z "$MODEL_ENV_FILE" ]]; then
  if [[ -f "$ROOT_DIR/.runtime/secrets/model-providers.env" ]]; then
    MODEL_ENV_FILE="$ROOT_DIR/.runtime/secrets/model-providers.env"
  elif [[ -f "$ROOT_DIR/.runtime/model-providers.env" ]]; then
    MODEL_ENV_FILE="$ROOT_DIR/.runtime/model-providers.env"
  fi
fi
if [[ -n "$MODEL_ENV_FILE" && -f "$MODEL_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$MODEL_ENV_FILE"
fi

mkdir -p "$LOCK_ROOT"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  LOCK_MTIME="$(stat -f %m "$LOCK_DIR" 2>/dev/null || echo 0)"
  NOW_SEC="$(date +%s)"
  if [[ "$LOCK_MTIME" =~ ^[0-9]+$ ]] && (( NOW_SEC - LOCK_MTIME > LOCK_STALE_SEC )); then
    rm -rf "$LOCK_DIR" 2>/dev/null || true
    mkdir "$LOCK_DIR"
  else
    echo "[run-mobile-demo] Another mobile demo process is already running."
    echo "[run-mobile-demo] If this is stale, run: rm -rf \"$LOCK_DIR\""
    exit 1
  fi
fi

if [[ -z "$FLUTTER_BIN" ]]; then
  if command -v flutter >/dev/null 2>&1; then
    FLUTTER_BIN="flutter"
  elif [[ -x "$HOME/flutter/bin/flutter" ]]; then
    FLUTTER_BIN="$HOME/flutter/bin/flutter"
  fi
fi

if [[ -z "$FLUTTER_BIN" ]]; then
  echo "[run-mobile-demo] ERROR: flutter is missing."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[run-mobile-demo] ERROR: node is missing."
  exit 1
fi

case "$MOBILE_RUN_MODE" in
  debug|profile|release) ;;
  *)
    echo "[run-mobile-demo] ERROR: invalid ARIA_MOBILE_RUN_MODE=$MOBILE_RUN_MODE"
    echo "[run-mobile-demo] Use one of: debug, profile, release"
    exit 1
    ;;
esac

case "$IOS_PREFER_SIMULATOR" in
  0|1) ;;
  *)
    echo "[run-mobile-demo] ERROR: invalid ARIA_IOS_PREFER_SIMULATOR=$IOS_PREFER_SIMULATOR"
    echo "[run-mobile-demo] Use 1 (default, prefer simulator) or 0."
    exit 1
    ;;
esac

case "$IOS_ALLOW_PHYSICAL" in
  0|1) ;;
  *)
    echo "[run-mobile-demo] ERROR: invalid ARIA_IOS_ALLOW_PHYSICAL=$IOS_ALLOW_PHYSICAL"
    echo "[run-mobile-demo] Use 1 to allow fallback to iPhone hardware."
    exit 1
    ;;
esac

detect_ios_device() {
  "$FLUTTER_BIN" devices --machine 2>/dev/null | node -e '
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  try {
    const devices = JSON.parse(raw);
    const iosDevices = devices.filter((d) => d && d.targetPlatform === "ios" && d.isSupported);
    const target = iosDevices.find((d) => d.emulator) || iosDevices[0];
    if (target) {
      process.stdout.write(`${target.id}\t${target.name}`);
    }
  } catch (_) {
    process.exit(0);
  }
});
'
}

detect_ios_physical_device() {
  "$FLUTTER_BIN" devices --machine 2>/dev/null | node -e '
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  try {
    const devices = JSON.parse(raw);
    const target = devices.find((d) => d && d.targetPlatform === "ios" && d.isSupported && !d.emulator);
    if (target) {
      process.stdout.write(`${target.id}\t${target.name}`);
    }
  } catch (_) {
    process.exit(0);
  }
});
'
}

detect_ios_simulator() {
  "$FLUTTER_BIN" devices --machine 2>/dev/null | node -e '
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  try {
    const devices = JSON.parse(raw);
    const target = devices.find((d) => d && d.targetPlatform === "ios" && d.isSupported && d.emulator);
    if (target) {
      process.stdout.write(`${target.id}\t${target.name}`);
    }
  } catch (_) {
    process.exit(0);
  }
});
'
}

pick_simulator_from_simctl() {
  if [[ -n "$IOS_SIMULATOR_ID" ]]; then
    printf '%s' "$IOS_SIMULATOR_ID"
    return 0
  fi
  xcrun simctl list devices available 2>/dev/null \
    | awk '/iPhone/ {
        if (match($0, /\([0-9A-F-]+\)/)) {
          print substr($0, RSTART + 1, RLENGTH - 2);
          exit
        }
      }'
}

boot_simulator() {
  local simulator_id="$1"
  if [[ -z "$simulator_id" ]]; then
    return 1
  fi
  xcrun simctl boot "$simulator_id" >/dev/null 2>&1 || true
  xcrun simctl bootstatus "$simulator_id" -b >/dev/null 2>&1 || true
  open -a Simulator >/dev/null 2>&1 || true
}

wait_for_ios_device() {
  local retries="${1:-20}"
  local delay_sec="${2:-3}"
  local i
  for ((i = 1; i <= retries; i += 1)); do
    local found
    found="$(detect_ios_physical_device || true)"
    if [[ -n "$found" ]]; then
      printf '%s' "$found"
      return 0
    fi
    echo "[run-mobile-demo] waiting iOS device (${i}/${retries})..."
    echo "[run-mobile-demo] keep iPhone unlocked and trusted on this Mac."
    sleep "$delay_sec"
  done
  return 1
}

wait_for_ios_simulator() {
  local retries="${1:-12}"
  local delay_sec="${2:-2}"
  local i
  for ((i = 1; i <= retries; i += 1)); do
    local found
    found="$(detect_ios_simulator || true)"
    if [[ -n "$found" ]]; then
      printf '%s' "$found"
      return 0
    fi
    sleep "$delay_sec"
  done
  return 1
}

wait_for_ios_target() {
  local retries="${1:-15}"
  local delay_sec="${2:-2}"
  local i
  for ((i = 1; i <= retries; i += 1)); do
    local found
    found="$(detect_ios_device || true)"
    if [[ -n "$found" ]]; then
      printf '%s' "$found"
      return 0
    fi
    sleep "$delay_sec"
  done
  return 1
}

if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:8787 | xargs -r kill >/dev/null 2>&1 || true
  lsof -ti tcp:"$BRIDGE_PORT" | xargs -r kill >/dev/null 2>&1 || true
fi

cd "$ROOT_DIR"
export ARIA_BRIDGE_BASE="http://127.0.0.1:${BRIDGE_PORT}"
node services/bridge/bridge-server.mjs &
BRIDGE_PID=$!
node services/api/mock-server.mjs &
API_PID=$!

wait_for_http() {
  local label="$1"
  local url="$2"
  local retries="${3:-40}"
  local delay_sec="${4:-0.25}"
  if ! command -v curl >/dev/null 2>&1; then
    return 0
  fi
  local i
  for ((i = 1; i <= retries; i += 1)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[run-mobile-demo] $label ready: $url"
      return 0
    fi
    sleep "$delay_sec"
  done
  echo "[run-mobile-demo] ERROR: $label failed to start: $url"
  return 1
}

cleanup() {
  if kill -0 "$BRIDGE_PID" >/dev/null 2>&1; then
    kill "$BRIDGE_PID" >/dev/null 2>&1 || true
  fi
  if kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
  rmdir "$LOCK_DIR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[run-mobile-demo] bridge pid: $BRIDGE_PID"
echo "[run-mobile-demo] api pid: $API_PID"
wait_for_http "bridge" "http://127.0.0.1:${BRIDGE_PORT}/health"
wait_for_http "api" "http://127.0.0.1:8787/health"
echo "[run-mobile-demo] iOS API base: $API_BASE"
if [[ -n "${ARIA_IOS_DEVICE_ID:-}" ]]; then
  echo "[run-mobile-demo] iOS device override: ARIA_IOS_DEVICE_ID=$ARIA_IOS_DEVICE_ID"
else
  echo "[run-mobile-demo] iOS launch policy: prefer_simulator=$IOS_PREFER_SIMULATOR allow_physical=$IOS_ALLOW_PHYSICAL"
fi

cd "$MOBILE_DIR"
if [[ ! -d ios ]]; then
  "$FLUTTER_BIN" create --platforms=ios .
fi

PODFILE_PATH="$MOBILE_DIR/ios/Podfile"
if [[ -f "$PODFILE_PATH" ]]; then
  if [[ -z "$POD_BIN" ]]; then
    if command -v pod >/dev/null 2>&1; then
      POD_BIN="pod"
    else
      POD_BIN="$(find "$HOME/.gem" -type f -path '*/bin/pod' 2>/dev/null | head -n 1 || true)"
    fi
  fi
  if [[ -z "$POD_BIN" ]]; then
    echo "[run-mobile-demo] ERROR: CocoaPods missing (ios/Podfile detected)."
    echo "[run-mobile-demo] Fix by running:"
    echo "[run-mobile-demo]   bash scripts/one-click-macos.command"
    echo "[run-mobile-demo] or install manually with a newer Ruby + CocoaPods."
    exit 1
  fi
  if [[ "$POD_BIN" != "pod" ]]; then
    POD_DIR="$(cd "$(dirname "$POD_BIN")" && pwd)"
    if [[ -n "$POD_DIR" ]] && [[ ":$PATH:" != *":$POD_DIR:"* ]]; then
      export PATH="$POD_DIR:$PATH"
    fi
  fi
  if ! command -v pod >/dev/null 2>&1; then
    echo "[run-mobile-demo] ERROR: pod binary still unavailable in PATH."
    echo "[run-mobile-demo] Try: export PATH=\"$(dirname "$POD_BIN"):\$PATH\""
    exit 1
  fi
  if ! pod --version >/dev/null 2>&1; then
    if RUBYOPT="-rlogger" pod --version >/dev/null 2>&1; then
      if [[ "${RUBYOPT:-}" == *"-rlogger"* ]]; then
        export RUBYOPT="$RUBYOPT"
      elif [[ -n "${RUBYOPT:-}" ]]; then
        export RUBYOPT="$RUBYOPT -rlogger"
      else
        export RUBYOPT="-rlogger"
      fi
      echo "[run-mobile-demo] CocoaPods runtime patched with RUBYOPT=-rlogger (Ruby 2.6 compatibility)."
    else
      echo "[run-mobile-demo] ERROR: pod command exists but failed to run."
      echo "[run-mobile-demo] Try:"
      echo "[run-mobile-demo]   RUBYOPT='-rlogger' pod --version"
      echo "[run-mobile-demo]   bash scripts/one-click-macos.command"
      exit 1
    fi
  fi
else
  echo "[run-mobile-demo] Podfile not found; skip CocoaPods check."
fi

"$FLUTTER_BIN" pub get
IOS_TARGET_RAW="${ARIA_IOS_DEVICE_ID:-}"
if [[ -n "$IOS_TARGET_RAW" ]]; then
  IOS_TARGET_NAME="custom"
else
  if [[ "$IOS_PREFER_SIMULATOR" == "1" ]]; then
    IOS_TARGET_RAW="$(wait_for_ios_simulator 4 1 || true)"
    if [[ -z "$IOS_TARGET_RAW" ]]; then
      echo "[run-mobile-demo] booting iOS Simulator for stable preview..."
      SIM_BOOT_ID="$(pick_simulator_from_simctl || true)"
      if [[ -n "$SIM_BOOT_ID" ]]; then
        boot_simulator "$SIM_BOOT_ID"
      fi
      IOS_TARGET_RAW="$(wait_for_ios_simulator 20 1 || true)"
    fi
    if [[ -z "$IOS_TARGET_RAW" ]] && [[ "$IOS_ALLOW_PHYSICAL" == "1" ]]; then
      echo "[run-mobile-demo] simulator unavailable, fallback to physical iPhone..."
      IOS_TARGET_RAW="$(wait_for_ios_device 25 3 || true)"
    fi
  else
    IOS_TARGET_RAW="$(wait_for_ios_target 15 2 || true)"
  fi
fi

if [[ -z "$IOS_TARGET_RAW" ]]; then
  echo "[run-mobile-demo] ERROR: no iOS device detected."
  if [[ "$IOS_PREFER_SIMULATOR" == "1" ]] && [[ "$IOS_ALLOW_PHYSICAL" != "1" ]]; then
    echo "[run-mobile-demo] Simulator is required in current policy."
    echo "[run-mobile-demo] If you want to fallback to iPhone hardware:"
    echo "[run-mobile-demo]   ARIA_IOS_ALLOW_PHYSICAL=1 bash scripts/run-mobile-demo.sh"
  fi
  echo "[run-mobile-demo] Try:"
  echo "[run-mobile-demo] 1) Unlock iPhone and keep screen on"
  echo "[run-mobile-demo] 2) Confirm Trust prompt on phone"
  echo "[run-mobile-demo] 3) Open Xcode -> Window -> Devices and Simulators"
  echo "[run-mobile-demo] 4) Rerun: bash scripts/run-mobile-demo.sh"
  exit 1
fi

IOS_TARGET_ID="${IOS_TARGET_RAW%%$'\t'*}"
IOS_TARGET_NAME="${IOS_TARGET_RAW#*$'\t'}"
if [[ "$IOS_TARGET_ID" == "$IOS_TARGET_RAW" ]]; then
  IOS_TARGET_NAME="iOS device"
fi

echo "[run-mobile-demo] launch target: ${IOS_TARGET_NAME} (${IOS_TARGET_ID})"
RUN_ARGS=(
  run
  -d "$IOS_TARGET_ID"
  --device-timeout 90
  --dart-define=ARIA_API_BASE="$API_BASE"
)
if [[ "$MOBILE_RUN_MODE" == "profile" ]]; then
  RUN_ARGS+=(--profile)
elif [[ "$MOBILE_RUN_MODE" == "release" ]]; then
  RUN_ARGS+=(--release)
fi
echo "[run-mobile-demo] flutter mode: $MOBILE_RUN_MODE"
"$FLUTTER_BIN" "${RUN_ARGS[@]}"
