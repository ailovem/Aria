# Antigravity 即刻执行单（2026-03-04）

状态：`UNBLOCKED / 继续执行`

## 一句话目标

前端继续优化，围绕“输入稳定、消息可见、反馈清晰、页面不乱”，今天把 P0 做完。

## 今日 P0（必须交付）

1. 四场景输入框稳定（不遮挡、不跳位、可持续输入）
2. 消息区状态统一（发送中/回复中/失败可读）
3. 头像与气泡不遮挡（含脑系统气泡文本完整显示）

## 代码边界（必须遵守）

- 只改：
  - `apps/desktop/src/App.tsx`
  - `apps/desktop/src/styles.css`
  - `apps/mobile/lib/main.dart`
- 不改：
  - `services/api/*`
  - `services/bridge/*`
  - 任意后端路由与策略文件

## 自检命令（提交前）

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop && npm run build:web
cd /Users/bear/Desktop/Aria/Aria/apps/mobile && $HOME/flutter/bin/flutter analyze
```

## 输出模板（提交时复制）

```text
[Antigravity UI 提交]
1) 改动文件：
- ...

2) 完成项：
- P0-1 ...
- P0-2 ...
- P0-3 ...

3) 验收：
- npm run build:web: PASS/FAIL
- flutter analyze: PASS/FAIL

4) 截图：
- /absolute/path/desktop-*.png
- /absolute/path/mobile-*.png

5) 风险：
- ...
```
