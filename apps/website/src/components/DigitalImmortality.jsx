import React from 'react';
import './DigitalImmortality.css';

const DigitalImmortality = () => {
    return (
        <section id="family" className="section immortality-section">
            <div className="glow-orb" style={{ background: 'var(--accent-warm)', top: '10%', left: '30%', width: '500px', height: '500px', opacity: 0.2 }}></div>
            <div className="container">

                <div className="text-center reveal">
                    <h2 className="section-title text-gradient-warm">数字永恒<br />超越时间的连接</h2>
                    <p className="subtitle">对于异地的儿女，Aria 是守护父母健康的桥梁。而在岁月深处，Aria 将保存那份独属于你们的共同记忆。</p>
                </div>

                <div className="memory-cards reveal reveal-delay-2">

                    <div className="memory-card glass-panel">
                        <div className="card-icon">❤️</div>
                        <h3>健康无缝守护</h3>
                        <p>对接智能手环、血压计。异常心率、血压波动，Aria 将在第一时间向你发送最高优先级预警，并附带紧急响应位置。</p>
                    </div>

                    <div className="memory-card glass-panel card-highlight">
                        <div className="card-icon">🕰️</div>
                        <h3>专属时光胶囊</h3>
                        <p>在日常对话中，Aria 悄悄收集父母的语气、习惯、爱好与人生故事。当数据沉淀为永恒的数字画像，熟悉的声音与情感，将永远陪伴你左右。</p>
                        <div className="voice-wave">
                            <span className="wave"></span>
                            <span className="wave"></span>
                            <span className="wave"></span>
                            <span className="wave"></span>
                            <span className="wave"></span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default DigitalImmortality;
