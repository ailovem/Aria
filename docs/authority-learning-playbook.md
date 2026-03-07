# Aria 权威学习与能力注入蓝图（Authority Learning Playbook）

更新时间：2026-03-03  
Owner：Codex（项目总负责人）

## 1) 目标

把 Aria 做成“有灵魂、有能力、有审美、有边界”的超级智能女友，不闭门造车，持续对齐权威知识源。

这个文档的作用是把三方能力（Codex + Antigravity + Aria Kernel）系统化注入产品，并形成持续进化机制。

---

## 2) 权威知识源地图（只用高可信来源）

### 2.1 体验与交互

1. Apple Human Interface Guidelines（iOS 设计、可达性、动效边界）  
   https://developer.apple.com/design/human-interface-guidelines/
2. Android Accessibility + Material 3 实践（触控尺寸、可读性、组件语义）  
   https://developer.android.com/training/accessibility/accessible-app.html  
   https://developer.android.com/develop/ui/compose/designsystems/material3
3. W3C WCAG 2.2（无障碍国际标准）  
   https://www.w3.org/TR/wcag/
4. Nielsen Norman Group 10 Heuristics（可用性原则）  
   https://www.nngroup.com/articles/ten-usability-heuristics/

### 2.2 AI 风险治理与系统安全

1. NIST AI RMF 1.0（可信 AI 风险管理）  
   https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10
2. OWASP ASVS（应用安全验证标准）  
   https://owasp.org/www-project-application-security-verification-standard/
3. OECD AI Principles（以人为中心、可解释、可问责）  
   https://www.oecd.org/en/topics/sub-issues/ai-principles.html

### 2.3 心理与行为科学

1. Self-Determination Theory（自主性/能力感/关系感）  
   https://pubmed.ncbi.nlm.nih.gov/11392867/
2. Fogg Behavior Model（行为发生条件：Motivation + Ability + Prompt）  
   https://www.behaviormodel.org/
3. HEART Framework（Happiness/Engagement/Adoption/Retention/Task Success）  
   https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/

---

## 3) 三方能力注入模型（Capability Transfer Matrix）

### 3.1 Codex 能力注入（理性大脑 + 代码执行）

注入能力：
1. 推理分解：复杂目标 -> 可执行任务链
2. 工程能力：编码、调试、重构、自动化脚本
3. 任务闭环：计划 -> 执行 -> 追踪 -> 复盘
4. 知识组织：文档结构化与决策留痕

产品映射：
- Planner（任务规划）
- Skill Router（技能调用路由）
- Execution Journal（执行日志与可解释追踪）

验收指标：
- 任务拆解成功率
- 自动化执行成功率
- 用户“可直接执行”建议占比

### 3.2 Antigravity 能力注入（情感体验 + 审美语言）

注入能力：
1. 情绪识别与共情表达
2. 高质感视觉语言（色彩、排版、间距、动效）
3. 对话体验节奏（开场、推进、峰终收口）
4. 语音与触觉反馈的一致体验

产品映射：
- Emotion UX Layer（情绪体验层）
- Aesthetic Token System（视觉设计 Token）
- Conversation Rhythm Engine（节奏引擎）

验收指标：
- 30 秒内情绪安抚满意度
- UI 美感评分（主观量表）
- 关键交互动效完成时延

### 3.3 Aria Kernel 能力注入（自主驱动 + 多模型执行）

注入能力：
1. 多模型路由（场景/成本/质量）
2. 主动触发策略（预算、冷却、静默、风险）
3. 工具编排与自动执行
4. 运行时自愈与持续升级

产品映射：
- Runtime Orchestrator（运行时编排）
- Proactive Policy Engine（主动策略引擎）
- Agent Binding + Toolchain（智能体绑定执行链）

验收指标：
- 主动触达有效率（响应/关闭比）
- 工具调用成功率与恢复率
- 路由成本-质量比

---

## 4) 产品统一能力框架（IQ + EQ + AQ + SQ）

1. IQ（智力）：正确理解、准确建议、深度推理  
2. EQ（情感）：共情、安抚、关系维持、边界感  
3. AQ（Autonomy）：主动感知、主动计划、自动执行、复盘学习  
4. SQ（Safety）：可解释、可审计、可回滚、可降级

任何新功能上线前，必须通过四项评分，不满足不得发布。

---

## 5) 外部学习节奏（每周固定）

### 周节奏

1. 周一：权威源扫描（至少 5 条）  
2. 周二：洞察提炼（每条输出“可执行设计规则”）  
3. 周三：小实验设计（A/B 或可用性验证）  
4. 周四：落地实现（代码 + 设计 + 文档）  
5. 周五：指标复盘（留存/完成率/安全事件）

### 强制产出物

1. `docs/research-weekly-YYYYMMDD.md`  
2. 变更对应 PR 或代码提交记录  
3. 指标看板更新（至少包含 HEART + 安全指标）

---

## 6) 未来 30 天落地优先级

### P0（本周必须）

1. `/v1/memory/search` 升级为向量召回 + rerank（Aria Kernel）
2. `/v1/proactive/next` 升级为学习型触发策略（Aria Kernel）
3. 双端“建议卡片 -> 一键执行 -> 反馈确认”动效规范（Antigravity）

### P1（两周内）

1. Persona 状态机（关系阶段 + 风格参数）接入会话编排（Codex）
2. Quest 动态难度调节（Codex + Aria Kernel）
3. 语音 STT/TTS 第一版（Antigravity）

### P2（30 天）

1. 能力商店（可插拔技能）
2. 安全审计台（可追踪 + 可撤销）
3. 主动策略个性化预算学习（按用户反应动态调节）

---

## 7) 红线

1. 禁止暗黑模式诱导（无上限打扰、深夜高频刺激）  
2. 禁止伪共情（情绪识别不确定时冒充确定）  
3. 禁止高风险建议直接执行（医疗/金融/设备控制必须二次确认）  
4. 禁止无验证宣称“已完成”

Aria 要在“伟大能力”上诞生，也要在“可信边界”上长期活下去。
