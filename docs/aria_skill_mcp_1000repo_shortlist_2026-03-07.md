# Aria 技能/MCP 安全增强清单（1000 仓库扫描版）

日期：2026-03-07
扫描来源：`ai OR assistant OR automation OR chatbot`
扫描规模：raw=1000，unique=1000
落地配置：新增安全技能目录 60 项

## Top20（优先提升“情商陪伴 + 自动执行爽感”）

| # | Skill Pack | Repo | 作用 |
|---|---|---|---|
| 1 | `pack.safe.openclaw_core` | `openclaw/openclaw` | 本地优先的个人 AI 助手与自治执行框架。 |
| 2 | `pack.safe.n8n_workflow` | `n8n-io/n8n` | 可视化工作流编排与 AI 流程自动化平台。 |
| 3 | `pack.safe.autogen_framework` | `microsoft/autogen` | 微软多智能体编排框架，适合任务协作与代理通信。 |
| 4 | `pack.safe.crewai_framework` | `crewAIInc/crewAI` | 角色化 AI Agent 编排框架，适合复杂任务链。 |
| 5 | `pack.safe.langchain_framework` | `langchain-ai/langchain` | LLM 应用与工具调用编排框架。 |
| 6 | `pack.safe.langflow_builder` | `langflow-ai/langflow` | 图形化构建 LLM Agent 与流程。 |
| 7 | `pack.safe.dify_platform` | `langgenius/dify` | 面向生产环境的 AI 工作流与应用平台。 |
| 8 | `pack.safe.flowise_builder` | `FlowiseAI/Flowise` | 低门槛搭建 Agent、RAG 与自动化链路。 |
| 9 | `pack.safe.openhands_coding` | `OpenHands/OpenHands` | AI 驱动的软件开发执行代理。 |
| 10 | `pack.safe.autogpt_runtime` | `Significant-Gravitas/AutoGPT` | 自治任务执行与目标驱动的 Agent 框架。 |
| 11 | `pack.safe.agno_agentic` | `agno-agi/agno` | 大规模运行与管理 agentic software 的框架。 |
| 12 | `pack.safe.metagpt_multi_agent` | `FoundationAgents/MetaGPT` | 多角色 AI 协同开发与任务执行框架。 |
| 13 | `pack.safe.goose_agent` | `block/goose` | 可安装执行测试编辑的开源 AI 代理。 |
| 14 | `pack.safe.browser_use` | `browser-use/browser-use` | 让 AI Agent 可稳定访问和操作网站。 |
| 15 | `pack.safe.playwright_core` | `microsoft/playwright` | 跨内核浏览器自动化与测试框架。 |
| 16 | `pack.safe.puppeteer_core` | `puppeteer/puppeteer` | Chrome/Firefox 自动化执行 API。 |
| 17 | `pack.safe.selenium_core` | `SeleniumHQ/selenium` | 成熟的浏览器自动化生态与驱动。 |
| 18 | `pack.safe.firecrawl_webdata` | `firecrawl/firecrawl` | 将整站转为 LLM 可用结构化数据。 |
| 19 | `pack.safe.crawl4ai_engine` | `unclecode/crawl4ai` | 面向 LLM 的网页抓取与清洗引擎。 |
| 20 | `pack.safe.awesome_mcp_servers` | `punkpeye/awesome-mcp-servers` | MCP 服务端生态索引，适配能力发现。 |

## 新增 60 个安全技能目录（已接入 Aria）

1. `pack.safe.openclaw_core` · OpenClaw 核心自治框架  
   - Repo: https://github.com/openclaw/openclaw  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: agent, autonomy, openclaw, openclaw/openclaw  
2. `pack.safe.n8n_workflow` · n8n 自动化编排  
   - Repo: https://github.com/n8n-io/n8n  
   - 能力: skill.route, web.fetch, content.summary, runtime.healthcheck  
   - 关键词: workflow, automation, n8n, n8n-io/n8n  
3. `pack.safe.autogen_framework` · AutoGen 多智能体框架  
   - Repo: https://github.com/microsoft/autogen  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: autogen, multi-agent, microsoft, microsoft/autogen  
4. `pack.safe.crewai_framework` · CrewAI 角色协同框架  
   - Repo: https://github.com/crewAIInc/crewAI  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: crewai, agent, workflow, crewAIInc/crewAI  
5. `pack.safe.langchain_framework` · LangChain Agent 框架  
   - Repo: https://github.com/langchain-ai/langchain  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: langchain, agent, tool-use, langchain-ai/langchain  
