import React, { useEffect, useMemo, useState } from 'react';
import './DownloadHub.css';

const DEFAULT_RELEASE_INFO = {
  version: import.meta.env.VITE_ARIA_RELEASE_VERSION || 'v0.1.4',
  publishedAt: import.meta.env.VITE_ARIA_RELEASE_DATE || '2026-03-07',
  changelogUrl: import.meta.env.VITE_ARIA_CHANGELOG_URL || 'https://github.com/ailovem/Aria/releases/tag/v0.1.4',
  downloads: {
    macos: {
      files: '.dmg',
      arch: 'Apple Silicon (M 系列)',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_MAC || 'https://github.com/ailovem/Aria/releases/download/v0.1.4/Aria_0.1.0_aarch64.dmg',
      checksum: import.meta.env.VITE_ARIA_SHA256_MAC || '2bd2f513e5e6fc446b9905380beb639a85f1eb5b147b2085784c5721a24387bf'
    },
    windows: {
      files: '.exe / .msi',
      arch: 'x64',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_WINDOWS || 'https://github.com/ailovem/Aria/releases/download/v0.1.4/Aria_0.1.0_x64-setup.exe',
      checksum: import.meta.env.VITE_ARIA_SHA256_WINDOWS || 'EXE: fc4f6b703d909fcf200cb9eb300d39408d02c92bc951440531fde5256ee57d24 | MSI: 28f1c6ee38116d2960f1004211bd44df63370cb1b72f95f2d0dad672d3a9b2cf'
    },
    linux: {
      files: '暂未提供',
      arch: 'x64',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_LINUX || 'https://github.com/ailovem/Aria/releases/tag/v0.1.4',
      checksum: import.meta.env.VITE_ARIA_SHA256_LINUX || '-'
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
      files: releaseInfo.downloads?.macos?.files || '.dmg',
      arch: releaseInfo.downloads?.macos?.arch || 'Apple Silicon (M 系列)',
      href: releaseInfo.downloads?.macos?.url || '#',
      checksum: releaseInfo.downloads?.macos?.checksum || '2bd2f513e5e6fc446b9905380beb639a85f1eb5b147b2085784c5721a24387bf'
    },
    {
      key: 'windows',
      platform: 'Windows',
      files: releaseInfo.downloads?.windows?.files || '.exe / .msi',
      arch: releaseInfo.downloads?.windows?.arch || 'x64',
      href: releaseInfo.downloads?.windows?.url || '#',
      checksum: releaseInfo.downloads?.windows?.checksum || 'EXE: fc4f6b703d909fcf200cb9eb300d39408d02c92bc951440531fde5256ee57d24 | MSI: 28f1c6ee38116d2960f1004211bd44df63370cb1b72f95f2d0dad672d3a9b2cf'
    },
    {
      key: 'linux',
      platform: 'Linux',
      files: releaseInfo.downloads?.linux?.files || '暂未提供',
      arch: releaseInfo.downloads?.linux?.arch || 'x64',
      href: releaseInfo.downloads?.linux?.url || '#',
      checksum: releaseInfo.downloads?.linux?.checksum || '-'
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
