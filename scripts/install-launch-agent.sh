#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$LAUNCH_AGENTS_DIR/com.aria.desktop.supervisor.plist"
LABEL="com.aria.desktop.supervisor"
LOG_DIR="$ROOT_DIR/.runtime/logs"
UID_NUM="$(id -u)"
SUPPORT_DIR="$HOME/Library/Application Support/Aria"
STARTUP_CMD_FILE="$SUPPORT_DIR/startup-launch.command"
RUNNER_FILE="$SUPPORT_DIR/supervisor-runner.sh"

mkdir -p "$LAUNCH_AGENTS_DIR" "$LOG_DIR" "$SUPPORT_DIR"

cat > "$RUNNER_FILE" <<EOF
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR}"
LOG_DIR="\${ROOT_DIR}/.runtime/logs"
SUPERVISOR_SCRIPT="\${ROOT_DIR}/scripts/boot-supervisor.sh"

mkdir -p "\$LOG_DIR"

while true; do
  /bin/bash "\$SUPERVISOR_SCRIPT" >> "\$LOG_DIR/supervisor.log" 2>&1 || true
  sleep 2
done
EOF
chmod +x "$RUNNER_FILE"

cat > "$STARTUP_CMD_FILE" <<EOF
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR}"
RUNNER_FILE="${RUNNER_FILE}"
PID_FILE="${SUPPORT_DIR}/supervisor-runner.pid"

mkdir -p "\$(dirname "\$PID_FILE")"

if pgrep -f "\$RUNNER_FILE" >/dev/null 2>&1; then
  echo "[startup-launch] runner already running"
  exit 0
fi

cd "\$ROOT_DIR"
nohup /bin/bash "\$RUNNER_FILE" >/dev/null 2>&1 &
echo \$! > "\$PID_FILE"
echo "[startup-launch] runner started pid=\$!"
EOF
chmod +x "$STARTUP_CMD_FILE"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/open</string>
    <string>-gj</string>
    <string>-a</string>
    <string>Terminal</string>
    <string>${STARTUP_CMD_FILE}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/launchagent.out.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/launchagent.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/${UID_NUM}" "$PLIST_PATH" >/dev/null 2>&1 || true
launchctl bootstrap "gui/${UID_NUM}" "$PLIST_PATH"
launchctl kickstart -k "gui/${UID_NUM}/${LABEL}"
/bin/bash "$STARTUP_CMD_FILE" >/dev/null 2>&1 || true

echo "installed: $PLIST_PATH"
echo "runner: $RUNNER_FILE"
echo "startup command: $STARTUP_CMD_FILE"
echo "service: gui/${UID_NUM}/${LABEL}"
echo "status check: launchctl print gui/${UID_NUM}/${LABEL}"
echo "open: https://127.0.0.1:1420"
