import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public', 'data', 'ai-conan-news.json');
const TIME_ZONE = 'Asia/Shanghai';
const LOCALE = 'zh-CN';
const MAX_AGE_DAYS = 45;
const MAX_ITEMS = 30;

const FEEDS = [
  {
    id: 'openai-news',
    name: 'OpenAI News',
    label: 'OpenAI 官方资讯',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    url: 'https://openai.com/news/rss.xml'
  },
  {
    id: 'google-ai-blog',
    name: 'Google AI Blog',
    label: 'Google AI 官方博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    url: 'https://blog.google/technology/ai/rss/'
  },
  {
    id: 'deepmind-blog',
    name: 'Google DeepMind Blog',
    label: 'Google DeepMind 官方博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    url: 'https://deepmind.google/discover/blog/feed/'
  },
  {
    id: 'microsoft-ai-blog',
    name: 'Microsoft AI Blog',
    label: 'Microsoft AI 官方博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    url: 'https://blogs.microsoft.com/blog/tag/ai/feed/'
  },
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch AI',
    label: 'TechCrunch AI 频道',
    kind: 'mixed',
    publisherType: 'media',
    filterMode: 'funding-or-product',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/'
  },
  {
    id: 'crunchbase-funding',
    name: 'Crunchbase Funding',
    label: 'Crunchbase Funding',
    kind: 'funding',
    publisherType: 'media',
    filterMode: 'funding-and-ai',
    url: 'https://news.crunchbase.com/tag/funding/feed/'
  },
  {
    id: 'crunchbase-seed',
    name: 'Crunchbase Seed Funding',
    label: 'Crunchbase Seed Funding',
    kind: 'funding',
    publisherType: 'media',
    filterMode: 'funding-and-ai',
    url: 'https://news.crunchbase.com/tag/seed-funding/feed/'
  },
  {
    id: 'crunchbase-venture',
    name: 'Crunchbase Venture Capital',
    label: 'Crunchbase Venture Capital',
    kind: 'funding',
    publisherType: 'media',
    filterMode: 'funding-and-ai',
    url: 'https://news.crunchbase.com/tag/venture-capital/feed/'
  }
];

const AI_PATTERNS = [
  /\bai\b/i,
  /artificial intelligence/i,
  /machine learning/i,
  /gen(?:erative)?\s*ai/i,
  /\bllm\b/i,
  /foundation model/i,
  /multimodal/i,
  /copilot/i,
  /agentic/i,
  /gpt-?[0-9.]+/i,
  /智能体/u,
  /人工智能/u,
  /大模型/u,
  /生成式/u,
  /模型/u,
  /\bmodels?\b/i
];

const FUNDING_PATTERNS = [
  /funding/i,
  /fundraise/i,
  /fundraising/i,
  /raise(?:d|s)?/i,
  /series\s+[A-Z]/i,
  /seed/i,
  /investment/i,
  /investor/i,
  /venture/i,
  /capital/i,
  /backed/i,
  /backing/i,
  /secures?/i,
  /acquire/i,
  /ipo/i,
  /融资/u,
  /投资/u,
  /募资/u,
  /并购/u,
  /收购/u,
  /种子轮/u,
  /天使轮/u,
  /A轮/u,
  /B轮/u,
  /C轮/u
];

const PRODUCT_PATTERNS = [
  /launch(?:ed|es)?/i,
  /release(?:d|s)?/i,
  /introduc(?:e|es|ed)/i,
  /unveil(?:ed|s)?/i,
  /announce(?:d|s)?/i,
  /\bdebut\b/i,
  /\bpreview\b/i,
  /new\s+model/i,
  /new\s+feature/i,
  /rolls? out/i,
  /\bagents?\b/i,
  /\bassistant\b/i,
  /\bcopilot\b/i,
  /\bworkflow\b/i,
  /\bplatform\b/i,
  /\bapi\b/i,
  /\bmodels?\b/i,
  /\bapp(?:lication)?s?\b/i,
  /产品/u,
  /应用/u,
  /发布/u,
  /上线/u,
  /升级/u,
  /推出/u,
  /模型/u,
  /平台/u,
  /工具/u
];

