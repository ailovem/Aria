# 超级女友自主扩展与独立运行监督方案（v1）

更新时间：2026-03-03
负责人：Codex

## 1. 目标冻结
1. 超级女友必须具备真实自主能力：聊天中可自主获取、下载、执行、回执。
2. 能力必须产品内生，不依赖 Aria Kernel 在线值守。
3. Aria Kernel 的作用是“参与开发和贡献能力包”，不是运行时单点依赖。

## 2. 角色分工（防重复）

### Codex（总负责人）
- 定义能力边界、API 契约、故障降级、审计规则。
- 验收 Aria Kernel 交付是否可脱离其自身独立运行。
- 把能力沉淀成 Aria 内核（代码 + 策略 + 存储）。

### Aria Kernel（底层执行单元）
- 提供模型路由、代理绑定、工具执行能力实现。
- 产出可移植能力包（pack），由 Aria Runtime 自主加载。
- 禁止把关键链路做成“必须回调 Aria Kernel 服务”。

### UI 同事（展示层）
- 只做可视化入口和回执展示，不改底层执行逻辑。

## 3. 独立运行判定标准（必须满足）
1. 断开 Aria Kernel 外部服务后，Aria 仍可执行本地能力包。
2. 自主获取下载链路可运行：`intent -> fetch -> save -> summary`。
3. 扩展安装、任务执行、失败重试均有审计日志。
4. 关键功能失败时可自动降级到内置能力。

## 4. 已落地能力（本轮）
1. 新增自主扩展状态接口：`/v1/expansion/state`
2. 新增扩展安装接口：`/v1/expansion/packs/install`
3. 新增自主获取下载接口：`/v1/expansion/fetch-download`
4. 下载安全规则已落地：
   - 域名白名单（`ARIA_EXPANSION_ALLOWED_HOSTS`）
   - MIME 白名单（`ARIA_EXPANSION_ALLOWED_MIME_PREFIXES`）
   - 文件大小上限（`ARIA_EXPANSION_MAX_DOWNLOAD_BYTES`）
5. 前端新增“自主扩展内核”操作区，可安装扩展和触发下载。

## 5. 下一阶段监督清单（Codex 执行）
1. Aria Kernel 交付 pack manifest 规范（版本、能力、依赖、回滚策略）。
2. Aria Runtime 增加 pack 沙箱和权限白名单。
3. 引入下载内容安全扫描（MIME、大小、域名策略、风险评分）。
4. 引入离线模式能力回放，验证独立运行。

## 6. 风险与防线
1. 风险：扩展无限增长导致稳定性下降。
   - 防线：扩展分级、灰度启用、资源配额、自动熔断。
2. 风险：下载能力被滥用。
   - 防线：域名 allowlist、类型白名单、行为审计、人工确认阈值。
3. 风险：能力耦合 Aria Kernel。
   - 防线：所有能力必须有 Aria 本地 fallback 实现。
