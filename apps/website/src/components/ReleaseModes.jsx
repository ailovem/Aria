import React from 'react';
import './ReleaseModes.css';

const releaseModes = [
  {
    title: '标准云端版（推荐大多数用户）',
    detail: '安装客户端后直接连接云端 API，开箱即用，自动更新快，适合追求省心体验。',
    badge: 'Cloud Ready'
  },
  {
    title: '本地隐私版（Docker Runtime）',
    detail: '通过 Docker 启动本地 API 容器，桌面端连本机地址，适合对数据边界和离线能力有要求的用户。',
    badge: 'Privacy Mode'
  },
  {
    title: '企业自部署版',
    detail: '支持私有网络部署与权限治理，结合组织内 SSO、审计与运维策略，满足合规要求。',
    badge: 'Enterprise'
  }
];

const ReleaseModes = () => {
  return (
    <section id="deploy" className="section release-section">
      <div className="container">
        <div className="text-center reveal">
          <h2 className="section-title">同一套客户端，三种发布模式</h2>
          <p className="subtitle">
            你可以从云端快速起步，也可以切到本地或企业自部署。
            Aria 的目标是“统一体验 + 灵活部署”，而不是把用户锁在网页里。
          </p>
        </div>

        <div className="release-grid reveal reveal-delay-2">
          {releaseModes.map((item) => (
            <article key={item.title} className="release-card glass-panel">
              <span className="release-badge">{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="release-command glass-panel reveal reveal-delay-3">
          <p className="release-command-title">本地 Docker 模式示例</p>
          <pre>bash scripts/deploy-local-api.sh</pre>
        </div>
      </div>
    </section>
  );
};

export default ReleaseModes;
