import React from 'react';
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

function App() {
  useScrollReveal();

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
