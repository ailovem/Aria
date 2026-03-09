# Aria Mock API

This service provides the Aria API v3 local backend for desktop/mobile demos.

Run:

```bash
cd /Users/bear/Desktop/Aria/Aria
node services/bridge/bridge-server.mjs
```

In another terminal:

```bash
cd /Users/bear/Desktop/Aria/Aria
node services/api/mock-server.mjs
```

Autonomy smoke:

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/run-autonomy-smoke.sh
```

Default address:

- `http://127.0.0.1:8787`

Data persistence:

- `services/api/data/demo-state.json`
- SQL schema template: `services/api/schema.sql`

## Auth flow

1. `POST /v1/auth/guest` to get bearer token
2. Use `Authorization: Bearer <token>` for `/v1/*` endpoints

## Endpoints

- `GET /health`
- `GET /v1/public/drug/label?search=<query>&limit=5`（公开，无需鉴权，代理 OpenFDA，官网药品查查使用）
- `GET /v1/public/site/discussion?threadId=<id>&actorId=<optional>&threadTitle=<optional>`（公开，无需鉴权，读取官网页面评论/点赞）
- `POST /v1/public/site/discussion/like`（公开，无需鉴权，切换点赞）
- `POST /v1/public/site/discussion/comment`（公开，无需鉴权，提交评论）
- `POST /v1/auth/guest`
- `GET /v1/state`
- `GET /v1/scene/config`
- `POST /v1/scene/config/apply`
- `GET /v1/system/config`
- `POST /v1/system/config`
- `POST /v1/system/config/reload`
- `GET /v1/system/config/history`
- `POST /v1/system/config/rollback`
- `GET /v1/timeline/unified?limit=120&flowId=<optional>`
- `POST /v1/timeline/replay`
- `GET /v1/timeline/diagnose?flowId=<required>&limit=300`
- `POST /v1/timeline/replay-repair`
- `GET /v1/capability/assessment`
- `GET /v1/capability/fusion`
- `GET /v1/capability/super-autonomy`
- `GET /v1/aria-kernel/gateway/status`
- `GET /v1/aria-kernel/heartbeat`
- `GET /v1/aria-kernel/session/status`
- `POST /v1/aria-kernel/session/spawn`
- `POST /v1/aria-kernel/session/send`
- `GET /v1/aria-kernel/task-center`
- `GET /v1/aria-kernel/execution-center`
- `GET /v1/aria-kernel/model/fallback/status`
- `GET /v1/aria-kernel/progress/protocol`
- `GET /v1/memory`
- `GET /v1/memory/architecture`
- `POST /v1/memory/architecture`
- `GET /v1/memory/runtime`
- `GET /v1/memory/backend/check`
- `GET /v1/memory/search?q=<query>&limit=6&scene=work|fun|life|love&crossScene=true|false`
- `POST /v1/memory` (supports `scene`, `tier=long_term|mid_term|short_term|temporary`, `tags`)
- `DELETE /v1/memory/:id`
- `POST /v1/preferences`
- `POST /v1/message`
- `POST /v1/message/stream` (SSE: `meta` -> `chunk` -> `done`)
- `GET /v1/engagement/state`
- `POST /v1/engagement/event`
- `POST /v1/quest/complete`
- `POST /v1/reward/claim`
- `POST /v1/proactive/next`
- `POST /v1/proactive/feedback`
- `GET /v1/workday/state`
- `POST /v1/workday/checkin`
- `POST /v1/workday/quest/complete`
- `GET /v1/workbench/state`
- `POST /v1/workbench/intent`
- `POST /v1/workbench/tool/run`
- `POST /v1/workbench/model/select`
- `GET /v1/expansion/state`
- `GET /v1/expansion/security`
- `POST /v1/expansion/security`
- `POST /v1/expansion/security/reload`
- `POST /v1/expansion/packs/install`
- `POST /v1/expansion/fetch-download`
- `GET /v1/device/capabilities`
- `POST /v1/device/permissions`
- `GET /v1/device/tasks`
- `POST /v1/device/tasks/plan`
- `POST /v1/device/tasks/execute`
- `GET /v1/device/audit`
- `GET /v1/mobile/link/outbox?limit=40`
- `GET /v1/hardware/status`
- `POST /v1/voice/tts`
- `POST /v1/voice/stt`
- `GET /v1/voice/profile`
- `POST /v1/voice/profile`
- `GET /v1/voice/channel/status`
- `POST /v1/voice/channel/acquire`
- `POST /v1/voice/channel/renew`
- `POST /v1/voice/channel/release`
- `GET /v1/autonomy/status`
- `GET /v1/autonomy/queue`
- `GET /v1/autonomy/inbox`
- `POST /v1/autonomy/inbox/ack`
- `POST /v1/autonomy/repair`
- `POST /v1/autonomy/tick`
- `POST /v1/autonomy/dispatch`
- `POST /v1/autonomy/queue/process`
- `POST /v1/autonomy/queue/dead-letter/retry`
- `POST /v1/autonomy/queue/policy`
- `GET /v1/agi/goal-contract/schema?text=<optional>`
- `POST /v1/agi/goal-contract/compile`
- `GET /v1/agi/framework?text=<optional>`
- `POST /v1/agi/execute`
- `POST /v1/reset`

