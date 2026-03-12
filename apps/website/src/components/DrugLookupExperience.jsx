import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DrugLookupExperience.css';
import {
    CHRONIC_GUIDES,
    COMMON_DRUG_QUICK_QUERIES,
    DRUG_REFERENCE_LIBRARY,
    MEDICAL_VISIT_CHECKLIST
} from './lumingHealthData';

const DRUG_FDA_PROXY = (import.meta.env.VITE_DRUG_FDA_PROXY || '').trim();
const SAME_ORIGIN_SITE_API_ENABLED = String(import.meta.env.VITE_ARIA_SITE_USE_RELATIVE_API || '').trim().toLowerCase() === 'true';

const HUMAN_SEARCH_GUIDE_CARDS = [
    {
        title: '支持多种写法',
        points: ['直接输入药盒上的中文名', '也可以输入商品名或英文名', '不确定全名时，先搜常用叫法也可以']
    },
    {
        title: '查询后会看到',
        points: ['先看一份中文用药速览', '需要时继续打开完整说明', '顺手查看就诊前准备建议']
    },
    {
        title: '如果暂时没查到',
        points: ['可以换通用名、品牌名或英文名再试一次', '先看页面里的相关提醒和补充资料入口', '重要用药问题优先问医生或药师']
    }
];

const resolveInitialDrugKeyword = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        return formatSnippet(new URLSearchParams(window.location.search).get('query') || '', 60);
    } catch {
        return '';
    }
};

const syncDrugKeywordToUrl = (keyword) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const value = formatSnippet(keyword, 60);
        const nextUrl = new URL(window.location.href);

        if (value) {
            nextUrl.searchParams.set('query', value);
        } else {
            nextUrl.searchParams.delete('query');
        }

        window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    } catch {
        // Ignore URL sync errors and keep the search experience available.
    }
};

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

const formatSnippet = (value, limit = 180) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);

const normalizeLookupValue = (value) => String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');

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
        return '暂时没找到完全匹配的药品信息。';
    }
    if (/aborted due to timeout/i.test(content) || /\btimeout\b/i.test(content)) {
        return '药品说明加载有点慢';
    }
    if (/failed to fetch/i.test(content) || /network/i.test(content)) {
        return '药品信息暂时没有连上';
    }
    if (/search not supported/i.test(content) || /invalid.*search/i.test(content)) {
        return '这次识别得不够准，换个更完整的药名试试';
    }
    if (content) {
        return content;
    }
    if (statusCode) {
        return `药品信息加载失败（HTTP ${statusCode}）`;
    }
    return '药品信息加载失败，请稍后重试。';
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
        return score;
    };

    return results.map((item, index) => {
        const openfda = item.openfda || {};
        const brand = openfda.brand_name?.[0] || `结果 ${index + 1}`;
        const generic = openfda.generic_name?.[0] || '未提供';
        const activeIngredient = formatSnippet(item.active_ingredient?.[0] || openfda.substance_name?.join(' / '), 160);
        const purpose = formatSnippet(item.purpose?.[0] || item.indications_and_usage?.[0] || '', 220);
        const warning = formatSnippet(item.warnings?.[0] || item.do_not_use?.[0] || item.stop_use?.[0], 180);
        const dailyMedKeyword = generic !== '未提供' ? generic : brand;

        const normalizedItem = {
            id: `${brand}-${generic}-${index}`,
            brand,
            generic,
            activeIngredient,
            purpose,
            warning,
            splSetId: openfda.spl_set_id?.[0] || '',
            dailyMedLink: buildDailyMedLink(dailyMedKeyword)
        };
        return {
            ...normalizedItem,
            relevanceScore: scoreResult(normalizedItem)
        };
    }).filter((item) => item.relevanceScore > 0)
        .sort((left, right) => right.relevanceScore - left.relevanceScore)
        .slice(0, 4);
};

