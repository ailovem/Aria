# Aria Desktop

Tech stack:

- React + TypeScript + Vite
- Tauri 2 shell

Run web mode:

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop
npm install
npm run dev:web
```

Start with mock API in one command:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-desktop-demo.sh
```

Run desktop mode (needs Rust toolchain):

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop
npm install
npm run dev
```

Desktop auto runtime (Docker API bootstrap):

- In desktop startup, Tauri can auto-run Docker API using `deploy/docker-compose.api.yml`.
- Default policy: debug/dev build = enabled; release build = disabled (recommended for public website distribution).
- Disable with env: `ARIA_DESKTOP_AUTO_BOOT_DOCKER_API=false`.
- Force enable in release with env: `ARIA_DESKTOP_AUTO_BOOT_DOCKER_API=true`.
- Override compose file path with env: `ARIA_DOCKER_COMPOSE_FILE=/absolute/path/to/docker-compose.api.yml`.
- Skip image rebuild on startup with env: `ARIA_DOCKER_COMPOSE_SKIP_BUILD=true`.