`GET /v1/state` now includes:

- `engagement` block (`xp`, `level`, `streakDays`, `today.*`)
- `proactive` block (daily budget, cooldown, quiet hours, recent suggestions)
- `autonomy` block (autonomous tick, self-repair, self-learning, inbox queue)
  - queue policy (per operation retry/circuit strategy)
  - unified timeline (intent submit -> dispatch -> retry -> finish)
  - failure insights (network / permission / policy / execution layers)
- `workday` block (职场游戏化任务、清晰度、爱的能量、Flow 进度)
- `deviceOps` block (桌面/手机能力权限、任务队列、审计日志)

Runtime policy file (hot-reload without restart):

- `services/api/autonomy-policy.json`

System architecture config files (hot-reload, backend layering):

- `services/api/system-profile.json`
- `services/api/model-routing.policy.json`
- `services/api/openclaw-fusion.profile.json`
- `services/api/super-autonomy.profile.json`
- `services/api/expansion-security.policy.json`
- `services/api/scene-orchestration.policy.json`

Universal AGI execution flow:

- `GET /v1/agi/goal-contract/schema` returns `goal-contract.v1` schema and optional preview contract.
- `POST /v1/agi/goal-contract/compile` compiles natural language or partial contract into a normalized `GoalContract + TaskGraph`.
- `POST /v1/agi/execute` runs one goal through:
  - intent parsing
  - GoalContract compile
  - task graph generation
  - policy guard
  - execution dispatch
  - evidence receipt generation
  - root-cause diagnosis + optional auto-repair chain
- `GET /v1/agi/framework` returns AGI capability snapshot, operation catalog and optional preview (`GoalContract + TaskGraph + Receipt`).

`POST /v1/system/config` supports both full payload update and patch update:

- `operatorName`
- `operatorSource`
- `changeReason`
- `systemProfilePatch`
- `modelRoutingPatch`
- `openclawFusionPatch`
- `superAutonomyPatch`
- `expansionSecurityPatch`
- `sceneOrchestrationPatch`
- `persist` (default `true`)

Memory vector backend can be switched via `systemProfilePatch`:

- `layers.foundation.storage.vectorRuntime.mode` (`local` | `qdrant`)
- `layers.foundation.storage.vectorRuntime.qdrant.url`
- `layers.foundation.storage.vectorRuntime.qdrant.collection`
- `layers.foundation.storage.vectorRuntime.qdrant.timeoutMs`

运营追踪与回滚：

- `GET /v1/system/config/history`：查看“谁改了什么”的策略时间线与快照列表
- `POST /v1/system/config/rollback`：一键回滚到上一个可用版本，或指定 `snapshotId` 回滚

示例：读取配置变更时间线

```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1:8787/v1/system/config/history?limit=20"
```

示例：一键回滚到上一个可用版本

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mode":"previous_stable","persist":true,"operatorName":"运营负责人","note":"回滚到稳定策略"}' \
  http://127.0.0.1:8787/v1/system/config/rollback
