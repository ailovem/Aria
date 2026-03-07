import React from 'react';
import './CoreLoop.css';

const CoreLoop = () => {
    return (
        <section id="brain" className="section core-loop-section">
            <div className="container">
                <div className="text-center reveal">
                    <h2 className="section-title">独特的「大脑+腿脚」闭环</h2>
                    <p className="subtitle">
                        不仅仅是聊天。Aria 将强大的认知中枢与场景化执行模块无缝连接。
                    </p>
                </div>

                <div className="loop-diagram reveal reveal-delay-2">
                    <div className="loop-node brain-node glass-panel">
                        <h3>个人智能中枢</h3>
                        <p>外脑模型调度 / 自主学习进化 / 长短期记忆库</p>
                    </div>

                    <div className="loop-arrow">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                    </div>

                    <div className="loop-node legs-node glass-panel">
                        <h3>场景化执行模块</h3>
                        <p>自动化办公 / 智能家居接管 / 电商内容分发</p>
                    </div>
                </div>

                <div className="features-grid text-left reveal reveal-delay-3">
                    <div className="feature-block">
                        <h4 className="text-gradient-aria">情商架构 (EQ)</h4>
                        <p>能够感知用户情绪状态，动态调整沟通的情感侧重点。当你疲倦时递上一句慰问，让你感受始终如一的陪伴。</p>
                    </div>
                    <div className="feature-block">
                        <h4 className="text-gradient-aria">智商架构 (IQ)</h4>
                        <p>从指令分析到多模型路由调度，Aria 懂得如何切分复杂任务，甚至自主处理异常，确保高效可靠的执行。</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoreLoop;
