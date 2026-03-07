#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WEBSITE_DIR="$ROOT_DIR/apps/website"
LATEST_FILE="$WEBSITE_DIR/public/releases/latest.json"
CHANGELOG_FILE="$WEBSITE_DIR/public/releases/changelog.json"

if [[ ! -d "$WEBSITE_DIR" ]]; then
  echo "[publish-website-release] ERROR: website dir not found: $WEBSITE_DIR"
  exit 1
fi

mkdir -p "$WEBSITE_DIR/public/releases"

if [[ ! -f "$LATEST_FILE" ]]; then
  cat > "$LATEST_FILE" <<'JSON'
{
  "version": "v0.1.0",
  "publishedAt": "2026-03-07",
  "channel": "stable",
  "changelogUrl": "/changelog.html",
  "downloads": {
    "macos": {
      "files": ".dmg / .app",
      "arch": "Apple Silicon / Intel",
      "url": "https://github.com/<your-account>/<your-repo>/releases/download/v0.1.0/Aria-v0.1.0-macOS.dmg",
      "checksum": "to-be-filled-at-release"
    },
    "windows": {
      "files": ".msi / .exe",
      "arch": "x64",
      "url": "https://github.com/<your-account>/<your-repo>/releases/download/v0.1.0/Aria-v0.1.0-windows.msi",
      "checksum": "to-be-filled-at-release"
    },
    "linux": {
      "files": ".AppImage / .deb",
      "arch": "x64",
      "url": "https://github.com/<your-account>/<your-repo>/releases/download/v0.1.0/Aria-v0.1.0-linux.AppImage",
      "checksum": "to-be-filled-at-release"
    }
  }
}
JSON
fi

if [[ ! -f "$CHANGELOG_FILE" ]]; then
  cat > "$CHANGELOG_FILE" <<'JSON'
{
  "product": "Aria Desktop",
  "entries": []
}
JSON
fi

read_json_field() {
  local json_file="$1"
  local field_path="$2"
  node -e '
const fs = require("fs");
const filePath = process.argv[1];
const path = process.argv[2];
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
const value = path.split(".").reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), data);
process.stdout.write(value == null ? "" : String(value));
' "$json_file" "$field_path"
}

prompt_default() {
  local label="$1"
  local default_value="$2"
  local result_var="$3"
  local input=""
  if [[ -n "$default_value" ]]; then
    read -r -p "$label [$default_value]: " input
  else
    read -r -p "$label: " input
  fi
  if [[ -z "$input" ]]; then
    input="$default_value"
  fi
  printf -v "$result_var" '%s' "$input"
}

DEFAULT_VERSION="$(read_json_field "$LATEST_FILE" "version")"
DEFAULT_DATE="$(date +%F)"
DEFAULT_CHANNEL="$(read_json_field "$LATEST_FILE" "channel")"
DEFAULT_MAC_URL="$(read_json_field "$LATEST_FILE" "downloads.macos.url")"
DEFAULT_WIN_URL="$(read_json_field "$LATEST_FILE" "downloads.windows.url")"
DEFAULT_LINUX_URL="$(read_json_field "$LATEST_FILE" "downloads.linux.url")"
DEFAULT_MAC_SHA="$(read_json_field "$LATEST_FILE" "downloads.macos.checksum")"
DEFAULT_WIN_SHA="$(read_json_field "$LATEST_FILE" "downloads.windows.checksum")"
DEFAULT_LINUX_SHA="$(read_json_field "$LATEST_FILE" "downloads.linux.checksum")"

echo
echo "=== Aria 官网发版助手（傻瓜模式）==="
echo "只需输入版本号和下载链接，脚本会自动更新官网并构建。"
echo

prompt_default "1) 版本号（例如 v0.1.1）" "${DEFAULT_VERSION:-v0.1.1}" RELEASE_VERSION
prompt_default "2) 发布日期（YYYY-MM-DD）" "$DEFAULT_DATE" RELEASE_DATE
prompt_default "3) 发布通道（stable/canary）" "${DEFAULT_CHANNEL:-stable}" RELEASE_CHANNEL
echo
prompt_default "4) macOS 下载链接" "$DEFAULT_MAC_URL" RELEASE_MAC_URL
prompt_default "5) Windows 下载链接" "$DEFAULT_WIN_URL" RELEASE_WIN_URL
prompt_default "6) Linux 下载链接" "$DEFAULT_LINUX_URL" RELEASE_LINUX_URL
echo
prompt_default "7) macOS SHA256（可先留占位）" "$DEFAULT_MAC_SHA" RELEASE_MAC_SHA
prompt_default "8) Windows SHA256（可先留占位）" "$DEFAULT_WIN_SHA" RELEASE_WIN_SHA
prompt_default "9) Linux SHA256（可先留占位）" "$DEFAULT_LINUX_SHA" RELEASE_LINUX_SHA
echo
prompt_default "10) 本次更新亮点（用 | 分隔）" "官网下载中心优化 | 桌面稳定性增强 | 体验流畅度提升" RELEASE_HIGHLIGHTS_RAW
prompt_default "11) 本次修复项（用 | 分隔）" "修复若干已知问题 | 提升启动成功率" RELEASE_FIXES_RAW

