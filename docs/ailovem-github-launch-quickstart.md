# ailovem.com 快速上线清单（GitHub 版）

目标：先把官网跑起来，同时把源码放在 GitHub 做基础保护（私有仓库）。

## 0. 推荐仓库可见性

- `源码仓库`：建议 **Private**
- `官网`：通过 GitHub Pages 发布（最终网页是公开访问）

这样可以减少被直接抄源码的风险，同时保证官网可访问。

## 1. 一键推送仓库

在本机执行：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/bootstrap-github-origin.sh
```

按提示填入你创建好的 GitHub 仓库地址（HTTPS）。

## 2. 打开 GitHub Pages

仓库里已经有自动部署文件：

- `/Users/bear/Desktop/Aria/Aria/.github/workflows/deploy-website-pages.yml`

在 GitHub 仓库：

1. `Settings`
2. `Pages`
3. `Build and deployment` 选择 `GitHub Actions`

推送后会自动构建 `apps/website` 并发布。

## 3. 绑定域名 `ailovem.com`

仓库已内置域名文件：

- `/Users/bear/Desktop/Aria/Aria/apps/website/public/CNAME`

DNS 配置建议：

- 根域名 `@` 配置 4 条 `A` 记录：
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www` 配置 `CNAME` 到 `<你的GitHub用户名>.github.io`

等待生效后访问：

- `https://ailovem.com`
- `https://www.ailovem.com`

## 4. 客户端下载入口（GitHub Release）

客户端构建 workflow 已支持在 `v*` tag 时上传安装包到 Release：

- `/Users/bear/Desktop/Aria/Aria/.github/workflows/build-desktop.yml`

你只需：

1. 打 tag（例如 `v0.1.1`）
2. push tag 到 GitHub
3. 等待构建结束
4. 把下载链接写入：
   - `/Users/bear/Desktop/Aria/Aria/apps/website/public/releases/latest.json`

官网 `DownloadHub` 会读取这个 JSON 展示下载按钮。