6. `pack.safe.langflow_builder` · Langflow 可视化构建  
   - Repo: https://github.com/langflow-ai/langflow  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: langflow, visual, workflow, langflow-ai/langflow  
7. `pack.safe.dify_platform` · Dify 生产级 AI 平台  
   - Repo: https://github.com/langgenius/dify  
   - 能力: skill.route, web.fetch, content.summary, runtime.healthcheck  
   - 关键词: dify, agentic, platform, langgenius/dify  
8. `pack.safe.flowise_builder` · Flowise AI 流程编排  
   - Repo: https://github.com/FlowiseAI/Flowise  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: flowise, rag, automation, FlowiseAI/Flowise  
9. `pack.safe.openhands_coding` · OpenHands 自治编程  
   - Repo: https://github.com/OpenHands/OpenHands  
   - 能力: skill.route, file.download, content.summary, runtime.healthcheck  
   - 关键词: coding-agent, openhands, dev, OpenHands/OpenHands  
10. `pack.safe.autogpt_runtime` · AutoGPT 自治任务引擎  
   - Repo: https://github.com/Significant-Gravitas/AutoGPT  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: autogpt, agent, task, Significant-Gravitas/AutoGPT  
11. `pack.safe.agno_agentic` · Agno Agentic Runtime  
   - Repo: https://github.com/agno-agi/agno  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: agno, agentic, runtime, agno-agi/agno  
12. `pack.safe.metagpt_multi_agent` · MetaGPT 多角色协同  
   - Repo: https://github.com/FoundationAgents/MetaGPT  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: metagpt, multi-agent, collaboration, FoundationAgents/MetaGPT  
13. `pack.safe.goose_agent` · Goose 可扩展代理  
   - Repo: https://github.com/block/goose  
   - 能力: skill.route, file.download, content.summary, runtime.healthcheck  
   - 关键词: goose, agent, tooling, block/goose  
14. `pack.safe.browser_use` · Browser Use 网页代理  
   - Repo: https://github.com/browser-use/browser-use  
   - 能力: web.fetch, skill.route, content.summary, runtime.healthcheck  
   - 关键词: browser, web-agent, automation, browser-use/browser-use  
15. `pack.safe.playwright_core` · Playwright 浏览器自动化  
   - Repo: https://github.com/microsoft/playwright  
   - 能力: web.fetch, skill.route, content.summary, runtime.healthcheck  
   - 关键词: playwright, browser, automation, microsoft/playwright  
16. `pack.safe.puppeteer_core` · Puppeteer 浏览器执行  
   - Repo: https://github.com/puppeteer/puppeteer  
   - 能力: web.fetch, skill.route, content.summary, runtime.healthcheck  
   - 关键词: puppeteer, browser, automation, puppeteer/puppeteer  
17. `pack.safe.selenium_core` · Selenium Web 自动化  
   - Repo: https://github.com/SeleniumHQ/selenium  
   - 能力: web.fetch, skill.route, content.summary, runtime.healthcheck  
   - 关键词: selenium, web, testing, SeleniumHQ/selenium  
18. `pack.safe.firecrawl_webdata` · Firecrawl 网页数据引擎  
   - Repo: https://github.com/firecrawl/firecrawl  
   - 能力: web.fetch, file.download, content.summary, runtime.healthcheck  
   - 关键词: firecrawl, crawl, web-data, firecrawl/firecrawl  
19. `pack.safe.crawl4ai_engine` · Crawl4AI 智能爬取  
   - Repo: https://github.com/unclecode/crawl4ai  
   - 能力: web.fetch, file.download, content.summary, runtime.healthcheck  
   - 关键词: crawl4ai, web, scraper, unclecode/crawl4ai  
20. `pack.safe.awesome_mcp_servers` · Awesome MCP Servers  
   - Repo: https://github.com/punkpeye/awesome-mcp-servers  
   - 能力: web.fetch, content.summary, skill.route, runtime.healthcheck  
   - 关键词: mcp, catalog, servers, punkpeye/awesome-mcp-servers  
21. `pack.safe.context7_docs_mcp` · Context7 文档 MCP  
   - Repo: https://github.com/upstash/context7  
   - 能力: web.fetch, content.summary, skill.route, runtime.healthcheck  
   - 关键词: context7, docs, mcp, upstash/context7  
22. `pack.safe.mem0_memory` · Mem0 记忆层  
   - Repo: https://github.com/mem0ai/mem0  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: memory, long-term, mem0, mem0ai/mem0  
