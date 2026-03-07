# Aria Native Bridge

Aria Native Bridge provides local high-permission adapters for:

- hardware status snapshot
- voice TTS/STT
- workspace organization
- workspace natural-language file search
- workspace command automation (policy allowlist)
- mail/SMS digest hooks
- cross-channel delivery (Feishu / mobile relay)

It is designed as an extensible adapter runtime (`services/bridge/adapters/*.mjs`).

## Run

```bash
cd /Users/bear/Desktop/Aria/Aria
node services/bridge/bridge-server.mjs
```

Default address:

- `http://127.0.0.1:8788`

## Endpoints

- `GET /health`
- `GET /v1/capabilities`
- `GET /v1/policy`
- `POST /v1/policy/reload`
- `GET /v1/hardware/snapshot`
- `POST /v1/voice/tts`
- `POST /v1/voice/stt`
- `GET /v1/voice/profile`
- `POST /v1/voice/profile`
- `GET /v1/voice/channel/status`
- `POST /v1/voice/channel/acquire`
- `POST /v1/voice/channel/renew`
- `POST /v1/voice/channel/release`
- `POST /v1/actions/execute`

## Policy

Policy file:

- `services/bridge/bridge-policy.json`

You can disable or enable specific actions from this file, and reload via:

```bash
curl -X POST http://127.0.0.1:8788/v1/policy/reload
```

Workspace command automation notes:

- action: `workspace.command`
- required payload: `command`
- optional payload: `cwd`, `timeoutMs`
- policy guardrails:
  - `workspace.allowedRoots`
  - `workspace.allowedCommandPrefixes`
  - `workspace.commandTimeoutMs`

Natural file search notes:

- action: `workspace.find_files`
- payload: `query`, `keywords[]`, `extensions[]`, `target`, `modifiedAfter`, `maxResults`

Cross-channel delivery notes:

- action: `communications.send_channel`
- channels: `feishu_webhook`, `mobile_link`, `email` (email requires external SMTP runtime)

## Add a new adapter

1. Create `services/bridge/adapters/<name>.mjs`
2. Export a single `adapter` object:

```js
export const adapter = {
  id: "my-adapter",
  name: "My Adapter",
  capabilities: [{ id: "custom.capability", platform: "desktop", name: "能力名", risk: "medium" }],
  actions: {
    "custom.action": async ({ payload, runCommand, policy }) => ({ ok: true, summary: "done" })
  }
};
```

3. Reload bridge:

```bash
curl -X POST http://127.0.0.1:8788/v1/policy/reload
```
