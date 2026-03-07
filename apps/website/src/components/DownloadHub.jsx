import React, { useEffect, useMemo, useState } from 'react';
import './DownloadHub.css';

const DEFAULT_RELEASE_INFO = {
  version: import.meta.env.VITE_ARIA_RELEASE_VERSION || 'v0.1.0',
  publishedAt: import.meta.env.VITE_ARIA_RELEASE_DATE || '2026-03-07',
  changelogUrl: import.meta.env.VITE_ARIA_CHANGELOG_URL || '/changelog.html',
  downloads: {
    macos: {
      files: '.dmg / .app',
      arch: 'Apple Silicon / Intel',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_MAC || 'https://github.com/<your-account>/<your-repo>/releases/latest/download/Aria-latest-macOS.dmg',
      checksum: import.meta.env.VITE_ARIA_SHA256_MAC || '待发布填充'
    },
    windows: {
      files: '.msi / .exe',
      arch: 'x64',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_WINDOWS || 'https://github.com/<your-account>/<your-repo>/releases/latest/download/Aria-latest-windows.msi',
      checksum: import.meta.env.VITE_ARIA_SHA256_WINDOWS || '待发布填充'
    },
    linux: {
      files: '.AppImage / .deb',
      arch: 'x64',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_LINUX || 'https://github.com/<your-account>/<your-repo>/releases/latest/download/Aria-latest-linux.AppImage',
      checksum: import.meta.env.VITE_ARIA_SHA256_LINUX || '待发布填充'
    }
  }
};

const DownloadHub = () => {
  const [releaseInfo, setReleaseInfo] = useState(DEFAULT_RELEASE_INFO);

  useEffect(() => {
    let active = true;
    fetch('/releases/latest.json')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active || !payload || typeof payload !== 'object') {
          return;
        }
        setReleaseInfo((prev) => ({
          ...prev,
          ...payload,
          downloads: {
            ...prev.downloads,
            ...(payload.downloads && typeof payload.downloads === 'object' ? payload.downloads : {})
          }
        }));
      })
      .catch(() => {
        // keep env/default fallback when release json is unavailable
      });
    return () => {
      active = false;
    };
  }, []);

  const downloadItems = useMemo(() => ([
    {
      key: 'macos',
      platform: 'macOS',
      files: releaseInfo.downloads?.macos?.files || '.dmg / .app',
      arch: releaseInfo.downloads?.macos?.arch || 'Apple Silicon / Intel',
      href: releaseInfo.downloads?.macos?.url || '#',
      checksum: releaseInfo.downloads?.macos?.checksum || '待发布填充'
    },
    {
      key: 'windows',
      platform: 'Windows',
      files: releaseInfo.downloads?.windows?.files || '.msi / .exe',
      arch: releaseInfo.downloads?.windows?.arch || 'x64',
      href: releaseInfo.downloads?.windows?.url || '#',
      checksum: releaseInfo.downloads?.windows?.checksum || '待发布填充'
    },
    {
      key: 'linux',
      platform: 'Linux',
      files: releaseInfo.downloads?.linux?.files || '.AppImage / .deb',
      arch: releaseInfo.downloads?.linux?.arch || 'x64',
      href: releaseInfo.downloads?.linux?.url || '#',
      checksum: releaseInfo.downloads?.linux?.checksum || '待发布填充'
    }
  ]), [releaseInfo]);

  return (
    <section id="download" className="section download-section">
      <div className="container">
        <div className="text-center reveal">
          <h2 className="section-title">先下载客户端，再体验 Aria</h2>
          <p className="subtitle">
            Aria 不是“只能网页聊天”的壳子，而是可安装、可运行、可升级的桌面产品。
            下载即用，支持标准云端模式与本地隐私模式。
          </p>
          <p className="download-version">
            最新稳定版：{releaseInfo.version} · 发布日期：{releaseInfo.publishedAt}
          </p>
        </div>

        <div className="download-grid reveal reveal-delay-2">
          {downloadItems.map((item) => (
            <article key={item.key} className="download-card glass-panel">
              <h3>{item.platform}</h3>
              <p className="download-meta">安装包：{item.files}</p>
              <p className="download-meta">架构：{item.arch}</p>
              <a className="download-button" href={item.href} target="_blank" rel="noreferrer">
                下载 {item.platform}
              </a>
              <p className="download-checksum">SHA256：{item.checksum}</p>
            </article>
          ))}
        </div>

        <div className="download-notes reveal reveal-delay-3">
          <p>发布建议：官网同时提供“最新稳定版 + 变更日志 + 历史版本 + 校验值”。</p>
          <p>内测/灰度建议：先发布 Canary 通道，稳定后再推正式版。</p>
          <p>
            更新记录：
            <a href={releaseInfo.changelogUrl || '/changelog.html'} target="_blank" rel="noreferrer">查看 Changelog</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default DownloadHub;