```

Unified timeline APIs:

- `GET /v1/timeline/unified`: merged task chain from workbench + autonomy + device
- `POST /v1/timeline/replay`: replay one `flowId` in chronological order
- `GET /v1/timeline/diagnose`: output task graph + root-cause layers + repair suggestion
- `POST /v1/timeline/replay-repair`: one-click retry dead-letters and/or rerun dispatch

System config response now also includes:

- `openclawFusionProfile` (Aria Kernel 架构融合与复用策略)
- `superAutonomyProfile` (全能力灌注与创新策略)
- `expansionSecurityPolicy` (whitelist, signature, sandbox profiles)

Aria Kernel runtime protocol APIs (for "copy homework + innovate" stack):

- gateway/session/execution/task ledger status APIs
- cloud-first + local fallback status API
- long-task progress protocol API
- all of the above are included in fusion/super-autonomy readiness checks

Native bridge (optional but recommended for hardware/voice/device execution):

- `services/bridge/bridge-server.mjs`
- default bridge address: `http://127.0.0.1:8788`
- API environment variable: `ARIA_BRIDGE_BASE`

Expansion security policy (whitelist + signature + sandbox):

- policy file: `services/api/expansion-security.policy.json`
- runtime API: `GET/POST /v1/expansion/security`
- install enforcement: host/mime whitelist, optional signature verification, sandbox capability filtering

Expansion safety env (used as policy defaults at bootstrap):

- `ARIA_EXPANSION_ALLOWED_HOSTS` (comma separated)
- `ARIA_EXPANSION_ALLOWED_MIME_PREFIXES` (comma separated)
- `ARIA_EXPANSION_MAX_DOWNLOAD_BYTES`
- signer secret env (configured in policy `signature.trustedSigners[*].keyEnv`)

Model router env (real model routing, with local fallback):

- `ARIA_MODEL_REAL_CALL` (`true|false`, default `true`)
- `ARIA_MODEL_OPENAI_BASE` (default `https://api.openai.com/v1`)
- `ARIA_MODEL_OPENAI_API_KEY` (or `OPENAI_API_KEY`)
- `ARIA_MODEL_PROVIDER_<PROVIDER_ID>_BASE_URL`
- `ARIA_MODEL_PROVIDER_<PROVIDER_ID>_API_KEY`
- `ARIA_MODEL_PROVIDER_<PROVIDER_ID>_MODEL`
- `ARIA_MODEL_PROVIDER_IFLOW_SHARED_API_KEY` (shared key for iFlow provider presets)

Domestic provider quick preset:

- example file: `services/api/model-providers.env.example`
- copy to `.runtime/secrets/model-providers.env` (recommended)
- supported preset IDs in `model-routing.policy.json`:
  - `cn-aliyun-qwen-plus` (DashScope compatible endpoint)
  - `cn-deepseek-chat`
  - `cn-zhipu-glm-4-plus`
  - `cn-siliconflow-deepseek-v3`
  - `cn-siliconflow-qwen`
  - `iflow-*` series (Qwen3/DeepSeek/Kimi/GLM/iFlow-ROME presets)

## Minimal payload examples

Search memory:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1:8787/v1/memory/search?q=焦虑&limit=5"
```

Memory search response now includes:

- `embedding_score`
- `rerank_score`
- `trigger_confidence`
- `scene`
- `memory_tier`

Memory plane runtime snapshot:

- `GET /v1/memory/runtime` returns vector backend runtime + scene counters + memory jobs/stats
- `GET /v1/memory/architecture` returns current 3+1 memory architecture and tier counters
- `POST /v1/memory/architecture` updates architecture mode/tier limits/reasoning strategy online
- `GET /v1/memory/backend/check` returns environment-aware self-check + repair suggestions (小白模式)
- `GET /v1/system/config` also includes `memoryPlaneRuntime`

Vector backend env (Qdrant priority, interface unchanged):

- `ARIA_VECTOR_BACKEND` (`local` or `qdrant`, default `local`)
- `ARIA_QDRANT_URL` (required when `ARIA_VECTOR_BACKEND=qdrant`)
- `ARIA_QDRANT_API_KEY` (optional)
- `ARIA_QDRANT_COLLECTION` (default `aria_memory`)
- `ARIA_QDRANT_TIMEOUT_MS` (default `6000`)

Memory architecture env (3+1 defaults):

- `ARIA_MEMORY_ARCH_MODE` (`three_plus_one` or `classic`, default `three_plus_one`)
- `ARIA_MEMORY_MID_TERM_LIMIT` (default `420`)
- `ARIA_MEMORY_REASONING_TOPK` (default `8`)

Update memory architecture online:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mode":"three_plus_one","midTerm":{"enabled":true,"maxItems":480},"realtimeReasoning":{"topK":10,"includeCrossScene":true,"hybridSearch":true}}' \
  http://127.0.0.1:8787/v1/memory/architecture
```

