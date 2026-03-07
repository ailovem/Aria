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

const detectClientInfoSync = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { os: 'unknown', arch: 'unknown' };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  const hintText = `${ua} ${platform}`;

  let os = 'unknown';
  if (hintText.includes('windows') || platform.startsWith('win')) {
    os = 'windows';
  } else if (hintText.includes('macintosh') || hintText.includes('mac os') || platform.includes('mac')) {
    os = 'macos';
  } else if (hintText.includes('linux') || platform.includes('linux') || hintText.includes('x11')) {
    os = 'linux';
  }

  let arch = 'unknown';
  if (hintText.includes('aarch64') || hintText.includes('arm64') || hintText.includes(' arm ')) {
    arch = 'arm64';
  } else if (
    hintText.includes('x86_64') ||
    hintText.includes('amd64') ||
    hintText.includes('wow64') ||
    hintText.includes('win64') ||
    hintText.includes('x64') ||
    hintText.includes('intel')
  ) {
    arch = 'x64';
  }

  return { os, arch };
};

const formatClientLabel = (clientInfo) => {
  if (clientInfo.os === 'windows') {
    return 'Windows';
  }
  if (clientInfo.os === 'linux') {
    return 'Linux';
  }
  if (clientInfo.os === 'macos') {
    if (clientInfo.arch === 'x64') {
      return 'macOS Intel';
    }
    if (clientInfo.arch === 'arm64') {
      return 'macOS Apple Silicon';
    }
    return 'macOS';
  }
  return '未知系统';
};

const DownloadHub = () => {
  const [releaseInfo, setReleaseInfo] = useState(DEFAULT_RELEASE_INFO);
  const [clientInfo, setClientInfo] = useState({ os: 'unknown', arch: 'unknown' });

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

  useEffect(() => {
    const detected = detectClientInfoSync();
    setClientInfo(detected);

    if (
      typeof navigator !== 'undefined' &&
      navigator.userAgentData &&
      typeof navigator.userAgentData.getHighEntropyValues === 'function'
    ) {
      navigator.userAgentData
        .getHighEntropyValues(['architecture', 'platform'])
        .then((highEntropy) => {
          const osRaw = (highEntropy.platform || '').toLowerCase();
          const archRaw = (highEntropy.architecture || '').toLowerCase();
          const next = { ...detected };

          if (osRaw.includes('windows')) {
            next.os = 'windows';
          } else if (osRaw.includes('mac')) {
            next.os = 'macos';
          } else if (osRaw.includes('linux')) {
            next.os = 'linux';
          }

          if (archRaw.includes('arm')) {
            next.arch = 'arm64';
          } else if (archRaw.includes('x86') || archRaw.includes('x64') || archRaw.includes('amd')) {
            next.arch = 'x64';
          }

          setClientInfo(next);
        })
        .catch(() => {
          // keep sync detection fallback
        });
    }
  }, []);

  const smartDownload = useMemo(() => {
    const macArmUrl = releaseInfo.downloads?.macos?.url || '#';
    const macIntelUrl = releaseInfo.downloads?.macos?.intelUrl || '';
    const windowsUrl = releaseInfo.downloads?.windows?.url || '#';
    const linuxUrl = releaseInfo.downloads?.linux?.url || '#';

    if (clientInfo.os === 'windows') {
      return {
        href: windowsUrl,
        label: '一键下载 Windows（推荐）',
        note: '已识别当前设备：Windows',
        backupHref: '',
        backupLabel: ''
      };
    }

    if (clientInfo.os === 'linux') {
      return {
        href: linuxUrl,
        label: '查看 Linux 下载',
        note: '已识别当前设备：Linux',
        backupHref: '',
        backupLabel: ''
      };
    }

    if (clientInfo.os === 'macos') {
      if (clientInfo.arch === 'x64' && macIntelUrl) {
        return {
          href: macIntelUrl,
          label: '一键下载 macOS Intel（推荐）',
          note: '已识别当前设备：macOS Intel',
          backupHref: macArmUrl,
          backupLabel: 'Apple Silicon 包'
        };
      }

      return {
        href: macArmUrl,
        label: '一键下载 macOS Apple Silicon（推荐）',
        note:
          clientInfo.arch === 'arm64'
            ? '已识别当前设备：macOS Apple Silicon'
            : '已识别当前设备：macOS，默认推荐 Apple Silicon',
        backupHref: macIntelUrl,
        backupLabel: macIntelUrl ? 'Intel 包' : ''
      };
    }

    return {
      href: windowsUrl,
      label: '一键下载（推荐）',
      note: `已识别当前设备：${formatClientLabel(clientInfo)}，可在下方手动选择`,
      backupHref: '',
      backupLabel: ''
    };
  }, [releaseInfo, clientInfo]);

  const downloadItems = useMemo(() => ([
    {
      key: 'macos',
      platform: 'macOS',
      files: releaseInfo.downloads?.macos?.files || '.dmg（Apple Silicon / Intel）',
      arch: releaseInfo.downloads?.macos?.arch || 'Apple Silicon / Intel',
      href:
        clientInfo.os === 'macos' && clientInfo.arch === 'x64' && releaseInfo.downloads?.macos?.intelUrl
          ? releaseInfo.downloads?.macos?.intelUrl
          : releaseInfo.downloads?.macos?.url || '#',
      secondaryHref:
        clientInfo.os === 'macos' && clientInfo.arch === 'x64'
          ? releaseInfo.downloads?.macos?.url || ''
          : releaseInfo.downloads?.macos?.intelUrl || '',
      buttonText:
        clientInfo.os === 'macos' && clientInfo.arch === 'x64'
          ? '下载 macOS (Intel, 推荐)'
          : '下载 macOS (Apple Silicon, 推荐)',
      secondaryButtonText:
        clientInfo.os === 'macos' && clientInfo.arch === 'x64'
          ? '下载 macOS (Apple Silicon)'
          : '下载 macOS (Intel)',
      checksum: releaseInfo.downloads?.macos?.checksum || 'ARM: 9e8d3b789a4e15d3a24d0d570a4ba9988cfa1232d7437ca75db574e9e5582b1d | Intel: 44b1616168653396878f39156ef05d472d318480e3176d3c122b70ef03d943ac'
    },
    {
      key: 'windows',
      platform: 'Windows',
      files: releaseInfo.downloads?.windows?.files || '.exe / .msi',
      arch: releaseInfo.downloads?.windows?.arch || 'x64',
      href: releaseInfo.downloads?.windows?.url || '#',
      secondaryHref: '',
      buttonText: clientInfo.os === 'windows' ? '下载 Windows (推荐)' : '下载 Windows',
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
  ]), [releaseInfo, clientInfo]);

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
          <div className="smart-download">
            <a className="download-button smart-download-button" href={smartDownload.href} target="_blank" rel="noreferrer">
              {smartDownload.label}
            </a>
            {smartDownload.backupHref ? (
              <a className="smart-download-alt" href={smartDownload.backupHref} target="_blank" rel="noreferrer">
                或下载 {smartDownload.backupLabel}
              </a>
            ) : null}
            <p className="smart-download-note">{smartDownload.note}</p>
          </div>
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
