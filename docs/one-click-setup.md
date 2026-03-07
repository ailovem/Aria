# Aria One-Click Setup Guide

Last updated: 2026-03-03

Direction freeze:

- Aria is an independent product (downloadable client + flexible deployment + iOS operation lane).
- Runtime autonomy must keep working without developer-agent presence.
- See `docs/aria-independent-product-charter.md`.

## 1) Do end users need development setup?

No.

- macOS users install from `dmg` or signed `.app`
- Windows users install from `msi` or `exe`
- iOS users install from TestFlight or App Store

End users do not need Node, Rust, Flutter, or Xcode.

## 2) What does your release team need?

### macOS release machine

- Xcode (full app)
- Homebrew
- Node.js LTS
- pnpm
- Rust + cargo
- Tauri CLI
- CocoaPods
- Flutter SDK (for iOS build lane)

Use:

```bash
bash scripts/setup-macos.sh
bash scripts/doctor-macos.sh
bash scripts/doctor-permissions-macos.sh
```

If admin setup fails, run user-scope fallback:

```bash
bash scripts/setup-macos-userland.sh
bash scripts/doctor-macos.sh
bash scripts/doctor-permissions-macos.sh
```

Or double-click:

- `scripts/one-click-macos.command`

### Windows release machine

- winget
- Node.js LTS
- pnpm
- Rust + cargo
- Visual Studio Build Tools (C++ workload)
- WebView2 Runtime
- Flutter SDK

Use PowerShell as Administrator:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-windows.ps1
powershell -ExecutionPolicy Bypass -File scripts/doctor-windows.ps1
```

Or double-click:

- `scripts\\one-click-windows.bat`

## 3) Build commands (after app code exists)

### Desktop installer build

```bash
bash scripts/build-desktop.sh
```

### iOS build (unsigned)

```bash
bash scripts/build-ios.sh
```

### iOS archive + ipa export (signed)

```bash
SIGN_AND_EXPORT=1 EXPORT_OPTIONS_PLIST=ios/ExportOptions.plist bash scripts/build-ios.sh
```

## 4) Local run commands

### Desktop web preview

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop
npm install
npm run dev:web
```

Or run desktop + mock API together:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-desktop-demo.sh
```

This command now also starts the Native Bridge (`127.0.0.1:8788`) for hardware
and voice capability demos.

### API local deploy with Docker

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/deploy-local-api.sh
```

### Desktop Tauri shell

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop
npm install
npm run dev
```

### iOS app

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/mobile
flutter create --platforms=ios .
flutter pub get
flutter run -d ios
```

Or run iOS + mock API together:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-mobile-demo.sh
```

This command now also starts the Native Bridge runtime automatically.

If testing on a real iPhone, check your Mac LAN IP:

```bash
bash scripts/show-local-ip.sh
```

## 5) CI/CD automation templates

- Desktop build workflow:
  - `.github/workflows/build-desktop.yml`
- iOS build workflow:
  - `.github/workflows/build-ios.yml`

These workflows are safe templates. They skip build if project folders are not
ready yet.

## 6) Important manual items that cannot be automated away

1. Apple Developer account setup and certificates
2. Windows Authenticode code-signing certificate (recommended)
3. Secrets setup in CI (API keys, signing material)
4. Product legal/compliance policies before release

If only CocoaPods is missing on macOS, run:

```bash
sudo gem install cocoapods
```
