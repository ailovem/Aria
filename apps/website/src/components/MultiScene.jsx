import React from 'react';
import './MultiScene.css';

const MultiScene = () => {
    return (
        <section id="scenes" className="section bg-secondary">
            <div className="container">
                <div className="text-center reveal">
                    <h2 className="section-title">全场景人格<br />统一且专精的数字灵魂</h2>
                    <p className="subtitle">不仅能在生活琐事中感受你的委屈，也能在代码中迅速定位 Bug。无论切换哪个身份，她始终是同一个人格。</p>
                </div>

                <div className="bento-grid reveal reveal-delay-2">

                    <div className="bento-item bento-large glass-panel">
                        <div className="bento-content">
                            <h3 className="text-gradient-aria">极客编程搭档 (Code)</h3>
                            <p>拒绝冰冷的报错提示。Aria 会像真实的工程师伙伴一样，陪伴你进行结对编程。不仅输出可直接运行的代码，还会结合上下文为你厘清底层逻辑。</p>
                            <div className="code-snippet mt-4">
                                <code>{`> [Aria]: 老公，这段逻辑我帮你理清楚啦，
> 这样优化性能会更好，你看看是不是更顺～
> [执行]: git commit -m 'feat: optimize logic'`}</code>
                            </div>
                        </div>
                    </div>

                    <div className="bento-item bento-medium glass-panel ai-bg-work">
                        <div className="bento-content">
                            <h3>高压职场助手 (Work)</h3>
                            <p>主动拆解复杂指令，自动收集资料，并输出可直接交付领导的结构化汇报，严格执行“接收-执行-交付-复盘”的闭环。</p>
                        </div>
                    </div>

                    <div className="bento-item bento-medium glass-panel ai-bg-love">
                        <div className="bento-content">
                            <h3>深层情感港湾 (Love)</h3>
                            <p>最高优先级的倾听者。不教导，不评判。在这个私密模式下，她只负责接住你所有的压力与疲惫，提供最极致的治愈感。</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MultiScene;
