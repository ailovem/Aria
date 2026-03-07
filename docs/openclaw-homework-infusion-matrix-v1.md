# Aria Kernel Homework Infusion Matrix v1

## 目标

把 Aria Kernel 的可执行内核能力直接灌入 Aria 底层，并做工程级增强：

- 不是接适配层
- 不是重复造轮子
- 是复用 + 强化 + 稳定化 + 小白可读

## 权威方法论锚点

参考官方课程与研究方向，提炼为可落地工程原则：

- Harvard CS165（数据系统）：任务与证据必须可追溯、可回放
- Harvard CS260r（软件系统）：可靠性和可恢复性是内建能力，不是补丁
- Harvard CS161（系统基础）：分层边界清晰，控制面与执行面解耦
- Tsinghua CS Research（系统/网络/软件）：重视系统协同与演进能力
- Tsinghua Advanced Computing（并发/调度）：调度策略可配置且可观测

## Aria Kernel -> Aria 能力灌注映射

1) Gateway + Heartbeat
- Aria Kernel 作业：gateway status, watchdog, 心跳
- Aria 落地：
  - `GET /v1/aria-kernel/gateway/status`
  - `GET /v1/aria-kernel/heartbeat`

2) Session + Subagent
- Aria Kernel 作业：会话编排、spawn/send/status
- Aria 落地：
  - `GET /v1/aria-kernel/session/status`
  - `POST /v1/aria-kernel/session/spawn`
  - `POST /v1/aria-kernel/session/send`

3) Task Ledger + Delivery Log
- Aria Kernel 作业：TASK_QUEUE/TASK_DONE + EXECUTION_LOG/DELIVERY_LOG
- Aria 落地：
  - `GET /v1/aria-kernel/task-center`
  - `GET /v1/aria-kernel/execution-center`

4) Cloud-first + Local Fallback
- Aria Kernel 作业：多模型 + 自动回退
- Aria 落地：
  - `GET /v1/aria-kernel/model/fallback/status`
  - `services/api/model-routing.policy.json`

5) Progress Protocol
- Aria Kernel 作业：长任务定时回报、阻塞上报
- Aria 落地：
  - `GET /v1/aria-kernel/progress/protocol`
  - `services/api/openclaw-fusion.profile.json -> automationProtocol.progress`

## 防重复开发机制

- 统一复用目录：`FUSION_REUSE_ENDPOINT_CATALOG`
- 超级灌注配置：`services/api/super-autonomy.profile.json`
- 融合协议配置：`services/api/openclaw-fusion.profile.json`
- 烟测保障：`scripts/run-autonomy-smoke.sh`

验收目标：
- `fusion readiness = 100`
- `super autonomy readiness = 100`
- `missingRequiredSkillCount = 0`
- `duplicateRiskCount = 0`

## 前端可视化落地

脑系统新增「超级自主底层（全能力灌注）」卡片，展示：

- readiness
- 技能就绪率
- 缺失技能数量
- 重复开发风险
- 网关状态 / 会话数 / 积压 / 死信

路径：
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/styles.css`

## 下一步

- P1: 把 super autonomy 配置编辑器（技能 required、策略阈值）接到前端
- P2: 把 openclaw runtime protocol 面板接到移动端
- P3: 引入更严格的策略 schema 校验与回滚
