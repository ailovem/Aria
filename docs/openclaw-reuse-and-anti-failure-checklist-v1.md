# Aria Kernel 底层能力复用与问题清单（超级女友专用）

更新时间：2026-03-03  
负责人：Codex（已基于 Aria Kernel 实际目录、脚本、日志完成盘点）

## 0) 结论先说（给你一句话版）

Aria Kernel 的很多底层能力可以复用，但不能整包搬运；要做成 Aria 独立内核。  
重点是把“防卡顿、防失联、防假完成”的守护链路先落进 Aria，再做更多功能扩展。

---

## 1) 可以复用的底层能力和文件（已确认）

| 能力模块 | Aria Kernel 源文件（可参考/改造） | 复用建议 | Aria 落地模块 |
|---|---|---|---|
| 健康巡检 | `/Users/bear/.codex/skills/openclaw-ops-guard/scripts/health_check.sh` | 直接复用思路，改成 Aria 版本 | `scripts/doctor-macos.sh`、`scripts/doctor-permissions-macos.sh` |
| 安全切模（可回滚） | `/Users/bear/.codex/skills/openclaw-ops-guard/scripts/safe_model_switch.sh` | 改造复用（保留备份+探针验证） | `services/api` 的模型路由层 |
| 自动自愈（防卡主链路） | `/Users/bear/.openclaw/scripts/openclaw-autoheal.sh` | 强烈建议复用设计（锁、冷却、状态记忆） | Aria Runtime Guardian（新增） |
| 中断检测+灾备切换 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_outage_detector.sh` | 改造复用（全局/单 Agent 双层切换） | Aria Orchestrator（任务调度层） |
| SLO 质量守护 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_chat_slo_guard.sh` | 改造复用（慢响应分级+自动恢复） | Aria API 网关与队列层 |
| 配置一致性守护 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_preventive_guard.sh` | 直接复用规则思路 | Aria Config Guard（新增） |
| 全局 DR 模式切换 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_dr_mode_switch.sh` | 改造复用（云模型->本地模型） | 超级女友模型大脑模块 |
| Agent 级紧急模式 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_agent_mode_switch.sh` | 改造复用（渠道隔离） | 母亲陪伴线/工作线双通道 |
| 上下文预算控制 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_context_budget_enforcer.sh` | 直接复用机制 | 记忆与会话治理模块 |
| 记忆质量巡检 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_memory_quality_guard.sh` | 改造复用 | 长短期记忆引擎 |
| 自治结果验真 | `/Users/bear/.openclaw/foundation/automation/pipelines/openclaw_autonomy_result_guard.sh` | 直接复用原则（无证据=未完成） | 自动化任务中心 |
| 计划任务安装器 | `/Users/bear/.openclaw/foundation/automation/pipelines/install_preventive_cron.sh` | 参考实现，不直接照抄 | Aria 一键部署脚本 |

> 关键原则：复用“机制”和“工程纪律”，不把超级女友变成依赖 Aria Kernel 运行的壳。

---

## 2) Aria Kernel 真实问题总结清单（超级女友必须规避）

以下不是猜测，是从真实运行日志和修复过程总结出来的高频问题。

1. **会话膨胀导致卡住**
   - 现象：回复变慢、超时、像“没反应”。
   - 证据：历史主会话出现超高 token（已出现过 137040 级别）。
   - 超级女友规则：会话热度超过阈值自动滚动，历史归档不丢失。

2. **模型调用超时堆积**
   - 现象：任务一直转圈、迟迟不回。
   - 证据：`gateway.err.log` 中 `embedded run timeout` 与 `LLM request timed out` 高频（累计 200+）。
   - 超级女友规则：请求超时、重试、熔断参数分层配置，且必须有冷却时间。

3. **No reply from agent（代理无回复）**
   - 现象：看似已发出，但没有任何回答。
   - 证据：`gateway.log` 出现多次 `No reply from agent`。
   - 超级女友规则：每次任务必须有状态回执（排队中/执行中/失败原因/下一步）。

4. **SOUL/系统提示过长导致截断**
   - 现象：人格不稳定、答复前后不一致。
   - 证据：运行时 SOUL 超长被截断后，稳定性下降。
   - 超级女友规则：人格核心分层（核心人格+场景策略+可变记忆），每层都有长度预算。

5. **网关服务入口漂移（升级后旧入口）**
   - 现象：升级后“能启动但不稳”。
   - 证据：历史出现过 `dist/entry.js` 与新版本不一致。
   - 超级女友规则：升级后自动比对 service entrypoint，不一致就自动重装并探针验收。

6. **巡检脚本并发重入，自己把自己拖死**
   - 现象：后台多实例堆积、系统更慢。
   - 证据：曾出现多组长时间驻留的巡检/agent 进程。
   - 超级女友规则：所有守护任务必须有 `lock + stale lock recover + watchdog` 三件套。

7. **定时任务环境不完整（依赖命令缺失）**
   - 现象：脚本“看起来在跑”，实际关键检查失效。
   - 证据：`preventive-cron.log` 大量 `rg: command not found`。
   - 超级女友规则：守护脚本启动时先做依赖自检；缺依赖直接标红告警，不允许静默失败。

8. **模型 ID / Provider 引用不一致**
   - 现象：偶发 `Unknown model` 或错误路由。
   - 证据：日志曾出现 `Unknown model`。
   - 超级女友规则：模型必须使用全限定 ID，发布前跑模型引用一致性检查。

9. **默认模型与 agent 覆盖模型冲突**
   - 现象：你以为改了主模型，某些通道仍走旧模型。
   - 证据：`agents.defaults.model.primary` 与 `agents.list.main.model.primary` 可出现不一致。
   - 超级女友规则：配置单一真源（SSOT），覆盖必须显式、可视化、可审计。

10. **通道策略配置错误导致消息静默丢弃**
    - 现象：看起来没报错，但消息没进来。
    - 证据：Feishu allowlist 空名单场景已发生。
    - 超级女友规则：通道策略配置上线前必须做可达性回归测试（真实收发）。

11. **前端只显示 Failed to fetch，用户看不懂**
    - 现象：用户不知道是网络、权限还是服务未启动。
    - 证据：你遇到过 `同步失败 / Failed to fetch`。
    - 超级女友规则：统一错误分类面板（网络/权限/策略/执行）+ 一键修复按钮。

12. **“口头完成”但没有证据落盘**
    - 现象：说做完了，追溯不到文件和结果。
    - 证据：已有 `autonomy_result_guard` 专门防这个问题。
    - 超级女友规则：任务完成必须附三证据（输出文件、执行日志、可验证结果）。

13. **队列策略缺少分级，忙时雪崩**
    - 现象：简单任务被复杂任务堵住。
    - 证据：已有单独容量守护、上下文预算守护脚本说明该问题常态化存在。
    - 超级女友规则：轻重任务分队列 + 并发隔离 + 高优先级抢占。

14. **只本机回环可用，移动端真机接不进来**
    - 现象：电脑能用，手机失败。
    - 证据：用户侧需要手动切 LAN IP（`ARIA_API_BASE=http://<LAN_IP>:8787`）。
    - 超级女友规则：部署助手自动识别网络场景并给出正确地址/二维码。