const MONEY_PATTERN = /(\$|€|£|¥|₹)\s?\d|\d\s?(million|billion|trillion|亿元|万美元|亿美元|万人民币|亿人民币)/i;

const THEME_DEFINITIONS = [
  { label: 'Agent', patterns: [/agent/i, /智能体/u] },
  { label: '编码智能', patterns: [/code/i, /coding/i, /developer/i, /codex/i, /编程/u, /编码/u] },
  { label: '多模态与视频', patterns: [/multimodal/i, /video/i, /audio/i, /speech/i, /voice/i, /多模态/u, /视频/u, /语音/u] },
  { label: '企业应用', patterns: [/enterprise/i, /workflow/i, /customer/i, /sales/i, /business/i, /办公/u, /企业/u, /客服/u] },
  { label: '安全', patterns: [/security/i, /trust/i, /安全/u] },
  { label: '医疗健康', patterns: [/health/i, /medical/i, /bio/i, /医疗/u, /健康/u] },
  { label: '算力芯片', patterns: [/chip/i, /gpu/i, /compute/i, /inference/i, /semiconductor/i, /芯片/u, /算力/u] },
  { label: '投融资', patterns: [/funding/i, /series/i, /investment/i, /融资/u, /投资/u] },
  { label: '模型能力', patterns: [/model/i, /llm/i, /reasoning/i, /推理/u, /模型/u] }
];

const SOURCE_SCORE = {
  'OpenAI News': 13,
  'Google AI Blog': 11,
  'Google DeepMind Blog': 11,
  'Microsoft AI Blog': 10,
  'TechCrunch AI': 7,
  'Crunchbase Funding': 7,
  'Crunchbase Seed Funding': 8,
  'Crunchbase Venture Capital': 7
};

function stripCdata(value = '') {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function decodeXml(value = '') {
  const named = value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return named.replace(/&#(x?[0-9a-fA-F]+);/g, (_, code) => {
    const valueCode = code.toLowerCase().startsWith('x')
      ? Number.parseInt(code.slice(1), 16)
      : Number.parseInt(code, 10);

    return Number.isFinite(valueCode) ? String.fromCodePoint(valueCode) : '';
  });
}

function stripHtml(value = '') {
  return decodeXml(stripCdata(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? stripCdata(match[1]) : '';
}

function extractTags(block, tagName) {
  return [...block.matchAll(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'gi'))]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
}

function parseRssItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const block = match[1];

    return {
      title: stripHtml(extractTag(block, 'title')),
      link: decodeXml(stripCdata(extractTag(block, 'link'))),
      description: stripHtml(extractTag(block, 'description') || extractTag(block, 'content:encoded')),
      pubDate: stripHtml(extractTag(block, 'pubDate')),
      author: stripHtml(extractTag(block, 'dc:creator')),
      sourceName: stripHtml(extractTag(block, 'source')),
      categories: extractTags(block, 'category')
    };
  });
}

