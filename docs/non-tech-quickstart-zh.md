# Aria 小白可执行说明（不懂技术也能用）

更新时间：2026-03-03

## 你只需要记住两件事

1. **普通用户安装客户端，不需要配置开发环境。**
2. **只有做“打包发布”的人，才需要安装 Node/Rust/Flutter/Xcode。**

## A. 如果你是普通用户（只想安装）

- Mac：下载 `.dmg` 或 `.app` 安装包
- Windows：下载 `.msi` 或 `.exe` 安装包
- iPhone：通过 TestFlight 或 App Store 安装

你不需要安装任何开发工具。

## B. 如果你是项目发布者（你现在这个角色）

在 Mac 上执行下面一条命令即可自动安装并体检：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/one-click-macos.sh
```

说明：如果管理员安装失败（比如没有 sudo 密码），脚本会自动切到“无 sudo 模式”，尽量把用户态环境补齐。
脚本会自动执行“权限体检”（Automation/麦克风/语音），方便你后续启用硬件能力。

或者直接双击这个文件（最省事）：

- `/Users/bear/Desktop/Aria/Aria/scripts/one-click-macos.command`

在 Windows 上（管理员 PowerShell）执行：

```powershell
cd C:\\path\\to\\Aria
powershell -ExecutionPolicy Bypass -File scripts/one-click-windows.ps1
```

或者双击：

- `scripts\\one-click-windows.bat`

## C. 一键打包命令

桌面端安装包：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/build-desktop.sh
```

iOS 包（先编译，不签名）：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/build-ios.sh
```

iOS 签名导出 ipa（上架前）：

```bash
cd /Users/bear/Desktop/Aria/Aria
SIGN_AND_EXPORT=1 EXPORT_OPTIONS_PLIST=ios/ExportOptions.plist bash scripts/build-ios.sh
```

## E. 我已经帮你初始化好的项目目录

- 桌面端：`/Users/bear/Desktop/Aria/Aria/apps/desktop`
- 移动端：`/Users/bear/Desktop/Aria/Aria/apps/mobile`
- 假后端 API：`/Users/bear/Desktop/Aria/Aria/services/api/mock-server.mjs`

两个端都已经有首屏聊天 UI，你后续只要继续加接口即可。

## F. 现在可以一键跑“可演示版本”

Mac 上最简单方式（自动启动假后端 + 桌面预览）：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-desktop-demo.sh
```

说明：这条命令会同时启动 Native Bridge（硬件/语音能力执行层）。

或者双击：

- `/Users/bear/Desktop/Aria/Aria/scripts/run-desktop-demo.command`

iOS 预览（会自动启动假后端）：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-mobile-demo.sh
```

说明：同样会自动启动 Native Bridge。

如果你用真机（不是模拟器），把命令改成（`<你的Mac局域网IP>` 换成实际 IP）：

```bash
cd /Users/bear/Desktop/Aria/Aria
ARIA_API_BASE=http://<你的Mac局域网IP>:8787 bash scripts/run-mobile-demo.sh
```

查看你 Mac 局域网 IP（自动显示）：

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/show-local-ip.sh
```

## D. 你必须手动准备（无法自动跳过）

1. Apple 开发者账号与证书
2. Windows 代码签名证书（强烈建议）
3. CI 里的密钥和证书保管

补充：如果体检只剩 `CocoaPods` 缺失，通常执行下面一条即可（需要管理员密码）：

```bash
sudo gem install cocoapods
```
