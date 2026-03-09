# Aria macOS 签名与公证准备清单

更新时间：2026-03-10

## 目标
- 解决 macOS `"已损坏，无法打开"` Gatekeeper 拦截
- 实现正式对外发布必需链路：`Developer ID 签名 -> notarytool 公证 -> stapler -> Gatekeeper 验证`

## 必须提前准备（人工）
1. Apple Developer Program 账号（组织或个人均可）
2. `Developer ID Application` 证书（.p12 导出）与导出密码
3. `APPLE_SIGNING_IDENTITY`（示例：`Developer ID Application: Your Name (TEAMID)`）
4. Apple 团队 ID（`APPLE_TEAM_ID`）
5. 公证凭据（二选一）

## 公证凭据方案 A（推荐上手快）
- `APPLE_ID`：用于公证的 Apple ID 邮箱
- `APPLE_APP_SPECIFIC_PASSWORD`：Apple ID 里生成的 app-specific password
- `APPLE_TEAM_ID`：团队 ID

## 公证凭据方案 B（更适合长期 CI）
- App Store Connect API Key（`.p8`）
- `APPLE_API_KEY_ID`
- `APPLE_API_ISSUER`
- `APPLE_API_KEY_BASE64`（把 `.p8` 做 base64 后存 secret）

## GitHub Secrets（CI 必需）
- `APPLE_CERTIFICATE_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_KEYCHAIN_PASSWORD`
- 方案 A：`APPLE_ID`、`APPLE_APP_SPECIFIC_PASSWORD`、`APPLE_TEAM_ID`
- 或方案 B：`APPLE_API_KEY_ID`、`APPLE_API_ISSUER`、`APPLE_API_KEY_BASE64`

## 仓库已就绪能力
- CI workflow 已接入：
  - 导入证书
  - 构建安装包（arm64 + x64）
  - `notarytool submit --wait`
  - `stapler staple`
  - `spctl/codesign` 验证
- 相关脚本：
  - `scripts/macos-import-signing-cert.sh`
  - `scripts/macos-notarize-and-staple.sh`
  - `scripts/macos-verify-gatekeeper.sh`

## 本地发布（可选）
```bash
cd /Users/bear/Desktop/Aria/Aria

# 1) 导入签名证书（需先 export 环境变量）
bash scripts/macos-import-signing-cert.sh

# 2) 构建安装包
npm --prefix apps/desktop run build
npm --prefix apps/desktop run tauri -- build --target x86_64-apple-darwin

# 3) 公证 + staple
bash scripts/macos-notarize-and-staple.sh apps/desktop/src-tauri/target

# 4) Gatekeeper 验证
bash scripts/macos-verify-gatekeeper.sh apps/desktop/src-tauri/target
```

## 发布后动作
1. 上传新的 `.dmg` 到 GitHub Release
2. 更新官网 `apps/website/public/releases/latest.json` 下载链接与 SHA256
3. 执行官网发布
