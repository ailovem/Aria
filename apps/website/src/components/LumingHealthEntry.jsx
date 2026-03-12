import React, { useMemo, useState } from 'react';
import './LumingHealthEntry.css';
import {
    CHRONIC_GUIDES,
    COMMON_DRUG_QUICK_QUERIES,
    DRUG_REFERENCE_LIBRARY,
    FREE_OFFICIAL_SOURCES,
    MEDICAL_VISIT_CHECKLIST
} from './lumingHealthData';

const DRUG_FDA_PROXY = (import.meta.env.VITE_DRUG_FDA_PROXY || '').trim();
const SAME_ORIGIN_SITE_API_ENABLED = String(import.meta.env.VITE_ARIA_SITE_USE_RELATIVE_API || '').trim().toLowerCase() === 'true';

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
        name: '药品查询与健康指南',
        tag: '入口 06',
        summary: '围绕常用药品说明、慢病管理重点和复诊准备建议，提供清晰、可继续行动的查询入口。',
        features: [
            '药品信息查询：支持常见中文名称、品牌名和英文通用名检索。',
            '用药参考：整合 FDA、RxNorm、MedlinePlus、DailyMed 等公开官方信息。',
            '健康指南：围绕慢病管理与复诊准备提供简洁建议。'
        ],
        links: [
            { label: 'OpenFDA Drug Label API', url: 'https://open.fda.gov/apis/drug/label/' },
            { label: 'DailyMed Web Services', url: 'https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm' },
            { label: 'RxNorm / RxNav API', url: 'https://lhncbc.nlm.nih.gov/RxNav/APIs/' },
            { label: 'MedlinePlus Connect', url: 'https://medlineplus.gov/connect/overview.html' }
        ],
        disclaimer: '药品查询和健康指南仅用于公开信息参考，不替代医生、药师的个体化诊疗与用药建议。'
    }
];

const formatSnippet = (value, limit = 180) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);

const normalizeLookupValue = (value) => String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');

const DRUG_ALIAS_TO_API_TERM = {
    维生素c: 'ascorbic acid',
    维生素C: 'ascorbic acid',
    维他命c: 'ascorbic acid',
    头孢: 'cephalexin',
    头孢氨苄: 'cephalexin',
    甲硝唑: 'metronidazole',
    雷贝拉唑: 'rabeprazole',
    埃索美拉唑: 'esomeprazole',
    阿卡波糖: 'acarbose',
    格列美脲: 'glimepiride',
    瑞格列奈: 'repaglinide',
    辛伐他汀: 'simvastatin',
    硝苯地平: 'nifedipine',
    氯雷他定: 'loratadine',
    西替利嗪: 'cetirizine',
    地氯雷他定: 'desloratadine',
    孟鲁司特: 'montelukast'
};

const ROUTE_LABELS_ZH = {
    ORAL: '口服',
    TOPICAL: '外用',
    INTRAVENOUS: '静脉注射',
    INJECTION: '注射',
    INHALATION: '吸入',
    NASAL: '鼻用',
    OPHTHALMIC: '眼用',
    OTIC: '耳用',
    RECTAL: '直肠用',
    TRANSDERMAL: '透皮',
    SUBCUTANEOUS: '皮下注射'
};

const TERM_TYPE_LABELS_ZH = {
    IN: '通用名',
    BN: '品牌名',
    SCD: '标准临床药品',
    SBD: '标准品牌药品',
    GPCK: '通用药品包装',
    BPCK: '品牌药品包装'
};

const DRUG_API_MODE_COPY = {
    remote: {
        badge: '正式版药学接口已接通',
        description: '当前页面会优先查询 Aria 公共药学 API，再聚合 OpenFDA、RxNorm、DailyMed 和 MedlinePlus 的公开信息。'
    },
    sameOrigin: {
        badge: '同域药学接口已接通',
        description: '当前站点已通过同域接口提供完整药品查询能力，适合联调、预发布和正式部署。'
    },
    fallback: {
        badge: '当前为基础公开检索模式',
        description: '站点尚未接入 Aria 公共药学 API。常见药可先查看中文速览与官方入口，完整官方标签与图片建议在正式环境接入 API 后使用。'
    }
};

const buildDailyMedLink = (keyword) => `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(formatSnippet(keyword) || 'aspirin')}`;

