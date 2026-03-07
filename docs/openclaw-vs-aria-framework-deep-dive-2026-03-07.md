# OpenClaw vs Aria 底层框架深度对照（2026-03-07）

## 1. 结论先行（给决策层）

Aria 已经把 OpenClaw 的不少“能力接口”接了进来，但离 OpenClaw 的“稳定运行机制”还有一段距离。  
当前 Aria 的强项是：产品面板完整、能力入口齐全、可观测度高。  
当前 Aria 的短板是：**执行运行时仍偏“单进程模拟层”、会话编排偏轻量、情感质量与执行质量尚未形成强约束闭环**。

如果目标是“不卡顿 + 强陪伴 + 强执行”，核心不是再加功能，而是做三件事：

1. **把 OpenClaw 的运行纪律内核化**（队列、锁、重试、心跳、恢复）。
2. **把陪伴质量数据化**（情感质量与执行成功同源采集、同源评估、同源路由）。
3. **把模型层-Aria 数控机床-工具层做成硬贯通协议**（非软约定）。

---

## 2. 研究范围与证据来源

### 2.1 本地代码与运行态（Aria）
- `services/api/mock-server.mjs`
- `services/api/system-profile.json`
- `services/api/model-routing.policy.json`
- `services/api/openclaw-fusion.profile.json`
- `services/api/super-autonomy.profile.json`
- `scripts/run-autonomy-smoke.sh`
- 运行验证：`bash scripts/run-autonomy-smoke.sh`

### 2.2 本地 OpenClaw 实例与基金会目录（read-only）
- `~/.openclaw/openclaw.json`
- `~/.openclaw/foundation/...`（brain / memory / automation / centers / coordination）
- `~/.openclaw/foundation/automation/pipelines/*.sh`

### 2.3 官方文档（主源）
- OpenClaw Gateway Architecture
- OpenClaw Agent Loop / Streaming / Hooks / Queue / Retry / Cron
- NVIDIA Data Flywheel Blueprint（生产流量驱动持续优化）

---

## 3. OpenClaw 底层框架优势（深度拆解）

## 3.1 架构层优势：网关中心化 + 会话隔离 + 协议明确

OpenClaw 的核心不是“会聊天”，而是“**有严格运行协议**”：

- 单一 Gateway 作为长期运行控制面（WebSocket 协议、握手、鉴权、配对）。
- 多 Agent 路由是隔离的：每个 agent 独立 workspace、agentDir、sessions。
- side-effect 调用有幂等与重试语义，消息/执行是事件驱动而非“请求即忘”。

这意味着：OpenClaw 的稳定性来自“运行机制”，不是来自某个大模型。

## 3.2 运行时优势：队列化、可串行、可并行、可回放

OpenClaw Agent Loop 的关键工程能力：

- 每 session 串行，避免并发碰撞。
- 全局 lane 控并发，不让高峰把系统打穿。
- queue mode（collect / steer / followup）支持对话与执行并行协同。
- 流式 chunk 支持“自然节奏输出”，避免用户感知为长时间黑盒。

这直接对应你提到的“卡顿、死板、任务推进不下去”三个痛点。

## 3.3 治理层优势：不是“能跑”，而是“可治理”

从本机 OpenClaw 基金会目录和脚本看，它的治理是体系化的：

- 预防门禁：`openclaw_preventive_guard.sh`
- SLO 守护：`openclaw_chat_slo_guard.sh`
- 中断与灾备：`openclaw_outage_detector.sh` + DR 模式切换
- 结果验真：`openclaw_autonomy_result_guard.sh`
- 锁 + stale lock recover + 冷却窗口（大量脚本一致采用）

这套机制让它“越跑越稳”，不是“越跑越脆”。

## 3.4 组织层优势：中心化能力地图（十大中心）

OpenClaw 把大脑、记忆、技能、插件、自动化、治理、复盘、恢复拆成中心。  
好处：职责边界清晰，升级与故障定位快，不会所有问题都堆在聊天层。

---

## 4. Aria 当前底层状态（真实盘点）

## 4.1 已具备的强项（可继续放大）

1. **能力融合框架已经搭好**  
   `openclaw-fusion.profile.json` 与 `super-autonomy.profile.json` 已建立复用目录、能力清单、端点矩阵。

2. **运行态可观测入口较完整**  
   已有 gateway/session/task-center/execution-center/model-fallback/progress/flywheel 等内核 API。

3. **Runtime Guardian + queue strategy 已实现基础版**  
   `mock-server.mjs` 已有 watchdog、SLO、queue 重试策略、circuit breaker。

4. **Flywheel 首版已经落地**  
   情感质量 + 执行成功评分已入库，可 replay，可用于在线路由排序。

5. **当前烟测结果良好（运行态）**  
   smoke 输出显示 fusion/super-autonomy readiness 分值高，核心链路可跑通。

## 4.2 关键差距（决定“像不像真人 + 稳不稳”）

1. **会话编排仍偏轻量模拟**  
   Aria 的 `session/spawn/send` 当前更像“会话壳层”，尚未达到 OpenClaw Agent Loop 那种强执行会话语义。

2. **Fallback 仍会触发模板化回复**  
   路由失败时落到本地规则回复（`local-fallback` + rule-based），容易给用户“机械感”。

3. **配置中“规划态能力”多于“硬执行门禁”**  
   `system-profile.json` 描述丰富，但部分能力仍停留在策略表达层，未全部转成硬门禁执行器。

4. **存储层工程化仍在过渡期**  
   当前 state 仍以 JSON/内存为主；`schema.sql` 完整，但事务库/队列/向量库未完全实装为默认真源。

