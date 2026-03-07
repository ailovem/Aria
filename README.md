# Aria Delivery Kit

This repository now includes non-technical, one-command setup and build scripts
for:

- macOS desktop build environment
- Windows desktop build environment
- iOS (Flutter) build environment
- CI templates for desktop installers and iOS artifacts

Quick start:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/setup-macos.sh
bash scripts/doctor-macos.sh
```

Detailed instructions are in `docs/one-click-setup.md`.
Chinese quick guide is in `docs/non-tech-quickstart-zh.md`.

App entry points:

- Desktop app: `apps/desktop`
- Mobile app: `apps/mobile`
- Official website: `apps/website`

Demo API:

- Mock backend: `services/api/mock-server.mjs`
- Native bridge runtime: `services/bridge/bridge-server.mjs`
- Voyager-style L3 curriculum: `POST /v1/autonomy/curriculum/next`
- Voyager-style skill library: `GET /v1/autonomy/skill-library`
- Voyager-style iterative dispatch: `POST /v1/autonomy/dispatch/iterative`
- V3 delivery note: `docs/phase-3-delivery.md`
- Workplace gamification + device copilot: `docs/phase-3-delivery.md`
- Psychology engagement playbook: `docs/psychology-engagement-playbook.md`
- Soul persona bible: `docs/aria-soul-persona-bible.md`
- Authority learning playbook: `docs/authority-learning-playbook.md`
- Agent execution report: `docs/agent-execution-report-20260303.md`
- Agent sprint board: `docs/agent-sprint-board-20260303.md`
- Antigravity execution pack: `docs/antigravity-ui-motion-spec-v1.md`
- Aria Kernel execution pack: `docs/openclaw-runtime-execution-pack-v1.md`
- Independent product charter: `docs/aria-independent-product-charter.md`
- Independent deployment blueprint: `docs/independent-deployment-blueprint.md`
- Engineering quality standard: `docs/engineering-quality-standard.md`
- Workplace + device copilot spec: `docs/workplace-gameplay-device-copilot-spec.md`
- Native bridge expansion plan: `docs/native-bridge-expansion-plan.md`
- Backend layering v2 (frontend-to-backend): `docs/backend-architecture-v2-from-frontend-20260303.md`

One-command local demo (macOS):

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-desktop-demo.sh
```

Website release (non-technical / guided):

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/publish-website-release.sh
```

GitHub repo bootstrap + domain launch (for `ailovem.com`):

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/bootstrap-github-origin.sh
```

Built-in GitHub deploy pipelines:

- Website auto deploy: `.github/workflows/deploy-website-pages.yml`
- Desktop installer release: `.github/workflows/build-desktop.yml`

Run API + bridge runtime only:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/dev-runtime.sh
```

Autonomy runtime smoke check:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-autonomy-smoke.sh
```

Web4.0 full inspection + self-heal report:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/web4-inspection.sh
```

Permission and hardware capability doctor (macOS):

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/doctor-permissions-macos.sh
```

Legacy compatibility bridge switch (desktop `api.ts`):

- Env default: set `VITE_ARIA_LEGACY_COMPAT_ENABLED=false` to disable legacy field mapping by default.
- Runtime toggle (in app / console): use `setLegacyCompatBridgeEnabled(false)` to force-disable, `setLegacyCompatBridgeEnabled(true)` to re-enable.
- Reset to env default: `resetLegacyCompatBridgeEnabled()`.
