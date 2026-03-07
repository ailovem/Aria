# Aria 后端与底层架构蓝图 v2（基于当前前端交互倒推）

更新时间：2026-03-03  
负责人：Aria PM/Tech Lead（Codex）

---

## 1) 目标与边界

本版本目标不是“再写一份大而空文档”，而是把前端已定下来的交互结构，倒推出可落地、可配置、可演进的后端分层架构，让产品具备：

1. 独立运行（不依赖外部开发者在线值守）
2. 自主执行（输入即执行，不是只聊天）
3. 自主修复（异常自动分类、重试、降级、自愈）
4. 自主进化（记忆沉淀 + 策略学习 + 能力扩展）
5. 多端一致（Desktop + iOS 的同一内核能力）

> 说明：用户体验采用“高粘性 + 高价值”路线，但执行上遵循安全和健康边界，避免操控式成瘾设计。

---

## 2) 分层架构（基础层 / 技术层 / 模型层 / 应用层 / 治理层）

## 2.1 基础层（Foundation Layer）

职责：让系统“跑得起来、存得住、恢复得了”。

- Runtime：Node API + Native Bridge（本地高权限执行）
- Storage：
  - 状态存储：JSON（当前）
  - 关系库存储：PostgreSQL（schema 已就位）
  - 向量存储：Qdrant（规划位）
  - 缓存队列：Redis/BullMQ（规划位）
- Reliability：
  - Runtime Guardian（watchdog + cooldown + self-heal）
  - 任务队列重试/熔断策略
  - 健康探针与可观测性基础指标

当前实现锚点：
- `/Users/bear/Desktop/Aria/Aria/services/api/mock-server.mjs`
- `/Users/bear/Desktop/Aria/Aria/services/bridge/bridge-server.mjs`
- `/Users/bear/Desktop/Aria/Aria/services/api/schema.sql`

## 2.2 技术层（Technology Layer）

职责：把“能力”变成标准化服务和可控接口。

- API Gateway（鉴权、请求规范、错误模型）
- Capability Gateway（Skill/MCP/Bridge 统一调用入口）
- Orchestrator（任务拆解、路由、调度、回执）
- Policy Engine（权限、风控、allowlist、命令前缀限制）
- Expansion Manager（下载扩展、校验、安装、审计）

当前实现锚点：
- `/Users/bear/Desktop/Aria/Aria/services/bridge/bridge-policy.json`
- `/Users/bear/Desktop/Aria/Aria/services/bridge/adapters/*.mjs`
- `/Users/bear/Desktop/Aria/Aria/services/api/autonomy-policy.json`

## 2.3 模型层（Model Layer）

职责：让系统按任务自动选模型，不因单点失败停机。

- Model Router：按任务类型（陪伴/规划/编码/执行）选择主模型
- Fallback Chain：超时、失败、限流时自动降级
- Prompt Guard + Output Guard：高风险动作前置约束
- Context Builder：短期会话 + 长期记忆 + 场景策略拼接

新增配置文件（已落地）：
- `/Users/bear/Desktop/Aria/Aria/services/api/model-routing.policy.json`

## 2.4 应用层（Application Layer）

职责：对齐前端四场景，保证“一个场景一套策略”。

- 工作场景（work）：目标拆解 -> 任务执行 -> 结果复盘
- 娱乐场景（fun）：互动玩法 -> 社交互动 -> 轻创作触发
- 生活场景（life）：生活对话中台 + 家庭提醒 + 设备代办
- 情感场景（love）：实时陪伴 + 记忆触达 + 关系经营

新增配置文件（已落地）：
- `/Users/bear/Desktop/Aria/Aria/services/api/scene-orchestration.policy.json`

## 2.5 治理层（Governance Layer）

职责：保证系统“能做事”同时“可控、可审计、可回滚”。

- 权限治理：高风险能力默认 prompt，需显式授权
- 审计治理：任务链路、外部下载、命令执行可回放
- 安全治理：allowlist、MIME 限制、下载大小限制
- 运营治理：SLO、失败率、慢请求、策略命中率

---

## 3) 基于现有前端结构的后端映射

## 3.1 左侧女友主页（你刚刚完成了清理）

前端结构：快捷功能 -> 脑系统 -> 女友形象 -> 技能执行  
后端映射：

1. 快捷功能：`Panel Router`（切 panel 但不破坏 scene 上下文）
2. 脑系统：`Brain Modules`（模型路由/进化/记忆/情智）
3. 女友形象：`Persona Service`（形象、服装、点击反馈、情感状态）
4. 技能执行：`Skill Execution Hub`（自动化、设备、编程、扩展）

## 3.2 右侧四场景核心要求

