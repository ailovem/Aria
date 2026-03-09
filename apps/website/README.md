# Aria Official Website (`apps/website`)

官网落地页（Vite + React），用于：

- 展示 Aria 的产品定位与能力架构
- 提供桌面端下载入口（macOS / Windows / Linux）
- 说明云端版 / 本地 Docker 版 / 企业版的部署模式
- 提供 `AI 柯南融资与创新应用资讯` 页面，自动抓取融资与产品动态并生成摘要

## Quick Start

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/website
npm install
npm run dev
```

默认开发地址：

- `http://localhost:5173`
- `http://localhost:5173/ai-conan.html`

## Build

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/website
npm run build
npm run preview
```

说明：`npm run build` 前会自动执行 `npm run sync:ai-conan`，从 RSS / 官方博客源生成：

- `public/data/ai-conan-news.json`

你也可以单独运行：

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/website
npm run sync:ai-conan
```

## GitHub Pages + `ailovem.com` 上线

仓库已经内置：

- GitHub Pages workflow：`/Users/bear/Desktop/Aria/Aria/.github/workflows/deploy-website-pages.yml`
- 自定义域名文件：`/Users/bear/Desktop/Aria/Aria/apps/website/public/CNAME`

上线步骤（最短路径）：

1. 先把仓库推到 GitHub（建议私有仓库）
2. 进入仓库 `Settings -> Pages`，选择 `GitHub Actions`
3. 在域名 DNS 配置 `ailovem.com` 到 GitHub Pages
4. 等待 workflow 完成后访问 `https://ailovem.com`

DNS 建议（GitHub Pages 官方常用）：

- `A` 记录（根域名）：
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `CNAME` 记录（`www`）：
  - `www -> <你的GitHub用户名>.github.io`

## 最傻瓜发版方式（推荐）

直接双击下面文件，然后按提示填写版本号和下载链接：

- `/Users/bear/Desktop/Aria/Aria/scripts/publish-website-release.command`

它会自动完成：

1. 更新下载链接与版本号
2. 更新更新日志
3. 自动构建官网 `dist/`

## Download Links (Env)

可通过环境变量注入下载地址与校验值（用于官网发布）：

- `VITE_ARIA_DOWNLOAD_MAC`
- `VITE_ARIA_DOWNLOAD_WINDOWS`
- `VITE_ARIA_DOWNLOAD_LINUX`
- `VITE_ARIA_SHA256_MAC`
- `VITE_ARIA_SHA256_WINDOWS`
- `VITE_ARIA_SHA256_LINUX`

示例：

```bash
VITE_ARIA_DOWNLOAD_MAC="https://example.com/aria-mac.dmg" \
VITE_ARIA_DOWNLOAD_WINDOWS="https://example.com/aria-win.msi" \
VITE_ARIA_DOWNLOAD_LINUX="https://example.com/aria-linux.AppImage" \
npm run build
```

## Public Release Notes

- 发布版客户端默认连接云端 API（开箱即用）
- 高级用户可选本地 Docker API 模式
- 建议官网同时提供：安装包、版本号、更新日志、SHA256 校验值

## Release Metadata Files

官网默认从以下文件读取下载链接与版本信息：

- `public/releases/latest.json`（下载链接、版本号、校验值）
- `public/releases/changelog.json`（版本更新记录）
- `public/changelog.html`（更新日志页面）

发布流程建议：

1. 先更新 `public/releases/latest.json` 的 `version / publishedAt / downloads`
2. 再追加 `public/releases/changelog.json` 新版本条目
3. 执行 `npm run build` 后发布 `dist/`
