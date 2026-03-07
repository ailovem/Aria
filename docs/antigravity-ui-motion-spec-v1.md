# Antigravity 执行包 v1（UI + 动效）

更新时间：2026-03-03 07:05  
负责人：Antigravity  
验收负责人：Codex

## 1) 本轮目标

把 Aria 的“自主内核 + 主动建议 + 记忆命中”做成同一套沉浸式体验语言，桌面端与 iOS 统一。

## 2) 必交付文件（硬性）

1. `apps/desktop/src/styles.css`  
2. `apps/desktop/src/App.tsx`  
3. `apps/mobile/lib/main.dart`

## 3) 必落地能力（硬性）

1. 自主内核状态三态可视化：`运行中` / `学习中` / `修复中`
2. 主动建议卡片动效：
   - 生成入场：180-260ms
   - CTA 点击反馈：90-130ms
3. 记忆命中反馈：
   - 命中分值变化可见
   - 被引用后 500ms 内完成反馈
4. 暖色质感统一：
   - 主色：米杏 + 焦糖橙
   - 辅色：低饱和蓝（执行感）

## 4) 设计 token（本轮冻结）

- 圆角：`8 / 10 / 12 / 16`
- 阴影：`0 20px 40px rgba(99,70,36,0.16)`（桌面）
- 关键动效时序：
  - 微反馈：`120ms`
  - 卡片切换：`220ms`
  - 状态过渡：`320ms`

## 5) 验收命令

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop && npm run build:web
cd /Users/bear/Desktop/Aria/Aria/apps/mobile && $HOME/flutter/bin/flutter analyze
```

## 6) 输出格式（必须）

每次提交必须附带：
1. 改动文件列表
2. 动效前后对比说明
3. 真机或预览截图路径

---

## 7) 继续执行指令（2026-03-04 21:30，来自 Codex）

> Antigravity：你不是“暂停”，请按下面任务立即恢复开发。  
> 目标：前端持续优化，但**不重复后端开发**；优先保证“可发消息、可看结果、可理解状态”。

### A. 本轮分工边界（防重复）

1. **你负责（UI/交互）**
   - `apps/desktop/src/App.tsx`（仅界面交互层）
   - `apps/desktop/src/styles.css`（布局/样式/可读性）
   - `apps/mobile/lib/main.dart`（移动端两页体验）
2. **你不负责（后端/协议）**
   - `services/api/*`
   - `services/bridge/*`
   - `model-routing.policy.json` 等策略文件
3. 发现后端问题：只在提交说明里标注，不自行改后端。

### B. 立即执行的 P0 任务（必须先做）

1. **四场景输入区稳定性**
   - 工作/娱乐/生活/情感四场景，输入框不得被遮挡、跳位、超出容器。
   - 发送后滚动保持在最新消息附近，不要跳到最顶部。
2. **消息可见性与状态可读性**
   - 用户消息与 Aria 消息视觉层级明确；
   - 失败态卡片（⚠️）样式可读，不与背景融在一起；
   - “发送中/回复中/失败”三态统一样式。
3. **气泡与头像遮挡**
   - 脑系统按钮气泡文字完整显示；
   - 女友头像不被聊天气泡遮脸（气泡位置与层级修正）。

### C. P1 体验增强（P0 完成后）

1. **Agi 任务动态视窗**
   - 右侧可展开/收起；
   - 步骤状态颜色统一（待执行/进行中/完成/失败）；
   - 小白文案（避免技术术语）。
2. **文件卡片与小游戏卡片一致化**
   - 按钮风格统一（打开/下载/全屏）；
   - 卡片间距、边框、阴影统一。

### D. 验收命令（每次提交必须跑）

```bash
cd /Users/bear/Desktop/Aria/Aria/apps/desktop && npm run build:web
cd /Users/bear/Desktop/Aria/Aria/apps/mobile && $HOME/flutter/bin/flutter analyze
```

### E. 提交输出（必须）

1. 改动文件列表
2. 本轮修复项（按 P0/P1）
3. 截图路径（桌面与移动端）
4. 未解决风险（如有）