5. **情感质量闭环仍偏后验**  
   Flywheel 已有打分，但“在线提示词/语气控制/节奏控制”与执行链路联动还需要更强绑定。

---

## 5. 针对 Aria 的解题思路（按你要的三层贯通）

你提出的链路是正确的：

1) 模型层  
2) Aria 数控机床（编排与执行中台）  
3) 工具层（skill/mcp/bridge）

下面给一版可落地的“硬协议”。

## 5.1 模型层（Model Plane）——从“选模型”升级到“选策略”

目标：不只是 route 到 provider，而是 route 到 **response policy bundle**。

每次路由输出必须包含：

- `provider/model`
- `voice_style_policy_id`（情感风格）
- `execution_policy_id`（执行策略）
- `risk_gate_profile_id`（安全门）
- `evidence_contract_id`（交付证据）

这样即使同一模型，也能保持不同场景的人格一致与执行一致。

## 5.2 Aria 数控机床（Orchestration CNC Plane）

把当前 dispatch 演进为 CNC 编排器，核心是四个总线：

1. **Goal Bus**：目标契约（goal/success/constraints/deadline）  
2. **Plan Bus**：任务图（DAG、依赖、并行度、预算）  
3. **Execution Bus**：工具调用（幂等键、权限、超时、补偿）  
4. **Evidence Bus**：证据回执（artifact/log/timeline/result）

强制规则：无 Evidence，不允许标记 completed。

## 5.3 工具层（Skill + MCP + Bridge Plane）

对 skill/mcp/bridge 做统一 Tool Contract：

- `tool_id`
- `input_schema`
- `output_schema`
- `idempotency_key`
- `risk_level`
- `required_permission`
- `retry_policy`
- `evidence_schema`

所有工具调用必须由 CNC 统一编排，不允许前端直穿。

---

## 6. “不卡顿 + 强陪伴 + 强执行”的统一飞轮

对齐 NVIDIA Data Flywheel 思路：  
用生产流量持续优化 latency/cost/quality，而不是凭感觉调参数。

## 6.1 统一信号（已起步，需增强）

信号向量建议统一为：

- `emotional_quality_score`
- `execution_success_score`
- `fallback_rate`
- `first_token_latency_ms`
- `task_completion_latency_ms`
- `user_continue_rate`（继续对话/继续任务）
- `evidence_completeness_score`

## 6.2 在线学习闭环

1. 采集：每轮聊天和执行都写 signal。  
2. 评估：按场景和任务类型计算 rolling metrics。  
3. 策略：更新 route/prompt/tool budget。  
4. 发布：灰度生效并监控回退条件。  
5. 复盘：自动 replay 失败链路并写治理报告。

## 6.3 两条不可降级红线

1. 体验红线：陪伴回复不允许“无情绪模板化”。  
2. 执行红线：任务完成不允许“无证据口头完成”。

---

## 7. 分阶段整改路线（建议）

## P0（7 天，先稳）

- 把 `session/spawn/send` 升级为真实执行会话（非 ack 壳）。
- 把 fallback 回复改为“情感协议模板 + 进度回报模板”，减少机械感。
- 为所有高频工具调用补 `idempotency_key + evidence_schema`。
- 对关键链路加 lock/cooldown/stale lock recover。

验收指标：
- 首回执 P95 <= 3s
- 执行任务启动 P95 <= 5s
- fallback 模板投诉率下降 50%+

## P1（14 天，做强）

- 完成 Goal/Plan/Execution/Evidence 四总线协议。
- Flywheel 接入延迟与证据完整度指标，在线路由从“分数排序”升级为“多目标优化”。
- 前端新增“执行中情感回报节奏器”（>8s 自动进度暖场）。

验收指标：
- 自动执行成功率 >= 85%
- 无证据完成率 = 0
- 连续会话满意延续率提升

## P2（30 天，可持续）

- JSON 状态迁移到 PostgreSQL + Redis + 向量库真源。
- 建立策略灰度发布与自动回滚。
- 把治理脚本体系（SLO/预防门禁/恢复）产品化为内核守护服务。

验收指标：
- 7 天稳定运行，无人工值守
- 失败可解释率 >= 99%
- 任务链路可回放率 = 100%

---

## 8. 风险与硬约束

1. 不要让前端承担后端稳定性问题（前端只负责感知与解释）。  
2. 不要把“人格文本增强”当成稳定性方案（根因在运行时协议）。  
3. 不要把更多模型接入误认为质量提升（先把策略与门禁做好）。  
4. 禁止密钥明文散落到非安全目录（应迁移到环境变量或密钥管理）。

---

## 9. 参考链接（官方）

- OpenClaw Gateway Architecture: https://docs.openclaw.ai/concepts/architecture
- OpenClaw Agent Runtime: https://docs.openclaw.ai/concepts/agent
- OpenClaw Agent Loop: https://docs.openclaw.ai/concepts/agent-loop
- OpenClaw Multi-Agent Routing: https://docs.openclaw.ai/concepts/multi-agent
- OpenClaw Streaming and Chunking: https://docs.openclaw.ai/concepts/streaming
- OpenClaw Hooks: https://docs.openclaw.ai/automation/hooks
- OpenClaw Queue: https://docs.openclaw.ai/queue
- OpenClaw Retry: https://docs.openclaw.ai/concepts/retry
- OpenClaw Cron Jobs: https://docs.openclaw.ai/automation/cron-jobs
- NVIDIA Data Flywheel Blueprint: https://build.nvidia.com/nvidia/build-an-enterprise-data-flywheel

