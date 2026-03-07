import React from 'react';
import './ActionModules.css';

const ActionModules = () => {
    return (
        <section id="action" className="section">
            <div className="container">
                <div className="text-center reveal">
                    <h2 className="section-title">全场景覆盖<br />你的每一寸生活</h2>
                    <p className="subtitle">它不仅存在于屏幕背后，它接管你的工作流、自动化你的桌面，成为你得力的数字分身。</p>
                </div>

                <div className="bento-grid reveal reveal-delay-2">

                    <div className="bento-item bento-large glass-panel">
                        <div className="bento-content">
                            <h3>工作辅助模块</h3>
                            <p>对接飞书、企微等工具，自动生成会议纪要。如果你是开发者，它能深度理解上下文，提供智能代码辅助补全，加速你的研发闭环。</p>
                            <div className="code-snippet mt-4">
                                <code>{`// Aria 正在接管桌面...\nconst implementFeature = await aria.analyze(repo);`}</code>
                            </div>
                        </div>
                    </div>

                    <div className="bento-item bento-medium glass-panel" style={{ background: 'linear-gradient(to bottom right, rgba(10,132,255,0.1), rgba(0,0,0,0))' }}>
                        <div className="bento-content">
                            <h3>创作者生态</h3>
                            <p>批量生成小红书脚本，自动化运营。让“想赚钱”的创意低门槛落地。</p>
                        </div>
                    </div>

                    <div className="bento-item bento-small glass-panel">
                        <div className="bento-content">
                            <h3>家庭中控</h3>
                            <p>对接父母的智能设备，无缝感知并协助。</p>
                        </div>
                    </div>

                    <div className="bento-item bento-small glass-panel">
                        <div className="bento-content">
                            <h3>云端协同</h3>
                            <p>多端数据实时互通，PC与App无缝切换。</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ActionModules;
