# Aria 全网库深度采集报告（EQ 陪伴 + IQ 自动化）

日期：2026-03-08（Asia/Shanghai）

## 1. 这次采了多大规模

- GitHub 关键词批量抓取：1229 条原始记录，去重后 1073 个仓库。
- HuggingFace 数据集批量抓取：1302 条原始记录，去重后 1284 个数据集。
- 机器可读总库（CSV）：2359 行（仓库 + 数据集）。

原始与聚合文件：
- `docs/research/raw/github_search_results.jsonl`
- `docs/research/raw/github_repos_aggregated.json`
- `docs/research/raw/hf_dataset_results_full.jsonl`
- `docs/research/raw/hf_datasets_aggregated.json`
- `docs/research/github_repos_catalog.csv`
- `docs/research/hf_datasets_catalog.csv`

## 2. 许可分层（商用角度）

GitHub 仓库（1073）：
- 宽松可商用（MIT/Apache/BSD/MPL/CC0/Unlicense）：564
- 需二次确认或有约束（NOASSERTION/UNKNOWN/GPL/AGPL 等）：509

HuggingFace 数据集（1284）：
- 明确偏可商用（apache-2.0/mit/cc-by-4.0/cc0 等）：412
- 受限或不明确（nc/nd/openrail/other/unknown 等）：848
- 其中 license=UNKNOWN：754

说明：
- `UNKNOWN/NOASSERTION/other/openrail` 不代表不能用，代表商用上线前必须做法务复核。
- 陪伴类高质量语料里，非商用（如 `cc-by-nc-*`）占比很高，需要做“训练集与线上推理语料隔离”。

## 3. Aria 可商用优先核心库（建议优先接）

### 3.1 自动化引擎与编排（代码库）

| 库 | Stars | License | 用途 |
|---|---:|---|---|
| langchain-ai/langchain | 128550 | MIT | 工具调用与代理编排基础层 |
| langchain-ai/langgraph | 25803 | MIT | 长任务状态机与可恢复流程 |
| openai/openai-agents-python | 19402 | MIT | Agent 工作流与多工具执行 |
| crewAIInc/crewAI | 45389 | MIT | 多角色任务分工 |
| run-llama/llama_index | 47447 | MIT | 记忆/检索/知识接入 |
| deepset-ai/haystack | 24425 | Apache-2.0 | 检索增强、评测与 pipeline |
| pydantic/pydantic-ai | 15290 | MIT | 工具参数约束、结构化输出 |
| FoundationAgents/MetaGPT | 64853 | MIT | 多 Agent 协作模板 |
| RasaHQ/rasa | 21084 | Apache-2.0 | 对话状态管理、NLU 管线 |
| i-am-bee/beeai-framework | 3150 | Apache-2.0 | 企业 Agent 编排 |

### 3.2 MCP / Skill 生态（优先可接入）

| 库 | Stars | License | 价值 |
|---|---:|---|---|
| github/github-mcp-server | 27601 | MIT | GitHub 任务闭环 |
| microsoft/playwright-mcp | 28377 | Apache-2.0 | 浏览器自动执行 |
| BrowserMCP/mcp | 5978 | Apache-2.0 | 浏览器能力补充 |
| hangwin/mcp-chrome | 10669 | MIT | Chrome 侧操作能力 |
| PrefectHQ/fastmcp | 23482 | Apache-2.0 | 快速开发 MCP Server |
| upstash/context7 | 48032 | MIT | 文档检索类 MCP |
| idosal/git-mcp | 7718 | Apache-2.0 | Git 操作自动化 |
| makenotion/notion-mcp-server | 3996 | MIT | Notion 工作流 |
| sooperset/mcp-atlassian | 4518 | MIT | Jira/Confluence 打通 |
| wonderwhy-er/DesktopCommanderMCP | 5618 | MIT | 桌面端执行工具 |

### 3.3 评测与稳定性基准（IQ 执行质量）

| 库/数据 | License | 价值 |
|---|---|---|
| SWE-bench/SWE-bench | MIT | 代码修复真实任务评测 |
| SWE-agent/SWE-agent | MIT | 真实仓库任务代理执行 |
| LiveCodeBench/LiveCodeBench | MIT |代码生成与执行能力评测 |
| OpenBMB/ToolBench | Apache-2.0 | 工具调用任务集 |
| THUDM/AgentBench | Apache-2.0 | 多环境 agent 能力评测 |
| xlang-ai/OSWorld | Apache-2.0 | 桌面系统真实操作评测 |
| web-arena-x/webarena | Apache-2.0 | 网页代理任务评测 |
| web-arena-x/visualwebarena | MIT | 视觉网页任务评测 |
| ShishirPatil/gorilla | Apache-2.0 | API 调用与工具选择评估 |
| openai/human-eval | MIT | 代码能力基准 |

## 4. 高质量但受限/需复核的情商数据（别直接商用训练）