function normalizeText(value = '') {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function countMatches(text, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function isToday(date) {
  return dayKey(date) === dayKey(new Date());
}

function dayKey(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function formatDate(date) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function extractThemes(text) {
  return THEME_DEFINITIONS
    .filter((theme) => theme.patterns.some((pattern) => pattern.test(text)))
    .map((theme) => theme.label)
    .slice(0, 3);
}

function classifyEntry(feed, entry) {
  const content = `${entry.title} ${entry.description} ${entry.categories.join(' ')}`;
  const aiHits = countMatches(content, AI_PATTERNS);
  const fundingHits = countMatches(content, FUNDING_PATTERNS);
  const productHits = countMatches(content, PRODUCT_PATTERNS);

  const passesFilter = {
    'product-or-ai': productHits > 0 || aiHits > 0,
    'funding-or-product': fundingHits > 0 || productHits > 1,
    'funding-and-ai': fundingHits > 0 && aiHits > 0
  }[feed.filterMode];

  if (!passesFilter) {
    return null;
  }

  const classification = feed.kind === 'funding'
    ? 'funding'
    : (fundingHits > productHits && (MONEY_PATTERN.test(content) || fundingHits >= 2))
      ? 'funding'
      : 'product';

  return {
    classification,
    aiHits,
    fundingHits,
    productHits,
    themes: extractThemes(content)
  };
}

function buildImportance(feed, entry, details, publishedAt) {
  const hoursOld = Math.max(0, (Date.now() - publishedAt.getTime()) / 36e5);
  let score = 8;

  score += details.classification === 'funding' ? 10 : 8;
  score += details.fundingHits * 3 + details.productHits * 2 + details.aiHits * 2;
  score += feed.publisherType === 'official' ? 8 : 4;
  score += SOURCE_SCORE[feed.name] || 0;
  score += MONEY_PATTERN.test(`${entry.title} ${entry.description}`) ? 8 : 0;
  score += hoursOld <= 24 ? 8 : hoursOld <= 72 ? 4 : 0;

  const level = score >= 50 ? 'high' : score >= 46 ? 'medium' : 'watch';
  const reasons = [];

  if (feed.publisherType === 'official') {
    reasons.push('官方产品源');
  }
  if (details.classification === 'funding' && MONEY_PATTERN.test(`${entry.title} ${entry.description}`)) {
    reasons.push('含融资金额');
  }
  if (hoursOld <= 24) {
    reasons.push('24 小时内更新');
  }
  if (details.themes.length > 0) {
    reasons.push(details.themes[0]);
  }

  return { score, level, reason: reasons.slice(0, 3).join(' · ') };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Aria AI Conan News Sync/1.0'
    },
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function topThemes(items, category) {
  const counts = new Map();

  items
    .filter((item) => item.category === category)
    .flatMap((item) => item.tags)
    .forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

function buildRecommendations(stats, fundingThemes, productThemes) {
  const leadFunding = fundingThemes[0] || '投融资';
  const leadProduct = productThemes[0] || '产品与应用';
  const recommendations = [
    `把“${leadFunding} + ${leadProduct}”列入本周一级跟踪，优先观察哪些团队出现“融资后 30 天内继续发产品”的双重信号。`,
    '高优先级条目建议沉淀到 Aria 周报，统一记录融资规模、目标用户、能力差异和可复用接口。'
  ];

  if (stats.todayCount >= 4) {
    recommendations.unshift('今日新增密度较高，建议先处理高优先级和官方源，再看媒体二手解读，避免信息噪音。');
  } else {
    recommendations.unshift('今日新增不算拥挤，适合回看近 7~14 天条目，重点确认哪些赛道正在形成连续投资与连续发布。');
  }

  if (productThemes.includes('Agent') || productThemes.includes('编码智能')) {
    recommendations.push('优先评估 Agent、编码智能、多模态这三类能力的接入门槛，它们最容易转化为 Aria 的功能升级。');
  }

  return recommendations.slice(0, 4);
}

function buildSummary(items, generatedAt) {
  const stats = {
    totalCount: items.length,
    fundingCount: items.filter((item) => item.category === 'funding').length,
    productCount: items.filter((item) => item.category === 'product').length,
    highCount: items.filter((item) => item.importance === 'high').length,
    todayCount: items.filter((item) => item.isToday).length,
    officialCount: items.filter((item) => item.publisherType === 'official').length
  };

  const fundingThemes = topThemes(items, 'funding');
  const productThemes = topThemes(items, 'product');
  const dominantMode = stats.fundingCount > stats.productCount
    ? '资本信号更强'
    : stats.productCount > stats.fundingCount
      ? '产品上新更快'
      : '资本与产品同步推进';

  return {
    title: `今日 AI 柯南判断：${dominantMode}`,
    overview: `截至 ${formatDate(generatedAt)}，本页追踪到 ${stats.totalCount} 条有效情报，其中融资 ${stats.fundingCount} 条、产品/应用 ${stats.productCount} 条，高优先级 ${stats.highCount} 条，今日新增 ${stats.todayCount} 条。`,
    insight: `融资主题更偏向 ${fundingThemes.join('、') || '基础设施与应用层'}；产品主题更偏向 ${productThemes.join('、') || '模型能力与创新应用'}。`,
    recommendations: buildRecommendations(stats, fundingThemes, productThemes),
    stats,
    fundingThemes,
    productThemes
  };
}

async function readExistingCache() {
  try {
    const raw = await fs.readFile(OUTPUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function buildDataset() {
  const failures = [];
  const seen = new Set();
  const items = [];

  for (const feed of FEEDS) {
    try {
      const xml = await fetchText(feed.url);
      const parsed = parseRssItems(xml);

      for (const entry of parsed) {
        const publishedAt = new Date(entry.pubDate || Date.now());

        if (Number.isNaN(publishedAt.getTime())) {
          continue;
        }

        const ageDays = (Date.now() - publishedAt.getTime()) / 864e5;

        if (ageDays > MAX_AGE_DAYS) {
          continue;
        }

        const details = classifyEntry(feed, entry);

        if (!details) {
          continue;
        }

        const dedupeKey = normalizeText(entry.title);

        if (!dedupeKey || seen.has(dedupeKey)) {
          continue;
        }

        seen.add(dedupeKey);

        const importance = buildImportance(feed, entry, details, publishedAt);
        items.push({
          id: `${feed.id}-${seen.size}`,
          title: entry.title,
          link: entry.link,
          description: entry.description,
          author: entry.author,
          source: entry.sourceName || feed.name,
          sourceLabel: feed.label,
          sourceUrl: feed.url,
          publisherType: feed.publisherType,
          category: details.classification,
          importance: importance.level,
          importanceScore: importance.score,
          reason: importance.reason,
          tags: details.themes.length > 0 ? details.themes : ['AI'],
          publishedAt: publishedAt.toISOString(),
          publishedAtLabel: formatDate(publishedAt),
          isToday: isToday(publishedAt)
        });
      }
    } catch (error) {
      failures.push({
        feed: feed.label,
        url: feed.url,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  items.sort((left, right) => {
    if (right.importanceScore !== left.importanceScore) {
      return right.importanceScore - left.importanceScore;
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });

  const trimmedItems = items.slice(0, MAX_ITEMS);
  const generatedAt = new Date();
  const summary = buildSummary(trimmedItems, generatedAt);

  return {
    meta: {
      generatedAt: generatedAt.toISOString(),
      generatedAtLabel: formatDate(generatedAt),
      timezone: TIME_ZONE,
      mode: failures.length === 0 ? 'live' : 'live-with-partial-fallback',
      totalSources: FEEDS.length,
      successfulSources: FEEDS.length - failures.length,
      sourceCatalog: FEEDS.map((feed) => ({
        id: feed.id,
        label: feed.label,
        url: feed.url,
        kind: feed.kind,
        publisherType: feed.publisherType
      })),
      failedSources: failures
    },
    summary,
    items: trimmedItems
  };
}

async function main() {
  const existing = await readExistingCache();
  const dataset = await buildDataset();

  const finalDataset = dataset.items.length === 0 && existing
    ? {
        ...existing,
        meta: {
          ...existing.meta,
          generatedAt: new Date().toISOString(),
          generatedAtLabel: formatDate(new Date()),
          mode: 'cache',
          cacheReason: '上游源暂时未返回可用条目，沿用最近一次成功快照。'
        }
      }
    : dataset;

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(finalDataset, null, 2)}\n`, 'utf8');

  console.log(`AI Conan news sync complete: ${finalDataset.items.length} items -> ${OUTPUT_PATH}`);

  if (finalDataset.meta.failedSources?.length) {
    console.warn(`Partial source failures: ${finalDataset.meta.failedSources.length}`);
  }
}

main().catch(async (error) => {
  const existing = await readExistingCache();

  if (existing) {
    console.warn(`AI Conan sync failed, kept existing cache: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(0);
  }

  console.error(error);
  process.exit(1);
});
