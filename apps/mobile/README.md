# Aria Mobile

Tech stack:

- Flutter (iOS first)

Quick start:

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/mobile
flutter create --platforms=ios .
flutter pub get
flutter run -d ios
```

Open in Xcode:

```bash
open /Users/bear/Desktop/Aria/Aria/apps/mobile/ios/Runner.xcworkspace
```

If `ios/` is missing, run:

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/mobile
flutter create --platforms=ios .
```

Run with mock API and iOS in one command:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-mobile-demo.sh
```

By default, the script prefers iOS Simulator (more stable than wireless iPhone debug).
To force a real phone, set device id:

```bash
ARIA_IOS_DEVICE_ID=<YOUR_DEVICE_ID> ARIA_API_BASE=http://<YOUR_MAC_IP>:8787 bash scripts/run-mobile-demo.sh
```

For real device, set your Mac LAN IP:

```bash
ARIA_API_BASE=http://<YOUR_MAC_IP>:8787 bash scripts/run-mobile-demo.sh
```

If debug mode waits too long on "Dart VM Service", run release mode:

```bash
ARIA_API_BASE=http://<YOUR_MAC_IP>:8787 ARIA_MOBILE_RUN_MODE=release bash scripts/run-mobile-demo.sh
```

If you only want to build:

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/mobile
flutter build ios --release --no-codesign
```
