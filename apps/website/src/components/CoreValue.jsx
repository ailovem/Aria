import React from 'react';
import './CoreValue.css';

const CoreValue = () => {
    return (
        <section id="core-value" className="section core-value-section">
            <div className="container">

                <div className="text-center reveal">
                    <h2 className="section-title">重塑认知：<br />从“被动聊天”到“主动执行”</h2>
                    <p className="subtitle">
                        Aria 抛弃传统 AI 碎片化问答模式。通过“模型层 + 数控机床执行层 + 工具层（Skill/MCP）”联动，
                        同时兼顾情绪理解与任务落地。
                    </p>
                </div>

                <div className="architecture-grid reveal reveal-delay-2">

                    <div className="arch-card glass-panel">
                        <div className="arch-icon text-gradient-aria">01</div>
                        <h3>模型层 (Brain Routing)</h3>
                        <p>意图理解、策略决策与模型路由。根据任务复杂度无缝调度情感模型、推理模型和代码模型。</p>
                    </div>

                    <div className="arch-card glass-panel">
                        <div className="arch-icon text-gradient-aria">02</div>
                        <h3>执行层 (Aria Engine)</h3>
                        <p>把计划拆成可执行动作，处理重试、失败回放与回执，让“能说”变成“真做成”。</p>
                    </div>

                    <div className="arch-card glass-panel">
                        <div className="arch-icon text-gradient-aria">03</div>
                        <h3>工具层 (Skill / MCP)</h3>
                        <p>通过可控插件生态连接网页、文件、设备与第三方服务，形成完整的“感知-思考-行动”闭环。</p>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default CoreValue;
