import React from 'react';
import './QuickStart30s.css';

const QUICKSTART_STEPS = [
    {
        id: 'step-1',
        time: '00-10s',
        title: '第 1 步：先说一句现在的你',
        subtitle: '情绪接住 + 真人回复',
        desc: '用一句自然的话说出你的状态，Aria 会先接住情绪，再给可执行建议。',
        visual: '/quickstart/step-empathy.svg',
        bullets: [
            '不用写指令，像聊天一样说就行',
            '回复不走固定模板，先共情再推进',
            '3 秒内进入连续对话状态'
        ]
    },
    {
        id: 'step-2',
        time: '10-20s',
        title: '第 2 步：把目标变成可执行任务',
        subtitle: '目标拆解 + 进度可视',
        desc: '输入一个目标，Aria 立刻拆成步骤、节奏和回执，让你看到真实推进感。',
        visual: '/quickstart/step-planning.svg',
        bullets: [
            '一键生成今日执行清单',
            '每步有状态，完成后即时反馈',
            '卡住时自动给下一步建议'
        ]
    },
    {
        id: 'step-3',
        time: '20-30s',
        title: '第 3 步：授权后直接做事',
        subtitle: '授权执行 + 全链路回放',
        desc: '允许设备能力后，Aria 可以直接执行动作，并把过程和结果完整回放给你。',
        visual: '/quickstart/step-execution.svg',
        bullets: [
            '可授权、可执行、可追踪',
            '每次执行都有日志与结果',
            '异常时自动走安全回退路径'
        ]
    }
];

const QuickStart30s = () => {
    return (
        <section id="quickstart" className="section quickstart-section">
            <div className="container">
                <div className="quickstart-head reveal">
                    <p className="quickstart-eyebrow">开箱即用</p>
                    <h2 className="quickstart-title">
                        30 秒图文上手，<span className="text-gradient-aria">打开就会用</span>
                    </h2>
                    <p className="subtitle quickstart-subtitle">
                        从“先聊一句”到“真实执行”，3 步 30 秒完整体验 Aria 的陪伴力和执行力。
                    </p>
                    <div className="quickstart-meter" aria-label="30秒上手进度">
                        <span>10s</span>
                        <span>20s</span>
                        <span>30s</span>
                    </div>
                </div>

                <div className="quickstart-grid">
                    {QUICKSTART_STEPS.map((step, index) => (
                        <article key={step.id} className={`quickstart-card glass-panel reveal reveal-delay-${Math.min(3, index + 1)}`}>
                            <div className="quickstart-visual-wrap">
                                <img src={step.visual} alt={step.subtitle} className="quickstart-visual" loading="lazy" />
                                <div className="quickstart-time">{step.time}</div>
                            </div>
                            <div className="quickstart-copy">
                                <p className="quickstart-kicker">{step.subtitle}</p>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                                <ul>
                                    {step.bullets.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="quickstart-cta reveal reveal-delay-3">
                    <a href="#download" className="btn-primary">立即下载客户端</a>
                    <a href="#core-value" className="btn-secondary">查看核心架构 <span>→</span></a>
                </div>
            </div>
        </section>
    );
};

export default QuickStart30s;
