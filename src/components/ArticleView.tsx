import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clock, Calendar, Share2, Printer } from "lucide-react";
import { ARTICLES } from "../data/articles";
import { LEGAL_PAGES } from "../data/legal";
import { PILLAR_FAQS } from "../data/faqs";
import FAQSection from "./FAQSection";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import SEO from "./SEO";

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = ARTICLES.find(a => a.id === id) || LEGAL_PAGES.find(a => a.id === id);

  if (!article) return <div className="pt-40 text-center text-white">Article not found.</div>;

  const todayStr = new Date().toISOString().split("T")[0];
  const isFutureScheduled = 'pubDate' in article && article.pubDate > todayStr;

  const isArticle = ARTICLES.some(a => a.id === article.id);
  const type = isArticle ? 'article' : 'page';
  const url = `https://blueoceanhub.info/${type}/${article.id}`;

  // Dynamically determine exact schema type
  let schemaType: string = isArticle ? (article.schema || "Article") : "WebPage";
  if (!isArticle) {
    if (article.id === "about-us") schemaType = "AboutPage";
    else if (article.id === "contact") schemaType = "ContactPage";
  }

  // Construct structured data object (JSON-LD)
  const jsonLdBase = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "headline": article.title,
    "description": article.metaDescription || article.description,
    "datePublished": article.pubDate,
    "author": {
      "@type": "Person",
      "name": article.author || "Blue Ocean Hub Editorial",
      "url": 'authorLinkedIn' in article && article.authorLinkedIn ? article.authorLinkedIn : undefined
    },
    "publisher": {
      "@type": "Organization",
      "name": "Blue Ocean Hub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blueoceanhub.info/favicon.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  // Check and append FAQPage schema if available for the pillar article
  const articleFaqs = article.id ? PILLAR_FAQS[article.id] : undefined;
  const jsonLdSchemas: any[] = [jsonLdBase];

  if (articleFaqs && articleFaqs.length > 0) {
    jsonLdSchemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": articleFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return (
    <>
      <SEO 
        title={`${article.title} | Blue Ocean Hub`}
        description={article.metaDescription || article.description || ""}
        canonicalUrl={url}
        ogType={isArticle ? "article" : "website"}
        jsonLd={jsonLdSchemas}
      />
      <motion.article 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-20 bg-ocean-950"
      >
      <div className="container mx-auto px-6 max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-cyan mb-12 transition-colors uppercase text-xs font-bold tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-cyan text-ocean-950 text-[10px] font-bold uppercase tracking-widest rounded">
              {article.category}
            </span>
            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-2 leading-none">
                <Calendar className="w-4 h-4" />
                {new Date(article.pubDate).toLocaleDateString()}
              </span>
              {article.readingTime && (
                <span className="flex items-center gap-2 leading-none">
                  <Clock className="w-4 h-4" />
                  {article.readingTime} min read
                </span>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            {article.title}
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 leading-relaxed italic border-l-4 border-cyan pl-6">
            {article.description}
          </p>

          <div className="flex items-center justify-between py-6 border-y border-ocean-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ocean-800 flex items-center justify-center text-cyan font-bold leading-none">
                {article.author ? article.author.charAt(0) : "B"}
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">
                  {'authorLinkedIn' in article && article.authorLinkedIn ? (
                    <a href={article.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors">
                      {article.author}
                    </a>
                  ) : (
                    article.author
                  )}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">Editorial Team</div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="text-slate-500 hover:text-cyan transition-colors"><Share2 className="w-5 h-5" /></button>
              <button className="text-slate-500 hover:text-cyan transition-colors" onClick={() => window.print()}><Printer className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        {isFutureScheduled ? (
          <div className="p-8 md:p-12 rounded-2xl bg-ocean-900 border border-ocean-800 text-center max-w-2xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-cyan/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-cyan animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Incoming Intelligence Briefing</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              This premium financial intelligence report is scheduled for release on <span className="text-cyan font-semibold">{new Date(article.pubDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-800 rounded-full border border-ocean-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Status: Scheduled Release
            </div>
          </div>
        ) : (
          <>
            <div className="markdown-body prose prose-invert prose-cyan max-w-none prose-h2:text-white prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-slate-300 prose-p:text-lg prose-p:leading-[1.8] prose-strong:text-cyan">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => {
                    const isInternal = props.href?.startsWith('/');
                    if (isInternal) {
                      return (
                        <Link 
                          to={props.href!} 
                          className="text-cyan hover:underline"
                        >
                          {props.children}
                        </Link>
                      );
                    }
                    return <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline" />;
                  }
                }}
              >
                {article.content!}
              </ReactMarkdown>
            </div>

            {articleFaqs && articleFaqs.length > 0 && (
              <FAQSection 
                items={articleFaqs} 
                title="Article Frequently Asked Questions" 
                subtitle="Strategic details and tactical responses associated with this intelligence report." 
                className="mt-16" 
              />
            )}
          </>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="mt-16 pt-16 border-t border-ocean-800">
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-ocean-900 border border-ocean-800 text-slate-400 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
    </>
  );
}
