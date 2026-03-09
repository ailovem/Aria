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
const TRANSLATE_CONCURRENCY = 4;

const FEEDS = [
  {
    id: 'openai-news',
    name: 'OpenAI News',
    label: 'OpenAI 官方资讯',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://openai.com/news/rss.xml'
  },
  {
    id: 'google-ai-blog',
    name: 'Google AI Blog',
    label: 'Google AI 官方博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://blog.google/technology/ai/rss/'
  },
  {
    id: 'deepmind-blog',
    name: 'Google DeepMind Blog',
    label: 'Google DeepMind 官方博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://deepmind.google/discover/blog/feed/'
  },
  {
    id: 'microsoft-ai-blog',
    name: 'Microsoft AI Blog',
    label: 'Microsoft AI 官方博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://blogs.microsoft.com/blog/tag/ai/feed/'
  },
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch AI',
    label: 'TechCrunch AI 频道',
    kind: 'mixed',
    publisherType: 'media',
    filterMode: 'funding-or-product',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/'
  },
  {
    id: 'crunchbase-funding',
    name: 'Crunchbase Funding',
    label: 'Crunchbase Funding',
    kind: 'funding',
    publisherType: 'media',
    filterMode: 'funding-and-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://news.crunchbase.com/tag/funding/feed/'
  },
  {
    id: 'crunchbase-seed',
    name: 'Crunchbase Seed Funding',
    label: 'Crunchbase Seed Funding',
    kind: 'funding',
    publisherType: 'media',
    filterMode: 'funding-and-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://news.crunchbase.com/tag/seed-funding/feed/'
  },
  {
    id: 'crunchbase-venture',
    name: 'Crunchbase Venture Capital',
    label: 'Crunchbase Venture Capital',
    kind: 'funding',
    publisherType: 'media',
    filterMode: 'funding-and-ai',
    region: 'global',
    languageHint: 'en',
    fetchMode: 'rss',
    url: 'https://news.crunchbase.com/tag/venture-capital/feed/'
  },
  {
    id: 'qwen-zh-blog',
    name: 'Qwen Blog Zh',
    label: 'Qwen 中文博客',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    region: 'china',
    languageHint: 'zh',
    fetchMode: 'rss',
    url: 'https://qwenlm.github.io/zh/blog/index.xml'
  },
  {
    id: 'zhipu-news',
    name: 'Zhipu News',
    label: '智谱官方动态',
    kind: 'product',
    publisherType: 'official',
    filterMode: 'product-or-ai',
    region: 'china',
    languageHint: 'zh',
    fetchMode: 'zhipu-news',
    url: 'https://www.zhipuai.cn/news'
  },
  {
    id: 'ifanr-aigc',
    name: 'ifanr AIGC',
    label: '爱范儿 AIGC',
    kind: 'mixed',
    publisherType: 'media',
    filterMode: 'funding-or-product-and-ai',
    region: 'china',
    languageHint: 'zh',
    fetchMode: 'ifanr-aigc-api',
    url: 'https://sso.ifanr.com/api/v5/wp/article/?post_category=AIGC'
  },
  {
    id: 'leiphone-ai',
    name: 'Leiphone AI',
    label: '雷峰网',
    kind: 'mixed',
    publisherType: 'media',
    filterMode: 'funding-or-product-and-ai',
    region: 'china',
    languageHint: 'zh',
    fetchMode: 'leiphone-ai',
    url: 'https://www.leiphone.com/category/ai'
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
  /\bmodels?\b/i,
  /deepseek/i,
  /qwen/i,
  /通义/u,
  /kimi/i,
  /智谱/u,
  /glm/i,
  /minimax/i,
  /百川/u,
  /moonshot/i,
  /豆包/u,
  /文心/u
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
  /Pre-A/u,
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
  /工具/u,
  /开源/u,
  /内测/u,
  /公测/u,
  /更新/u
];

const CHINA_PATTERNS = [
  /中国/u,
  /国内/u,
  /国产/u,
  /China/i,
  /Chinese/i,
  /北京/u,
  /上海/u,
  /杭州/u,
  /深圳/u,
  /智谱/u,
  /通义/u,
  /Qwen/i,
  /DeepSeek/i,
  /月之暗面/u,
  /Kimi/i,
  /MiniMax/i,
  /百川/u,
  /零一万物/u,
  /字节/u,
  /腾讯/u,
  /百度/u,
  /阿里/u,
  /华为/u,
  /豆包/u,
  /文心/u,
  /商汤/u
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
  { label: '模型能力', patterns: [/model/i, /llm/i, /reasoning/i, /推理/u, /模型/u] },
  { label: '中国信号', patterns: [/中国/u, /国内/u, /国产/u, /China/i, /Qwen/i, /DeepSeek/i, /智谱/u, /Kimi/i] }
];

