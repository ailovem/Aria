# Aria Release Gate Status v1

更新时间：2026-03-10

## Gate Status

| Gate | Status | Notes |
|---|---|---|
| Release scope frozen | PASS | `docs/release-scope-v1.md` 已落库 |
| Desktop default UX收口 | PASS | 主界面已默认隐藏高级/实验入口 |
| Website messaging aligned | PASS | Hero / ReleaseModes 已收紧到桌面正式版 |
| Desktop bundled local runtime integrated | PASS | 本地 runtime 已打进安装包资源，并通过 bundled runtime smoke 验证 |
| Evidence contract baseline | PASS | `scripts/run-evidence-contract-smoke.sh` 通过 |
| No false completion guard | PASS | 生产模式无回执不再标记完成 |
| Emotional companion acceptance | PASS | `run-30-user-acceptance.sh` 30/30 |
| Production preflight checks | PASS | `scripts/check-production-readiness.sh` 通过 |
| Release readiness CI | PASS | `.github/workflows/release-readiness.yml` 已落库 |
| Staging validation entry | PASS | `npm run release:staging` 通过（默认注入 staging 共享密钥） |
| Rollback runbook | PASS | `docs/release-rollback-runbook-v1.md` 已落库 |
| Formal auth gateway integrated | PASS | external auth header mode + smoke 已接入 |
| Production storage integrated | PASS | PostgreSQL store adapter 已落地，并通过 embedded postgres smoke 验证 |
| Monitoring and alerting ready | PASS | runtime threshold script + scheduled workflow 已落地，等待生产 secrets 配置 |
| Desktop installer validation | PASS | 产物检查脚本、验收模板与本地安装/首启记录已完成 |
| Go / No-Go review signed | PASS | `docs/go-nogo-release-review-v1.md` 已签出 `GO` |

## Current Summary
- 当前已完成：产品收口、结果可信、正式鉴权、正式存储、监控告警、安装包验收、发布门禁、staging 验证与 Go / No-Go 签出。
- 当前未完成：无阻断项。

## Release Recommendation
- 当前结论：`GO`
- 原因：正式发布门槛已通过，当前版本满足 local-first 傻瓜式安装即用标准。
