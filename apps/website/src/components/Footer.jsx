import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            borderTop: '1px solid var(--glass-border)',
            padding: '4rem 0',
            textAlign: 'center',
            color: 'var(--text-secondary)'
        }}>
            <div className="container">
                <h2 className="text-gradient-aria" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Aria.</h2>
                <p style={{ fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
                    可下载、可部署、可持续进化的 AI 伴侣。既有高情商陪伴，也有高可靠自动化执行。
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.85rem' }}>
                    <a href="#quickstart" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>30秒上手</a>
                    <a href="#download" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>下载中心</a>
                    <a href="#deploy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>部署模式</a>
                    <a href="/changelog.html" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>更新日志</a>
                    <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>隐私与合规</a>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '3rem', opacity: 0.5 }}>© 2026 Aria Intelligence. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