23. `pack.safe.khoj_brain` · Khoj 第二大脑  
   - Repo: https://github.com/khoj-ai/khoj  
   - 能力: skill.route, file.download, content.summary, runtime.healthcheck  
   - 关键词: second-brain, memory, khoj, khoj-ai/khoj  
24. `pack.safe.anythingllm_workspace` · AnythingLLM 工作空间  
   - Repo: https://github.com/Mintplex-Labs/anything-llm  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: anythingllm, workspace, rag, Mintplex-Labs/anything-llm  
25. `pack.safe.ragflow_engine` · RAGFlow 检索增强引擎  
   - Repo: https://github.com/infiniflow/ragflow  
   - 能力: web.fetch, file.download, content.summary, runtime.healthcheck  
   - 关键词: ragflow, rag, retrieval, infiniflow/ragflow  
26. `pack.safe.quivr_rag` · Quivr RAG 框架  
   - Repo: https://github.com/QuivrHQ/quivr  
   - 能力: skill.route, file.download, content.summary, runtime.healthcheck  
   - 关键词: quivr, rag, knowledge, QuivrHQ/quivr  
27. `pack.safe.pathway_llm_app` · Pathway LLM 应用模板  
   - Repo: https://github.com/pathwaycom/llm-app  
   - 能力: web.fetch, file.download, content.summary, runtime.healthcheck  
   - 关键词: pathway, rag, pipeline, pathwaycom/llm-app  
28. `pack.safe.docling_docs` · Docling 文档处理  
   - Repo: https://github.com/docling-project/docling  
   - 能力: file.download, content.summary, runtime.healthcheck  
   - 关键词: docling, document, extract, docling-project/docling  
29. `pack.safe.paddleocr_docs` · PaddleOCR 票据识别  
   - Repo: https://github.com/PaddlePaddle/PaddleOCR  
   - 能力: file.download, content.summary, runtime.healthcheck  
   - 关键词: ocr, paddleocr, document, PaddlePaddle/PaddleOCR  
30. `pack.safe.litellm_gateway` · LiteLLM AI Gateway  
   - Repo: https://github.com/BerriAI/litellm  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: gateway, llm, router, BerriAI/litellm  
31. `pack.safe.kong_ai_gateway` · Kong AI Gateway  
   - Repo: https://github.com/Kong/kong  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: kong, gateway, api, Kong/kong  
32. `pack.safe.localai_runtime` · LocalAI 本地模型运行时  
   - Repo: https://github.com/mudler/LocalAI  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: localai, local-model, runtime, mudler/LocalAI  
33. `pack.safe.exo_local_compute` · Exo 本地集群推理  
   - Repo: https://github.com/exo-explore/exo  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: exo, local, compute, exo-explore/exo  
34. `pack.safe.ray_compute` · Ray 分布式计算引擎  
   - Repo: https://github.com/ray-project/ray  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: ray, distributed, compute, ray-project/ray  
35. `pack.safe.meilisearch_hybrid` · Meilisearch 混合检索  
   - Repo: https://github.com/meilisearch/meilisearch  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: search, meilisearch, retrieval, meilisearch/meilisearch  
36. `pack.safe.clickhouse_analytics` · ClickHouse 实时分析  
   - Repo: https://github.com/ClickHouse/ClickHouse  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: analytics, clickhouse, realtime, ClickHouse/ClickHouse  
37. `pack.safe.posthog_product_analytics` · PostHog 产品分析  
   - Repo: https://github.com/PostHog/posthog  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: analytics, posthog, product, PostHog/posthog  
38. `pack.safe.appwrite_backend` · Appwrite 后端能力  
   - Repo: https://github.com/appwrite/appwrite  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: appwrite, backend, infra, appwrite/appwrite  
39. `pack.safe.supabase_backend` · Supabase AI 后端  
   - Repo: https://github.com/supabase/supabase  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: supabase, postgres, backend, supabase/supabase  
40. `pack.safe.appsmith_internal_tools` · Appsmith 内部工具平台  
   - Repo: https://github.com/appsmithorg/appsmith  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: appsmith, internal-tools, dashboard, appsmithorg/appsmith  
41. `pack.safe.tooljet_internal_tools` · ToolJet 内部系统构建  
   - Repo: https://github.com/ToolJet/ToolJet  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: tooljet, internal-tools, ops, ToolJet/ToolJet  
