# Aria 第三阶段交付说明（含 P0 增量）

更新时间：2026-03-03

## 这次升级做了什么

1. 把原来的纯 demo 接口升级成 **V3 API 骨架**（支持鉴权和用户隔离）
2. 把桌面端和 iOS 端都改为走 **Token + 受保护接口**
3. 增加数据库结构定义（`schema.sql`）用于下一步接 Postgres
4. 增加本地部署脚本与 Docker Compose，便于后续上云
5. 新增 **SSE 流式消息接口**（`/v1/message/stream`）和双端流式状态机
6. 新增 **成长系统接口**（`/v1/engagement/state`、`/v1/engagement/event`）
7. 新增 **记忆检索与主动触达骨架**（`/v1/memory/search`、`/v1/proactive/next`）
8. 双端增加记忆检索面板、记忆写入入口、主动建议执行入口（可直接预填并发送）
9. 新增“权威学习与能力注入蓝图”以驱动持续迭代（`docs/authority-learning-playbook.md`）
10. 新增“自主内核 v1”：自动 tick、自修复、自学习、策略热加载和双端控制台
11. 冻结“独立产品方向”：客户端下载、灵活部署、独立运营（`docs/aria-independent-product-charter.md`）
12. 新增“职场游戏化工作台 v1”：清晰度/爱的能量/Quest 结算（`/v1/workday/*`）
13. 新增“设备接管控制台 v1”：桌面+手机权限、任务编排、执行审计（`/v1/device/*`）
14. 新增“Native Bridge v1”：硬件巡检、语音 TTS/STT、跨应用能力适配（`services/bridge/*`）

## 新增/关键文件

- API 服务：
  - `services/api/mock-server.mjs`
  - `services/api/schema.sql`
  - `services/api/Dockerfile`
- 客户端接入：
  - `apps/desktop/src/api.ts`
  - `apps/mobile/lib/demo_api.dart`
- 部署：
  - `deploy/docker-compose.api.yml`
  - `scripts/deploy-local-api.sh`

## V3 API 关键接口

- `POST /v1/auth/guest`：换取访客 token
- `GET /v1/state`：拉取当前用户状态（需 Bearer token）
- `POST /v1/preferences`：更新模式/在线状态（需 token）
- `POST /v1/message`：发送消息并返回 Aria 回复（需 token）
- `POST /v1/message/stream`：SSE 流式返回 Aria 回复（需 token）
- `GET /v1/engagement/state`：获取 XP/等级/连击/今日任务状态（需 token）
- `POST /v1/engagement/event`：上报行为事件并结算成长值（需 token）
- `GET /v1/memory/search`：按关键词检索长期记忆 + 近期会话片段（需 token）
- `POST /v1/memory`：写入一条长期记忆（需 token）
- `POST /v1/proactive/next`：获取下一条主动触达建议（含预算与冷却保护，需 token）
- `POST /v1/proactive/feedback`：上报建议反馈（executed/ignored/dismissed）并学习触达参数
- `GET /v1/workday/state`：获取工作日游戏化状态（清晰度、爱的能量、Quest）
- `POST /v1/workday/checkin`：提交工作签到（能量/压力/意图）
- `POST /v1/workday/quest/complete`：完成 Quest 并结算 XP
- `GET /v1/device/capabilities`：获取设备能力与授权状态
- `POST /v1/device/permissions`：更新设备授权策略
- `POST /v1/device/tasks/plan`：规划桌面/手机任务
- `POST /v1/device/tasks/execute`：执行任务并返回摘要
- `GET /v1/device/tasks`：查询任务队列
- `GET /v1/device/audit`：查询审计日志
- `GET /v1/hardware/status`：获取硬件状态快照（经 Bridge）
- `POST /v1/voice/tts`：语音播报（经 Bridge）
- `POST /v1/voice/stt`：语音转文字（经 Bridge）
- `POST /v1/quest/complete`：完成微任务并结算奖励（需 token）
- `POST /v1/reward/claim`：领取奖励并结算（需 token）
- `GET /v1/autonomy/status`：获取独立运行内核状态（需 token）
- `GET /v1/autonomy/inbox`：获取自主生成建议队列（需 token）
- `POST /v1/autonomy/inbox/ack`：确认一条自主建议（需 token）
- `POST /v1/autonomy/repair`：手动触发自修复检查（需 token）
- `POST /v1/autonomy/tick`：手动触发一次自主执行（需 token）
- `POST /v1/reset`：重置当前用户演示数据（需 token）

兼容保留（旧版 demo 路径）：

- `/v1/demo/*`

## 如何启动

### 本地 Node 模式

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/dev-api.sh
```

### Docker 模式

```bash
cd /Users/bear/Desktop/Aria/Aria
bash scripts/deploy-local-api.sh
```

## 说明

- 当前仍是“可演示后端”，AI 回复是规则生成，不是大模型在线推理。
- Native Bridge 已支持插件式扩展（`services/bridge/adapters`），可以继续接入更多硬件与系统能力。
- 下一步可把 `schema.sql` 对接到真实 Postgres + Redis + 向量库。
- 双端已支持“加载/流式/失败重试 + 记忆检索 + 主动建议 + 自主内核控制台”基础状态，下一步可继续做打字动画、断线重连和历史分页。
- 当前 `/v1/memory/search` 已新增 `embedding_score`、`rerank_score`、`trigger_confidence`，用于后续接入向量召回。
