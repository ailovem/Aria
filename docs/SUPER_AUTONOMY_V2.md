# Super Girlfriend Autonomy V2 (全能力灌注架构)

## 1) 目标

本方案不是“简单融合接入”，而是以 **Codex + Aria Kernel + Antigravity** 为底稿，构建“更强、可独立升级、可自主执行”的底层架构。

关键目标：

- 全能力灌注：保留三方核心能力并做升级，不做重复开发
- 自主执行闭环：目标 -> 计划 -> 执行 -> 证据 -> 复盘 -> 策略更新
- 稳定优先：运行时守护、队列重试、熔断、自修复
- 自由扩展：扩展接入灵活，但必须经过签名校验与沙箱约束

## 2) 对标的权威思路（课程/研究方向）

以下资料用于提炼“系统工程 + 可靠性 + 分布式执行 + 数据系统”的原则：

- Harvard CS161 (Operating Systems): <https://seas.harvard.edu/computer-science/courses>
- Harvard CS165 (Data Systems): <https://daslab.seas.harvard.edu/classes/cs165>
- Harvard CS260r (Software Systems Readings): <https://read.seas.harvard.edu/cs260r/2022/>
- Tsinghua CS Research Areas (Computer Systems / Networks / Data&Software): <https://www.cs.tsinghua.edu.cn/csen/Research.htm>
- Tsinghua Advanced Computing Curriculum: <https://ac.cs.tsinghua.edu.cn/curriculum.html>
- Tsinghua HPC Institute (高性能/并发/存储系统方向): <https://hpc.cs.tsinghua.edu.cn/gxnsgk.htm>

## 3) 架构原则（从资料提炼并落地）

- 分层与职责清晰：控制面、执行面、记忆面、可靠性面、扩展面
- 数据与执行同等重要：任务证据、时间线回放、可追溯
- 可靠性工程内建：重试预算、熔断、降级、死信重放
- 扩展自由但有边界：白名单、签名、能力沙箱三件套
- 复用优先：统一端点复用目录，禁止重复实现

## 4) 本次落地配置

- 能力灌注主配置：`services/api/super-autonomy.profile.json`
- 融合复用协议配置：`services/api/openclaw-fusion.profile.json`
- 系统总配置：`services/api/system-profile.json`
- 扩展安全配置：`services/api/expansion-security.policy.json`

运行时通过 `mock-server.mjs` 热加载以上配置，支持通过 `/v1/system/config` patch 更新：

- `superAutonomyPatch`
- `openclawFusionPatch`
- `expansionSecurityPatch`

## 5) 核心技能与接口（已配置）

Super Autonomy 技能注册（`skillRegistry`）已配置并接到真实 API：

- `skill.plan_and_code` -> `/v1/workbench/intent`, `/v1/workbench/tool/run`
- `skill.autonomy_dispatch` -> `/v1/autonomy/dispatch`, `/v1/autonomy/queue/process`
- `skill.secure_extension` -> `/v1/expansion/packs/install`, `/v1/expansion/security`
- `skill.memory_evidence` -> `/v1/memory/search`, `/v1/memory`, `/v1/timeline/unified`
- `skill.device_orchestration` -> `/v1/device/tasks/plan`, `/v1/device/tasks/execute`
- `skill.self_heal` -> `/v1/runtime/health`, `/v1/runtime/guardian/heal`
- `skill.scene_companion` -> `/v1/scene/config/apply`, `/v1/message/stream`
- `skill.gateway_runtime` -> `/v1/aria-kernel/gateway/status`, `/v1/aria-kernel/heartbeat`
- `skill.session_orchestration` -> `/v1/aria-kernel/session/status`, `/v1/aria-kernel/session/spawn`, `/v1/aria-kernel/session/send`
- `skill.task_ledger` -> `/v1/aria-kernel/task-center`, `/v1/aria-kernel/execution-center`
- `skill.model_fallback_guard` -> `/v1/aria-kernel/model/fallback/status`, `/v1/system/config`
- `skill.progress_protocol` -> `/v1/aria-kernel/progress/protocol`, `/v1/autonomy/status`

## 5.1) Aria Kernel 抄作业清单（并做增强）

不是“接个适配层”结束，而是把 Aria Kernel 的可用内核拿来直接产品化：

- 网关治理：心跳、watchdog、自愈状态可视化
- 会话编排：主会话 + 子会话（spawn/send/status）
- 任务账本：pending / completed / dead-letter 三账本
- 交付证据：execution log + delivery log，支持回放
- 模型护栏：云端优先 + 本地回退策略可查
- 长任务协议：超过阈值按固定周期回报进度

对应接口已全部落地到 Aria API，不再依赖 Aria Kernel 在线驻场。

## 6) 评估与观测接口

- 综合能力评估：`GET /v1/capability/assessment`
- 融合复用状态：`GET /v1/capability/fusion`
- 全能力灌注状态：`GET /v1/capability/super-autonomy`

关键指标：

- `readinessScore`
- `skillReadiness`
- `missingRequiredSkillCount`
- `duplicateRiskCount`
- `sessionCount`
- `taskLedgerPending` / `taskLedgerDeadLetters`

## 7) “不重复开发”执行规则

- `duplicationGuard.disallowDuplicateImplementation = true`
- `duplicationGuard.preferReuseEndpoints` 约束统一复用端点目录
- 烟测脚本持续检查：`scripts/run-autonomy-smoke.sh`

## 8) 验证结果（当前）

在当前仓库中运行：

```bash
bash scripts/run-autonomy-smoke.sh
```

可得到：

- fusion readiness = 100
- super autonomy readiness = 100
- skillReadiness = 100
- missingRequiredSkillCount = 0

这表示“全能力灌注 + 复用优先 + 稳定策略”已在当前 mock runtime 跑通。

## 9) 运营可控性（给非技术同学）

为避免“没有工程师就无法运营”，已补齐三件套：

- 参数风险提示：每个关键参数都有推荐值 + 风险说明
- 一键回滚：可回滚到上一个可用快照
- 变更时间线：记录谁在何时改了哪些策略

对应 API：

- `GET /v1/system/config/history`
- `POST /v1/system/config/rollback`
