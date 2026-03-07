import React, { useEffect, useMemo, useState } from 'react';
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

const STEP_DURATION_MS = 10000;
const PLAYER_TICK_MS = 100;
const TOTAL_DURATION_MS = QUICKSTART_STEPS.length * STEP_DURATION_MS;

const QuickStart30s = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [elapsedInStep, setElapsedInStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const activeStep = QUICKSTART_STEPS[activeIndex];
    const elapsedTotalMs = Math.min(TOTAL_DURATION_MS, activeIndex * STEP_DURATION_MS + elapsedInStep);
    const totalProgress = Math.min(100, Math.round((elapsedTotalMs / TOTAL_DURATION_MS) * 100));
    const stepProgress = Math.min(100, Math.round((elapsedInStep / STEP_DURATION_MS) * 100));
    const remainingSeconds = Math.max(0, Math.ceil((TOTAL_DURATION_MS - elapsedTotalMs) / 1000));
    const isAtLastStep = activeIndex >= QUICKSTART_STEPS.length - 1;
    const isPlaybackEnded = isAtLastStep && elapsedInStep >= STEP_DURATION_MS;

    useEffect(() => {
        if (!isPlaying) return;
        const timer = window.setInterval(() => {
            setElapsedInStep((prev) => {
                const next = prev + PLAYER_TICK_MS;
                if (next < STEP_DURATION_MS) {
                    return next;
                }
                if (isAtLastStep) {
                    setIsPlaying(false);
                    return STEP_DURATION_MS;
                }
                setActiveIndex((idx) => Math.min(idx + 1, QUICKSTART_STEPS.length - 1));
                return 0;
            });
        }, PLAYER_TICK_MS);
        return () => window.clearInterval(timer);
    }, [isPlaying, isAtLastStep]);

    const playbackLabel = useMemo(() => {
        if (isPlaying) {
            return '自动播放中';
        }
        if (isPlaybackEnded) {
            return '播放完成';
        }
        return '已暂停';
    }, [isPlaying, isPlaybackEnded]);

    const selectStep = (index) => {
        setActiveIndex(index);
        setElapsedInStep(0);
    };

    const handleTogglePlayback = () => {
        if (isPlaying) {
            setIsPlaying(false);
            return;
        }
        if (isPlaybackEnded) {
            setActiveIndex(0);
            setElapsedInStep(0);
        }
        setIsPlaying(true);
    };

    const handlePrevStep = () => {
        if (activeIndex <= 0) return;
        setActiveIndex((prev) => Math.max(0, prev - 1));
        setElapsedInStep(0);
    };

    const handleNextStep = () => {
        if (activeIndex >= QUICKSTART_STEPS.length - 1) return;
        setActiveIndex((prev) => Math.min(QUICKSTART_STEPS.length - 1, prev + 1));
        setElapsedInStep(0);
    };

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
                    <div className="quickstart-meter" aria-label="30秒自动引导进度">
                        <div className="quickstart-meter-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={totalProgress}>
                            <span className="quickstart-meter-fill" style={{ width: `${totalProgress}%` }} />
                        </div>
                        <div className="quickstart-meter-meta">
                            <span>{playbackLabel}</span>
                            <span>剩余 {remainingSeconds}s</span>
                        </div>
                    </div>
                </div>

                <div className="quickstart-player reveal reveal-delay-1">
                    <div className="quickstart-tabs" role="tablist" aria-label="30秒上手步骤">
                        {QUICKSTART_STEPS.map((step, index) => (
                            <button
                                key={step.id}
                                type="button"
                                role="tab"
                                aria-selected={index === activeIndex}
                                className={`quickstart-tab ${index === activeIndex ? 'is-active' : ''}`}
                                onClick={() => selectStep(index)}
                            >
                                <span className="quickstart-tab-time">{step.time}</span>
                                <span className="quickstart-tab-title">步骤 {index + 1}</span>
                                <span className="quickstart-tab-progress">
                                    <i
                                        style={{
                                            width: `${
                                                index < activeIndex
                                                    ? 100
                                                    : index === activeIndex
                                                        ? stepProgress
                                                        : 0
                                            }%`
                                        }}
                                    />
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="quickstart-player-controls">
                        <button type="button" className="quickstart-control-btn" onClick={handlePrevStep} disabled={activeIndex <= 0}>
                            上一步
                        </button>
                        <button type="button" className="quickstart-control-btn quickstart-control-main" onClick={handleTogglePlayback}>
                            {isPlaying ? '暂停播放' : (isPlaybackEnded ? '重新播放30秒' : '继续播放')}
                        </button>
                        <button type="button" className="quickstart-control-btn" onClick={handleNextStep} disabled={activeIndex >= QUICKSTART_STEPS.length - 1}>
                            下一步
                        </button>
                    </div>
                </div>

                <div className="quickstart-stage reveal reveal-delay-2" aria-live="polite">
                    {QUICKSTART_STEPS.map((step, index) => (
                        <article
                            key={step.id}
                            className={`quickstart-card glass-panel ${index === activeIndex ? 'is-active' : ''}`}
                            aria-hidden={index !== activeIndex}
                        >
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

                <p className="quickstart-active-note reveal reveal-delay-3">
                    当前播放：{activeStep.title}
                </p>

                <div className="quickstart-cta reveal reveal-delay-3">
                    <a href="#download" className="btn-primary">立即下载客户端</a>
                    <a href="#core-value" className="btn-secondary">查看核心架构 <span>→</span></a>
                </div>
            </div>
        </section>
    );
};

export default QuickStart30s;
