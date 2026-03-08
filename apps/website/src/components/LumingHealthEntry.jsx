import React from 'react';
import './LumingHealthEntry.css';

const PRODUCT_ANGLES = [
    {
        title: 'AI 数字父母',
        description: '为家庭提供可持续的陪伴副本，覆盖日常问候、健康提醒、生活经验传承与情感回应。'
    },
    {
        title: '临终关怀',
        description: '通过心理支持、愿望记录、家庭协同和哀伤陪伴流程，辅助构建有尊严的告别支持服务。'
    },
    {
        title: '老年心理健康与数字康养',
        description: '以情绪监测、认知训练、社交激活和风险预警组合，形成长期可运营的数字康养体系。'
    }
];

const LumingHealthEntry = () => {
    return (
        <section id="luming-health" className="section luming-entry-section">
            <div className="luming-glow luming-glow-left" />
            <div className="luming-glow luming-glow-right" />

            <div className="container">
                <div className="luming-entry-head reveal">
                    <p className="luming-eyebrow">认证展示栏目</p>
                    <h2>
                        鹿鸣健康·<span className="text-gradient-warm">数字父母</span>
                    </h2>
                    <p className="subtitle luming-subtitle">
                        面向认证与合作展示，Aria 官网已新增“鹿鸣健康·数字父母”入口，聚焦 AI 数字父母、临终关怀与老年心理健康数字康养三大方向。
                    </p>
                </div>

                <div className="luming-entry-grid">
                    <article className="luming-card glass-panel reveal reveal-delay-1">
                        <h3>产品开发文档视角</h3>
                        <ul>
                            {PRODUCT_ANGLES.map((item) => (
                                <li key={item.title}>
                                    <strong>{item.title}</strong>
                                    <p>{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="luming-card glass-panel reveal reveal-delay-2">
                        <h3>创立主体与发起人</h3>
                        <p>
                            由 <strong>北京蓝色壹路技术有限公司</strong> 创立，发起人 <strong>董道宽</strong>，具备数十年医药健康行业从业与产业协作经验。
                        </p>
                        <p className="luming-note">
                            文档版式采用“产品定位 + 功能架构 + 合规边界 + 实施路径 + 认证指标”结构，可直接用于对外介绍与认证材料补充。
                        </p>
                        <p className="luming-cert">
                            已整合证书备案字段：药品医疗器械网络信息服务备案（备案编号：(京)网药械信息备字（2021）第00169号）。
                        </p>
                        <div className="luming-actions">
                            <a className="btn-primary" href="/luming-health.html">
                                打开认证开发文档
                            </a>
                            <a className="btn-secondary" href="#security">
                                查看隐私与合规能力 <span>→</span>
                            </a>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default LumingHealthEntry;
