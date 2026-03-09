import React, { useEffect, useMemo, useState } from 'react';

const LOCAL_DISCUSSION_PREFIX = 'aria_ai_conan_discussion_v1';
const LOCAL_CLIENT_ID_KEY = 'aria_ai_conan_client_id_v1';
const LOCAL_AUTHOR_KEY = 'aria_ai_conan_author_v1';
const COMMENT_COOLDOWN_MS = 30 * 1000;

function createClientId() {
  return `visitor-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function getClientId() {
  if (typeof window === 'undefined') {
    return 'server-preview';
  }
  let existing = window.localStorage.getItem(LOCAL_CLIENT_ID_KEY);
  if (!existing) {
    existing = createClientId();
    window.localStorage.setItem(LOCAL_CLIENT_ID_KEY, existing);
  }
  return existing;
}

function getLocalStorageKey(threadId) {
  return `${LOCAL_DISCUSSION_PREFIX}:${threadId}`;
}

function sanitizeName(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 24);
}

function sanitizeContent(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
}

function readLocalDiscussion(threadId, threadTitle) {
  if (typeof window === 'undefined') {
    return {
      threadId,
      threadTitle,
      likesCount: 0,
      viewerLiked: false,
      comments: [],
      updatedAt: '',
      mode: 'local'
    };
  }

  const clientId = getClientId();
  try {
    const raw = window.localStorage.getItem(getLocalStorageKey(threadId));
    const parsed = raw ? JSON.parse(raw) : {};
    const likesActors = parsed.likesActors && typeof parsed.likesActors === 'object' ? parsed.likesActors : {};
    const comments = Array.isArray(parsed.comments) ? parsed.comments : [];

    return {
      threadId,
      threadTitle: parsed.threadTitle || threadTitle,
      likesCount: Object.keys(likesActors).length,
      viewerLiked: Boolean(likesActors[clientId]),
      comments: comments.slice().sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)).slice(0, 40),
      updatedAt: parsed.updatedAt || '',
      mode: 'local'
    };
  } catch {
    return {
      threadId,
      threadTitle,
      likesCount: 0,
      viewerLiked: false,
      comments: [],
      updatedAt: '',
      mode: 'local'
    };
  }
}

function writeLocalDiscussion(threadId, payload) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(getLocalStorageKey(threadId), JSON.stringify(payload));
}

function toggleLocalLike(threadId, threadTitle) {
  const clientId = getClientId();
  const current = readLocalDiscussion(threadId, threadTitle);
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(getLocalStorageKey(threadId)) : null;
  const parsed = raw ? JSON.parse(raw) : { likesActors: {}, comments: [] };
  const likesActors = parsed.likesActors && typeof parsed.likesActors === 'object' ? parsed.likesActors : {};

  if (likesActors[clientId]) {
    delete likesActors[clientId];
  } else {
    likesActors[clientId] = new Date().toISOString();
  }

  const nextPayload = {
    threadTitle,
    likesActors,
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    updatedAt: new Date().toISOString()
  };

  writeLocalDiscussion(threadId, nextPayload);
  return {
    ...current,
    threadTitle,
    likesCount: Object.keys(likesActors).length,
    viewerLiked: Boolean(likesActors[clientId]),
    updatedAt: nextPayload.updatedAt,
    mode: 'local'
  };
}

function addLocalComment(threadId, threadTitle, authorName, content) {
  const clientId = getClientId();
  const normalizedName = sanitizeName(authorName) || '访客';
  const normalizedContent = sanitizeContent(content);
  if (!normalizedContent) {
    throw new Error('请输入评论内容。');
  }

  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(getLocalStorageKey(threadId)) : null;
  const parsed = raw ? JSON.parse(raw) : { likesActors: {}, comments: [] };
  const comments = Array.isArray(parsed.comments) ? parsed.comments : [];
  const lastOwnComment = comments.find((item) => item.clientId === clientId);
  if (lastOwnComment && Date.now() - Date.parse(lastOwnComment.createdAt) < COMMENT_COOLDOWN_MS) {
    throw new Error('评论太快了，请稍后再发。');
  }

  const nextComment = {
    id: `local-${Date.now().toString(36)}`,
    authorName: normalizedName,
    content: normalizedContent,
    createdAt: new Date().toISOString(),
    clientId
  };

  const nextPayload = {
    threadTitle,
    likesActors: parsed.likesActors && typeof parsed.likesActors === 'object' ? parsed.likesActors : {},
    comments: [nextComment, ...comments].slice(0, 80),
    updatedAt: new Date().toISOString()
  };

  writeLocalDiscussion(threadId, nextPayload);
  window.localStorage.setItem(LOCAL_AUTHOR_KEY, normalizedName);

  return readLocalDiscussion(threadId, threadTitle);
}

function resolveApiBase() {
  const explicitBase = String(import.meta.env.VITE_ARIA_SITE_API_BASE || '').trim();
  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://127.0.0.1:8787';
  }

  return '';
}

async function fetchRemoteDiscussion(apiBase, threadId, threadTitle) {
  const clientId = getClientId();
  const params = new URLSearchParams({ threadId, actorId: clientId, threadTitle });
  const response = await fetch(`${apiBase}/v1/public/site/discussion?${params.toString()}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = await response.json();
  return payload.discussion;
}

