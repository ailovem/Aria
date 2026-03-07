# Aria 三方执行落地报告（2026-03-03）

Owner：Codex（项目负责人）

## 本次不是“分工停留在文档”，而是已落到代码

### 1) Aria Kernel 方向（自主运行 + 自修复 + 自进化）

已落地代码：

- `services/api/mock-server.mjs`
- `services/api/autonomy-policy.json`
- `services/api/schema.sql`

已实现能力：

1. 自主运行：
   - 后端自动 tick（默认 20s）
   - 根据用户空闲时长自动生成自主建议（进入 autonomy inbox）
2. 自主修复：
   - 结构异常自动修复（messages/memory/preferences）
   - 手动触发修复接口：`POST /v1/autonomy/repair`
3. 自主进化：
   - 自主学习记忆（从近期用户消息提取“提醒/明天/家人”等模式）
4. 自主升级：
   - 热加载策略文件：`services/api/autonomy-policy.json`
   - 无需重启可更新策略版本与阈值

新增接口：

- `GET /v1/autonomy/status`
- `GET /v1/autonomy/inbox`
- `POST /v1/autonomy/inbox/ack`
- `POST /v1/autonomy/repair`
- `POST /v1/autonomy/tick`

### 2) Antigravity 方向（体验落地）

已落地代码：

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/styles.css`
- `apps/mobile/lib/main.dart`

已实现能力：

1. 双端加入“独立运行内核”可视化状态（tick、生成数、修复时间）
2. 双端加入“自主建议收件箱”并支持一键接收到输入框
3. 双端加入“立即自主执行 / 自修复”操作入口

### 3) Codex 方向（架构与治理）

已落地文档：

- `docs/authority-learning-playbook.md`
- `COLLABORATION.md`（v2.7）

已落地机制：

1. 权威学习机制（每周外部来源扫描 + 规则沉淀 + 实验复盘）
2. 三方执行标准化（不是口头协作，必须产出可运行代码与验收）
3. 独立产品原则：运行、修复、进化、升级都在产品 runtime 内实现

## 结论

Aria 当前已经具备“独立运行产品”的初版内核，不再依赖“人手动触发每一步”。

下一阶段将继续把自主内核从规则版升级为向量检索 + 学习型策略版。

补充（2026-03-03 07:34）：

- 方向已冻结到 `docs/aria-independent-product-charter.md`
- 后续任何能力开发必须满足：独立运营、独立修复、独立升级、独立成长

补充（2026-03-03 07:58）：

- 已落地主动触达学习闭环：
  - 新增 `POST /v1/proactive/feedback`
  - 根据 executed / ignored / dismissed 自适应调节 cooldown 与 maxDaily
- 已落地检索评分扩展字段：
  - `embedding_score`
  - `rerank_score`
  - `trigger_confidence`
- 双端 UI 已同步：
  - 主动建议反馈按钮
  - 记忆检索多评分可视化
