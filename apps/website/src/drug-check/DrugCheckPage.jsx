import React from 'react';
import DrugLookupExperience from '../components/DrugLookupExperience';
import './DrugCheckPage.css';

const DrugCheckPage = () => {
    return (
        <main className="drug-check-page">
            <div className="drug-check-shell">
                <header className="drug-check-topbar">
                    <div className="drug-check-brand">
                        <span className="drug-check-brand-mark">鹿鸣健康</span>
                        <strong className="drug-check-brand-title">药品查查</strong>
                    </div>

                    <p className="drug-check-topbar-note">日常用药查询页</p>
                </header>

                <section className="drug-check-hero">
                    <div className="drug-check-hero-copy">
                        <p className="drug-check-kicker">家庭常用药查询</p>
                        <h1>输入药名，先看得懂，再决定下一步</h1>
                        <p>
                            页面聚焦在用户真正需要的信息上：先看中文速览，再按需要继续打开完整说明和补充资料。
                        </p>
                    </div>

                    <div className="drug-check-hero-tags" aria-label="页面特点">
                        <span>简明直观</span>
                        <span>适合家属使用</span>
                        <span>减少无关信息</span>
                    </div>
                </section>

                <DrugLookupExperience />
            </div>
        </main>
    );
};

export default DrugCheckPage;