const requestDrugKnowledge = async (keyword, apiContext) => {
    const apiUrl = buildPublicApiUrl(`/v1/public/drug/knowledge?name=${encodeURIComponent(keyword)}`, apiContext);
    if (!apiUrl) {
        return null;
    }
    try {
        const response = await fetch(apiUrl, { cache: 'no-store' });
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
        const response = await fetch(apiUrl, { cache: 'no-store' });
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
            label: '查看完整药品说明',
            url: buildDailyMedLink(searchSeed)
        }
    ];

    return links;
};

const buildDrugFallbackEndpoint = (expression) => `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(expression)}&limit=12`;

const isLocalPreviewHost = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const buildDrugSearchEndpoints = (expression, apiContext) => {
    const primaryEndpoint = buildPublicApiUrl(
        `/v1/public/drug/label?search=${encodeURIComponent(expression)}&limit=12`,
        apiContext
    );

    if (!primaryEndpoint) {
        return [buildDrugFallbackEndpoint(expression)];
    }

    if (apiContext?.mode === 'sameOrigin' && isLocalPreviewHost()) {
        return [buildDrugFallbackEndpoint(expression), primaryEndpoint];
    }

    return [primaryEndpoint, buildDrugFallbackEndpoint(expression)];
};

const requestDrugLabelPayload = async (expression, apiContext) => {
    const endpoints = buildDrugSearchEndpoints(expression, apiContext);
    let lastError = null;

    for (let index = 0; index < endpoints.length; index += 1) {
        const endpoint = endpoints[index];
        const isFallbackEndpoint = index > 0;

        try {
            const response = await fetch(endpoint, { cache: 'no-store' });
            const payload = await parseDrugPayload(response);
            const message = payload?.error?.message || '';

            if (message) {
                const normalizedMessage = resolveDrugSearchErrorMessage(message, response.status);
                if (!isFallbackEndpoint && response.status >= 500) {
                    lastError = new Error(normalizedMessage);
                    continue;
                }
                return {
                    response,
                    payload
                };
            }

            if (!response.ok) {
                const normalizedMessage = resolveDrugSearchErrorMessage(payload?.error?.message, response.status);
                if (!isFallbackEndpoint && response.status >= 500) {
                    lastError = new Error(normalizedMessage);
                    continue;
                }
                throw new Error(normalizedMessage);
            }

            return {
                response,
                payload
            };
        } catch (error) {
            lastError = error;
            if (isFallbackEndpoint) {
                break;
            }
        }
    }

    throw lastError || new Error('药品信息加载失败，请稍后重试。');
};