Create memory:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"用户最近晚间容易焦虑，先安抚再拆任务"}' \
  http://127.0.0.1:8787/v1/memory
```

Fetch next proactive suggestion:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"scene":"desktop-home","localHour":10}' \
  http://127.0.0.1:8787/v1/proactive/next
```

Report proactive feedback:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"feedback":"executed","suggestionId":"pro-xxx"}' \
  http://127.0.0.1:8787/v1/proactive/feedback
```

Fetch workday loop:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1:8787/v1/workday/state"
```

Grant mobile album permission:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"capabilityId":"mobile.photos_organize","status":"granted","reason":"用户同意相册整理"}' \
  http://127.0.0.1:8787/v1/device/permissions
```

Plan and execute mobile task:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"taskType":"mobile_album_cleanup","payload":{"target":"camera-roll"}}' \
  http://127.0.0.1:8787/v1/device/tasks/plan
```

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"task-xxx"}' \
  http://127.0.0.1:8787/v1/device/tasks/execute
```

Hardware snapshot:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1:8787/v1/hardware/status"
```

Voice TTS:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"今天先完成最关键的三件事","voice":"Eddy (中文（中国大陆）)","dryRun":true}' \
  http://127.0.0.1:8787/v1/voice/tts
```

Autonomy dispatch (Aria Kernel kernel):

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"整理桌面并下载 https://raw.githubusercontent.com/github/gitignore/main/README.md","execute":true}' \
  http://127.0.0.1:8787/v1/autonomy/dispatch
```

Autonomy retry queue snapshot:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1:8787/v1/autonomy/queue"
```

Process retry queue manually:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"limit":5}' \
  http://127.0.0.1:8787/v1/autonomy/queue/process
```

Retry one dead-letter task:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"id":"aq-xxx"}' \
  http://127.0.0.1:8787/v1/autonomy/queue/dead-letter/retry
```

Update queue policy (global switch + per-type strategy):

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"autoProcessOnTick":true,"strategies":{"shell_command":{"enabled":false},"api_call":{"maxAttempts":4,"circuitBreakerThreshold":4}}}' \
  http://127.0.0.1:8787/v1/autonomy/queue/policy
```

Capability assessment:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1:8787/v1/capability/assessment"
```

Workbench intent:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"帮我生成本周复盘提纲","tags":["#复盘","#工作"]}' \
  http://127.0.0.1:8787/v1/workbench/intent
```

Coding closed-loop (intent -> command pipeline -> auto repair):

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"帮我修复桌面端构建报错并跑测试，自动执行","scene":"work"}' \
  http://127.0.0.1:8787/v1/message
```

- coding intents now route to `coding_execution` task-first model policy.
- failed coding dispatch triggers auto repair chain (queue replay + rerun dispatch) and writes repair summary into execution receipt.
- `code_patch_loop` now enforces safety gate: auto dispatch only generates preview draft; apply/rollback must be confirmed through patch-gate endpoints.
- patch proposal generation has strict-json fallback: local tolerant parser + one-shot model json-repair before returning `patch_proposal_failed`.
- `scene:"coding"` is supported as the dedicated “编程女孩” scene.

Patch safety gate (preview diff -> confirm apply -> rollback):

```bash
# 1) preview
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"objective":"修复构建报错","cwd":"apps/desktop","verifyCommands":["npm run build:web"]}' \
  http://127.0.0.1:8787/v1/code/patch/preview

# 2) apply by draftId
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"draftId":"patch-draft-xxx"}' \
  http://127.0.0.1:8787/v1/code/patch/apply

# 3) rollback latest/appointed receipt
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"receiptId":"patch-receipt-xxx"}' \
  http://127.0.0.1:8787/v1/code/patch/rollback
```

Install expansion pack:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"packId":"pack.remote.demo","name":"远程扩展包","source":"manifest"}' \
  http://127.0.0.1:8787/v1/expansion/packs/install
```

Autonomous fetch + download:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://example.com/a.pdf","saveAs":"downloads/a.pdf"}' \
  http://127.0.0.1:8787/v1/expansion/fetch-download
```

Compatibility endpoints (legacy demo):

- `GET /v1/demo/state?userId=<id>`
- `GET /v1/demo/memory?userId=<id>`
- `POST /v1/demo/preferences`
- `POST /v1/demo/message`
- `POST /v1/demo/reset`
