# Aria 闭环主流程内置能力（小白版）

## 这次到底做了什么
你提的 4 条主线，已经不是“口号”，而是写进了可读写的底层配置，并且挂到了前端「超级脑图 -> 脑系统策略配置」入口里。

一句话：  
**现在前端改配置 -> 后端 `/v1/system/config` 落库 -> 运行时按新策略执行**。

---

## 前端入口与后端字段映射

入口：`脑系统策略配置（实时连后端）`

### 1) 脑系统（模型 + 自主进化）
- **目标确认阈值**  
  - 前端控件：数值输入  
  - 后端字段：`systemProfile.layers.application.goalContract.autoClarifyThreshold`
- **权威学习定时(CRON)**  
  - 后端字段：`systemProfile.learningEngine.autonomousEvolution.schedules.authorityKnowledgeSyncCron`
- **反馈学习定时(CRON)**  
  - 后端字段：`systemProfile.learningEngine.autonomousEvolution.schedules.feedbackDigestCron`
- **MCP 浏览执行**  
  - 后端字段：`systemProfile.layers.technology.mcpBrowserRuntime.enabled`

### 2) 记忆系统
- **跨场景联想 TopK**  
  - 后端字段：`systemProfile.memoryFramework.crossSceneAssociation.recallTopK`
- 结构已内置（无需你手动配每项）：  
  - `longTerm`（长期向量记忆）  
  - `shortTerm`（短期会话记忆）  
  - `temporary`（临时任务记忆）  
  - `crossSceneAssociation`（跨场景联想）

### 3) 上下文回收分类系统
- **上下文升入长期阈值**  
  - 后端字段：`systemProfile.contextRecycleSystem.rules.importanceThreshold`
- 定时回收与去重策略已内置：  
  - `contextClassifyCron`  
  - `duplicateCompressCron`

### 4) Skill / 扩展 / 语音硬件
- **GitHub 官方技能发现**  
  - 后端字段：`systemProfile.skillAndExpansionBuiltin.githubOfficialSkillDiscovery.enabled`
- **语音能力**  
  - 后端字段：`systemProfile.multiDeviceRuntime.voice.enabled`
- **蓝牙接入**  
  - 后端字段：`systemProfile.multiDeviceRuntime.hardwareBridge.bluetooth`

---

## 主流程节点（Goal -> Task -> Result）已固化

字段：`systemProfile.closedLoopProtocol.nodes`

内置节点：
1. `intent_understanding`（理解意图）
2. `goal_contract_confirmation`（确认目标）
3. `task_graph_planning`（分解任务）
4. `autonomous_execution`（自主执行）
5. `realtime_feedback`（实时反馈）
6. `delivery_and_evidence`（交付结果+证据）
7. `memory_writeback`（记忆写回）
8. `repair_or_replay`（整改重放）

---

## 超级自治技能库（已扩容）

文件：`services/api/super-autonomy.profile.json`

新增了你点名的关键技能（全部进 `skillRegistry`）：
- `skill.model_api_easy_setup`
- `skill.autonomous_learning_crawler`
- `skill.feedback_learning_writeback`
- `skill.memory_lifecycle_manager`
- `skill.cross_scene_memory_recall`
- `skill.context_recycle_classifier`
- `skill.mcp_browser_runtime`
- `skill.github_official_skill_discovery`
- `skill.voice_hardware_bluetooth_orchestration`

---

## 场景策略现在也带“能力和记忆权重”

文件：`services/api/scene-orchestration.policy.json`

每个场景都已补：
- `capabilities`
- `requiredSkills`
- `responseStyle`
- `memoryStrategy`

并且后端 `normalizeSceneOrchestrationPolicy` 已升级，以上字段不会再被吃掉。

---

## 安全与扩展（不放飞，能控）

文件：`services/api/expansion-security.policy.json`

已增强：
- GitHub 官方下载域名白名单（`api.github.com` / `codeload.github.com` 等）
- 新增 sandbox profile：`browser-mcp`、`github-discovery`
- 签名信任人扩展：`github-release`

---

## 你现在怎么验收（最短路径）
1. 打开桌面端「超级脑图 -> 脑系统策略配置」  
2. 改任意一个新字段（如“跨场景联想 TopK”）  
3. 点「保存策略」  
4. 点「刷新策略」后确认值保留  
5. 查看 `services/api/system-profile.json` 已持久化

如果你要，我下一步可以把这 9 个新入口再加一层「推荐值/风险提示/一键恢复默认」按钮，给非技术同学更傻瓜化。

---

## 本轮“真实落地”新增（不是声明）

### 1) 四场景独立记忆存储（已落地）
- 后端新增 `memorySystem`：
  - `sceneVaults.work/fun/life/love`
  - `longTerm / shortTerm / temporary`
  - `vectorIndex`（本地向量索引）
- 入口：
  - 聊天消息入库：`POST /v1/message`、`POST /v1/message/stream`
  - 手动写记忆：`POST /v1/memory`（支持 `scene/tier/tags`）