1. Work：支持真实工具执行，不只是建议文字
2. Fun：支持多入口隐藏配置 + 单输入框主交互
3. Life：固定在生活主页交互，不跳页
4. Love：实时共情 + 记忆回调 + 行动建议闭环

后端统一链路：

`User Input -> Intent Parser -> Scene Policy -> Model Router -> Task Planner -> Queue Dispatcher -> Bridge/Skill Executor -> Memory Writeback -> UI Feedback`

---

## 4) “继承 Codex + Aria Kernel 核心能力”到 Aria 独立内核

这里是“能力复制”，不是“运行依赖”。

## 4.1 Codex 核心能力注入

- Planner-Executor Loop：将自然语言拆成可执行步骤
- Code Agent Workbench：自主编程、改错、测试、补丁
- Root Cause Engine：失败按网络/权限/策略/执行分层归因
- Runtime Self-Heal：锁、watchdog、冷却、自动重放

## 4.2 Aria Kernel 核心能力注入

- Agent Binding Gateway：能力绑定路由（面板/场景/任务维度）
- Autonomous Queue Router：任务队列策略化重试与熔断
- Expansion Fetch/Install Pipeline：安全下载、安装、回执
- Policy Hot Reload：策略文件热更新，不重启服务

## 4.3 Aria 原生核心能力

- Persona-Memory Engine：关系记忆、偏好记忆、场景记忆
- Emotion-first Dialogue：先共情再动作，场景化语气
- Device Copilot：桌面/手机能力授权后可执行

---

## 5) 配置实现（已落地）

为避免“全写死在代码里”，本轮新增三份配置源，并接入 API 热重载：

- 系统分层总配置：
  - `/Users/bear/Desktop/Aria/Aria/services/api/system-profile.json`
- 模型路由策略：
  - `/Users/bear/Desktop/Aria/Aria/services/api/model-routing.policy.json`
- 场景编排策略：
  - `/Users/bear/Desktop/Aria/Aria/services/api/scene-orchestration.policy.json`

API 已接入：

- `GET /v1/system/config`：查看当前生效配置
- `POST /v1/system/config/reload`：热重载配置

并在 `GET /health` 增加了配置版本信息，便于运维确认。

---

## 6) 数据架构（从 demo 到工程化）

## 6.1 当前（可演示）

- `demo-state.json`：用户状态与消息等主状态
- `autonomy-policy.json`：自治策略
- 新增三类配置文件：系统/模型/场景

## 6.2 下一阶段（工程化）

- PostgreSQL：用户、会话、任务、审计、事件
- Vector DB：长期记忆向量检索
- Redis/BullMQ：队列、锁、重试、延迟任务
- Object Storage：附件、语音、导出产物

---

## 7) 接口分层建议（稳定契约）

## 7.1 Experience API（给前端）

- `/v1/state`
- `/v1/message/stream`
- `/v1/workday/*`
- `/v1/system/config`

## 7.2 Orchestration API（给调度）

- `/v1/autonomy/dispatch`
- `/v1/autonomy/queue/process`
- `/v1/autonomy/queue/policy`
- `/v1/runtime/guardian/*`

## 7.3 Capability API（给执行层）

- `/v1/device/*`
- `/v1/workbench/*`
- `/v1/expansion/*`
- bridge `/v1/actions/execute`

---

## 8) 交付节奏（从前端倒推后端）

## P0（现在）

1. 分层配置外置化（已完成）
2. 配置热重载接口（已完成）
3. 场景-面板映射与后端策略对齐（进行中）

## P1（下一阶段）

1. 把 `/v1/message/stream` 接入真实模型路由器
2. workbench 与 autonomy 统一时间线（单任务全链路）
3. failure root cause 面板数据化接口

## P2（工程化）

1. JSON 状态迁移到 PostgreSQL + Redis
2. 引入向量记忆检索
3. 引入任务幂等键与回滚动作

## P3（独立进化）

1. 自主学习闭环（反馈学习 + 预学习）
2. 扩展市场与技能包签名验证
3. 多设备协同与长期稳定运行

---

## 9) 验收口径（产品 + 工程双维）

1. 用户视角：场景清晰、输入直达结果、失败可理解
2. 工程视角：可配置、可观测、可回滚、可降级
3. 自治视角：能自动重试、自动修复、自动恢复
4. 独立性：脱离 Codex/Aria Kernel 在线也可持续运行

---

## 10) 结论

前端已经走向“简洁 + 场景明确”的正确方向。  
后端现在要做的是：把复杂度沉到分层内核和配置治理里，形成“可长期演进”的独立产品底座。

本次已把“基础层/技术层/模型层/应用层”的配置入口落地到代码与文件结构，下一步可以直接进入 P1（真实模型路由 + 统一任务时间线 + 失败根因面板后端化）。
