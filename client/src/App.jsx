import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Hero from './components/Hero';
import GenerationTool from './components/GenerationTool';
import ContentCustomizer from './components/ContentCustomizer';
import SocialProof from './components/SocialProof';
import FeatureCards from './components/FeatureCards';
import Pricing from './components/Pricing';
import BannerCTA from './components/BannerCTA';
import FAQ from './components/FAQ';

import Swap from './pages/Swap';

function Home() {
  return (
    <main>
      <Hero />
      <section id="generate" className="relative z-10 py-12">
        <GenerationTool />
      </section>
      <ContentCustomizer />
      <SocialProof />
      <FeatureCards />
      <Pricing />
      <BannerCTA />
      <FAQ />
      <Footer />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden selection:bg-blue-500/30">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/swap" element={<Swap />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;
