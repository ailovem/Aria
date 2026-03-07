import React from 'react';
import './Security.css';

const Security = () => {
    return (
        <section id="security" className="section security-section">
            <div className="container">

                <div className="text-center reveal">
                    <h2 className="section-title">记忆，由你掌控<br />企业级安全基准</h2>
                    <p className="subtitle">
                        把你的生活与秘密托付给 Aria，是最大的信任。我们从 Day 1 起将合规与隐私织入架构底层。
                    </p>
                </div>

                <div className="security-features reveal reveal-delay-2">

                    <div className="sec-feature">
                        <div className="sec-icon text-gradient-aria">✓</div>
                        <div className="sec-text">
                            <h3>记忆面板完全可视</h3>
                            <p>你可以随时查看 Aria 记住的偏好、习惯和重要纪念日，并一键清空或修正偏差记忆。</p>
                        </div>
                    </div>

                    <div className="sec-feature">
                        <div className="sec-icon text-gradient-aria">✓</div>
                        <div className="sec-text">
                            <h3>数据出口与授权开关</h3>
                            <p>不强行绑定。支持导出你的数字记忆，并可随时关闭敏感会话训练授权。</p>
                        </div>
                    </div>

                    <div className="sec-feature">
                        <div className="sec-icon text-gradient-aria">✓</div>
                        <div className="sec-text">
                            <h3>高风险动作二次确认</h3>
                            <p>桌面接管与自动化执行受“人工兜底”策略保护，涉及资金与关键删除操作必须再次确认。</p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Security;
