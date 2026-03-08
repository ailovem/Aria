#!/usr/bin/env bash

set -euo pipefail

OWNER="ailovem"
REPO="Aria"
WORKFLOW_FILE="deploy-website-pages.yml"
BRANCH="main"
API_BASE="https://api.github.com"

echo "==============================================="
echo " Aria 官网一键修复（启用 Pages + 重跑部署）"
echo "==============================================="
echo
echo "目标仓库: ${OWNER}/${REPO}"
echo

read -r -p "GitHub 用户名 [ailovem]: " GITHUB_USER
GITHUB_USER="${GITHUB_USER:-ailovem}"
read -r -s -p "GitHub PAT（输入不显示）: " GITHUB_TOKEN
echo

if [[ -z "${GITHUB_TOKEN}" ]]; then
  echo "❌ 未输入 PAT，已退出。"
  exit 1
fi

auth_headers=(
  -H "Accept: application/vnd.github+json"
  -H "Authorization: Bearer ${GITHUB_TOKEN}"
  -H "X-GitHub-Api-Version: 2022-11-28"
)

call_api() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local body_file
  body_file="$(mktemp)"
  local status

  if [[ -n "$data" ]]; then
    status="$(curl -sS -o "$body_file" -w "%{http_code}" -X "$method" "${auth_headers[@]}" "$url" -d "$data")"
  else
    status="$(curl -sS -o "$body_file" -w "%{http_code}" -X "$method" "${auth_headers[@]}" "$url")"
  fi

  echo "$status|$body_file"
}

extract_message() {
  local file="$1"
  node -e '
const fs = require("fs");
const path = process.argv[1];
try {
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  const msg = data && typeof data.message === "string" ? data.message : "";
  process.stdout.write(msg);
} catch {
  process.stdout.write("");
}
' "$file"
}

echo
echo "1) 校验仓库权限..."
repo_result="$(call_api GET "${API_BASE}/repos/${OWNER}/${REPO}")"
repo_status="${repo_result%%|*}"
repo_body="${repo_result#*|}"
if [[ "$repo_status" != "200" ]]; then
  msg="$(extract_message "$repo_body")"
  rm -f "$repo_body"
  echo "❌ 无法访问仓库 ${OWNER}/${REPO}（HTTP ${repo_status}）${msg:+: $msg}"
  echo "请确认 PAT 至少有：repo（classic）或 Repository Contents 写权限。"
  exit 1
fi
rm -f "$repo_body"

echo "2) 检查/创建 Pages 站点..."
pages_result="$(call_api GET "${API_BASE}/repos/${OWNER}/${REPO}/pages")"
pages_status="${pages_result%%|*}"
pages_body="${pages_result#*|}"

if [[ "$pages_status" == "404" ]]; then
  rm -f "$pages_body"
  create_payload='{"source":{"branch":"main","path":"/"}}'
  create_result="$(call_api POST "${API_BASE}/repos/${OWNER}/${REPO}/pages" "$create_payload")"
  create_status="${create_result%%|*}"
  create_body="${create_result#*|}"
  if [[ "$create_status" != "201" && "$create_status" != "409" && "$create_status" != "422" ]]; then
    msg="$(extract_message "$create_body")"
    rm -f "$create_body"
    echo "❌ 创建 Pages 失败（HTTP ${create_status}）${msg:+: $msg}"
    echo "请确认 PAT 具备 Pages/Administration 写权限。"
    exit 1
  fi
  rm -f "$create_body"
else
  rm -f "$pages_body"
fi

echo "3) 设置 Pages 为 GitHub Actions(workflow)..."
update_payload='{"build_type":"workflow","source":{"branch":"main","path":"/"}}'
update_result="$(call_api PUT "${API_BASE}/repos/${OWNER}/${REPO}/pages" "$update_payload")"
update_status="${update_result%%|*}"
update_body="${update_result#*|}"
if [[ "$update_status" != "204" ]]; then
  msg="$(extract_message "$update_body")"
  rm -f "$update_body"
  echo "❌ 更新 Pages 失败（HTTP ${update_status}）${msg:+: $msg}"
  echo "如果你用的是 Fine-grained PAT，请补齐：Pages(write)+Administration(write)。"
  exit 1
fi
rm -f "$update_body"

echo "4) 触发官网部署 workflow..."
dispatch_payload="{\"ref\":\"${BRANCH}\"}"
dispatch_result="$(call_api POST "${API_BASE}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches" "$dispatch_payload")"
dispatch_status="${dispatch_result%%|*}"
dispatch_body="${dispatch_result#*|}"
if [[ "$dispatch_status" != "204" ]]; then
  msg="$(extract_message "$dispatch_body")"
  rm -f "$dispatch_body"
  echo "❌ 触发 workflow 失败（HTTP ${dispatch_status}）${msg:+: $msg}"
  echo "请确认 PAT 权限含 workflow（classic）或 Actions 写权限。"
  exit 1
fi
rm -f "$dispatch_body"

echo
echo "✅ 已完成：Pages 启用 + workflow 重跑"
echo "请打开查看："
echo "  - Pages 设置：https://github.com/${OWNER}/${REPO}/settings/pages"
echo "  - Actions 运行：https://github.com/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}"
echo
echo "如果 DNS 已改完，几分钟后访问："
echo "  - https://ailovem.com"
echo "  - https://www.ailovem.com"