const buildReferenceAliasIndex = () => {
    const aliasToApiTerm = { ...DRUG_ALIAS_TO_API_TERM };
    const aliasRows = [];

    DRUG_REFERENCE_LIBRARY.forEach((entry) => {
        const aliases = [entry.canonicalName, entry.englishName, ...(entry.aliases || [])];
        aliases.forEach((alias) => {
            const normalizedAlias = normalizeLookupValue(alias);
            if (!normalizedAlias) {
                return;
            }
            aliasRows.push({
                normalizedAlias,
                entry
            });
            aliasToApiTerm[alias] = entry.apiSearchTerms?.[0] || entry.englishName || '';
            aliasToApiTerm[normalizedAlias] = entry.apiSearchTerms?.[0] || entry.englishName || '';
        });
    });

    return {
        aliasRows,
        aliasToApiTerm
    };
};

const { aliasRows: DRUG_REFERENCE_ALIASES, aliasToApiTerm: DRUG_ALIAS_SEARCH_MAP } = buildReferenceAliasIndex();

const resolveDrugApiContext = () => {
    const explicitBase = String(import.meta.env.VITE_ARIA_SITE_API_BASE || '').trim();
    if (explicitBase) {
        return {
            mode: 'remote',
            base: explicitBase.replace(/\/$/, '')
        };
    }

    if (DRUG_FDA_PROXY) {
        return {
            mode: 'remote',
            base: DRUG_FDA_PROXY.replace(/\/$/, '')
        };
    }

    if (typeof window === 'undefined') {
        return {
            mode: 'fallback',
            base: ''
        };
    }

    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return {
            mode: 'sameOrigin',
            base: ''
        };
    }

    if (SAME_ORIGIN_SITE_API_ENABLED) {
        return {
            mode: 'sameOrigin',
            base: ''
        };
    }

    return {
        mode: 'fallback',
        base: ''
    };
};

const buildPublicApiUrl = (path, apiContext) => {
    if (!apiContext || apiContext.mode === 'fallback') {
        return '';
    }
    if (apiContext.mode === 'sameOrigin') {
        return path;
    }
    return `${apiContext.base}${path}`;
};

const resolveDrugReference = (...values) => {
    const candidates = values
        .flat()
        .map((item) => normalizeLookupValue(item))
        .filter(Boolean);

    if (!candidates.length) {
        return null;
    }

    let bestEntry = null;
    let bestScore = 0;

    DRUG_REFERENCE_ALIASES.forEach(({ normalizedAlias, entry }) => {
        candidates.forEach((candidate) => {
            let score = 0;
            if (normalizedAlias === candidate) score = 140;
            else if (normalizedAlias.startsWith(candidate)) score = 110;
            else if (candidate.startsWith(normalizedAlias)) score = 102;
            else if (normalizedAlias.includes(candidate)) score = 88;
            else if (candidate.includes(normalizedAlias)) score = 80;

            if (score > bestScore) {
                bestScore = score;
                bestEntry = entry;
            }
        });
    });

    return bestScore >= 80 ? bestEntry : null;
};

const translateRouteLabel = (value) => {
    const route = String(value || '').trim();
    if (!route) {
        return '未提供';
    }
    const parts = route.split(/[/,]/).map((item) => item.trim()).filter(Boolean);
    const translated = parts.map((item) => ROUTE_LABELS_ZH[item.toUpperCase()] || item);
    return translated.join(' / ');
};

const translateTermTypeLabel = (value) => TERM_TYPE_LABELS_ZH[String(value || '').trim().toUpperCase()] || String(value || '未提供');

