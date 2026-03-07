# Aria 按钮功能矩阵（Desktop + Mobile）

目标：确保「每个前端按钮」都有可执行动作，不是静态占位；并且可通过脚本验收。

验收脚本：`bash /Users/bear/Desktop/Aria/Aria/scripts/run-button-smoke.sh`

## Desktop 按钮矩阵

| 场景 | 入口按钮（用户可见） | 后端动作 | 关键接口 |
|---|---|---|---|
| 全局 | 刷新 | 同步全量状态（chat/workbench/device/autonomy/runtime） | `GET /v1/state` + 多模块接口 |
| 全局 | 重置 | 重置当前用户状态 | `POST /v1/reset` |
| 聊天 | 发送 | 生成回复 + 可选自动执行 | `POST /v1/message` / `POST /v1/message/stream` |
| 聊天 | 重试上一条 | 重放失败输入 | `POST /v1/message` |
| 聊天 | 写入记忆 | 记忆入库 + 检索刷新 | `POST /v1/memory` + `GET /v1/memory/search` |
| 聊天 | 主动建议：立即执行 | 触发建议并执行 | `POST /v1/proactive/next` + `POST /v1/message` |
| 工作场景 | 发送工作目标 | 进入 workbench 执行链 | `POST /v1/workbench/intent` |
| 工作场景 | 模型切换 | 更新工作台模型 | `POST /v1/workbench/model/select` |
| 工作场景 | 工具按钮（coding/autopilot 等） | 运行工具并生成回执 | `POST /v1/workbench/tool/run` |
| 工作场景 | 文件附件按钮（📎） | 读取文件内容并注入工作输入 | 前端文件选择 + `POST /v1/workbench/intent` |
| 设备执行 | 授权按钮（允许/阻止） | 更新能力权限 | `POST /v1/device/permissions` |
| 设备执行 | 快速任务（桌面整理/硬件检查/相册清理等） | 规划并执行设备任务 | `POST /v1/device/tasks/plan` + `POST /v1/device/tasks/execute` |
| 设备执行 | 语音播报 | 调用桥接语音执行 | `POST /v1/voice/tts` |
| 设备执行 | 硬件刷新 | 拉取硬件快照 | `GET /v1/hardware/status` |
| 自主内核 | Tick / Repair / Queue Process | 触发自治巡检、修复、重试处理 | `POST /v1/autonomy/tick` / `POST /v1/autonomy/repair` / `POST /v1/autonomy/queue/process` |
| 自主内核 | 死信重入 | dead-letter 回放 | `POST /v1/autonomy/queue/dead-letter/retry` |
| 自主内核 | 策略按钮（开关、重试±、退避±、熔断±） | 更新队列策略 | `POST /v1/autonomy/queue/policy` |
| Runtime Guardian | 一键自愈 / 仅重放 / 仅修复 | 执行运行时自愈动作 | `POST /v1/runtime/guardian/heal` |
| Runtime Guardian | 自动巡检开关 | 切换 watchdog | `POST /v1/runtime/guardian/config` |
| Runtime Guardian | 模式（节能/平衡/高峰） | 切换 mode + queueLimit | `POST /v1/runtime/guardian/config` |
| Runtime Guardian | 刷新系统状态 | 刷新健康与故障根因 | `GET /v1/runtime/health` |
| 防复发手册 | 一键写入记忆守则 | 将命中故障守则写入记忆系统 | `POST /v1/aria-kernel/incidents/remember` |
| 防复发手册 | 写入该守则 | 按 incidentId 精确写入 | `POST /v1/aria-kernel/incidents/remember` |
| 脑系统 | 模块按钮（模型/进化/记忆/情智） | 跳转并触发对应配置/执行 | `POST /v1/scene/config/apply` + 对应模块接口 |
| 脑系统 | 同步 Aria Kernel 模型与密钥 | 同步 provider 路由 | `POST /v1/system/config/sync-aria-kernel` |
| 脑系统 | 保存策略台 | 保存系统配置草稿 | `POST /v1/system/config` |
| 脑系统 | 重载配置 | 磁盘重载 | `POST /v1/system/config/reload` |
| 脑系统 | 回滚到可用版本 | 配置回滚 | `POST /v1/system/config/rollback` |
| 脑系统 | 变更记录 | 拉取变更历史 | `GET /v1/system/config/history` |
| 时间线 | 统一时间线 | 拉取提交→执行→重试→完成链路 | `GET /v1/timeline/unified` |
| 时间线 | 回放 | 回放指定 flow | `POST /v1/timeline/replay` |
| 扩展中心 | 安装扩展 | 安装扩展包 | `POST /v1/expansion/packs/install` |
| 扩展中心 | 下载扩展资源 | 安全下载任务 | `POST /v1/expansion/fetch-download` |
| 扩展中心 | 安全策略配置 | 更新白名单/签名/沙箱 | `GET/POST /v1/expansion/security` |
| Aria Kernel 运行面板 | 网关/会话/任务中心/执行中心/模型降级/进度协议 | 运行态观测 | `/v1/aria-kernel/*` 系列接口 |

