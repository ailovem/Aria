#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="$HOME/Desktop"
START_SHORTCUT="$DESKTOP_DIR/启动Aria.command"
STOP_SHORTCUT="$DESKTOP_DIR/停止Aria.command"

mkdir -p "$DESKTOP_DIR"

cat > "$START_SHORTCUT" <<EOF
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR}"
AGENT_LABEL="com.aria.desktop.supervisor"
GUI_DOMAIN="gui/\$(id -u)"

cd "\$ROOT_DIR"

# 确保开机自启服务存在（首次双击时自动补齐）
bash "\$ROOT_DIR/scripts/install-launch-agent.sh" >/dev/null 2>&1 || true

# 尝试立即拉起
launchctl kickstart -k "\$GUI_DOMAIN/\$AGENT_LABEL" >/dev/null 2>&1 || true
bash "\$HOME/Library/Application Support/Aria/startup-launch.command" >/dev/null 2>&1 || true

# 等待端口就绪（最长约 8 秒）
for _ in {1..16}; do
  if lsof -nP -iTCP:1420 -sTCP:LISTEN >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

open "https://127.0.0.1:1420/love"
EOF

cat > "$STOP_SHORTCUT" <<EOF
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR}"
GUI_DOMAIN="gui/\$(id -u)"
AGENT_LABEL="com.aria.desktop.supervisor"

launchctl bootout "\$GUI_DOMAIN" "\$HOME/Library/LaunchAgents/\$AGENT_LABEL.plist" >/dev/null 2>&1 || true
pkill -f "\$HOME/Library/Application Support/Aria/supervisor-runner.sh" >/dev/null 2>&1 || true
bash "\$ROOT_DIR/scripts/cleanup-dev-runtime.sh" >/dev/null 2>&1 || true
EOF

chmod +x "$START_SHORTCUT" "$STOP_SHORTCUT"

echo "created: $START_SHORTCUT"
echo "created: $STOP_SHORTCUT"
