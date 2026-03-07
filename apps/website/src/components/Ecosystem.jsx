import React from 'react';
import './Ecosystem.css';

const Ecosystem = () => {
    return (
        <section id="ecosystem" className="section ecosystem-section">
            <div className="container text-center">

                <div className="reveal">
                    <h2 className="section-title">端云协同，网页只是入口之一</h2>
                    <p className="subtitle mx-auto">
                        Aria 从 Day 1 就按“客户端产品”构建。官网负责下载分发，
                        真正的体验发生在桌面端与移动端应用内。
                    </p>
                </div>

                <div className="platform-cards reveal reveal-delay-2">

                    <div className="platform-card glass-panel">
                        <div className="icon-wrapper">💻</div>
                        <h3>Desktop (Tauri 2)</h3>
                        <p>基于 Tauri 的高性能桌面应用，支持工作流自动化、任务执行回放与本地模式，强调“真执行、可追踪”。</p>
                    </div>

                    <div className="platform-card glass-panel">
                        <div className="icon-wrapper">📱</div>
                        <h3>iOS (Flutter)</h3>
                        <p>移动端聚焦陪伴和远程调度。语音与卡片指令可直接驱动桌面与云端任务，跨端协同一致。</p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Ecosystem;
