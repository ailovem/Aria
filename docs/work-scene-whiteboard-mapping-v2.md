# 工作场景白板图映射（v2）

更新时间：2026-03-03
来源：用户手绘白板图（工作场景）
负责人：Codex

## 1. 白板结构识别

1. 顶部：工作场景主标题
2. 左栏：女友形象 / 模型选择 / 编程 Skill / MCP / 自动化 / 记忆策略
3. 中间：主执行与回执区域
4. 右栏：插件 / PDF 转换 / 文件库 / 文生图 / 联网 / 多命令
5. 底栏：# 输入框 + 发送 + 语音

## 2. 前端落地映射

已落地到 `apps/desktop/src/App.tsx` 的工作场景页：
1. `workbench-card`：白板结构主容器
2. `workbench-left-stack`：左栏能力栈
3. `workbench-center-stage`：中间回执流与计划
4. `workbench-right-tools`：右栏工具动作按钮
5. `workbench-input-row`：底部输入条

## 3. 后端能力映射

1. 工作台状态：`GET /v1/workbench/state`
2. 意图提交：`POST /v1/workbench/intent`
3. 工具触发：`POST /v1/workbench/tool/run`
4. 模型切换：`POST /v1/workbench/model/select`
5. 扩展状态：`GET /v1/expansion/state`
6. 扩展安装：`POST /v1/expansion/packs/install`
7. 自主下载：`POST /v1/expansion/fetch-download`

## 4. 小白体验目标

1. 看懂：结构固定，不会迷路。
2. 会用：一句话目标可直接提交。
3. 有结果：每个动作都有回执。
4. 可扩展：插件和下载能力随时增长。
