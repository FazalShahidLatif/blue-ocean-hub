import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import ArticleListing from "./components/ArticleListing";
import ArticleView from "./components/ArticleView";
import Toolkit from "./components/Toolkit";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import FAQSection from "./components/FAQSection";
import { HOMEPAGE_FAQS } from "./data/faqs";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES } from "./data/categories";
import { ARTICLES } from "./data/articles";
import SEO from "./components/SEO";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
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
        title="Blue Ocean Hub: Personal Wealth Allocation and Dollar Revenue Strategies for South Asian Founders"
        description="Strategic financial intelligence for South Asian entrepreneurs. Expert analysis on PSX stock dividends, dollar-denominated export revenue, and high-yield saving strategies."
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
        <ArticleListing />
        <Toolkit />
        <FAQSection items={HOMEPAGE_FAQS} />
        <Newsletter />
      </motion.div>
    </>
  );
}

function CategoryPage() {
  const { pathname } = useLocation();
  const categoryId = pathname.split("/")[1];
  const categoryData = CATEGORIES.find(c => c.id === categoryId);
  
  if (!categoryData) {
    return <div className="pt-40 text-center text-white text-2xl">404 - Category Not Found</div>;
  }

  // Filter articles matching this category for ItemList JSON-LD
  const todayStr = new Date().toISOString().split("T")[0];
  const publishedArticles = ARTICLES.filter(a => a.pubDate <= todayStr);
  const categoryArticles = publishedArticles.filter(art => 
    art.category.toLowerCase().replace(/\s+/g, "-") === categoryId
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryData.seoTitle} | Blue Ocean Hub`,
    "description": categoryData.seoDescription,
    "url": `https://blueoceanhub.info/${categoryData.id}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": categoryArticles.length,
      "itemListElement": categoryArticles.map((art, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://blueoceanhub.info/article/${art.id}`,
        "name": art.title
      }))
    }
  };
  
  return (
    <>
      <SEO 
        title={`${categoryData.seoTitle} | Blue Ocean Hub`}
        description={categoryData.seoDescription}
        canonicalUrl={`https://blueoceanhub.info/${categoryData.id}`}
        jsonLd={jsonLd}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-32 min-h-screen bg-ocean-950 pb-20"
      >
        <div className="container mx-auto px-6">
          <header className="mb-12 max-w-4xl">
            <div className="markdown-body category-markdown font-sans">
              <ReactMarkdown 
                components={{
                  h1: (props) => <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight" {...props} />,
                  p: (props) => <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-3xl" {...props} />,
                  h3: (props) => <h3 className="text-xl font-bold text-cyan mt-12 mb-6 uppercase tracking-widest border-b border-ocean-800 pb-2" {...props} />,
                  ul: (props) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12" {...props} />,
                  li: (props) => (
                    <li className="flex items-start gap-3 text-slate-300">
                      <span className="text-cyan mt-1.5">•</span>
                      <span>{props.children}</span>
                    </li>
                  ),
                  a: (props) => {
                    const isInternal = props.href?.startsWith('/');
                    return isInternal ? (
                      <Link to={props.href!} className="text-cyan hover:underline">{props.children}</Link>
                    ) : (
                      <a href={props.href} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">{props.children}</a>
                    );
                  }
                }}
              >
                {categoryData.content}
              </ReactMarkdown>
            </div>
          </header>

          <h2 className="text-2xl font-bold text-white mb-8 border-t border-ocean-800 pt-12 uppercase tracking-widest">Intelligence Cluster</h2>
          <ArticleListing filterCategory={categoryId.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")} />
        </div>
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
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:id" element={<ArticleView />} />
              <Route path="/page/:id" element={<ArticleView />} />
              {/* Category routes can be added if needed, but let's stick to these for now */}
              <Route path="/passive-income" element={<CategoryPage />} />
              <Route path="/investing" element={<CategoryPage />} />
              <Route path="/freelancing" element={<CategoryPage />} />
              <Route path="/saving-money" element={<CategoryPage />} />
              <Route path="/dollar-earning" element={<CategoryPage />} />
              <Route path="*" element={<div className="pt-40 text-center text-white text-2xl">404 - Page Not Found</div>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
}
