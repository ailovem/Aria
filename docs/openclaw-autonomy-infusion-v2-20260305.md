# Aria × OpenClaw 自动化调度与整改机制融合（v2，2026-03-05）

## 目标
- 让 Aria 在四场景和编程场景里，具备稳定的“自主判断 → 自主执行 → 自主修复 → 证据回执”闭环。
- 降低假执行、重复执行、失败后卡死、模板化回话等问题。

## 参考原理（OpenClaw）
- 单次执行流强调可控串行与顺序稳定，避免并发乱序导致状态漂移。
- 将调度面（任务编排）与执行面（能力调用）分层，失败后走统一整改链路。
- 通过 Hooks/生命周期切点做“执行前校验、执行后收敛、失败后修复”。
- 输出事件流/分块结果，保证前端可观察，不是黑盒。
- 安全策略上采用 allowlist、最小权限、能力门控，避免自动化误触高风险动作。

> 以上原理用于指导 Aria 内核，不依赖 OpenClaw 运行时。

### 参考文档
- https://docs.openclaw.ai/user-guide/framework/architecture
- https://docs.openclaw.ai/user-guide/framework/multi-agent-routing
- https://docs.openclaw.ai/user-guide/agents/agent-loop
- https://docs.openclaw.ai/user-guide/agents/hooks
- https://docs.openclaw.ai/user-guide/agents/streaming-and-chunking
- https://docs.openclaw.ai/user-guide/operations/system-health
- https://docs.openclaw.ai/user-guide/security/key-security

## Aria 本轮已落地改造

### 1) 聊天执行幂等层（防重复执行）
- 新增聊天执行幂等窗口与进行中复用机制：
  - 相同用户 + 相同场景 + 相同任务指纹，在短窗口内复用已完成回执，避免重复 side-effect。
  - 正在执行中的相同任务直接复用 in-flight 状态，避免并发二次触发。
- 价值：
  - 解决用户连点发送/网络抖动导致“重复安装、重复下载、重复写文件”。

### 2) 全场景自动整改链（不只 coding）
- 新增通用 `dispatch` 自动修复链：
  - 对网络、权限、策略、桥接类失败，自动进入 `repairTimelineFlow`（重放死信、自动授权、重跑链路）。
  - 输出统一修复摘要并回传诊断。
- 价值：
  - 从“失败就停”升级为“失败后自动修复一次再给结果”。

### 3) life 场景模块强执行映射
- 将 `life` 左侧模块从“弱 prompt”升级为“强计划执行”：
  - `life-care-model`：联网检索 + 本地 API 自检
  - `life-sync`：技能发现/自动安装 + 安装方法检索
  - `life-auto`：技能自动安装 + 工具链自检 + 按需代码改写
  - `life-external`：联网检索 + 技能安装 + API 调用 + 下载/扩展接入
  - `life-hardware`：硬件协同检索 + API 自检
- 自动补齐能力授权后执行，并汇总“设备任务 + 调度任务 + 修复任务”三类回执。

### 4) 调度 API 级自动修复能力
- `/v1/autonomy/dispatch` 支持自动整改结果透出：
  - 返回 `initialDispatch` + `dispatch`（修复后）+ `autoRepair`。
  - 对外可直接看见“原始失败”与“修复后状态”差异。

### 5) 本地调用安全策略修正
- 放通 `localhost/127.0.0.1` 主机判定，保障本地 API 自检与回环调用不被误拦截。

## 对“自主执行/自主思考/自主解决问题”的实际提升
- 自主执行：按钮与聊天都走真实执行计划，不再只写入输入框。
- 自主思考：先产出 plan，再执行，再根据失败原因进入修复链，形成“执行推理”。
- 自主解决：失败后不直接甩锅，先自动修一次，再给明确回执和剩余阻塞点。

## 下一阶段建议（P1/P2）

### P1（稳定性）
- 扩展幂等范围到 `scene config apply` 与 `agi execute`（跨端防重放）。
- 将自动整改结果接入前端 AGI 动态视窗，展示“修复前/修复后”节点变化。
- 对失败根因做优先级排序（网络 > 权限 > 策略 > 执行）并给“一键修复”按钮。

### P2（能力自治）
- 增加“工具自发现→安装→自测→登记”的标准化流水线（技能治理台）。
- 增加任务约束契约（时间预算、风险等级、必须交付物）并在执行前强校验。
- 增加长期失败模式学习，自动调整策略（重试上限、路由优先级、熔断阈值）。

## 成功判定（建议）
- 连续 100 条真实执行指令中：
  - 假执行率 <= 1%
  - 自动修复成功率 >= 70%
  - 重复执行事故（同任务重复 side-effect）<= 1%
  - 失败回执可解释率（能看懂失败层）>= 95%
