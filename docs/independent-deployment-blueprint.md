# Aria 独立部署与运营蓝图

更新时间：2026-03-03 07:33  
Owner：Codex

## 1) 目标

确保 Aria 作为独立产品可被下载、部署、运营，而不是仅在开发环境可用。

## 2) 发行路径

### 2.1 Desktop

1. macOS：
   - 产物：`dmg` / 签名 `.app`
   - 通道：官网下载 / 企业分发
2. Windows：
   - 产物：`msi` / `exe`
   - 通道：官网下载 / 企业分发

### 2.2 iOS

1. 内测：TestFlight
2. 正式：App Store

## 3) 部署拓扑（可切换）

### A. 单机拓扑（本地演示）

- Client -> `services/api/mock-server.mjs`
- 适用：快速演示、离线调试

### B. Docker 拓扑（标准环境）

- Client -> API Gateway -> Runtime + DB
- 适用：团队协作、预发环境

### C. 云端拓扑（运营环境）

- Client -> API Gateway(LB) -> 多实例 Runtime -> PostgreSQL/Redis/VectorDB
- 适用：线上运营、灰度、自动扩缩容

## 4) 运行自治能力（上线必备）

1. Runtime 心跳与健康检查
2. 自主策略热更新
3. 异常自动回滚
4. 自主修复日志与审计追踪

## 5) 最小上线清单（MVP Production Gate）

1. Desktop 与 iOS 都可安装
2. 至少一个标准部署模板可一键启动
3. 自治内核接口可观测（status/inbox/repair/tick）
4. 错误可恢复，不会因一次异常导致服务长期不可用
5. 安全与频率限制策略默认开启

## 6) 验证命令（当前）

```bash
cd /Users/bear/Desktop/Aria/Aria && bash scripts/run-desktop-demo.sh
cd /Users/bear/Desktop/Aria/Aria && bash scripts/run-mobile-demo.sh
cd /Users/bear/Desktop/Aria/Aria && bash scripts/run-autonomy-smoke.sh
```
