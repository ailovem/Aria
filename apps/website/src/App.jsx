import React, { useEffect } from 'react';
import useScrollReveal from './hooks/useScrollReveal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuickStart30s from './components/QuickStart30s';
import DownloadHub from './components/DownloadHub';
import CoreValue from './components/CoreValue';
import MultiScene from './components/MultiScene';
import Ecosystem from './components/Ecosystem';
import ReleaseModes from './components/ReleaseModes';
import Security from './components/Security';
import Footer from './components/Footer';

const QUICKSTART_AB_BUCKET_KEY = 'aria_quickstart_ab_bucket_v1';
const QUICKSTART_VISITED_KEY = 'aria_site_first_visit_seen_v1';
const QUICKSTART_AUTO_SCROLL_ENABLED = (import.meta.env.VITE_ARIA_QUICKSTART_AUTO_SCROLL_AB || 'true') !== 'false';
const QUICKSTART_AUTO_SCROLL_RATE = (() => {
  const parsed = Number(import.meta.env.VITE_ARIA_QUICKSTART_AUTO_SCROLL_RATE || 0.5);
  if (!Number.isFinite(parsed)) return 0.5;
  return Math.min(1, Math.max(0, parsed));
})();
const QUICKSTART_SCROLL_DELAY_MS = 1300;

function App() {
  useScrollReveal();

  useEffect(() => {
    if (typeof window === 'undefined' || !QUICKSTART_AUTO_SCROLL_ENABLED) {
      return;
    }

    if (window.location.hash && window.location.hash !== '#') {
      localStorage.setItem(QUICKSTART_VISITED_KEY, '1');
      return;
    }

    const hasVisited = localStorage.getItem(QUICKSTART_VISITED_KEY) === '1';
    let bucket = localStorage.getItem(QUICKSTART_AB_BUCKET_KEY);
    const urlBucket = new URLSearchParams(window.location.search).get('qs_ab');

    if (urlBucket === 'A' || urlBucket === 'B') {
      bucket = urlBucket;
      localStorage.setItem(QUICKSTART_AB_BUCKET_KEY, bucket);
    }

    if (!bucket) {
      bucket = Math.random() < QUICKSTART_AUTO_SCROLL_RATE ? 'B' : 'A';
      localStorage.setItem(QUICKSTART_AB_BUCKET_KEY, bucket);
    }

    if (!hasVisited && bucket === 'B') {
      const timer = window.setTimeout(() => {
        const target = document.getElementById('quickstart');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, QUICKSTART_SCROLL_DELAY_MS);

      localStorage.setItem(QUICKSTART_VISITED_KEY, '1');
      return () => window.clearTimeout(timer);
    }

    localStorage.setItem(QUICKSTART_VISITED_KEY, '1');
    return undefined;
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <QuickStart30s />
      <DownloadHub />
      <CoreValue />
      <MultiScene />
      <Ecosystem />
      <ReleaseModes />
      <Security />
      <Footer />
    </>
  );
}

export default App;