async function toggleRemoteLike(apiBase, threadId, threadTitle) {
  const response = await fetch(`${apiBase}/v1/public/site/discussion/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threadId,
      threadTitle,
      actorId: getClientId()
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || '点赞失败');
  }
  return payload.discussion;
}

async function submitRemoteComment(apiBase, threadId, threadTitle, authorName, content) {
  const response = await fetch(`${apiBase}/v1/public/site/discussion/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threadId,
      threadTitle,
      actorId: getClientId(),
      authorName,
      content
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || '评论提交失败');
  }
  window.localStorage.setItem(LOCAL_AUTHOR_KEY, sanitizeName(authorName) || '访客');
  return payload.discussion;
}

function modeLabel(mode) {
  return mode === 'shared-api' ? '留言会同步给其他访问者' : '留言会先保存在当前设备';
}

function formatCommentTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function AiConanDiscussion({ threadId, threadTitle }) {
  const apiBase = useMemo(() => resolveApiBase(), []);
  const [discussion, setDiscussion] = useState(() => readLocalDiscussion(threadId, threadTitle));
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.localStorage.getItem(LOCAL_AUTHOR_KEY) || '';
  });
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDiscussion() {
      try {
        setLoading(true);
        if (apiBase) {
          const remote = await fetchRemoteDiscussion(apiBase, threadId, threadTitle);
          if (!cancelled) {
            setDiscussion(remote);
            setError('');
          }
        } else if (!cancelled) {
          setDiscussion(readLocalDiscussion(threadId, threadTitle));
        }
      } catch {
        if (!cancelled) {
          setDiscussion(readLocalDiscussion(threadId, threadTitle));
          setError('网络有点不稳定，先切换到当前设备保存，不影响继续留言。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDiscussion();

    return () => {
      cancelled = true;
    };
  }, [apiBase, threadId, threadTitle]);

  async function handleToggleLike() {
    try {
      setBusy(true);
      setError('');
      if (apiBase) {
        const remote = await toggleRemoteLike(apiBase, threadId, threadTitle);
        setDiscussion(remote);
      } else {
        setDiscussion(toggleLocalLike(threadId, threadTitle));
      }
    } catch {
      setDiscussion(toggleLocalLike(threadId, threadTitle));
      setError('点赞同步暂时不可用，已先保存在当前设备。');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setBusy(true);
      setError('');
      if (apiBase) {
        const remote = await submitRemoteComment(apiBase, threadId, threadTitle, authorName, commentText);
        setDiscussion(remote);
      } else {
        setDiscussion(addLocalComment(threadId, threadTitle, authorName, commentText));
      }
      setCommentText('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '评论提交失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section" id="discussion">
      <div className="container">
        <div className="ai-conan-section-head">
          <div>
            <span className="ai-conan-eyebrow">参与讨论</span>
            <h2>说说你怎么看今天这些动态</h2>
          </div>
        </div>

        <div className="ai-conan-discussion-grid">
          <article className="glass-panel ai-conan-discussion-panel">
            <div className="ai-conan-discussion-header">
              <div>
                <h3>{discussion.threadTitle || threadTitle}</h3>
                <p className="ai-conan-muted">{modeLabel(discussion.mode)}</p>
              </div>
              <button
                className={`ai-conan-like-button ${discussion.viewerLiked ? 'active' : ''}`}
                disabled={busy}
                onClick={handleToggleLike}
                type="button"
              >
                👍 {discussion.likesCount}
              </button>
            </div>

            <form className="ai-conan-comment-form" onSubmit={handleSubmit}>
              <input
                className="ai-conan-input"
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder="怎么称呼你（可选）"
                value={authorName}
              />
              <textarea
                className="ai-conan-textarea"
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="写下你的看法、补充信息，或者你最关注的一条动态…"
                rows={5}
                value={commentText}
              />
              <div className="ai-conan-discussion-actions">
                <span className="ai-conan-muted">{apiBase ? '你的留言会同步显示给其他访问者。' : '你的留言会先保存在当前设备，稍后也可以继续查看。'}</span>
                <button className="cta-button" disabled={busy} type="submit">
                  {busy ? '提交中…' : '发表评论'}
                </button>
              </div>
            </form>

            {error && <p className="ai-conan-discussion-error">{error}</p>}
          </article>

          <article className="glass-panel ai-conan-discussion-panel">
            <div className="ai-conan-discussion-header">
              <div>
                <h3>最新评论</h3>
                <p className="ai-conan-muted">{loading ? '正在加载大家的留言…' : `${discussion.comments.length} 条留言`}</p>
              </div>
            </div>

            {discussion.comments.length === 0 && !loading && (
              <div className="ai-conan-empty ai-conan-empty--compact">还没有人留言，你来开个头吧。</div>
            )}

            <div className="ai-conan-comment-list">
              {discussion.comments.map((comment) => (
                <article className="ai-conan-comment-item" key={comment.id}>
                  <div className="ai-conan-comment-head">
                    <strong>{comment.authorName || '访客'}</strong>
                    <span>{formatCommentTime(comment.createdAt)}</span>
                  </div>
                  <p>{comment.content}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default AiConanDiscussion;
