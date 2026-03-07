import React, { useEffect, useMemo, useState } from 'react';
import './DownloadHub.css';

const DEFAULT_RELEASE_INFO = {
  version: import.meta.env.VITE_ARIA_RELEASE_VERSION || 'v0.1.8',
  publishedAt: import.meta.env.VITE_ARIA_RELEASE_DATE || '2026-03-07',
  changelogUrl: import.meta.env.VITE_ARIA_CHANGELOG_URL || 'https://github.com/ailovem/Aria/releases/tag/v0.1.8',
  downloads: {
    macos: {
      files: '.dmg（Apple Silicon / Intel）',
      arch: 'Apple Silicon / Intel',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_MAC || 'https://github.com/ailovem/Aria/releases/download/v0.1.8/Aria_0.1.0_aarch64.dmg',
      intelUrl: import.meta.env.VITE_ARIA_DOWNLOAD_MAC_INTEL || 'https://github.com/ailovem/Aria/releases/download/v0.1.8/Aria_0.1.0_x64.dmg',
      checksum: import.meta.env.VITE_ARIA_SHA256_MAC || 'ARM: 9e8d3b789a4e15d3a24d0d570a4ba9988cfa1232d7437ca75db574e9e5582b1d | Intel: 44b1616168653396878f39156ef05d472d318480e3176d3c122b70ef03d943ac'
    },
    windows: {
      files: '.exe / .msi',
      arch: 'x64',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_WINDOWS || 'https://github.com/ailovem/Aria/releases/download/v0.1.8/Aria_0.1.0_x64-setup.exe',
      checksum: import.meta.env.VITE_ARIA_SHA256_WINDOWS || 'EXE: 6b475ff63b6f42cc6531e3ad17ff1125bf5a51d0d76b08fcfad162b2c1b69f33 | MSI: 8819c4e1f251f597d5941f7efc6727b54a023d31fe328f35c35248e1957eaa30'
    },
    linux: {
      files: '暂未提供',
      arch: 'x64',
      url: import.meta.env.VITE_ARIA_DOWNLOAD_LINUX || 'https://github.com/ailovem/Aria/releases/tag/v0.1.8',
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
      files: releaseInfo.downloads?.macos?.files || '.dmg（Apple Silicon / Intel）',
      arch: releaseInfo.downloads?.macos?.arch || 'Apple Silicon / Intel',
      href: releaseInfo.downloads?.macos?.url || '#',
      secondaryHref: releaseInfo.downloads?.macos?.intelUrl || '',
      buttonText: '下载 macOS (Apple Silicon)',
      secondaryButtonText: '下载 macOS (Intel)',
      checksum: releaseInfo.downloads?.macos?.checksum || 'ARM: 9e8d3b789a4e15d3a24d0d570a4ba9988cfa1232d7437ca75db574e9e5582b1d | Intel: 44b1616168653396878f39156ef05d472d318480e3176d3c122b70ef03d943ac'
    },
    {
      key: 'windows',
      platform: 'Windows',
      files: releaseInfo.downloads?.windows?.files || '.exe / .msi',
      arch: releaseInfo.downloads?.windows?.arch || 'x64',
      href: releaseInfo.downloads?.windows?.url || '#',
      secondaryHref: '',
      buttonText: '下载 Windows',
      secondaryButtonText: '',
      checksum: releaseInfo.downloads?.windows?.checksum || 'EXE: 6b475ff63b6f42cc6531e3ad17ff1125bf5a51d0d76b08fcfad162b2c1b69f33 | MSI: 8819c4e1f251f597d5941f7efc6727b54a023d31fe328f35c35248e1957eaa30'
    },
    {
      key: 'linux',
      platform: 'Linux',
      files: releaseInfo.downloads?.linux?.files || '暂未提供',
      arch: releaseInfo.downloads?.linux?.arch || 'x64',
      href: releaseInfo.downloads?.linux?.url || '#',
      secondaryHref: '',
      buttonText: '下载 Linux',
      secondaryButtonText: '',
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
                {item.buttonText}
              </a>
              {item.secondaryHref ? (
                <a className="download-button" href={item.secondaryHref} target="_blank" rel="noreferrer">
                  {item.secondaryButtonText}
                </a>
              ) : null}
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
