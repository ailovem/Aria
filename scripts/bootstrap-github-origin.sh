#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==========================================="
echo " Aria GitHub 初始化（源码私有 + 官网上线）"
echo "==========================================="
echo

DEFAULT_URL="https://github.com/<your-account>/<your-repo>.git"
read -r -p "请输入 GitHub 仓库 HTTPS 地址 [${DEFAULT_URL}]: " REMOTE_URL
REMOTE_URL="${REMOTE_URL:-$DEFAULT_URL}"

if [[ "$REMOTE_URL" == "$DEFAULT_URL" ]]; then
  echo "❌ 你还没填真实仓库地址，请重试。"
  exit 1
fi

if ! [[ "$REMOTE_URL" =~ ^https://github\.com/.+/.+(\.git)?$ ]]; then
  echo "❌ 仓库地址格式不正确，应类似：https://github.com/用户名/仓库.git"
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "ℹ️ 已存在 origin，更新为：$REMOTE_URL"
  git remote set-url origin "$REMOTE_URL"
else
  echo "ℹ️ 新增 origin：$REMOTE_URL"
  git remote add origin "$REMOTE_URL"
fi

echo
echo "➡️ 暂存全部改动..."
git add -A

if git diff --cached --quiet; then
  echo "ℹ️ 没有新增改动，跳过 commit。"
else
  DEFAULT_COMMIT_MSG="chore: prepare github deploy pipeline"
  read -r -p "请输入提交信息 [${DEFAULT_COMMIT_MSG}]: " COMMIT_MSG
  COMMIT_MSG="${COMMIT_MSG:-$DEFAULT_COMMIT_MSG}"
  git commit -m "$COMMIT_MSG"
fi

echo
echo "➡️ 推送到 GitHub（main）..."
git push -u origin main

echo
echo "✅ 推送完成。"
echo "下一步："
echo "1) 打开 GitHub 仓库 -> Settings -> Pages"
echo "2) Source 选择 GitHub Actions"
echo "3) 等待 workflow 'Deploy Website (GitHub Pages)' 变绿"
echo "4) 在域名 DNS 中绑定 ailovem.com 到 GitHub Pages"
