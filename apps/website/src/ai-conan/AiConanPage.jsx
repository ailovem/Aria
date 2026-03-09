import React, { useEffect, useMemo, useState } from 'react';
import AiConanDiscussion from './AiConanDiscussion.jsx';
import './AiConanPage.css';

const FILTERS = [
  { key: 'all', label: '全部情报' },
  { key: 'china', label: '中国信息' },
  { key: 'funding', label: '融资' },
  { key: 'product', label: '产品/应用' },
  { key: 'high', label: '高优先级' },
  { key: 'today', label: '今日新增' }
];

const EMPTY_ITEMS = [];

const sourceTypeLabel = {
  official: '官方源',
  media: '媒体源'
};

const importanceLabel = {
  high: '高优先级',
  medium: '重点观察',
  watch: '持续跟踪'
};

function StatCard({ label, value, helper }) {
  return (
    <div className="ai-conan-stat glass-panel">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  );
}

function Chip({ children, tone = 'default' }) {
  return <span className={`ai-conan-chip ai-conan-chip--${tone}`}>{children}</span>;
}

function AiConanPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        const response = await fetch('/data/ai-conan-news.json', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setPayload(data);
          setError('');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const items = payload?.items ?? EMPTY_ITEMS;
  const summary = payload?.summary;
  const meta = payload?.meta;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchFilter = {
        all: true,
        china: item.region === 'china',
        funding: item.category === 'funding',
        product: item.category === 'product',
        high: item.importance === 'high',
        today: item.isToday
      }[activeFilter];

      if (!matchFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        item.title,
        item.titleOriginal,
        item.description,
        item.descriptionOriginal,
        item.source,
        item.regionLabel,
        item.tags.join(' ')
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeFilter, items, query]);

  const spotlightItems = useMemo(
    () => items.filter((item) => item.importance === 'high').slice(0, 3),
    [items],
  );

  const discussionThreadId = useMemo(() => {
    const day = String(meta?.generatedAt || '').slice(0, 10);
    return day ? `ai-conan:${day}` : 'ai-conan:latest';
  }, [meta?.generatedAt]);

  const discussionThreadTitle = summary?.title || 'AI 柯南资讯讨论';

  return (
    <div className="ai-conan-page">
      <header className="ai-conan-nav glass-panel">
        <a className="ai-conan-brand text-gradient-aria" href="/">Aria.</a>
        <nav className="ai-conan-nav-links">
          <a href="#summary">今日结论</a>
          <a href="#feed">资讯流</a>
          <a href="#discussion">评论点赞</a>
          <a href="#sources">来源机制</a>
        </nav>
        <a className="ai-conan-home-link" href="/">返回官网</a>
      </header>

      <main>
        <section className="section ai-conan-hero">
          <div className="glow-orb glow-blue ai-conan-hero-orb-left" />
          <div className="glow-orb glow-purple ai-conan-hero-orb-right" />
          <div className="container ai-conan-hero-inner">
            <div className="ai-conan-hero-copy reveal active">
              <span className="ai-conan-eyebrow">Aria · AI 情报页</span>
              <h1>
                AI 柯南融资与
                <span className="text-gradient-aria">创新应用资讯</span>
              </h1>
              <p className="subtitle ai-conan-subtitle">
                自动探查全球与中国 AI 融资、产品发布与创新应用线索，把英文资讯转成中文可读描述，并给出今日摘要、建议和互动讨论区。
              </p>

              <div className="ai-conan-actions">
                <a className="cta-button" href="#summary">查看今日总结</a>
                <a className="ai-conan-secondary-link" href="#feed">打开资讯流</a>
              </div>
            </div>

            <div className="ai-conan-stats reveal active">
              <StatCard
                label="抓取时间"
                value={meta?.generatedAtLabel || '加载中'}
                helper={meta?.mode === 'cache' ? '当前使用缓存快照' : '构建时自动刷新'}
              />
              <StatCard
                label="有效情报"
                value={summary?.stats?.totalCount ?? '--'}
                helper="按重要度排序展示"
              />
              <StatCard
                label="中国线索"
                value={summary?.stats?.chinaCount ?? '--'}
                helper="国内融资与产品动态"
              />
              <StatCard
                label="今日新增"
                value={summary?.stats?.todayCount ?? '--'}
                helper="以北京时间统计"
              />
              <StatCard
                label="高优先级"
                value={summary?.stats?.highCount ?? '--'}
                helper="优先阅读的强信号"
              />
            </div>
          </div>
        </section>

        <section className="section" id="summary">
          <div className="container">
            <div className="ai-conan-section-head">
              <div>
                <span className="ai-conan-eyebrow">今日总结</span>
                <h2>{summary?.title || '正在生成 AI 柯南判断'}</h2>
              </div>
              {meta?.mode && (
                <Chip tone={meta.mode === 'cache' ? 'warn' : 'accent'}>
                  {meta.mode === 'cache' ? '缓存模式' : meta.mode === 'live' ? '实时抓取' : '部分源已回退'}
                </Chip>
              )}
            </div>

            <div className="ai-conan-summary-grid">
              <article className="glass-panel ai-conan-summary-card">
                <h3>结论</h3>
                <p>{summary?.overview || '正在读取最近一次同步结果。'}</p>
                <p>{summary?.insight || '这里会显示融资、产品和中国信号的趋势判断。'}</p>
                {meta?.cacheReason && <p className="ai-conan-muted">{meta.cacheReason}</p>}
              </article>

              <article className="glass-panel ai-conan-summary-card">
                <h3>建议</h3>
                <ul className="ai-conan-list">
                  {(summary?.recommendations || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="ai-conan-theme-row">
              <div className="glass-panel ai-conan-theme-panel">
                <h3>融资主题</h3>
                <div className="ai-conan-chip-row">
                  {(summary?.fundingThemes?.length ? summary.fundingThemes : ['基础设施', '企业应用']).map((item) => (
                    <Chip key={item}>{item}</Chip>
                  ))}
                </div>
              </div>

              <div className="glass-panel ai-conan-theme-panel">
                <h3>产品主题</h3>
                <div className="ai-conan-chip-row">
                  {(summary?.productThemes?.length ? summary.productThemes : ['模型能力', 'Agent']).map((item) => (
                    <Chip key={item} tone="accent">{item}</Chip>
                  ))}
                </div>
              </div>

              <div className="glass-panel ai-conan-theme-panel">
                <h3>中国重点</h3>
                <div className="ai-conan-chip-row">
                  {(summary?.chinaThemes?.length ? summary.chinaThemes : ['国产模型', '应用落地']).map((item) => (
                    <Chip key={item} tone="warm">{item}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="feed">
          <div className="container">
            <div className="ai-conan-section-head">
              <div>
                <span className="ai-conan-eyebrow">资讯流</span>
                <h2>重要融资与产品线索</h2>
              </div>
              <div className="ai-conan-filter-row">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    className={`ai-conan-filter ${activeFilter === filter.key ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.key)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ai-conan-search-row">
              <input
                aria-label="搜索资讯"
                className="ai-conan-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索公司、赛道、关键词，例如 中国 / Agent / 融资 / OpenAI"
                type="search"
                value={query}
              />
              <span className="ai-conan-search-meta">当前 {filteredItems.length} / {items.length} 条</span>
            </div>

            {loading && (
              <div className="glass-panel ai-conan-empty">正在加载 AI 柯南资讯…</div>
            )}

            {!loading && error && (
              <div className="glass-panel ai-conan-empty">资讯加载失败：{error}</div>
            )}

            {!loading && !error && spotlightItems.length > 0 && (
              <div className="ai-conan-spotlight-grid">
                {spotlightItems.map((item) => (
                  <article className="glass-panel ai-conan-spotlight-card" key={item.id}>
                    <div className="ai-conan-card-head">
                      <Chip tone="accent">重点线索</Chip>
                      <span>{item.publishedAtLabel}</span>
                    </div>
                    <h3>{item.title}</h3>
                    {item.titleOriginal && item.titleOriginal !== item.title && (
                      <p className="ai-conan-original">原文：{item.titleOriginal}</p>
                    )}
                    <p>{item.reason || item.description}</p>
                    <a href={item.link} rel="noreferrer" target="_blank">查看原文</a>
                  </article>
                ))}
              </div>
            )}

            {!loading && !error && filteredItems.length === 0 && (
              <div className="glass-panel ai-conan-empty">当前筛选条件下没有结果，换个关键词试试。</div>
            )}

            <div className="ai-conan-feed-grid">
              {filteredItems.map((item) => (
                <article className="glass-panel ai-conan-card" key={item.id}>
                  <div className="ai-conan-card-head">
                    <div className="ai-conan-card-chip-group">
                      <Chip tone={item.category === 'funding' ? 'warm' : 'accent'}>
                        {item.category === 'funding' ? '融资' : '产品/应用'}
                      </Chip>
                      <Chip tone={item.importance === 'high' ? 'accent' : item.importance === 'medium' ? 'default' : 'muted'}>
                        {importanceLabel[item.importance]}
                      </Chip>
                      <Chip tone="muted">{sourceTypeLabel[item.publisherType]}</Chip>
                      <Chip tone={item.region === 'china' ? 'warm' : 'default'}>{item.regionLabel}</Chip>
                    </div>
                    <span>{item.publishedAtLabel}</span>
                  </div>

                  <h3>{item.title}</h3>
                  {item.titleOriginal && item.titleOriginal !== item.title && (
                    <p className="ai-conan-original">原文：{item.titleOriginal}</p>
                  )}
                  <p>{item.description || item.reason || '点击查看原文获取完整信息。'}</p>

                  <div className="ai-conan-card-meta">
                    <span>{item.source}</span>
                    {item.reason && <span>{item.reason}</span>}
                  </div>

                  <div className="ai-conan-chip-row">
                    {item.tags.map((tag) => (
                      <Chip key={`${item.id}-${tag}`}>{tag}</Chip>
                    ))}
                    {item.isToday && <Chip tone="accent">今日</Chip>}
                    {item.translated && <Chip tone="muted">已转中文</Chip>}
                  </div>

                  <a className="ai-conan-card-link" href={item.link} rel="noreferrer" target="_blank">
                    查看原文
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <AiConanDiscussion threadId={discussionThreadId} threadTitle={discussionThreadTitle} />

        <section className="section" id="sources">
          <div className="container">
            <div className="ai-conan-section-head">
              <div>
                <span className="ai-conan-eyebrow">来源机制</span>
                <h2>真实抓取，不是静态占位</h2>
              </div>
            </div>

            <div className="ai-conan-method-grid">
              <article className="glass-panel ai-conan-method-card">
                <h3>工作方式</h3>
                <ul className="ai-conan-list">
                  <li>构建前自动抓取 RSS、官方博客和中国公司动态页，生成 `/data/ai-conan-news.json`。</li>
                  <li>对英文标题和描述自动转成中文，保留原文标题便于核对。</li>
                  <li>同时识别中国线索，单独统计国内融资、模型发布和创新应用动态。</li>
                  <li>评论与点赞优先接入 Aria API，自持公开存储；未接通时退回当前浏览器本机模式。</li>
                </ul>
              </article>

              <article className="glass-panel ai-conan-method-card">
                <h3>当前来源</h3>
                <div className="ai-conan-source-list">
                  {(meta?.sourceCatalog || []).map((source) => (
                    <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
                      <span>{source.label}</span>
                      <small>
                        {source.publisherType === 'official' ? '官方源' : '媒体源'} · {source.kind} · {source.region === 'china' ? '中国' : '全球'}
                      </small>
                    </a>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AiConanPage;
