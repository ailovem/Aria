import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="glow-orb glow-blue" style={{ top: '20%', left: '20%', width: '400px', height: '400px' }}></div>
            <div className="glow-orb glow-purple" style={{ bottom: '10%', right: '20%', width: '300px', height: '300px' }}></div>

            <div className="container hero-content">
                <h1 className="reveal reveal-delay-1">
                    Aria. <br />
                    <span className="text-gradient">可下载、可执行的 AI 伴侣。</span>
                </h1>
                <p className="subtitle reveal reveal-delay-2">
                    不是单一网页聊天框。Aria 是一款可安装客户端，具备情感陪伴、自动化执行与多场景任务闭环能力。
                    一次下载，桌面端和移动端统一体验。
                </p>
                <div className="hero-badges reveal reveal-delay-2">
                    <span className="hero-badge">桌面客户端</span>
                    <span className="hero-badge">自动化引擎</span>
                    <span className="hero-badge">情感陪伴</span>
                </div>
                <div className="hero-actions reveal reveal-delay-3">
                    <a href="#download" className="btn-primary">下载客户端</a>
                    <a href="#deploy" className="btn-secondary">查看部署模式 <span>→</span></a>
                </div>

                <div className="hero-image-placeholder reveal reveal-delay-3">
                    {/* Abstract visualization of multi-platform sync */}
                    <div className="platform-mockup glass-panel">
                        <div className="mockup-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="mockup-body">
                            <div className="code-line">Aria Desktop Booting...</div>
                            <div className="code-line">Mode: Cloud Standard / Local Docker</div>
                            <div className="code-line highlight">Connected: Desktop (Tauri) + Mobile (Flutter)</div>
                            <div className="code-line">Status: Ready for companion + automation.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
