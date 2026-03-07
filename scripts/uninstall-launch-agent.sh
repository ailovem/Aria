#!/usr/bin/env bash
set -euo pipefail

LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$LAUNCH_AGENTS_DIR/com.aria.desktop.supervisor.plist"
LABEL="com.aria.desktop.supervisor"
UID_NUM="$(id -u)"
SUPPORT_DIR="$HOME/Library/Application Support/Aria"
STARTUP_CMD_FILE="$SUPPORT_DIR/startup-launch.command"
RUNNER_FILE="$SUPPORT_DIR/supervisor-runner.sh"
RUNNER_PID_FILE="$SUPPORT_DIR/supervisor-runner.pid"

launchctl bootout "gui/${UID_NUM}" "$PLIST_PATH" >/dev/null 2>&1 || true
if [[ -f "$RUNNER_PID_FILE" ]]; then
  kill "$(cat "$RUNNER_PID_FILE")" >/dev/null 2>&1 || true
fi
pkill -f "$RUNNER_FILE" >/dev/null 2>&1 || true
rm -f "$PLIST_PATH"
rm -f "$STARTUP_CMD_FILE"
rm -f "$RUNNER_FILE" "$RUNNER_PID_FILE"

echo "uninstalled: ${LABEL}"
