# Aria Native Bridge 扩展计划（v1）

更新时间：2026-03-03  
Owner：Codex  
目标：让 Aria 具备更强的电脑与硬件接入能力，同时保持可控、稳定、可审计。

## 1) 已落地

1. 新增桥接服务：`services/bridge/bridge-server.mjs`
2. 插件化适配器：`services/bridge/adapters/*.mjs`
3. API 桥接端点：
   - `GET /v1/hardware/status`
   - `POST /v1/voice/tts`
   - `POST /v1/voice/stt`
   - `POST /v1/device/tasks/execute`（优先走桥接执行）
4. 权限体检脚本：`scripts/doctor-permissions-macos.sh`

## 2) 扩展原则

1. 能力先登记再执行：必须在 capability catalog 里有明确风险等级。  
2. 权限先决：未授权一律不执行，只返回 `needs_permission`。  
3. 全量审计：权限变更、执行请求、执行结果都可追踪。  
4. 可降级：桥接层不可用时，API 保持服务可用并给出降级结果。

## 3) 下一步清单（v1.1）

1. 接入真实 iOS Photos API（替代目录模拟）。
2. 接入邮件 IMAP/Exchange 摘要插件。
3. 增加设备动作回滚和幂等控制。
4. 增加桥接层 watchdog（崩溃自动拉起 + 健康探针）。
5. 增加权限最小化向导（按任务动态申请权限）。
