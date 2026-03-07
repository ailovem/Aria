# Agent 冲刺看板（2026-03-03）

负责人：Codex  
目标：把“分工”变成“可执行、可验收、可追责”的开发动作

## 当前状态

| Agent | 任务包 | 状态 | 截止 | 验收命令 |
|:--|:--|:--|:--|:--|
| Codex | `docs/product-dev-plan-soul-v1.md`（对齐 Aria sy 1.0 初心） | ✅ 完成 | 2026-03-03 23:59 | 文档评审 + 原型映射检查 |
| Antigravity | `docs/antigravity-ui-motion-spec-v1.md` | 🟨 进行中 | 2026-03-04 12:00 | `npm run build:web` + `flutter analyze` |
| Antigravity（续作） | `docs/antigravity-ui-now-20260304.md`（解除卡住后继续执行） | 🟨 进行中 | 2026-03-04 23:59 | `npm run build:web` + `flutter analyze` |
| Aria Kernel | `docs/openclaw-runtime-execution-pack-v1.md` | 🟨 进行中 | 2026-03-04 12:00 | `node --check` + `run-autonomy-smoke.sh` |
| Antigravity + Codex | 客户端下载链路可运营（Desktop+iOS） | 🟨 进行中 | 2026-03-05 18:00 | `build-desktop.sh` + `build-ios.sh` |
| Aria Kernel + Codex | 独立运营链路（自治内核 24h 稳定） | 🟨 进行中 | 2026-03-06 12:00 | `run-autonomy-smoke.sh`（定时） |
| Codex | 统筹验收与回归 | 🟨 进行中 | 持续 | 全链路回归 |

## 强制规则

1. 没有代码改动 = 没有完成  
2. 没有验收命令结果 = 没有完成  
3. 没有文档同步 = 没有完成  
4. 到期未完成由 Codex 直接接管代执行