const SOURCE_SCORE = {
  'OpenAI News': 13,
  'Google AI Blog': 11,
  'Google DeepMind Blog': 11,
  'Microsoft AI Blog': 10,
  'TechCrunch AI': 7,
  'Crunchbase Funding': 7,
  'Crunchbase Seed Funding': 8,
  'Crunchbase Venture Capital': 7,
  'Qwen Blog Zh': 11,
  'Zhipu News': 10,
  'ifanr AIGC': 8,
  'Leiphone AI': 8
};

const translationCache = new Map();

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
      sourceName: stripHtml(extractTag(block, 'source') || extractTag(block, 'News:Source')),
      categories: extractTags(block, 'category')
    };
  });
}

function extractEscapedObjectArray(rawText, marker) {
  const startIndex = rawText.indexOf(marker);
  if (startIndex < 0) {
    return [];
  }

  const objects = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let current = '';

  for (let cursor = startIndex + marker.length; cursor < rawText.length; cursor += 1) {
    const char = rawText[cursor];

    if (depth === 0) {
      if (char === '{') {
        depth = 1;
        current = '{';
      } else if (char === ']') {
        break;
      }
      continue;
    }

    current += char;

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        objects.push(current);
        current = '';
      }
    }
  }

  return objects
    .map((value) => value.replace(/\\"/g, '"').replace(/\\\//g, '/').replace(/\\n/g, ' ').replace(/\\r/g, ' '))
    .map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function parseZhipuNewsEntries(html, feed) {
  const rows = extractEscapedObjectArray(html, 'newsItems\\":[');

  return rows.map((item) => ({
    title: String(item.title_zh || item.title_en || '').trim(),
    link: feed.url,
    description: String(item.resume_zh || item.resume_en || '').trim(),
    pubDate: String(item.createAt || '').trim(),
    author: '智谱',
    sourceName: feed.name,
    categories: [String(item.tag_zh || item.tag_en || '中国 AI').trim()].filter(Boolean)
  }));
}

function parseIfanrAigcEntries(jsonText, feed) {
  let payload;
  try {
    payload = JSON.parse(jsonText);
  } catch {
    return [];
  }

  const rows = Array.isArray(payload?.objects) ? payload.objects : [];
  return rows.map((item) => ({
    title: String(item.post_title || '').trim(),
    link: String(item.post_url || feed.url).trim(),
    description: stripHtml(String(item.post_excerpt || item.compact_post_content || '').trim()),
    pubDate: Number.isFinite(Number(item.published_at))
      ? new Date(Number(item.published_at) * 1000).toISOString()
      : '',
    author: '爱范儿',
    sourceName: feed.name,
    categories: ['AIGC', String(item.post_category || '').trim()].filter(Boolean)
  }));
}

function parseChineseTimeLabel(label) {
  const text = String(label || '').trim();
  if (!text) {
    return '';
  }

  const now = new Date();
  const minuteMatch = text.match(/(\d+)分钟前/u);
  if (minuteMatch) {
    return new Date(now.getTime() - Number(minuteMatch[1]) * 60 * 1000).toISOString();
  }

  const hourMatch = text.match(/(\d+)小时前/u);
  if (hourMatch) {
    return new Date(now.getTime() - Number(hourMatch[1]) * 60 * 60 * 1000).toISOString();
  }

  const yesterdayMatch = text.match(/昨天\s*(\d{1,2}):(\d{2})/u);
  if (yesterdayMatch) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    date.setHours(Number(yesterdayMatch[1]), Number(yesterdayMatch[2]), 0, 0);
    return date.toISOString();
  }

  const monthDayMatch = text.match(/(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/u);
  if (monthDayMatch) {
    const date = new Date(now);
    date.setMonth(Number(monthDayMatch[1]) - 1, Number(monthDayMatch[2]));
    date.setHours(Number(monthDayMatch[3]), Number(monthDayMatch[4]), 0, 0);
    return date.toISOString();
  }

  return '';
}

function parseLeiphoneAiEntries(html, feed) {
  const matches = [...html.matchAll(/<a href="(https:\/\/www\.leiphone\.com\/category\/ai\/[^"]+)" target="_blank" title="([^"]+)" class="headTit">[\s\S]*?<\/a>[\s\S]{0,200}?<div class="des">([\s\S]*?)<\/div>[\s\S]{0,420}?<div class="time">([^<]+)<\/div>[\s\S]{0,240}?(?:<a href="https:\/\/www\.leiphone\.com\/tag\/[^"]+" title="([^"]+)"[^>]*>)?/g)];

  return matches.map((match) => ({
    title: stripHtml(match[2] || ''),
    link: String(match[1] || feed.url).trim(),
    description: stripHtml(match[3] || match[2] || ''),
    pubDate: parseChineseTimeLabel(match[4] || ''),
    author: '雷峰网',
    sourceName: feed.name,
    categories: ['AI', stripHtml(match[5] || '')].filter(Boolean)
  }));
}

function normalizeText(value = '') {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function countMatches(text, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function containsCjk(value = '') {
  return /[\u3400-\u9FFF]/u.test(value);
}

function shouldTranslateToZh(value = '') {
  const text = String(value || '').trim();
  if (!text) {
    return false;
  }
  if (containsCjk(text)) {
    return false;
  }
  return /[A-Za-z]/.test(text);
}

function dayKey(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function isToday(date) {
  return dayKey(date) === dayKey(new Date());
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

function detectRegion(feed, entry) {
  const content = `${entry.title} ${entry.description} ${entry.categories.join(' ')}`;
  if (feed.region === 'china') {
    return 'china';
  }
  if (CHINA_PATTERNS.some((pattern) => pattern.test(content))) {
    return 'china';
  }
  return 'global';
}

function classifyEntry(feed, entry) {
  const content = `${entry.title} ${entry.description} ${entry.categories.join(' ')}`;
  const aiHits = countMatches(content, AI_PATTERNS);
  const fundingHits = countMatches(content, FUNDING_PATTERNS);
  const productHits = countMatches(content, PRODUCT_PATTERNS);

  const passesFilter = {
    'product-or-ai': productHits > 0 || aiHits > 0,
    'funding-or-product': fundingHits > 0 || productHits > 1,
    'funding-or-product-and-ai': aiHits > 0 && (fundingHits > 0 || productHits > 1),
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
    region: detectRegion(feed, entry),
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
  score += details.region === 'china' ? 2 : 0;
  score += hoursOld <= 24 ? 8 : hoursOld <= 72 ? 4 : 0;

  const level = score >= 54 ? 'high' : score >= 48 ? 'medium' : 'watch';
  const reasons = [];

  if (feed.publisherType === 'official') {
    reasons.push('官方产品源');
  }
  if (details.region === 'china') {
    reasons.push('中国信号');
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
      'user-agent': 'Aria AI Conan News Sync/2.0'
    },
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchFeedEntries(feed) {
  const text = await fetchText(feed.url);

  if (feed.fetchMode === 'zhipu-news') {
    return parseZhipuNewsEntries(text, feed);
  }

  if (feed.fetchMode === 'ifanr-aigc-api') {
    return parseIfanrAigcEntries(text, feed);
  }

  if (feed.fetchMode === 'leiphone-ai') {
    return parseLeiphoneAiEntries(text, feed);
  }

  return parseRssItems(text);
}

async function translateTextToZh(text) {
  const normalized = String(text || '').trim();
  if (!normalized) {
    return '';
  }
  if (!shouldTranslateToZh(normalized)) {
    return normalized;
  }
  if (translationCache.has(normalized)) {
    return translationCache.get(normalized);
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(normalized)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
      ? payload[0].map((item) => String(item?.[0] || '')).join('').trim()
      : normalized;
    const finalValue = translated || normalized;
    translationCache.set(normalized, finalValue);
    return finalValue;
  } catch {
    translationCache.set(normalized, normalized);
    return normalized;
  }
}

async function runWithConcurrency(items, limit, handler) {
  const queue = [...items];
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length || 1)) }, async () => {
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }
      await handler(current);
    }
  });
  await Promise.all(workers);
}

async function localizeItems(items) {
  await runWithConcurrency(items, TRANSLATE_CONCURRENCY, async (item) => {
    item.titleOriginal = item.title;
    item.descriptionOriginal = item.description;

    const [titleZh, descriptionZh] = await Promise.all([
      translateTextToZh(item.title),
      item.description ? translateTextToZh(item.description) : Promise.resolve('')
    ]);

    item.title = titleZh || item.title;
    item.description = descriptionZh || item.description;
    item.translated = item.title !== item.titleOriginal || item.description !== item.descriptionOriginal;
  });
}

function topThemes(items, predicate) {
  const counts = new Map();

  items
    .filter(predicate)
    .flatMap((item) => item.tags)
    .forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

function buildRecommendations(stats, fundingThemes, productThemes, chinaThemes) {
  const leadFunding = fundingThemes[0] || '投融资';
  const leadProduct = productThemes[0] || '产品与应用';
  const recommendations = [
    stats.todayCount >= 4
      ? '今天新增信号偏密集，建议优先看高优先级与官方源，再回看媒体解读，避免被噪音带偏。'
      : '今天新增不算拥挤，适合回看近 7~14 天连续上新的团队，确认谁在形成持续加速。',
    `把“${leadFunding} + ${leadProduct}”列入本周一级跟踪，优先观察哪些团队出现“融资后 30 天内继续发产品”的双信号。`,
    '高优先级条目建议沉淀到 Aria 周报，统一记录融资规模、目标用户、能力差异和可复用接口。'
  ];

  if (stats.chinaCount > 0) {
    recommendations.push(`中国线索已进入主榜，建议单独跟踪 ${chinaThemes[0] || '国产模型与应用'}，重点看哪些能力最适合接入 Aria。`);
  }

  if (productThemes.includes('Agent') || productThemes.includes('编码智能')) {
    recommendations.push('优先评估 Agent、编码智能、多模态三类能力的接入门槛，它们最容易转化为 Aria 的功能升级。');
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
    officialCount: items.filter((item) => item.publisherType === 'official').length,
    chinaCount: items.filter((item) => item.region === 'china').length,
    chinaFundingCount: items.filter((item) => item.region === 'china' && item.category === 'funding').length,
    chinaProductCount: items.filter((item) => item.region === 'china' && item.category === 'product').length
  };

  const fundingThemes = topThemes(items, (item) => item.category === 'funding');
  const productThemes = topThemes(items, (item) => item.category === 'product');
  const chinaThemes = topThemes(items, (item) => item.region === 'china');
  const dominantMode = stats.fundingCount > stats.productCount
    ? '资本信号更强'
    : stats.productCount > stats.fundingCount
      ? '产品上新更快'
      : '资本与产品同步推进';

  return {
    title: `今日 AI 柯南判断：${dominantMode}`,
    overview: `截至 ${formatDate(generatedAt)}，本页追踪到 ${stats.totalCount} 条有效情报，其中融资 ${stats.fundingCount} 条、产品/应用 ${stats.productCount} 条、高优先级 ${stats.highCount} 条，今日新增 ${stats.todayCount} 条，中国相关 ${stats.chinaCount} 条。`,
    insight: `融资主题更偏向 ${fundingThemes.join('、') || '基础设施与应用层'}；产品主题更偏向 ${productThemes.join('、') || '模型能力与创新应用'}；中国线索重点落在 ${chinaThemes.join('、') || '国产模型与落地场景'}。`,
    recommendations: buildRecommendations(stats, fundingThemes, productThemes, chinaThemes),
    stats,
    fundingThemes,
    productThemes,
    chinaThemes
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
      const parsedEntries = await fetchFeedEntries(feed);

      for (const entry of parsedEntries) {
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
          titleOriginal: entry.title,
          link: entry.link,
          description: entry.description,
          descriptionOriginal: entry.description,
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
          region: details.region,
          regionLabel: details.region === 'china' ? '中国' : '全球',
          language: feed.languageHint,
          publishedAt: publishedAt.toISOString(),
          publishedAtLabel: formatDate(publishedAt),
          isToday: isToday(publishedAt),
          translated: false
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
  await localizeItems(trimmedItems);

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
      translatedCount: trimmedItems.filter((item) => item.translated).length,
      sourceCatalog: FEEDS.map((feed) => ({
        id: feed.id,
        label: feed.label,
        url: feed.url,
        kind: feed.kind,
        publisherType: feed.publisherType,
        region: feed.region
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