## Mobile 按钮矩阵

| 页面 | 按钮 | 后端动作 | 关键接口 |
|---|---|---|---|
| 首页聊天 | 发送 | 聊天 + 自动执行链 | `POST /v1/message` / `POST /v1/message/stream` |
| 首页聊天 | ♥ 场景选择 | 切换场景状态并注入欢迎语 | 前端状态 + 可发起消息 |
| 首页聊天 | 电话按钮 | 实时语音通话（STT/TTS + message） | `POST /v1/message` + `POST /v1/voice/tts` |
| 首页聊天 | 快捷条 1~N | 预置 prompt 并发送 | `POST /v1/message` |
| 首页聊天 | + 号 | 跳转服务中心并执行动作 | 前端路由 + 各服务接口 |
| 我的-服务中心 | 能力涌现 | 写记忆 + 消化任务 | `POST /v1/memory` + `POST /v1/message` |
| 我的-服务中心 | 知识中心 | 写记忆 + 触发 workbench 产出 | `POST /v1/memory` + `POST /v1/workbench/intent` |
| 我的-服务中心 | 日历记忆/客户管理 | 记忆写入 + 跟进计划 | `POST /v1/memory` + `POST /v1/workbench/intent` |
| 我的-服务中心 | 文件/相册管理 | 设备任务规划与执行 | `POST /v1/device/tasks/plan` + `POST /v1/device/tasks/execute` |
| 我的-服务中心 | 聊天交友/家庭生活 | 生成话术并反向注入首页自动发送 | `POST /v1/message` |
| 我的-服务中心 | 商业日志 | 生成日志与建议 | `POST /v1/workbench/intent` |
| 我的-配置中心 | 硬件接入 | 授权关键能力 | `POST /v1/device/permissions` |
| 我的-配置中心 | 语音设置 | 语音引擎连通检查 | `POST /v1/voice/tts` |
| 我的-配置中心 | 模型路由 | 同步 Aria Kernel 路由 | `POST /v1/system/config/sync-aria-kernel` |
| 我的-配置中心 | 自动化策略 | Tick + Repair | `POST /v1/autonomy/tick` + `POST /v1/autonomy/repair` |
| 我的-配置中心 | 系统诊断 | 硬件状态 + 自主状态 + 防复发手册命中 | `GET /v1/hardware/status` + `GET /v1/autonomy/status` + `GET /v1/aria-kernel/incidents/playbook` |

## 说明

- 所有高风险动作仍保留权限闸门（例如 `desktop.global_control`），避免误操作直接接管。
- 「防复发手册」会把已命中的故障守则写回记忆系统，减少同类问题反复出现。
- `/工作场景`、`/娱乐场景`、`/生活场景`、`/情感世界` 现在支持路由识别，会自动映射到对应场景页面。