const DrugLookupExperience = () => {
    const initialDrugKeywordRef = useRef(resolveInitialDrugKeyword());
    const hasAutoSearchedInitialKeywordRef = useRef(false);
    const activeDrugSearchIdRef = useRef(0);
    const searchDrugRef = useRef(null);
    const [activeGuideId, setActiveGuideId] = useState(CHRONIC_GUIDES[0].id);
    const [matchedGuideIds, setMatchedGuideIds] = useState([]);
    const [drugKeyword, setDrugKeyword] = useState(() => initialDrugKeywordRef.current);
    const [drugLoading, setDrugLoading] = useState(false);
    const [drugError, setDrugError] = useState('');
    const [drugNotice, setDrugNotice] = useState('');
    const [drugResults, setDrugResults] = useState([]);
    const [drugKnowledgeLoading, setDrugKnowledgeLoading] = useState(false);
    const [drugKnowledge, setDrugKnowledge] = useState(null);
    const [drugMediaMap, setDrugMediaMap] = useState({});
    const [drugReference, setDrugReference] = useState(null);
    const [hasDrugSearchAttempted, setHasDrugSearchAttempted] = useState(false);
    const [drugSearchContext, setDrugSearchContext] = useState(null);

    const apiContext = useMemo(() => resolveDrugApiContext(), []);
    const drugOfficialLinks = useMemo(
        () => buildDrugOfficialLinks(drugKeyword, drugReference, drugKnowledge),
        [drugKeyword, drugReference, drugKnowledge]
    );
    const visibleGuideIds = useMemo(() => {
        const ids = matchedGuideIds.length ? matchedGuideIds : (drugReference?.guideIds || []);
        return ids.filter((id, index) => id && ids.indexOf(id) === index);
    }, [drugReference, matchedGuideIds]);
    const visibleGuides = useMemo(
        () => visibleGuideIds
            .map((guideId) => CHRONIC_GUIDES.find((guide) => guide.id === guideId))
            .filter(Boolean),
        [visibleGuideIds]
    );
    const selectedGuide = useMemo(
        () => visibleGuides.find((guide) => guide.id === activeGuideId) || visibleGuides[0] || null,
        [activeGuideId, visibleGuides]
    );
    const displayAliasSuggestions = useMemo(() => {
        const items = new Set();
        (drugReference?.aliases || []).forEach((item) => items.add(item));
        (drugKnowledge?.commonBrands || []).forEach((item) => items.add(item));
        return Array.from(items)
            .filter((item) => normalizeLookupValue(item) !== normalizeLookupValue(drugKeyword))
            .slice(0, 5);
    }, [drugKnowledge, drugKeyword, drugReference]);
    const searchSummary = useMemo(() => {
        if (!drugSearchContext) {
            return null;
        }
        return {
            inputKeyword: drugSearchContext.inputKeyword,
            interpretedKeyword: drugReference?.canonicalName || drugKnowledge?.matchedName || drugSearchContext.inputKeyword,
            aliases: displayAliasSuggestions.slice(0, 3)
        };
    }, [displayAliasSuggestions, drugKnowledge, drugReference, drugSearchContext]);

    const resetDrugWorkspace = () => {
        activeDrugSearchIdRef.current += 1;
        setActiveGuideId(CHRONIC_GUIDES[0].id);
        setDrugError('');
        setDrugNotice('');
        setDrugResults([]);
        setMatchedGuideIds([]);
        setDrugKnowledge(null);
        setDrugKnowledgeLoading(false);
        setDrugMediaMap({});
        setDrugReference(null);
        setHasDrugSearchAttempted(false);
        setDrugSearchContext(null);
    };

    const searchDrug = async (rawKeyword) => {
        let keyword = formatSnippet(rawKeyword);
        if (!keyword) {
            activeDrugSearchIdRef.current += 1;
            syncDrugKeywordToUrl('');
            setDrugError('请输入药品名称，例如阿司匹林、氨氯地平或 aspirin。');
            setDrugNotice('');
            setDrugResults([]);
            setDrugKnowledge(null);
            setDrugMediaMap({});
            setDrugReference(null);
            return;
        }

        syncDrugKeywordToUrl(rawKeyword);
        const nextSearchId = activeDrugSearchIdRef.current + 1;
        activeDrugSearchIdRef.current = nextSearchId;
        const isStaleSearch = () => activeDrugSearchIdRef.current !== nextSearchId;

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

        setHasDrugSearchAttempted(true);
        setDrugReference(nextDrugReference);
        setDrugSearchContext({
            inputKeyword: formatSnippet(rawKeyword, 60)
        });

        const keywordKnowledge = await requestDrugKnowledge(keyword, apiContext);
        if (isStaleSearch()) {
            return;
        }
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
            ? '已先为你整理一份更容易看懂的用药速览。'
            : '');
        setDrugResults([]);
        setDrugKnowledge(null);
        setDrugKnowledgeLoading(false);
        setDrugMediaMap({});

        try {
            let nextResults = [];
            let lastMessage = '';

            for (const searchKeyword of retryKeywords) {
                const expressions = buildDrugSearchExpressions(searchKeyword);
                for (const expression of expressions) {
                    const { response, payload } = await requestDrugLabelPayload(expression, apiContext);
                    if (isStaleSearch()) {
                        return;
                    }
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
                        ? `${lastMessage}，已先展示用药速览。`
                        : '暂时没有查到完整说明，已先展示用药速览。');
                } else {
                    setDrugError(lastMessage || '暂时没有找到匹配的药品信息，换个更完整的名字试试。');
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
            setDrugNotice('');
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
            if (isStaleSearch()) {
                return;
            }

            setDrugKnowledge(knowledgePayload || null);
            setDrugMediaMap(Object.fromEntries(mediaPairs.filter(([, url]) => url)));
            setDrugKnowledgeLoading(false);
        } catch (error) {
            if (isStaleSearch()) {
                return;
            }
            setDrugKnowledgeLoading(false);
            const localizedErrorMessage = resolveDrugSearchErrorMessage(error?.message, 0);
            if (nextDrugReference) {
                setDrugError('');
                setDrugNotice(`${localizedErrorMessage || '这次完整说明加载不太顺'}，已先展示用药速览。`);
            } else {
                setDrugError(localizedErrorMessage || '药品信息加载失败，请稍后重试。');
            }
        } finally {
            if (!isStaleSearch()) {
                setDrugLoading(false);
            }
        }
    };

    const handleDrugSearch = async (event) => {
        event.preventDefault();
        await searchDrug(drugKeyword);
    };

    const handleQuickQuery = async (keyword) => {
        setDrugKeyword(keyword);
        await searchDrug(keyword);
    };

    const handleClearSearch = () => {
        setDrugKeyword('');
        syncDrugKeywordToUrl('');
        resetDrugWorkspace();
    };

    searchDrugRef.current = searchDrug;

    useEffect(() => {
        if (hasAutoSearchedInitialKeywordRef.current || !initialDrugKeywordRef.current) {
            return;
        }

        hasAutoSearchedInitialKeywordRef.current = true;
        void searchDrugRef.current?.(initialDrugKeywordRef.current);
    }, []);

    return (
        <section className="drug-lookup-shell">
            <section className="drug-lookup-search-card">
                <div className="drug-lookup-intro">
                    <div className="drug-lookup-intro-copy">
                        <p className="drug-lookup-description">
                            支持中文名、商品名和英文名，适合家属、长辈和普通用户日常查询。
                        </p>
                    </div>

                    <div className="drug-lookup-badge-row" aria-label="服务特点">
                        <span className="drug-lookup-badge">中文速览</span>
                        <span className="drug-lookup-badge">常见用途</span>
                        <span className="drug-lookup-badge">复诊提示</span>
                    </div>
                </div>

                <form className="drug-lookup-form" onSubmit={handleDrugSearch}>
                    <label className="drug-lookup-label" htmlFor="drug-check-search">药品名称</label>
                    <div className="drug-lookup-input-row">
                        <input
                            id="drug-check-search"
                            className="drug-lookup-input"
                            type="text"
                            value={drugKeyword}
                            onChange={(event) => setDrugKeyword(event.target.value)}
                            placeholder="例如：二甲双胍 / 格华止 / metformin"
                            aria-label="药品检索输入框"
                        />
                        {drugKeyword ? (
                            <button
                                type="button"
                                className="drug-lookup-clear"
                                onClick={handleClearSearch}
                            >
                                清空
                            </button>
                        ) : null}
                        <button className="drug-lookup-submit" type="submit" disabled={drugLoading}>
                            {drugLoading ? '查询中...' : '查询'}
                        </button>
                    </div>
                    <p className="drug-lookup-helper">
                        可直接输入药盒上的名字；不会写全名也可以先搜常用叫法。
                    </p>
                </form>

                <div className="drug-lookup-quick-row">
                    <span className="drug-lookup-quick-label">常搜药品</span>
                    <div className="drug-lookup-chip-row">
                        {COMMON_DRUG_QUICK_QUERIES.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className="drug-lookup-chip"
                                onClick={() => void handleQuickQuery(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {!hasDrugSearchAttempted ? (
                    <div className="drug-lookup-help-grid">
                        {HUMAN_SEARCH_GUIDE_CARDS.map((card) => (
                            <section key={card.title} className="drug-lookup-help-card">
                                <h3>{card.title}</h3>
                                <ul>
                                    {card.points.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                ) : null}
            </section>

            {searchSummary ? (
                <section className="drug-lookup-summary" role="status" aria-live="polite">
                    <p>
                        {searchSummary.inputKeyword === searchSummary.interpretedKeyword
                            ? <>已为你整理 <strong>{searchSummary.interpretedKeyword}</strong> 的相关资料。</>
                            : <>已将 <strong>{searchSummary.inputKeyword}</strong> 识别为 <strong>{searchSummary.interpretedKeyword}</strong>。</>}
                    </p>
                    {searchSummary.aliases.length ? (
                        <div className="drug-lookup-suggestion-row">
                            <span>也可以试试这些叫法</span>
                            <div className="drug-lookup-chip-row">
                                {searchSummary.aliases.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className="drug-lookup-chip is-soft"
                                        onClick={() => void handleQuickQuery(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </section>
            ) : null}

            {drugLoading ? (
                <div className="drug-lookup-state state-loading" role="status">
                    <div className="drug-lookup-loading-dot" />
                    <div>
                        <strong>正在整理药品资料</strong>
                        <p>通常几秒内会返回结果，请稍等。</p>
                    </div>
                </div>
            ) : null}

            {drugNotice ? (
                <div className="drug-lookup-state state-notice" role="status">
                    <p>{drugNotice}</p>
                </div>
            ) : null}

            {drugError ? (
                <div className="drug-lookup-state state-error" role="alert">
                    <p>{drugError}</p>
                    <span>可尝试：通用名、品牌名或英文名，例如阿托伐他汀 / 立普妥 / atorvastatin。</span>
                </div>
            ) : null}

            {drugReference ? (
                <section className="drug-lookup-section">
                    <div className="drug-lookup-section-head">
                        <div>
                            <h3>用药速览</h3>
                            <p>先看这几个重点，具体剂量和疗程仍以医生、药师建议为准。</p>
                        </div>
                    </div>

                    <div className="drug-lookup-reference-grid">
                        <article className="drug-lookup-card is-primary">
                            <p className="drug-lookup-card-kicker">{drugReference.category}</p>
                            <h4>{drugReference.canonicalName}</h4>
                            <p className="drug-lookup-card-subtitle">{drugReference.englishName}</p>
                            <p className="drug-lookup-card-summary">{drugReference.summary}</p>
                        </article>

                        <article className="drug-lookup-card">
                            <h4>常见适用场景</h4>
                            <ul className="drug-lookup-bullets">
                                {drugReference.commonUses.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </article>

                        <article className="drug-lookup-card">
                            <h4>日常需要留意</h4>
                            <ul className="drug-lookup-bullets">
                                {drugReference.dailyFocus.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </article>

                        <article className="drug-lookup-card">
                            <h4>看诊时可以问</h4>
                            <ul className="drug-lookup-bullets">
                                {drugReference.askDoctor.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </article>
                    </div>
                </section>
            ) : null}

            {(hasDrugSearchAttempted && (drugResults.length || drugKnowledge?.patientEducation || drugOfficialLinks.length)) ? (
                <section className="drug-lookup-section">
                    <div className="drug-lookup-section-head">
                        <div>
                            <h3>完整说明与补充资料</h3>
                            <p>需要进一步确认时，可以继续打开更完整的药品资料。</p>
                        </div>

                        {drugOfficialLinks.length ? (
                            <div className="drug-lookup-link-row">
                                {drugOfficialLinks.map((link) => (
                                    <a key={link.url} className="drug-lookup-link" href={link.url} target="_blank" rel="noreferrer">
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {drugKnowledgeLoading ? (
                        <p className="drug-lookup-loading-note">正在补充更完整的资料...</p>
                    ) : null}

                    {drugKnowledge?.patientEducation ? (
                        <article className="drug-lookup-card drug-lookup-education-card">
                            <div>
                                <p className="drug-lookup-card-kicker">进一步了解</p>
                                <h4>{drugKnowledge.patientEducation.title || '用药教育'}</h4>
                                <p className="drug-lookup-card-summary">
                                    {drugKnowledge.patientEducation.summary
                                        ? drugKnowledge.patientEducation.summary
                                        : '已匹配到一份可继续阅读的用药教育页面。'}
                                </p>
                            </div>

                            <a
                                className="drug-lookup-link"
                                href={drugKnowledge.patientEducation.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                打开用药教育
                            </a>
                        </article>
                    ) : null}

                    {drugResults.length ? (
                        <ul className="drug-lookup-results">
                            {drugResults.map((item) => (
                                <li
                                    key={item.id}
                                    className={`drug-lookup-result-card ${drugMediaMap[item.id] ? 'has-media' : ''}`}
                                >
                                    {drugMediaMap[item.id] ? (
                                        <div className="drug-lookup-result-media">
                                            <img src={drugMediaMap[item.id]} alt={`${item.brand} 药品图片`} />
                                        </div>
                                    ) : null}

                                    <div className="drug-lookup-result-body">
                                        <div className="drug-lookup-result-head">
                                            <strong>{item.brand}</strong>
                                            {item.generic !== '未提供' ? <span>{item.generic}</span> : null}
                                        </div>

                                        <div className="drug-lookup-result-copy">
                                            {item.activeIngredient ? (
                                                <p><span>常见成分</span>{item.activeIngredient}</p>
                                            ) : null}
                                            {item.purpose ? (
                                                <p><span>常见用途</span>{item.purpose}</p>
                                            ) : null}
                                            {item.warning ? (
                                                <p><span>注意事项</span>{item.warning}</p>
                                            ) : null}
                                        </div>

                                        <a className="drug-lookup-link is-inline" href={item.dailyMedLink} target="_blank" rel="noreferrer">
                                            查看完整说明
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </section>
            ) : null}

            {selectedGuide ? (
                <section className="drug-lookup-section">
                    <div className="drug-lookup-section-head">
                        <div>
                            <h3>相关健康提醒</h3>
                            <p>如果这次查药和慢病长期管理有关，可以顺手看一下这些要点。</p>
                        </div>
                    </div>

                    {visibleGuides.length > 1 ? (
                        <div className="drug-lookup-guide-tabs" role="tablist" aria-label="相关健康提醒">
                            {visibleGuides.map((guide) => (
                                <button
                                    key={guide.id}
                                    type="button"
                                    className={`drug-lookup-guide-tab ${guide.id === selectedGuide.id ? 'is-active' : ''}`}
                                    onClick={() => setActiveGuideId(guide.id)}
                                >
                                    {guide.name}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    <div className="drug-lookup-guide-card">
                        <p className="drug-lookup-card-kicker">{selectedGuide.tag}</p>
                        <h4>{selectedGuide.name}</h4>
                        <p className="drug-lookup-card-summary">{selectedGuide.summary}</p>

                        <div className="drug-lookup-guide-grid">
                            <article className="drug-lookup-card">
                                <h4>日常重点</h4>
                                <ul className="drug-lookup-bullets">
                                    {selectedGuide.focus.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </article>

                            <article className="drug-lookup-card">
                                <h4>看诊时可问</h4>
                                <ul className="drug-lookup-bullets">
                                    {selectedGuide.askDoctor.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </article>

                            <article className="drug-lookup-card">
                                <h4>尽快就医信号</h4>
                                <ul className="drug-lookup-bullets">
                                    {selectedGuide.redFlags.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>
            ) : null}

            {hasDrugSearchAttempted ? (
                <section className="drug-lookup-section">
                    <div className="drug-lookup-section-head">
                        <div>
                            <h3>看诊前可以带上这些</h3>
                            <p>提前准备好，和医生沟通会更高效。</p>
                        </div>
                    </div>

                    <ul className="drug-lookup-checklist">
                        {MEDICAL_VISIT_CHECKLIST.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <p className="drug-lookup-disclaimer">
                页面内容仅作日常用药参考，不替代医生、药师的个体化诊疗与用药建议。
            </p>
        </section>
    );
};

export default DrugLookupExperience;
