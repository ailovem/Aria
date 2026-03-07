# Aria Kernel 执行包 v1（Runtime + 自学习）

更新时间：2026-03-03 07:05  
负责人：Aria Kernel  
验收负责人：Codex

## 1) 本轮目标

把当前规则版 runtime 升级为“可学习、可扩展、可回滚”的独立智能内核。

## 2) 必交付文件（硬性）

1. `services/api/mock-server.mjs`
2. `services/api/schema.sql`
3. `services/api/autonomy-policy.json`
4. `docs/phase-3-delivery.md`

## 3) 必落地能力（硬性）

### 3.1 记忆检索升级

- `GET /v1/memory/search` 保持路径不变，新增字段：
  - `embedding_score`
  - `rerank_score`
  - `trigger_confidence`

### 3.2 主动策略学习化

- `POST /v1/proactive/next` 保持路径不变
- 触发阈值根据以下反馈动态调节：
  - 建议被执行
  - 建议被忽略
  - 建议被关闭

### 3.3 自治运维能力

- 策略热加载持续可用
- 异常策略自动回滚到上一个可用版本
- 自修复日志可追溯（用户级）

## 4) 验收命令

```bash
cd /Users/bear/Desktop/Aria/Aria && node --check services/api/mock-server.mjs
cd /Users/bear/Desktop/Aria/Aria && bash scripts/run-autonomy-smoke.sh
```

## 5) 验收标准（通过即完成）

1. 接口兼容（旧客户端不需要改路径）
2. 自主内核连续运行 30 分钟无崩溃
3. 自学习参数可观察、可回退
4. 文档同步完成