export RELEASE_LATEST="$LATEST_FILE"
export RELEASE_CHANGELOG="$CHANGELOG_FILE"
export RELEASE_VERSION
export RELEASE_DATE
export RELEASE_CHANNEL
export RELEASE_MAC_URL
export RELEASE_WIN_URL
export RELEASE_LINUX_URL
export RELEASE_MAC_SHA
export RELEASE_WIN_SHA
export RELEASE_LINUX_SHA
export RELEASE_HIGHLIGHTS_RAW
export RELEASE_FIXES_RAW

node <<'NODE'
const fs = require("fs");

const latestPath = process.env.RELEASE_LATEST;
const changelogPath = process.env.RELEASE_CHANGELOG;
const version = String(process.env.RELEASE_VERSION || "").trim() || "v0.1.0";
const date = String(process.env.RELEASE_DATE || "").trim() || new Date().toISOString().slice(0, 10);
const channel = String(process.env.RELEASE_CHANNEL || "").trim() || "stable";

function readJson(path, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function splitList(raw, fallback) {
  const value = String(raw || "").trim();
  if (!value) return fallback;
  const rows = value.split("|").map((item) => item.trim()).filter(Boolean);
  return rows.length > 0 ? rows : fallback;
}

const latest = readJson(latestPath, {});
const nextLatest = {
  ...latest,
  version,
  publishedAt: date,
  channel,
  changelogUrl: "/changelog.html",
  downloads: {
    ...(latest.downloads && typeof latest.downloads === "object" ? latest.downloads : {}),
    macos: {
      ...((latest.downloads && latest.downloads.macos) || {}),
      files: ".dmg / .app",
      arch: "Apple Silicon / Intel",
      url: String(process.env.RELEASE_MAC_URL || "").trim(),
      checksum: String(process.env.RELEASE_MAC_SHA || "").trim()
    },
    windows: {
      ...((latest.downloads && latest.downloads.windows) || {}),
      files: ".msi / .exe",
      arch: "x64",
      url: String(process.env.RELEASE_WIN_URL || "").trim(),
      checksum: String(process.env.RELEASE_WIN_SHA || "").trim()
    },
    linux: {
      ...((latest.downloads && latest.downloads.linux) || {}),
      files: ".AppImage / .deb",
      arch: "x64",
      url: String(process.env.RELEASE_LINUX_URL || "").trim(),
      checksum: String(process.env.RELEASE_LINUX_SHA || "").trim()
    }
  }
};

fs.writeFileSync(latestPath, `${JSON.stringify(nextLatest, null, 2)}\n`, "utf8");

const changelog = readJson(changelogPath, {
  product: "Aria Desktop",
  entries: []
});
const highlights = splitList(
  process.env.RELEASE_HIGHLIGHTS_RAW,
  ["官网发版更新", "客户端体验优化"]
);
const fixes = splitList(
  process.env.RELEASE_FIXES_RAW,
  ["修复若干已知问题"]
);

const nextEntry = {
  version,
  date,
  highlights,
  fixes
};

const prevEntries = Array.isArray(changelog.entries) ? changelog.entries : [];
const entries = [nextEntry, ...prevEntries.filter((item) => String(item?.version || "").trim() !== version)].slice(0, 50);
const nextChangelog = {
  ...changelog,
  product: changelog.product || "Aria Desktop",
  entries
};

fs.writeFileSync(changelogPath, `${JSON.stringify(nextChangelog, null, 2)}\n`, "utf8");
NODE

echo
echo "[publish-website-release] ✅ 已更新："
echo "  - $LATEST_FILE"
echo "  - $CHANGELOG_FILE"
echo

if [[ ! -d "$WEBSITE_DIR/node_modules" ]]; then
  echo "[publish-website-release] 正在安装官网依赖..."
  npm --prefix "$WEBSITE_DIR" install --no-audit --no-fund
fi

echo "[publish-website-release] 正在构建官网..."
npm --prefix "$WEBSITE_DIR" run build

echo
echo "[publish-website-release] ✅ 构建完成，上传这个目录即可："
echo "  $WEBSITE_DIR/dist"
echo
echo "[publish-website-release] 建议你检查这两个页面："
echo "  - 官网首页：$WEBSITE_DIR/dist/index.html"
echo "  - 更新日志：$WEBSITE_DIR/dist/changelog.html"

if command -v open >/dev/null 2>&1; then
  open "$WEBSITE_DIR/dist" >/dev/null 2>&1 || true
fi