42. `pack.safe.homeassistant_device` · Home Assistant 设备联动  
   - Repo: https://github.com/home-assistant/core  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: home-assistant, iot, device, home-assistant/core  
43. `pack.safe.huginn_agents` · Huginn 事件代理  
   - Repo: https://github.com/huginn/huginn  
   - 能力: web.fetch, skill.route, content.summary, runtime.healthcheck  
   - 关键词: huginn, agents, automation, huginn/huginn  
44. `pack.safe.airflow_orchestration` · Apache Airflow 调度  
   - Repo: https://github.com/apache/airflow  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: airflow, scheduler, orchestration, apache/airflow  
45. `pack.safe.acme_cert_automation` · acme.sh 证书自动化  
   - Repo: https://github.com/acmesh-official/acme.sh  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: acme, ssl, automation, acmesh-official/acme.sh  
46. `pack.safe.fastlane_mobile_ci` · Fastlane 移动端自动化  
   - Repo: https://github.com/fastlane/fastlane  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: mobile, ci, fastlane, fastlane/fastlane  
47. `pack.safe.openbb_finance` · OpenBB 金融数据  
   - Repo: https://github.com/OpenBB-finance/OpenBB  
   - 能力: web.fetch, content.summary, skill.route, runtime.healthcheck  
   - 关键词: finance, openbb, research, OpenBB-finance/OpenBB  
48. `pack.safe.dbeaver_db_ops` · DBeaver 数据库运维  
   - Repo: https://github.com/dbeaver/dbeaver  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: database, dbeaver, sql, dbeaver/dbeaver  
49. `pack.safe.photoprism_media_ai` · PhotoPrism 媒体管理  
   - Repo: https://github.com/photoprism/photoprism  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: photos, media, management, photoprism/photoprism  
50. `pack.safe.nextchat_client` · NextChat 客户端  
   - Repo: https://github.com/ChatGPTNextWeb/NextChat  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: nextchat, chat, client, ChatGPTNextWeb/NextChat  
51. `pack.safe.open_webui_client` · Open WebUI 聊天界面  
   - Repo: https://github.com/open-webui/open-webui  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: webui, chat, llm, open-webui/open-webui  
52. `pack.safe.librechat_client` · LibreChat 多模型客户端  
   - Repo: https://github.com/danny-avila/LibreChat  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: librechat, chat, agent, danny-avila/LibreChat  
53. `pack.safe.chatbotui_client` · Chatbot UI  
   - Repo: https://github.com/mckaywrigley/chatbot-ui  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: chatbot-ui, frontend, chat, mckaywrigley/chatbot-ui  
54. `pack.safe.chatbox_client` · Chatbox 客户端  
   - Repo: https://github.com/chatboxai/chatbox  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: chatbox, desktop, assistant, chatboxai/chatbox  
55. `pack.safe.aider_pair_programming` · Aider 终端结对编程  
   - Repo: https://github.com/Aider-AI/aider  
   - 能力: skill.route, file.download, content.summary, runtime.healthcheck  
   - 关键词: aider, coding, agent, Aider-AI/aider  
56. `pack.safe.continue_ci_checks` · Continue Source-controlled AI checks  
   - Repo: https://github.com/continuedev/continue  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: continue, ci, code-check, continuedev/continue  
57. `pack.safe.tabby_coding_assistant` · Tabby 自托管代码助手  
   - Repo: https://github.com/TabbyML/tabby  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: tabby, coding, assistant, TabbyML/tabby  
58. `pack.safe.daytona_runtime` · Daytona 执行沙箱  
   - Repo: https://github.com/daytonaio/daytona  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: daytona, runtime, sandbox, daytonaio/daytona  
59. `pack.safe.folo_reader` · Folo AI Reader  
   - Repo: https://github.com/RSSNext/Folo  
   - 能力: web.fetch, content.summary, runtime.healthcheck  
   - 关键词: rss, reader, news, RSSNext/Folo  
60. `pack.safe.lobehub_agentspace` · LobeHub Agent Space  
   - Repo: https://github.com/lobehub/lobehub  
   - 能力: skill.route, content.summary, runtime.healthcheck  
   - 关键词: lobehub, agent, workspace, lobehub/lobehub  

## 接入位置

- 安全目录文件：`services/api/skill-market.safe-catalog.json`
- 运行时加载：`services/api/mock-server.mjs`（`AUTONOMY_SKILL_MARKET_CATALOG` 合并安全目录）
- 发现/安装入口：`/v1/autonomy/dispatch` 的 `skill_discovery` 流程