const buildDrugSearchExpressions = (keyword) => {
    const safeKeyword = keyword.replace(/"/g, '\\"').trim();
    const firstToken = safeKeyword.split(/\s+/).filter(Boolean)[0] || safeKeyword;
    const wildcardToken = firstToken.replace(/[^a-zA-Z0-9.-]/g, '');
    const expressions = [
        `openfda.generic_name:"${safeKeyword}"`,
        `openfda.brand_name:"${safeKeyword}"`,
        `openfda.substance_name:"${safeKeyword}"`
    ];

    if (firstToken && firstToken !== safeKeyword) {
        expressions.push(
            `openfda.generic_name:"${firstToken}"`,
            `openfda.brand_name:"${firstToken}"`,
            `openfda.substance_name:"${firstToken}"`
        );
    }

    expressions.push([
        `openfda.brand_name:"${safeKeyword}"`,
        `openfda.generic_name:"${safeKeyword}"`,
        `openfda.substance_name:"${safeKeyword}"`
    ].join(' OR '));

    if (wildcardToken) {
        expressions.push(
            `openfda.generic_name:${wildcardToken}`,
            `openfda.brand_name:${wildcardToken}`,
            `openfda.substance_name:${wildcardToken}`,
            `openfda.generic_name:${wildcardToken}*`,
            `openfda.brand_name:${wildcardToken}*`,
            `openfda.substance_name:${wildcardToken}*`
        );
    }

    return [...new Set(expressions.filter(Boolean))];
};

const buildDrugSearchEndpoint = (expression, apiContext) => {
    const apiUrl = buildPublicApiUrl(
        `/v1/public/drug/label?search=${encodeURIComponent(expression)}&limit=12`,
        apiContext
    );

    if (apiUrl) {
        return apiUrl;
    }

    return `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(expression)}&limit=12`)}`;
};

const parseDrugPayload = async (response) => {
    const rawText = await response.text();
    try {
        return JSON.parse(rawText);
    } catch {
        throw new Error('药品信息加载失败，请稍后重试。');
    }
};

const resolveDrugSearchErrorMessage = (message, statusCode) => {
    const content = String(message || '').trim();
    if (/No matches found/i.test(content)) {
        return '暂未找到完全匹配的公开药品信息。';
    }
    if (/aborted due to timeout/i.test(content) || /\btimeout\b/i.test(content)) {
        return '上游官方药品接口响应超时';
    }
    if (/failed to fetch/i.test(content) || /network/i.test(content)) {
        return '当前药品接口暂时不可达';
    }
    if (/search not supported/i.test(content) || /invalid.*search/i.test(content)) {
        return '当前关键词识别不稳定，请尝试更完整的药品名称。';
    }
    if (content) {
        return content;
    }
    if (statusCode) {
        return `药品信息查询失败（HTTP ${statusCode}）`;
    }
    return '药品信息查询失败，请稍后重试。';
};

const buildRetryKeywords = (keyword, knowledge, drugReference) => {
    const values = [];
    const seen = new Set();
    const push = (value) => {
        const formatted = formatSnippet(value, 120);
        const key = normalizeLookupValue(formatted);
        if (!formatted || !key || seen.has(key)) {
            return;
        }
        seen.add(key);
        values.push(formatted);
    };

    push(keyword);
    push(knowledge?.matchedName);
    if (Array.isArray(drugReference?.apiSearchTerms)) {
        drugReference.apiSearchTerms.slice(0, 3).forEach(push);
    }
    if (Array.isArray(drugReference?.aliases)) {
        drugReference.aliases.slice(0, 4).forEach(push);
    }
    if (Array.isArray(knowledge?.commonBrands)) {
        knowledge.commonBrands.slice(0, 3).forEach(push);
    }

    return values;
};

const resolveGuideMatches = (values) => {
    const normalizedValues = values.map((value) => normalizeLookupValue(value)).filter(Boolean);
    if (!normalizedValues.length) {
        return [];
    }

    return CHRONIC_GUIDES.filter((guide) => guide.keywords.some((keyword) => {
        const normalizedKeyword = normalizeLookupValue(keyword);
        return normalizedValues.some((value) => value.includes(normalizedKeyword) || normalizedKeyword.includes(value));
    })).map((guide) => guide.id);
};

const normalizeDrugResults = (results, keyword) => {
    if (!Array.isArray(results)) {
        return [];
    }

    const query = normalizeLookupValue(keyword);
    const scoreResult = (item) => {
        const rawBrand = String(item.brand || '').toLowerCase();
        const rawGeneric = String(item.generic || '').toLowerCase();
        const brand = normalizeLookupValue(item.brand);
        const generic = normalizeLookupValue(item.generic);
        const ingredient = normalizeLookupValue(item.activeIngredient);
        let score = 0;

        if (generic === query || brand === query) score += 120;
        if (generic.startsWith(query)) score += 100;
        if (brand.startsWith(query)) score += 90;
        if (ingredient.startsWith(query)) score += 80;
        if (generic.includes(query)) score += 60;
        if (brand.includes(query)) score += 50;
        if (ingredient.includes(query)) score += 40;
        if (/ and |\//.test(rawGeneric) || / and |\//.test(rawBrand)) score -= 18;
        if (/hydrochloride|calcium|sodium/.test(rawGeneric)) score += 8;
        return score;
    };

    return results.map((item, index) => {
        const openfda = item.openfda || {};
        const brand = openfda.brand_name?.[0] || `结果 ${index + 1}`;
        const generic = openfda.generic_name?.[0] || '未提供';
        const manufacturer = openfda.manufacturer_name?.[0] || '未提供';
        const purpose = formatSnippet(item.purpose?.[0] || item.indications_and_usage?.[0] || '未提供用途说明', 180);
        const usage = formatSnippet(item.indications_and_usage?.[0] || item.description?.[0] || item.dosage_and_administration?.[0], 180);
        const activeIngredient = formatSnippet(item.active_ingredient?.[0] || openfda.substance_name?.join(' / '), 160);
        const warning = formatSnippet(item.warnings?.[0] || item.do_not_use?.[0] || item.stop_use?.[0], 160);
        const route = translateRouteLabel(openfda.route?.[0] || '未提供');
        const dailyMedKeyword = generic !== '未提供' ? generic : brand;

        return {
            id: `${brand}-${generic}-${index}`,
            brand,
            generic,
            manufacturer,
            purpose,
            usage,
            activeIngredient,
            warning,
            route,
            splSetId: openfda.spl_set_id?.[0] || '',
            dailyMedLink: buildDailyMedLink(dailyMedKeyword)
        };
    }).sort((left, right) => scoreResult(right) - scoreResult(left)).slice(0, 5);
};

const requestDrugKnowledge = async (keyword, apiContext) => {
    const apiUrl = buildPublicApiUrl(`/v1/public/drug/knowledge?name=${encodeURIComponent(keyword)}`, apiContext);
    if (!apiUrl) {
        return null;
    }
    try {
        const response = await fetch(apiUrl, {
            cache: 'no-store'
        });
        const payload = await response.json();
        if (!response.ok || !payload?.ok) {
            return null;
        }
        return payload.knowledge || null;
    } catch {
        return null;
    }
};

const requestDrugMedia = async (setId, apiContext) => {
    const apiUrl = buildPublicApiUrl(`/v1/public/drug/media?setid=${encodeURIComponent(setId)}`, apiContext);
    if (!apiUrl || !setId) {
        return [];
    }
    try {
        const response = await fetch(apiUrl, {
            cache: 'no-store'
        });
        const payload = await response.json();
        if (!response.ok || !payload?.ok || !Array.isArray(payload.media)) {
            return [];
        }
        return payload.media;
    } catch {
        return [];
    }
};

const buildDrugOfficialLinks = (keyword, drugReference, drugKnowledge) => {
    const searchSeed = formatSnippet(
        drugReference?.englishName
        || drugReference?.apiSearchTerms?.[0]
        || drugKnowledge?.matchedName
        || keyword,
        120
    ) || 'aspirin';

    const links = [
        {
            label: '查看 DailyMed 官方说明',
            url: buildDailyMedLink(searchSeed)
        },
        {
            label: '了解 OpenFDA 官方标签字段',
            url: `https://open.fda.gov/apis/drug/label/searchable-fields/`
        }
    ];

    if (drugKnowledge?.patientEducation?.url) {
        links.unshift({
            label: '打开 MedlinePlus 患者教育',
            url: drugKnowledge.patientEducation.url
        });
    }

    return links;
};