---

## 3) 给超级女友的“防复发硬性门禁”（必须全部满足）

1. 上线门禁必须包含：`health probe`、`模型引用校验`、`通道收发回归`、`依赖命令自检`。  
2. 所有守护任务统一接入：互斥锁、陈旧锁回收、watchdog、失败重试冷却。  
3. 每次自动修复都要写可读报告：修了什么、为何触发、是否成功、如何回滚。  
4. 前端必须展示失败根因，不允许只弹“失败”。  
5. 任何自治任务都要“证据优先”，无证据即未完成。  
6. 模型切换必须备份可回滚，且切换后自动探针验证。  
7. 会话上下文必须预算化，超阈值自动归档轮换。  
8. 人格与提示词系统必须模块化，防止一个长文件拖垮全局。  
9. 通道（妈妈线/工作线）必须隔离配置、隔离记忆、隔离告警。  
10. 移动端与桌面端使用同一套错误语义与任务状态机。  

---

## 4) 迁移到 Aria 的执行建议（按优先级）

### P0（本周必须做）
- 把 `openclaw-autoheal` 机制改造成 Aria Runtime Guardian（锁+冷却+状态文件+报告）。
- 把 `outage_detector + chat_slo_guard` 机制并入 Aria 后端调度层。
- 在 Aria 前端加“失败根因面板”（网络/权限/策略/执行）。

### P1（下周）
- 加模型路由安全切换器（备份、切换、验收、回滚）。
- 加会话预算治理和自动归档。
- 加自治任务结果验真器（无证据不算完成）。

### P2（两周内）
- 完成通道隔离治理（妈妈专线与工作专线完全隔离）。
- 完成移动端/桌面端统一部署探针与局域网自发现。

---

## 5) 责任分工（避免重复开发）

- **Codex**：后端治理内核（守护链路、队列、错误分类、证据系统）。  
- **Aria Kernel**：模型路由、通道策略、自动化编排与灾备切换。  
- **Antigravity**：前端信息架构、失败解释可视化、简洁工作台交互。  

协作原则：同一功能只保留一个 owner，另两方只做评审与补位，不并行重复造轮子。