### 2) 跨场景联想检索（已落地）
- `GET /v1/memory/search` 新增参数：
  - `scene=work|fun|life|love`
  - `crossScene=true|false`
- 返回项包含：
  - `scene`
  - `memory_tier`
  - `embedding_score / rerank_score / trigger_confidence`

### 3) 学习与回收定时任务（已落地）
- `POST /v1/autonomy/tick` 会触发 lifecycle（可 `forceLifecycle=true`）
- 已包含 4 个作业：
  - `authority_learning`（权威网站学习）
  - `feedback_digest`（聊天反馈学习）
  - `prelearning`（自主预学习）
  - `context_recycle`（去重压缩 + 长期晋升）

### 4) 前端已接真实后端（已落地）
- 记忆检索已按当前场景调用后端：
  - `searchDemoMemory(query, limit, { scene, crossScene })`
- 手动写记忆已按当前场景入库：
  - `createDemoMemory(content, { scene, tier, tags })`
- 记忆列表显示来源已切换为真实标签（场景/层级/来源）。

---

## P1：外部向量库适配（Qdrant 优先）

### 已落地能力
- 后端保持原接口不变（`/v1/memory/search`、`/v1/memory`），内部新增 Qdrant 适配层。
- 模式切换：
  - `ARIA_VECTOR_BACKEND=local`（默认，本地索引）
  - `ARIA_VECTOR_BACKEND=qdrant`（外部向量库）
- Qdrant 配置：
  - `ARIA_QDRANT_URL`
  - `ARIA_QDRANT_API_KEY`（可选）
  - `ARIA_QDRANT_COLLECTION`（默认 `aria_memory`）
- 写入策略：本地记忆写入后异步 upsert 到 Qdrant（不阻塞聊天链路）。
- 检索策略：`/v1/memory/search` 先做本地召回，再融合 Qdrant 结果并重排，接口字段保持兼容。

### 脑系统页可视化（已落地）
入口：`超级脑图 -> 脑系统策略配置`
- 新增「记忆平面实时状态卡」，可直接看到：
  - 当前后端模式（local-index / qdrant）
  - Qdrant ready/status/error/lastWrite/lastSearch
  - 四场景记忆条数 + long/short/temp/vectorIndex
  - 学习作业时间戳（authority/feedback/prelearning/recycle）
  - 记忆统计（写入、去重、晋升）

### 验收步骤（3 分钟）
1. 启动 Qdrant（本地示例）
   - `docker run -p 6333:6333 qdrant/qdrant`
2. 设置环境并重启运行时
   - `export ARIA_VECTOR_BACKEND=qdrant`
   - `export ARIA_QDRANT_URL=http://127.0.0.1:6333`
   - `export ARIA_QDRANT_COLLECTION=aria_memory`
   - `bash /Users/bear/Desktop/Aria/Aria/scripts/restart-desktop-web.sh`
3. 在页面里发送几条消息后，打开脑系统状态卡确认：
   - Qdrant 显示 `已就绪`
   - `lastSearchHits`、`lastWriteAt` 有变化
4. 请求验证（可选）
   - `GET /v1/system/config` 中 `memoryPlaneRuntime.vector.qdrant.ready === true`

### 回滚与平滑迁移
- 想回本地索引，直接：
  - `export ARIA_VECTOR_BACKEND=local`
  - 重启运行时即可。
- 前端与 API 不改调用方式，所有入口保持兼容。

---

## P1.5：小白可视化开关台（已落地）

入口：`超级脑图 -> 脑系统策略配置 -> 记忆平面实时状态卡`

你现在不需要命令行，直接点按钮就能完成：
- 切换 `local-index / qdrant`
- 填写 Qdrant URL / Collection / 超时
- 查看风险提示和推荐值
- 一键回滚到 `local-index`

### 页面里的三个核心按钮
1. **保存向量后端策略**：把当前配置写入系统配置并立即生效。  
2. **一键回滚到 local-index**：快速恢复到最稳定的本地模式。  
3. **刷新状态卡**：立刻查看当前是否连通、是否报错、最近检索状态。  

### 小白建议
- 你没有自建 Qdrant 时，默认用 `local-index` 最稳。
- 只有当你需要更大规模长期记忆，再切 `qdrant`。
- 切到 qdrant 后若显示 `error/fetch failed`，先回滚 local，再排查 Qdrant 服务。

---

## P1.6：连接自检 + 一键修复建议（已落地）

入口：`超级脑图 -> 脑系统策略配置 -> 记忆平面实时状态卡`

新增能力：
- `连接自检`：自动检测当前模式、Qdrant URL、连通性、环境（docker/brew）  
- `按建议一键修复`：优先执行最安全修复（通常是回滚 local-index）  
- `小白建议卡`：把“为什么失败”和“下一步做什么”直接写清楚  

后端接口：
- `GET /v1/memory/backend/check`

说明：
- 自检结果会给出 `healthy / error` 状态和分层建议。
- 在你当前机器未部署 Qdrant 时，系统会建议先回滚 `local-index`，保证可用优先。
