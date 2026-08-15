import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import ArticleListing from "./components/ArticleListing";
import MagazineGrid from "./components/MagazineGrid";
import Toolkit from "./components/Toolkit";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import FAQSection from "./components/FAQSection";
import { HOMEPAGE_FAQS } from "./data/faqs";
import { motion, AnimatePresence } from "motion/react";
import SEO from "./components/SEO";

// Lazy load secondary route components to eliminate unused initial JavaScript
const ArticleView = lazy(() => import("./components/ArticleView"));
const CategoryPage = lazy(() => import("./components/CategoryPage"));
const IndexingConsole = lazy(() => import("./components/IndexingConsole"));

function PageLoadingFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  const [viewMode, setViewMode] = useState<"magazine" | "feed">("magazine");

  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Blue Ocean Hub",
      "alternateName": "Blue Ocean Hub: Strategic Financial Intelligence",
      "url": "https://blueoceanhub.info/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blueoceanhub.info/?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Blue Ocean Hub",
      "url": "https://blueoceanhub.info/",
      "logo": "https://blueoceanhub.info/favicon.svg",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "hello@blueoceanhub.info",
        "contactType": "editorial support"
      },
      "sameAs": [
        "https://linkedin.com/company/blue-ocean-hub"
      ],
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "South Asia"
      },
      "description": "South Asia's premier strategic financial magazine and intelligence publication. Delivering elite cashflow allocation and currency hedging blueprints."
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": HOMEPAGE_FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  ];

  return (
    <>
      <SEO 
        title="Blue Ocean Hub | South Asian Financial Intelligence"
        description="South Asia's premier financial publication. Strategic insights on passive income, PSX stocks, dollar exports, and corporate asset allocation."
        canonicalUrl="https://blueoceanhub.info/"
        jsonLd={homeJsonLd}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        
        {/* Toggle Controls */}
        <div className="container mx-auto px-6 -mt-10 mb-16 flex justify-center relative z-20">
          <div className="inline-flex rounded-full bg-ocean-900 border border-ocean-800 p-1.5 shadow-xl shadow-black/40">
            <button
              type="button"
              onClick={() => setViewMode("magazine")}
              aria-label="Switch to Magazine Edition layout view"
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${
                viewMode === "magazine"
                  ? "bg-cyan text-ocean-950 font-extrabold shadow-lg shadow-cyan/25"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Magazine Edition
            </button>
            <button
              type="button"
              onClick={() => setViewMode("feed")}
              aria-label="Switch to Chronological Feed layout view"
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${
                viewMode === "feed"
                  ? "bg-cyan text-ocean-950 font-extrabold shadow-lg shadow-cyan/25"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Chronological Feed
            </button>
          </div>
        </div>

        {viewMode === "magazine" ? <MagazineGrid /> : <ArticleListing />}
        
        <Toolkit />
        <FAQSection items={HOMEPAGE_FAQS} />
        <Newsletter />
      </motion.div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-ocean-950 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoadingFallback />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/article/:id" element={<ArticleView />} />
                <Route path="/page/:id" element={<ArticleView />} />
                <Route path="/passive-income" element={<CategoryPage />} />
                <Route path="/investing" element={<CategoryPage />} />
                <Route path="/freelancing" element={<CategoryPage />} />
                <Route path="/saving-money" element={<CategoryPage />} />
                <Route path="/dollar-earning" element={<CategoryPage />} />
                <Route path="/indexing-console" element={<IndexingConsole />} />
                <Route path="*" element={<div className="pt-40 text-center text-white text-2xl">404 - Page Not Found</div>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
}
