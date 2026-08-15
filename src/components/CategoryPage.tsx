import { useLocation, Link } from "react-router-dom";
import { CATEGORIES } from "../data/categories";
import { ARTICLES } from "../data/articles";
import SEO from "./SEO";
import ArticleListing from "./ArticleListing";
import Newsletter from "./Newsletter";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

export default function CategoryPage() {
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
                  h2: (props) => <h2 className="text-2xl md:text-3xl font-bold text-white mt-10 mb-4 tracking-tight" {...props} />,
                  p: (props) => <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl" {...props} />,
                  h3: (props) => <h3 className="text-xl font-bold text-cyan mt-12 mb-6 uppercase tracking-widest border-b border-ocean-800 pb-2" {...props} />,
                  ul: (props) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12" {...props} />,
                  li: (props) => (
                    <li className="flex items-start gap-3 text-slate-200">
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