const LumingHealthEntry = () => {
    const [activeEntryId, setActiveEntryId] = useState(LUMING_ENTRIES[0].id);
    const [activePromptIndex, setActivePromptIndex] = useState(0);
    const [activeGuideId, setActiveGuideId] = useState(CHRONIC_GUIDES[0].id);
    const [matchedGuideIds, setMatchedGuideIds] = useState([]);
    const [drugKeyword, setDrugKeyword] = useState('');
    const [drugLoading, setDrugLoading] = useState(false);
    const [drugError, setDrugError] = useState('');
    const [drugNotice, setDrugNotice] = useState('');
    const [drugResults, setDrugResults] = useState([]);
    const [drugKnowledgeLoading, setDrugKnowledgeLoading] = useState(false);
    const [drugKnowledgeError, setDrugKnowledgeError] = useState('');
    const [drugKnowledge, setDrugKnowledge] = useState(null);
    const [drugMediaMap, setDrugMediaMap] = useState({});
    const [drugReference, setDrugReference] = useState(null);

    const apiContext = useMemo(() => resolveDrugApiContext(), []);
    const apiModeCopy = DRUG_API_MODE_COPY[apiContext.mode] || DRUG_API_MODE_COPY.fallback;

    const activeEntry = useMemo(
        () => LUMING_ENTRIES.find((item) => item.id === activeEntryId) || LUMING_ENTRIES[0],
        [activeEntryId]
    );
    const activePrompt = activeEntry.demoPrompts?.[activePromptIndex];
    const activeGuide = useMemo(
        () => CHRONIC_GUIDES.find((item) => item.id === activeGuideId) || CHRONIC_GUIDES[0],
        [activeGuideId]
    );
    const matchedGuideNames = useMemo(
        () => matchedGuideIds
            .map((guideId) => CHRONIC_GUIDES.find((guide) => guide.id === guideId)?.name)
            .filter(Boolean)
            .join('、'),
        [matchedGuideIds]
    );
    const drugOfficialLinks = useMemo(
        () => buildDrugOfficialLinks(drugKeyword, drugReference, drugKnowledge),
        [drugKeyword, drugReference, drugKnowledge]
    );

    const resetDrugWorkspace = () => {
        setDrugError('');
        setDrugNotice('');
        setDrugResults([]);
        setMatchedGuideIds([]);
        setDrugKnowledge(null);
        setDrugKnowledgeError('');
        setDrugKnowledgeLoading(false);
        setDrugMediaMap({});
        setDrugReference(null);
    };

    const handleSelectEntry = (entryId) => {
        setActiveEntryId(entryId);
        setActivePromptIndex(0);
        resetDrugWorkspace();
    };

    const searchDrug = async (rawKeyword) => {
        let keyword = formatSnippet(rawKeyword);
        if (!keyword) {
            setDrugError('请输入药品名称，例如阿司匹林、氨氯地平或 aspirin。');
            setDrugNotice('');
            setDrugResults([]);
            setDrugKnowledge(null);
            setDrugKnowledgeError('');
            setDrugMediaMap({});
            setDrugReference(null);
            return;
        }

        const normalizedKeyword = keyword.replace(/\s+/g, '');
        const nextDrugReference = resolveDrugReference(keyword, normalizedKeyword);
        const mappedKeyword = DRUG_ALIAS_SEARCH_MAP[keyword]
            || DRUG_ALIAS_SEARCH_MAP[normalizedKeyword]
            || DRUG_ALIAS_SEARCH_MAP[keyword.toLowerCase?.()]
            || DRUG_ALIAS_SEARCH_MAP[normalizedKeyword.toLowerCase?.()]
            || nextDrugReference?.apiSearchTerms?.[0];

        if (mappedKeyword) {
            keyword = mappedKeyword;
        }

        setDrugReference(nextDrugReference);

        const keywordKnowledge = await requestDrugKnowledge(keyword, apiContext);
        const retryKeywords = buildRetryKeywords(keyword, keywordKnowledge, nextDrugReference);
        const keywordMatches = resolveGuideMatches([rawKeyword, ...retryKeywords]);
        setMatchedGuideIds(keywordMatches);
        if (nextDrugReference?.guideIds?.[0]) {
            setActiveGuideId(nextDrugReference.guideIds[0]);
        } else if (keywordMatches[0]) {
            setActiveGuideId(keywordMatches[0]);
        }

        setDrugLoading(true);
        setDrugError('');
        setDrugNotice(nextDrugReference
            ? '已匹配到中文用药速览，会同时补充公开官方标签与患者教育资料。'
            : apiContext.mode === 'fallback'
                ? '当前站点未接入 Aria 公共药学 API，将优先展示基础公开检索结果。'
                : '');
        setDrugResults([]);
        setDrugKnowledge(null);
        setDrugKnowledgeError('');
        setDrugKnowledgeLoading(false);
        setDrugMediaMap({});

        try {
            let nextResults = [];
            let lastMessage = '';

            for (const searchKeyword of retryKeywords) {
                const expressions = buildDrugSearchExpressions(searchKeyword);
                for (const expression of expressions) {
                    const response = await fetch(buildDrugSearchEndpoint(expression, apiContext));
                    const payload = await parseDrugPayload(response);
                    const message = payload?.error?.message || '';

                    if (message) {
                        lastMessage = resolveDrugSearchErrorMessage(message, response.status);
                        if (/No matches found/i.test(message) || /search not supported/i.test(message) || /invalid.*search/i.test(message)) {
                            continue;
                        }
                        throw new Error(lastMessage);
                    }

                    if (apiContext.mode !== 'fallback' && !response.ok) {
                        throw new Error(resolveDrugSearchErrorMessage(payload?.error?.message, response.status));
                    }

                    nextResults = normalizeDrugResults(payload?.results, searchKeyword);
                    if (nextResults.length) {
                        break;
                    }
                }
                if (nextResults.length) {
                    break;
                }
            }

            if (!nextResults.length) {
                if (nextDrugReference) {
                    setDrugNotice(lastMessage
                        ? `${lastMessage}，已先展示中文用药速览与官方入口。`
                        : '当前未返回完整官方标签，已先展示中文用药速览与官方入口。');
                } else {
                    setDrugError(lastMessage || '暂未找到匹配的公开药品信息，请尝试通用名、品牌名或更完整的英文名。');
                }
                if (keywordKnowledge) {
                    setDrugKnowledge(keywordKnowledge);
                }
                return;
            }

            const resultMatches = resolveGuideMatches([
                rawKeyword,
                keyword,
                ...nextResults.map((item) => item.brand),
                ...nextResults.map((item) => item.generic),
                ...nextResults.map((item) => item.activeIngredient)
            ]);
            setMatchedGuideIds(resultMatches);
            if (nextDrugReference?.guideIds?.[0]) {
                setActiveGuideId(nextDrugReference.guideIds[0]);
            } else if (resultMatches[0]) {
                setActiveGuideId(resultMatches[0]);
            }

            setDrugResults(nextResults);
            setDrugKnowledgeLoading(true);

            const [knowledgePayload, mediaPairs] = await Promise.all([
                keywordKnowledge?.rxcui
                    ? Promise.resolve(keywordKnowledge)
                    : requestDrugKnowledge(nextResults[0]?.generic !== '未提供' ? nextResults[0].generic : keyword, apiContext),
                Promise.all(nextResults.map(async (item) => {
                    const media = await requestDrugMedia(item.splSetId, apiContext);
                    return [item.id, media?.[0]?.url || ''];
                }))
            ]);

            setDrugKnowledge(knowledgePayload || null);
            setDrugMediaMap(Object.fromEntries(mediaPairs.filter(([, url]) => url)));
            setDrugKnowledgeLoading(false);
        } catch (error) {
            setDrugKnowledgeLoading(false);
            const localizedErrorMessage = resolveDrugSearchErrorMessage(error?.message, 0);
            if (nextDrugReference) {
                setDrugError('');
                setDrugNotice(`${localizedErrorMessage || '云端官方标签暂时不可用'}，已先展示中文用药速览与官方入口。`);
            } else {
                setDrugError(localizedErrorMessage || '药品信息查询失败，请稍后重试。');
            }
        } finally {
            setDrugLoading(false);
        }
    };

    const handleDrugSearch = async (event) => {
        event.preventDefault();
        await searchDrug(drugKeyword);
    };

    const handleQuickQuery = async (keyword) => {
        setActiveEntryId('drug-check');
        setDrugKeyword(keyword);
        await searchDrug(keyword);
    };

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
                            <div className="luming-demo-box luming-health-workspace">
                                <div className="luming-workspace-head">
                                    <div>
                                        <h4>药品查询与健康指南</h4>
                                        <p className="luming-workspace-copy">
                                            查询常用药品说明，查看慢病管理重点与复诊准备建议，让药品信息更容易理解，也更方便继续行动。
                                        </p>
                                    </div>
                                </div>

                                <div className="luming-service-status">
                                    <span className={`luming-service-badge is-${apiContext.mode}`}>{apiModeCopy.badge}</span>
                                    <p>{apiModeCopy.description}</p>
                                </div>

                                <div className="luming-search-shell">
                                    <label className="luming-search-label" htmlFor="luming-drug-search">药品名称</label>
                                    <p className="luming-search-subcopy">支持中文名称、品牌名和英文通用名，例如阿托伐他汀、立普妥、atorvastatin。正式版建议接入 Aria 公共药学 API。</p>
                                    <form className="luming-drug-form" onSubmit={handleDrugSearch}>
                                        <input
                                            id="luming-drug-search"
                                            type="text"
                                            value={drugKeyword}
                                            onChange={(event) => setDrugKeyword(event.target.value)}
                                            placeholder="输入药品名称，例如二甲双胍 / 格华止 / metformin"
                                            aria-label="药品检索输入框"
                                        />
                                        <button type="submit" disabled={drugLoading}>
                                            {drugLoading ? '查询中...' : '查询药品'}
                                        </button>
                                    </form>
                                </div>

                                <div className="luming-search-presets">
                                    <span className="luming-search-presets-label">常搜药品</span>
                                    <div className="luming-chip-row">
                                        {COMMON_DRUG_QUICK_QUERIES.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                className="luming-chip"
                                                onClick={() => void handleQuickQuery(item)}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="luming-drug-actions">
                                    {drugOfficialLinks.map((link) => (
                                        <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                                    ))}
                                </div>

                                {matchedGuideNames ? (
                                    <p className="luming-drug-match" role="status">
                                        相关健康指南：{matchedGuideNames}
                                    </p>
                                ) : null}

                                {drugNotice ? (
                                    <div className="luming-search-state is-notice" role="status">
                                        <p className="luming-search-feedback">{drugNotice}</p>
                                    </div>
                                ) : null}

                                {drugError ? (
                                    <div className="luming-search-state is-error" role="alert">
                                        <p className="luming-drug-error">{drugError}</p>
                                        <p className="luming-search-tip">可尝试：通用名、品牌名或英文名，例如阿托伐他汀 / 立普妥 / atorvastatin。</p>
                                    </div>
                                ) : null}

                                {drugReference ? (
                                    <div className="luming-reference-shell">
                                        <div className="luming-guide-head">
                                            <h4>中文用药速览</h4>
                                            <p>这部分面向普通用户和家属阅读，帮助先把药品的大方向看明白；具体剂量、适应症和疗程仍以医生/药师建议为准。</p>
                                        </div>
                                        <div className="luming-reference-grid">
                                            <section className="luming-reference-card">
                                                <p className="luming-reference-kicker">{drugReference.category}</p>
                                                <h5>{drugReference.canonicalName}</h5>
                                                <p className="luming-reference-subtitle">{drugReference.englishName}</p>
                                                <p className="luming-reference-summary">{drugReference.summary}</p>
                                            </section>
                                            <section className="luming-reference-card">
                                                <h5>常见适用场景</h5>
                                                <ul className="luming-knowledge-list">
                                                    {drugReference.commonUses.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </section>
                                            <section className="luming-reference-card">
                                                <h5>日常关注点</h5>
                                                <ul className="luming-knowledge-list">
                                                    {drugReference.dailyFocus.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </section>
                                            <section className="luming-reference-card">
                                                <h5>复诊时可以问</h5>
                                                <ul className="luming-knowledge-list">
                                                    {drugReference.askDoctor.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </section>
                                        </div>
                                    </div>
                                ) : null}

                                {drugResults.length ? (
                                    <div className="luming-results-shell">
                                        <div className="luming-results-head">
                                            <h4>查询结果</h4>
                                            <p>已找到 {drugResults.length} 条相关药品信息。</p>
                                        </div>
                                        <ul className="luming-drug-results">
                                            {drugResults.map((item) => (
                                                <li key={item.id}>
                                                    <div className="luming-drug-result-layout">
                                                        <div className="luming-drug-result-media">
                                                            {drugMediaMap[item.id] ? (
                                                                <img className="luming-drug-image" src={drugMediaMap[item.id]} alt={`${item.brand} 官方图片`} />
                                                            ) : (
                                                                <div className="luming-drug-placeholder">暂无官方图片</div>
                                                            )}
                                                        </div>
                                                        <div className="luming-drug-result-main">
                                                            <div className="luming-drug-result-head">
                                                                <strong>{item.brand}</strong>
                                                                <span>{item.route}</span>
                                                            </div>
                                                            <p><strong>通用名：</strong>{item.generic}</p>
                                                            <p><strong>生产方：</strong>{item.manufacturer}</p>
                                                            <p><strong>主要用途（官方英文标签）：</strong>{item.purpose || '未提供'}</p>
                                                            {item.usage ? <p><strong>官方标签摘要（英文）：</strong>{item.usage}</p> : null}
                                                            {item.activeIngredient ? <p><strong>活性成分：</strong>{item.activeIngredient}</p> : null}
                                                            {item.warning ? <p><strong>用药关注（官方英文标签）：</strong>{item.warning}</p> : null}
                                                            <div className="luming-drug-result-links">
                                                                <a href={item.dailyMedLink} target="_blank" rel="noreferrer">查看说明全文</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {drugKnowledgeLoading ? <p className="luming-knowledge-note">正在整理公开药学参考信息...</p> : null}
                                {drugKnowledgeError ? <p className="luming-knowledge-note">{drugKnowledgeError}</p> : null}

                                {drugKnowledge ? (
                                    <div className="luming-knowledge-shell">
                                        <div className="luming-guide-head">
                                            <h4>公开官方药学信息</h4>
                                            <p>这部分保留官方数据库的原始术语和英文资料入口，适合在中文速览基础上继续深查。</p>
                                        </div>
                                        <div className="luming-knowledge-grid">
                                            <section className="luming-knowledge-card">
                                                <h5>标准药学概览</h5>
                                                <ul className="luming-knowledge-list">
                                                    <li><strong>标准名称：</strong>{drugKnowledge.matchedName || '未提供'}</li>
                                                    <li><strong>术语类型：</strong>{translateTermTypeLabel(drugKnowledge.termType)}</li>
                                                    <li><strong>常见品牌：</strong>{drugKnowledge.commonBrands?.length ? drugKnowledge.commonBrands.join('、') : '未提供'}</li>
                                                    <li><strong>常见剂型：</strong>{drugKnowledge.doseForms?.length ? drugKnowledge.doseForms.join('、') : '未提供'}</li>
                                                </ul>
                                            </section>
                                            <section className="luming-knowledge-card">
                                                <h5>官方结构化字段</h5>
                                                <ul className="luming-knowledge-list">
                                                    <li><strong>RxCUI：</strong>{drugKnowledge.rxcui || '未提供'}</li>
                                                    <li><strong>ATC 编码：</strong>{drugKnowledge.atcCodes?.length ? drugKnowledge.atcCodes.join('、') : '未提供'}</li>
                                                    <li><strong>may_treat：</strong>{drugKnowledge.mayTreat?.length ? drugKnowledge.mayTreat.join('、') : '未提供'}</li>
                                                </ul>
                                            </section>
                                            {drugKnowledge.patientEducation ? (
                                                <section className="luming-knowledge-card is-wide">
                                                    <h5>官方患者教育资料</h5>
                                                    <p className="luming-knowledge-summary">
                                                        {drugKnowledge.patientEducation.summary
                                                            ? `以下为 MedlinePlus 英文患者教育摘要：${drugKnowledge.patientEducation.summary}`
                                                            : '已匹配到官方患者教育页面，可点击查看完整内容。'}
                                                    </p>
                                                    <div className="luming-drug-result-links">
                                                        <a href={drugKnowledge.patientEducation.url} target="_blank" rel="noreferrer">
                                                            打开 {drugKnowledge.patientEducation.title || 'MedlinePlus'} 官方页
                                                        </a>
                                                    </div>
                                                </section>
                                            ) : null}
                                        </div>
                                        <p className="luming-knowledge-source">{drugKnowledge.sourceNote || '信息来源：FDA、RxNorm、MedlinePlus、DailyMed 等公开官方数据。'}</p>
                                    </div>
                                ) : null}

                                <div className="luming-guide-shell">
                                    <div className="luming-guide-head">
                                        <h4>慢病健康管理指南</h4>
                                        <p>
                                            从用户和家属视角梳理“日常重点、复诊要问、风险信号”，帮助把健康管理这件事做得更清楚。
                                        </p>
                                    </div>

                                    <div className="luming-guide-tabs" role="tablist" aria-label="慢病健康管理指南">
                                        {CHRONIC_GUIDES.map((guide) => (
                                            <button
                                                key={guide.id}
                                                type="button"
                                                className={`luming-guide-tab ${guide.id === activeGuide.id ? 'is-active' : ''} ${matchedGuideIds.includes(guide.id) ? 'is-suggested' : ''}`}
                                                aria-pressed={guide.id === activeGuide.id}
                                                onClick={() => setActiveGuideId(guide.id)}
                                            >
                                                {guide.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="luming-guide-panel">
                                        <p className="luming-guide-kicker">{activeGuide.tag}</p>
                                        <h5>{activeGuide.name}</h5>
                                        <p className="luming-guide-summary">{activeGuide.summary}</p>

                                        <div className="luming-guide-grid">
                                            <section className="luming-guide-block">
                                                <h6>日常重点</h6>
                                                <ul>
                                                    {activeGuide.focus.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </section>

                                            <section className="luming-guide-block">
                                                <h6>复诊时可问</h6>
                                                <ul>
                                                    {activeGuide.askDoctor.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </section>

                                            <section className="luming-guide-block">
                                                <h6>尽快就医信号</h6>
                                                <ul>
                                                    {activeGuide.redFlags.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </section>
                                        </div>

                                        <div className="luming-guide-keywords">
                                            <span>相关药品关键词</span>
                                            <div className="luming-chip-row">
                                                {activeGuide.keywords.slice(0, 4).map((keyword) => (
                                                    <button
                                                        key={keyword}
                                                        type="button"
                                                        className="luming-chip is-soft"
                                                        onClick={() => void handleQuickQuery(keyword)}
                                                    >
                                                        {keyword}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="luming-links">
                                            {activeGuide.learnMore.map((link) => (
                                                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                                                    {link.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="luming-checklist-shell">
                                    <h4>复诊 / 购药前准备清单</h4>
                                    <ul className="luming-checklist">
                                        {MEDICAL_VISIT_CHECKLIST.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="luming-source-shell">
                                    <h4>信息来源</h4>
                                    <div className="luming-source-grid">
                                        {FREE_OFFICIAL_SOURCES.map((source) => (
                                            <a
                                                key={source.url}
                                                href={source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="luming-source-card"
                                            >
                                                {source.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
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
