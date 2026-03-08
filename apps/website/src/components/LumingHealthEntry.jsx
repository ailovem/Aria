import React, { useMemo, useState } from 'react';
import './LumingHealthEntry.css';

const DRUG_AI_ENDPOINT = (import.meta.env.VITE_DRUG_AI_ENDPOINT || '').trim();
const DRUG_AI_MODEL = (import.meta.env.VITE_DRUG_AI_MODEL || 'deepseek-v3').trim();
// OpenFDA 不支持 CORS，需经代理。配置 VITE_DRUG_FDA_PROXY 指向 Aria API（如 http://localhost:8787），否则使用公共 CORS 代理
const DRUG_FDA_PROXY = (import.meta.env.VITE_DRUG_FDA_PROXY || '').trim();

const LUMING_ENTRIES = [
    {
        id: 'digital-parent',
        name: 'AI 数字父母',
        tag: '入口 01',
        summary: '建立可陪伴、可记录、可协同的家庭级支持入口，让长者每天都有人回应。',
        features: [
            '家庭记忆体：沉淀个人经历、偏好、价值观与沟通语气。',
            '日常陪伴体：日历提醒、健康问候、节律引导、语音互动。',
            '家属协同体：异地子女实时接收摘要回执，提升照护一致性。'
        ],
        demoPrompts: [
            {
                input: '我妈妈最近总忘记吃药，晚上睡眠也变差。',
                output: '已生成 7 天陪伴计划：早晚提醒 + 睡前放松建议 + 每晚家属回执。若连续 3 天睡眠差，将自动触发家属提醒。'
            },
            {
                input: '帮我安排一个“每天固定问候 + 每周视频关怀”流程。',
                output: '流程已配置：每天 08:30 语音问候，每周六 20:00 发起家庭视频提醒，并输出周报给家属。'
            },
            {
                input: '爸爸今天心情一般，不想说太多。',
                output: '已切换低压力沟通模式：短句陪伴 + 回忆话题引导 + 不追问策略，优先稳定情绪。'
            }
        ],
        links: [
            { label: 'WHO：Ageing', url: 'https://www.who.int/health-topics/ageing' },
            { label: 'WHO：Mental health of older adults', url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-of-older-adults' }
        ],
        disclaimer: '体验内容为产品演示，不替代医疗建议。'
    },
    {
        id: 'end-of-life',
        name: '临终关怀支持',
        tag: '入口 02',
        summary: '围绕愿望记录、家庭沟通与哀伤支持流程，提供有边界、有温度的数字化支持。',
        features: [
            '心愿记录与人生回顾：保留可传承的家庭记忆和留言。',
            '家属沟通节奏：提供阶段性话题建议与情绪缓冲提示。',
            '敏感场景人工优先：避免冷硬自动化，保留人工介入机制。'
        ],
        demoPrompts: [
            {
                input: '我们想整理长辈最想留给家人的三件事。',
                output: '已生成“生命回顾卡”：人生节点、家风寄语、未竟心愿，并支持家庭成员协作补充。'
            },
            {
                input: '家属沟通容易争执，想有个更平和的流程。',
                output: '已配置沟通节奏模板：先事实同步，再情绪表达，最后行动清单，减少冲突和重复讨论。'
            },
            {
                input: '希望每次沟通后都有记录，避免遗漏。',
                output: '已开启会后摘要：关键决定、待办事项、下次沟通时间点自动归档。'
            }
        ],
        links: [
            { label: 'WHO：Palliative care', url: 'https://www.who.int/news-room/fact-sheets/detail/palliative-care' },
            { label: 'MedlinePlus：End of Life Issues', url: 'https://medlineplus.gov/endoflifeissues.html' }
        ],
        disclaimer: '本入口不替代临床诊疗与精神科治疗，高风险情况需转接专业机构。'
    },
    {
        id: 'mental-health',
        name: '老年心理健康',
        tag: '入口 03',
        summary: '通过情绪识别、认知激活与社交触达，形成“评估-干预-追踪-复盘”的长期闭环。',
        features: [
            '情绪状态识别：基于互动文本和行为节律识别趋势信号。',
            '认知与社交激活：回忆任务、轻互动、亲友联动促进活跃。',
            '预警协同机制：出现持续低落或孤立迹象时通知家属。'
        ],
        demoPrompts: [
            {
                input: '我外婆最近明显不爱说话，社交变少了。',
                output: '建议先启用“轻社交激活包”：每日 1 个回忆话题 + 每周 2 次亲友互动提醒，并追踪 14 天变化。'
            },
            {
                input: '能不能帮我判断她是不是情绪持续低落？',
                output: '系统将按 7 天窗口给出趋势等级，并在连续低活跃时推送家属关注提醒。'
            },
            {
                input: '有没有适合老人的简单认知训练？',
                output: '已生成低负担训练清单：词语回忆、日程复述、图片联想，每日 10 分钟。'
            }
        ],
        links: [
            { label: 'WHO：Mental health of older adults', url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-of-older-adults' },
            { label: 'MedlinePlus：Mental Health', url: 'https://medlineplus.gov/mentalhealth.html' }
        ],
        disclaimer: '情绪评估为辅助判断，不构成医疗诊断结论。'
    },
    {
        id: 'family-collab',
        name: '家属协同中心',
        tag: '入口 04',
        summary: '为异地子女与照护者提供同一任务视图、统一回执和多角色协作流程。',
        features: [
            '多角色协作：子女、照护者、服务方共享任务与回执。',
            '照护共识板：统一目标、责任与时间点，降低沟通成本。',
            '异常升级链路：连续异常触发二次提醒和人工复核。'
        ],
        demoPrompts: [
            {
                input: '我和弟弟在外地，希望共享爸妈的照护进度。',
                output: '已创建家庭协同看板：每日状态、提醒完成率、风险记录，默认每晚 21:00 汇总。'
            },
            {
                input: '请给我们一个分工模板，避免重复做事。',
                output: '已生成分工建议：医疗陪诊、药品补给、情绪陪伴三线并行，按周轮值。'
            },
            {
                input: '如果 48 小时没人回应提醒怎么办？',
                output: '已配置升级路径：二次通知 -> 备用联系人 -> 人工客服复核。'
            }
        ],
        links: [
            { label: 'WHO：Integrated care for older people', url: 'https://www.who.int/publications/i/item/WHO-FWC-ALC-19.1' },
            { label: 'WHO：Ageing and health', url: 'https://www.who.int/news-room/fact-sheets/detail/ageing-and-health' }
        ],
        disclaimer: '协同中心用于家庭照护管理，不替代应急医疗系统。'
    },
    {
        id: 'service-connect',
        name: '康养服务连接',
        tag: '入口 05',
        summary: '打通社区、康养机构与志愿者服务资源，形成从识别需求到服务落地的闭环。',
        features: [
            '服务清单标准化：按需求类型匹配可执行服务项。',
            '机构/社区协同：支持服务任务派发、回执与复盘。',
            '跨域连接能力：承接医药险融合与本地健康服务体系。'
        ],
        demoPrompts: [
            {
                input: '想把上门照护、药店配送、心理关怀串起来。',
                output: '已生成联合服务工单：需求拆解、服务方分配、SLA 时限与反馈模板。'
            },
            {
                input: '能否按紧急程度自动排优先级？',
                output: '已启用三级优先策略：高风险 2 小时内响应，中风险 24 小时内回执，常规服务按周计划。'
            },
            {
                input: '我需要每月复盘服务效果。',
                output: '已开启月度复盘：响应时长、闭环率、满意度和风险事件全量可视化。'
            }
        ],
        links: [
            { label: 'WHO：Ageing and health', url: 'https://www.who.int/news-room/fact-sheets/detail/ageing-and-health' },
            { label: 'WHO：Integrated care for older people', url: 'https://www.who.int/publications/i/item/WHO-FWC-ALC-19.1' }
        ],
        disclaimer: '服务连接能力依赖合作方接入进度，部分地区功能会分阶段上线。'
    },
    {
        id: 'drug-check',
        name: '药品查查',
        tag: '入口 06',
        summary: '基于公开药品标签数据提供查询入口，支持药品名检索、用途摘要和公开来源跳转。',
        features: [
            '查询输入框：支持英文商品名或通用名检索。',
            '公开数据聚合：显示品牌名、通用名、厂家与用途摘要。',
            'AI 封装预留：支持配置 DeepSeek-V3 封装接口做二次解读。'
        ],
        links: [
            { label: 'OpenFDA Drug Label API', url: 'https://open.fda.gov/apis/drug/label/' },
            { label: 'FDA openfda（GitHub）', url: 'https://github.com/FDA/openfda' },
            { label: 'DeepSeek-V3（GitHub）', url: 'https://github.com/deepseek-ai/DeepSeek-V3' },
            { label: 'DailyMed 查询', url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm' }
        ],
        disclaimer: '药品查查用于公开信息检索与科普，不构成用药医嘱。'
    }
];

const formatSnippet = (value) => String(value || '').replace(/\s+/g, ' ').trim();

// OpenFDA 仅支持英文搜索，常用中文药品名映射到英文通用名
const DRUG_ZH_TO_EN = {
    阿司匹林: 'aspirin',
    布洛芬: 'ibuprofen',
    对乙酰氨基酚: 'acetaminophen',
    扑热息痛: 'acetaminophen',
    泰诺: 'acetaminophen',
    维生素c: 'ascorbic acid',
    维生素C: 'ascorbic acid',
    维他命c: 'ascorbic acid',
    阿莫西林: 'amoxicillin',
    头孢: 'cephalexin',
    头孢氨苄: 'cephalexin',
    甲硝唑: 'metronidazole',
    奥美拉唑: 'omeprazole',
    雷贝拉唑: 'rabeprazole',
    埃索美拉唑: 'esomeprazole',
    二甲双胍: 'metformin',
    阿卡波糖: 'acarbose',
    格列美脲: 'glimepiride',
    瑞格列奈: 'repaglinide',
    辛伐他汀: 'simvastatin',
    阿托伐他汀: 'atorvastatin',
    硝苯地平: 'nifedipine',
    氨氯地平: 'amlodipine',
    氯沙坦: 'losartan',
    缬沙坦: 'valsartan',
    氯雷他定: 'loratadine',
    西替利嗪: 'cetirizine',
    地氯雷他定: 'desloratadine',
    孟鲁司特: 'montelukast',
};

const normalizeDrugResults = (results) => {
    if (!Array.isArray(results)) return [];
    return results.slice(0, 5).map((item, index) => {
        const openfda = item.openfda || {};
        const brand = openfda.brand_name?.[0] || `结果 ${index + 1}`;
        const generic = openfda.generic_name?.[0] || '未提供';
        const manufacturer = openfda.manufacturer_name?.[0] || '未提供';
        const usageRaw = item.indications_and_usage?.[0] || item.purpose?.[0] || item.description?.[0] || '未提供用途说明';
        return {
            brand,
            generic,
            manufacturer,
            usage: formatSnippet(usageRaw).slice(0, 180)
        };
    });
};

const resolveApiError = async (response) => {
    try {
        const payload = await response.json();
        return payload?.error?.message || `查询失败（HTTP ${response.status}）`;
    } catch {
        return `查询失败（HTTP ${response.status}）`;
    }
};

const LumingHealthEntry = () => {
    const [activeEntryId, setActiveEntryId] = useState(LUMING_ENTRIES[0].id);
    const [activePromptIndex, setActivePromptIndex] = useState(0);
    const [drugKeyword, setDrugKeyword] = useState('');
    const [drugLoading, setDrugLoading] = useState(false);
    const [drugError, setDrugError] = useState('');
    const [drugResults, setDrugResults] = useState([]);
    const [drugInsight, setDrugInsight] = useState('');
    const [drugInsightLoading, setDrugInsightLoading] = useState(false);
    const [drugInsightError, setDrugInsightError] = useState('');

    const activeEntry = useMemo(
        () => LUMING_ENTRIES.find((item) => item.id === activeEntryId) || LUMING_ENTRIES[0],
        [activeEntryId]
    );

    const activePrompt = activeEntry.demoPrompts?.[activePromptIndex];

    const handleSelectEntry = (entryId) => {
        setActiveEntryId(entryId);
        setActivePromptIndex(0);
        setDrugError('');
        setDrugResults([]);
        setDrugInsight('');
        setDrugInsightError('');
    };

    const handleDrugSearch = async (event) => {
        event.preventDefault();
        let keyword = formatSnippet(drugKeyword);
        if (!keyword) {
            setDrugError('请输入药品名（支持中文或英文），例如 阿司匹林 / aspirin。');
            setDrugResults([]);
            return;
        }
        // OpenFDA 不支持中文，将常用中文药品名映射到英文
        const keyNorm = keyword.replace(/\s+/g, '');
        const mapped = DRUG_ZH_TO_EN[keyword] || DRUG_ZH_TO_EN[keyNorm] || DRUG_ZH_TO_EN[keyword.toLowerCase?.()] || DRUG_ZH_TO_EN[keyNorm.toLowerCase?.()];
        if (mapped) keyword = mapped;

        setDrugLoading(true);
        setDrugError('');
        setDrugInsight('');
        setDrugInsightError('');
        setDrugResults([]);

        try {
            const query = encodeURIComponent(`openfda.brand_name:"${keyword}"+openfda.generic_name:"${keyword}"`);
            const fdaUrl = `https://api.fda.gov/drug/label.json?search=${query}&limit=5`;
            let response;
            if (DRUG_FDA_PROXY) {
                response = await fetch(
                    `${DRUG_FDA_PROXY.replace(/\/$/, '')}/v1/public/drug/label?search=${encodeURIComponent(`openfda.brand_name:"${keyword}"+openfda.generic_name:"${keyword}"`)}&limit=5`
                );
            } else {
                response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fdaUrl)}`);
            }
            const rawText = await response.text();
            let payload;
            try {
                payload = JSON.parse(rawText);
            } catch {
                throw new Error('药品数据解析失败，请稍后重试。');
            }
            if (payload?.error?.message) {
                const msg = payload.error.message;
                if (/search not supported/i.test(msg) || /invalid.*search/i.test(msg)) {
                    throw new Error('当前关键词暂不支持，请尝试英文名如 aspirin（阿司匹林）、ibuprofen（布洛芬）。');
                }
                throw new Error(msg);
            }
            if (DRUG_FDA_PROXY && !response.ok) {
                throw new Error(payload?.error?.message || `查询失败（HTTP ${response.status}）`);
            }
            const nextResults = normalizeDrugResults(payload?.results);
            if (!nextResults.length) {
                setDrugError('未查到公开标签数据，可尝试英文通用名或换一个关键词。');
                return;
            }
            setDrugResults(nextResults);
        } catch (error) {
            setDrugError(error?.message || '药品查询失败，请稍后重试。');
        } finally {
            setDrugLoading(false);
        }
    };

    const handleDrugInsight = async () => {
        setDrugInsight('');
        setDrugInsightError('');

        if (!drugResults.length) {
            setDrugInsightError('请先完成药品查询，再生成 AI 解读。');
            return;
        }

        if (!DRUG_AI_ENDPOINT) {
            setDrugInsightError('未配置 VITE_DRUG_AI_ENDPOINT，当前仅启用公开数据检索模式。');
            return;
        }

        setDrugInsightLoading(true);
        try {
            const response = await fetch(DRUG_AI_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: DRUG_AI_MODEL,
                    keyword: formatSnippet(drugKeyword),
                    items: drugResults
                })
            });
            if (!response.ok) {
                throw new Error(await resolveApiError(response));
            }
            const payload = await response.json();
            const summary = formatSnippet(payload?.summary || payload?.result || payload?.content);
            if (!summary) {
                setDrugInsightError('AI 接口已返回，但没有可展示的解读内容。');
                return;
            }
            setDrugInsight(summary);
        } catch (error) {
            setDrugInsightError(error?.message || 'AI 解读失败，请检查接口配置。');
        } finally {
            setDrugInsightLoading(false);
        }
    };

    const dailyMedLink = `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(formatSnippet(drugKeyword) || 'aspirin')}`;

    return (
        <section id="luming-health" className="section luming-entry-section">
            <div className="luming-glow luming-glow-left" />
            <div className="luming-glow luming-glow-right" />

            <div className="container">
                <div className="luming-entry-head reveal">
                    <p className="luming-eyebrow">鹿鸣健康 · 数字康养</p>
                    <h2>
                        AI 数字父母 + 临终关怀 + 心理健康 <span className="text-gradient-warm">一体化入口</span>
                    </h2>
                    <p className="subtitle luming-subtitle">
                        鹿鸣健康·数字父母基于 Aria 能力框架，面向银发家庭提供“可陪伴、可记录、可协同、可持续”的数字康养服务能力。
                    </p>
                </div>

                <div className="luming-intro-grid reveal reveal-delay-1">
                    <article className="luming-card glass-panel">
                        <h3>产品定位与服务对象</h3>
                        <ul className="luming-overview-list">
                            <li>产品形态：官网入口页 + 可扩展 App/小程序 + 服务协同模块。</li>
                            <li>服务对象：老年用户、异地子女、照护者、心理支持与康养服务方。</li>
                            <li>核心价值：补足陪伴空白、协同空白、记录空白，形成长期服务闭环。</li>
                            <li>融合方向：承接医药险融合与本地健康服务基础，延展至 AI 康养服务。</li>
                        </ul>
                    </article>

                    <article className="luming-card glass-panel">
                        <h3>创立主体与发起人</h3>
                        <p>
                            本项目由 <strong>北京蓝色壹路技术有限公司</strong> 发起，发起人
                            <strong> 董道宽 </strong>
                            ，具备数十年医药健康行业从业与产业协同经验。
                        </p>
                        <p className="luming-note">
                            组织定位：以“医疗健康行业经验 + AI 工程化能力”双轮驱动，推动数字康养产品化落地。
                        </p>
                        <p className="luming-cert">
                            备案信息：药品医疗器械网络信息服务备案（备案编号：(京)网药械信息备字（2021）第00169号）。
                        </p>
                    </article>
                </div>

                <div className="luming-hub-grid reveal reveal-delay-2">
                    <aside className="luming-entries">
                        {LUMING_ENTRIES.map((entry) => (
                            <button
                                key={entry.id}
                                type="button"
                                className={`luming-entry-btn ${entry.id === activeEntry.id ? 'is-active' : ''}`}
                                onClick={() => handleSelectEntry(entry.id)}
                            >
                                <span className="luming-entry-tag">{entry.tag}</span>
                                <strong>{entry.name}</strong>
                                <p>{entry.summary}</p>
                            </button>
                        ))}
                    </aside>

                    <article className="luming-detail glass-panel">
                        <p className="luming-detail-kicker">{activeEntry.tag} · 真实内容与体验</p>
                        <h3>{activeEntry.name}</h3>
                        <p className="luming-detail-summary">{activeEntry.summary}</p>

                        <ul className="luming-feature-list">
                            {activeEntry.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                            ))}
                        </ul>

                        <div className="luming-links">
                            {activeEntry.links.map((link) => (
                                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {activeEntry.id === 'drug-check' ? (
                            <div className="luming-demo-box">
                                <h4>药品查查体验</h4>
                                <form className="luming-drug-form" onSubmit={handleDrugSearch}>
                                    <input
                                        type="text"
                                        value={drugKeyword}
                                        onChange={(event) => setDrugKeyword(event.target.value)}
                                        placeholder="输入药品名，如 阿司匹林 或 aspirin"
                                    />
                                    <button type="submit" disabled={drugLoading}>
                                        {drugLoading ? '查询中...' : '立即查询'}
                                    </button>
                                </form>

                                <div className="luming-drug-actions">
                                    <button type="button" onClick={handleDrugInsight} disabled={drugInsightLoading || drugLoading}>
                                        {drugInsightLoading ? 'AI 解析中...' : 'AI 解读（DeepSeek 配置位）'}
                                    </button>
                                    <a href={dailyMedLink} target="_blank" rel="noreferrer">去 DailyMed 深查</a>
                                </div>

                                {drugError ? <p className="luming-drug-error">{drugError}</p> : null}
                                {drugInsightError ? <p className="luming-drug-error">{drugInsightError}</p> : null}
                                {drugInsight ? <p className="luming-ai-result">{drugInsight}</p> : null}

                                {drugResults.length ? (
                                    <ul className="luming-drug-results">
                                        {drugResults.map((item) => (
                                            <li key={`${item.brand}-${item.generic}`}>
                                                <p><strong>品牌名：</strong>{item.brand}</p>
                                                <p><strong>通用名：</strong>{item.generic}</p>
                                                <p><strong>生产方：</strong>{item.manufacturer}</p>
                                                <p><strong>用途摘要：</strong>{item.usage || '未提供'}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ) : (
                            <div className="luming-demo-box">
                                <h4>场景体验</h4>
                                <div className="luming-prompt-tabs">
                                    {activeEntry.demoPrompts.map((prompt, index) => (
                                        <button
                                            key={prompt.input}
                                            type="button"
                                            className={index === activePromptIndex ? 'is-active' : ''}
                                            onClick={() => setActivePromptIndex(index)}
                                        >
                                            场景 {index + 1}
                                        </button>
                                    ))}
                                </div>
                                <div className="luming-dialogue">
                                    <div>
                                        <span>用户输入</span>
                                        <p>{activePrompt?.input}</p>
                                    </div>
                                    <div>
                                        <span>系统输出</span>
                                        <p>{activePrompt?.output}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="luming-disclaimer">{activeEntry.disclaimer}</p>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default LumingHealthEntry;