| 数据集 | License | 用途 |
|---|---|---|
| facebook/empathetic_dialogues | cc-by-nc-4.0 | 共情表达与情绪回应 |
| thu-coai/esconv | cc-by-nc-4.0 | 情绪支持对话策略 |
| li2017dailydialog/daily_dialog | cc-by-nc-sa-4.0 | 日常多轮对话流畅度 |
| declare-lab/MELD | gpl-3.0 | 多轮情绪识别 |
| ParlAI/blended_skill_talk | unknown | 共情+知识+人格混合对话 |
| Amod/mental_health_counseling_conversations | other | 心理支持语气样本 |
| dair-ai/emotion | other | 细粒度情绪分类 |

建议用法：
- 用于“模板风格蒸馏、评测、离线对比”，不要直接混入线上可商用训练主集。
- 线上主集优先 `Apache/MIT/CC-BY`，并对每条样本保留来源与 license 字段。

## 5. 情商数据（可商用优先）可先落这批

| 数据集 | License | 说明 |
|---|---|---|
| google-research-datasets/go_emotions | apache-2.0 | 情绪识别标签底座 |
| OpenAssistant/oasst1 | apache-2.0 | 高质量指令对话 |
| OpenAssistant/oasst2 | apache-2.0 | 扩展多轮对话 |
| Anthropic/hh-rlhf | mit | 偏好对齐/安全对话 |
| HuggingFaceH4/ultrachat_200k | mit | 长对话风格与结构 |
| mteb/toxic_conversations_50k | cc-by-4.0 | 反生硬、反攻击性过滤 |
| shareAI/ShareGPT-Chinese-English-90k | apache-2.0 | 中英双语对话补充 |
| jojo0217/korean_safe_conversation | apache-2.0 | 安全语气迁移参考 |
| awsaf49/persona-chat | mit | 人格一致性对话 |

## 6. Aria 立即可接入的 20 个 Skill/MCP（执行爽感优先）

1. github/github-mcp-server（代码托管与 issue 自动化）
2. microsoft/playwright-mcp（网页任务自动执行）
3. BrowserMCP/mcp（浏览器操作补强）
4. hangwin/mcp-chrome（Chrome 侧可执行能力）
5. PrefectHQ/fastmcp（快速新建 MCP）
6. upstash/context7（文档检索增强）
7. idosal/git-mcp（Git 操作链）
8. makenotion/notion-mcp-server（知识库同步）
9. sooperset/mcp-atlassian（团队任务系统）
10. wonderwhy-er/DesktopCommanderMCP（桌面指令执行）
11. firecrawl/firecrawl-mcp-server（网页结构化抓取）
12. grafana/mcp-grafana（可观测性联动）
13. brightdata/brightdata-mcp（高可用网页数据采集）
14. zcaceres/markdownify-mcp（网页内容清洗入库）
15. supercorp-ai/supergateway（MCP 网关化）
16. open-webui/mcpo（协议适配层）
17. agentgateway/agentgateway（Agent 网关与路由）
18. microsoft/mcp（微软生态官方实现）
19. github + playwright + context7 组合（任务闭环最短路径）
20. git-mcp + DesktopCommanderMCP 组合（本地执行最稳路径）

## 7. 对 Aria 的落地方案（避免生硬与卡顿）

### 7.1 情商层（回复自然度）

- 建立 `情绪信号 schema`：`emotion_detected/intensity/need_type/response_style/continuity_anchor`。
- 建立 `回复原子库`：`确认情绪 -> 共情复述 -> 可执行建议 -> 下一步承诺 -> 失败解释`。
- 每轮回复做“风格去模板化采样”：
  - 同意图至少 6 套措辞。
  - 禁止连续两轮同句式开头。
  - 长任务状态更新插入“情绪照顾短句”。

### 7.2 智商层（自动化执行）

- 路由前置可用性检测：`provider/key/tool` 三维 readiness。
- 失败透明化：每次降级必须返回 `原因 + 已尝试步骤 + 可恢复动作`。
- 长任务状态机：`queued/running/retrying/degraded/done` 可视化到前端。
- 在线 Flywheel：把 `情感评分 + 执行成功率 + 用户二次追问率` 入库做自动路由学习。

### 7.3 开箱即用层（全用户）

- 无 key 默认走“平滑模式”：本地 fallback + 低延迟模板原子混排，不出现“机械失败提示”。
- 有 key 一键升级：自动探测可用 provider 并热切路由。
- 首次安装 30 秒引导：展示“陪伴能力 + 自动执行能力 + 隐私边界”。

## 8. 下一步执行清单（建议按周）

- Week 1：落 `数据治理表`（source/license/用途/商用状态）+ 接 10 个 MCP。
- Week 2：上线 `去模板化回复原子库` + `失败透明化状态机`。
- Week 3：接入 `SWE-bench + ToolBench + BFCL` 小规模离线评测。
- Week 4：上线 Flywheel 回放与自动路由 AB，目标：执行成功率与留存同时提升。

