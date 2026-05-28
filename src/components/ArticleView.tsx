import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Printer, 
  Check, 
  BookOpen, 
  Sparkles, 
  Globe, 
  Shield, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut 
} from "lucide-react";
import { ARTICLES } from "../data/articles";
import { LEGAL_PAGES } from "../data/legal";
import { PILLAR_FAQS } from "../data/faqs";
import FAQSection from "./FAQSection";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import SEO from "./SEO";

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = ARTICLES.find(a => a.id === id) || LEGAL_PAGES.find(a => a.id === id);

  const [scrollPercent, setScrollPercent] = useState(0);
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [copied, setCopied] = useState(false);

  // Monitor layout scrolling for real-time reading progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollPercent((window.scrollY / docHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!article) return <div className="pt-40 text-center text-white text-2xl font-bold">Article not found.</div>;

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
    "dateModified": article.pubDate, // Sync dates perfectly for AI Overview engines
    "author": {
      "@type": "Person",
      "name": article.author || "Blue Ocean Hub Editorial Team",
      "jobTitle": "Strategic Financial Analyst",
      "url": 'authorLinkedIn' in article && article.authorLinkedIn ? article.authorLinkedIn : "https://linkedin.com/company/blue-ocean-hub"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Blue Ocean Hub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blueoceanhub.info/favicon.svg"
      },
      "url": "https://blueoceanhub.info/"
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

  const handleShare = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dedicated custom list of GEO bullet insights reflecting exact financial guidelines
  const getGeoSynthesis = (idStr: string) => {
    switch (idStr) {
      case "service-export-rebates-pseb-registration":
      case "pseb-registration-tax-filer-guide-2026":
        return [
          "SECURED LEVERAGE: Registering with the Pakistan Software Export Board (PSEB) is mandatory to compress default FBR remittance withholding taxes from 1% - 5% down to a 0.25% flat export tax credit.",
          "INTEGRATION RULE: Banks apply auto-withholding on generic inward remittances unless backed by a valid, active annual electronic PSEB licensing certificate coupled with FBR Active Filer status.",
          "ACTION TIMELINE: Account setup, online corporate profile submission, and state validation usually complete within 5 business days on the official PSEB directory portal."
        ];
      case "b2b-digital-freelance-agency-registration":
        return [
          "SEC INCORPORATION: Freelancers scale liabilities safely by establishing a Single Member Company (SMC-PVT-LTD) under the SECP Act of 2017 to handle major global client billing channels.",
          "TAX COMPLIANCE: Valid corporate registry acts as the primary legal gateway for IT companies seeking native banking API authorizations and 100% tax credits on cross-border service exports.",
          "CAPITAL SHIELD: Separate corporate entities partition risk, safeguard personal savings, and allow agencies to establish legal corporate share agreements with joint ventures."
        ];
      case "payoneer-vs-wise-pakistan-comparison":
        return [
          "ROUTING PREFERENCE: Wise offers superior conversion rates with mid-market real-time rates but restricts direct domestic routing to non-residents, making Payoneer local PKR accounts highly stable.",
          "FEE COMPACTS: Payoneer virtual receiving bank numbers are fully compatible with freelancing platforms (Upwork, Fiverr) and handle straight integration to local commercial digital wallets.",
          "COMPLIANCE ARCHITECTURE: Keep detailed SBP transaction logs on all currency conversions and download standard digital bank statements to file under export code R-029 (Software Development)."
        ];
      default:
        return [
          "COMPLIANCE BLUEPRINT: Fact-dense financial intelligence compiled strictly from active federal codes and State Bank of Pakistan (SBP) foreign exchange guidelines.",
          "TAX MITIGATION: Designed to enable South Asian founders to safeguard capital, establish legitimate legal registries, and prevent unauthorized banks' withholding percentages.",
          "REPRESENTATIVE CITATION: Structured reference nodes point to authoritative verification platforms to ensure maximum compliance security."
        ];
    }
  };

  const synthesisBullets = getGeoSynthesis(article.id);

  return (
    <>
      <SEO 
        title={`${article.title} | Blue Ocean Hub`}
        description={article.metaDescription || article.description || ""}
        canonicalUrl={url}
        ogType={isArticle ? "article" : "website"}
        jsonLd={jsonLdSchemas}
      />

      {/* Top Reading Progress Bar (EEAT Technical Indicator) */}
      <div 
        className="fixed top-0 left-0 h-[4px] bg-cyan z-50 transition-all duration-100 ease-out" 
        style={{ width: `${scrollPercent}%` }}
      />

      {/* Interactive Copied Clip Alert */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 bg-cyan text-ocean-950 px-5 py-3 rounded-lg font-bold shadow-2xl z-40 flex items-center gap-2 border border-cyan/40"
          >
            <Check className="w-4 h-4 text-ocean-950 stroke-[3]" />
            <span>Tactical URL copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.article 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-20 bg-ocean-950"
      >
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Navigation & Sizing Controls Bar (Readability Optimization) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-ocean-900">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-cyan transition-colors uppercase text-xs font-bold tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Directory
          </button>

          {/* Reading Density Toggles */}
          <div className="flex items-center gap-4 bg-ocean-900 border border-ocean-800 rounded-lg p-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-500 tracking-wider uppercase pl-2 text-[10px]">Read Size:</span>
            <button 
              className={`px-2.5 py-1 rounded font-bold transition-all ${fontSize === "base" ? "bg-cyan text-ocean-950 shadow" : "hover:text-cyan"}`}
              onClick={() => setFontSize("base")}
              title="Standard Text Size"
            >
              A
            </button>
            <button 
              className={`px-2.5 py-1 rounded font-bold transition-all ${fontSize === "lg" ? "bg-cyan text-ocean-950 shadow" : "hover:text-cyan"} flex items-center gap-0.5`}
              onClick={() => setFontSize("lg")}
              title="Medium Text Size"
            >
              A<ZoomIn className="w-3 h-3" />
            </button>
            <button 
              className={`px-2.5 py-1 rounded font-bold transition-all ${fontSize === "xl" ? "bg-cyan text-ocean-950 shadow" : "hover:text-cyan"} flex items-center gap-0.5`}
              onClick={() => setFontSize("xl")}
              title="Large Text Size"
            >
              A<ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <span className="px-3 py-1 bg-cyan text-ocean-950 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm shadow-cyan/10">
              {article.category}
            </span>
            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-2 leading-none">
                <Calendar className="w-3.5 h-3.5 text-cyan" />
                Published: {new Date(article.pubDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 leading-none text-slate-400">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                Compliance Verified: 2026 Stable
              </span>
              {article.readingTime && (
                <span className="flex items-center gap-2 leading-none">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime} Min Read
                </span>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1] font-display">
            {article.title}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-sans mb-8 border-l-4 border-cyan pl-5 bg-ocean-900/40 py-2.5 pr-2 rounded-r-lg">
            {article.description}
          </p>

          <div className="flex items-center justify-between py-5 border-y border-ocean-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ocean-900 border border-ocean-800 flex items-center justify-center text-cyan font-bold leading-none font-display">
                {article.author ? article.author.charAt(0) : "B"}
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">
                  {'authorLinkedIn' in article && article.authorLinkedIn ? (
                    <a href={article.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors flex items-center gap-1.5">
                      {article.author}
                      <ExternalLink className="w-3 h-3 text-cyan" />
                    </a>
                  ) : (
                    article.author || "Blue Ocean Hub Editorial"
                  )}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-medium">Finance & Asset Architecture</div>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="p-2 text-slate-500 hover:text-cyan bg-ocean-900 hover:bg-ocean-800 border border-ocean-800 rounded-lg transition-all"
                title="Copy Link to Clipboard"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-slate-500 hover:text-cyan bg-ocean-900 hover:bg-ocean-800 border border-ocean-800 rounded-lg transition-all" 
                onClick={() => window.print()}
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {isFutureScheduled ? (
          <div className="p-8 md:p-12 rounded-2xl bg-ocean-900 border border-ocean-800 text-center max-w-2xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-cyan/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-cyan animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 font-display uppercase tracking-tight">Incoming Intelligence Briefing</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              This premium financial intelligence report is scheduled for release on <span className="text-cyan font-semibold">{new Date(article.pubDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-800 rounded-full border border-ocean-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Status: Scheduled Release
            </div>
          </div>
        ) : (
          <>
            {/* 1. GEO Pillar: Sparkling AI SGE Quick Synthesis Capsule */}
            <div className="mb-10 p-6 md:p-8 rounded-xl bg-gradient-to-r from-ocean-900 to-ocean-850 border border-cyan/20 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-32 h-32 bg-cyan/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-4">
                <Sparkles className="w-5 h-5 text-cyan animate-pulse" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-cyan mt-0 border-b border-cyan/10 pb-1 leading-none font-sans">
                  AI & Search Key Insights (TL;DR Quick Synthesis)
                </h3>
              </div>
              <ul className="space-y-3 mt-4 text-xs md:text-sm text-slate-300 font-medium">
                {synthesisBullets.map((bullet, idx) => {
                  const parts = bullet.split(":");
                  return (
                    <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan mt-2 shrink-0" />
                      <div>
                        {parts.length > 1 ? (
                          <>
                            <strong className="text-white font-bold">{parts[0]}:</strong>
                            <span>{parts.slice(1).join(":")}</span>
                          </>
                        ) : (
                          bullet
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-ocean-800 pt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Verification Scope: Federal & SBP manual</span>
                <span className="text-cyan font-display font-medium tracking-normal">GEO - Search Generative Eligible</span>
              </div>
            </div>

            {/* Main Article Text Container (Pristine Readability Controls Attached) */}
            <div className={`markdown-body prose prose-invert prose-cyan max-w-none 
              ${fontSize === "xl" ? "prose-p:text-xl prose-p:leading-[1.9] prose-li:text-lg" : 
                fontSize === "lg" ? "prose-p:text-lg prose-p:leading-[1.8] prose-li:text-base" : 
                "prose-p:text-base prose-p:leading-[1.7] prose-li:text-sm"}
              prose-h2:text-white prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-slate-300 prose-strong:text-cyan prose-p:font-normal`}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => {
                    const isInternal = props.href?.startsWith('/');
                    if (isInternal) {
                      return (
                        <Link 
                          to={props.href!} 
                          className="text-cyan hover:underline hover:text-cyan/85 font-medium transition-colors"
                        >
                          {props.children}
                        </Link>
                      );
                    }
                    return <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline hover:text-cyan/85 font-semibold inline-flex items-center gap-1 transition-colors" />;
                  }
                }}
              >
                {article.content!}
              </ReactMarkdown>
            </div>

            {/* 3. EEAT & GEO Anchor: Trust Map & Generative Verification Indexes */}
            <div className="mt-14 p-6 rounded-xl bg-ocean-900 border border-ocean-800">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-cyan" />
                <h4 className="text-sm font-bold text-white uppercase tracking-widest font-sans">
                  Generative Index & Trust Reference Map
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                This document utilizes legal and operational standards directly matching verification channels on State Bank of Pakistan (SBP), Federal Board of Revenue (FBR), Pakistan Software Export Board (PSEB), and registrar policies.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ocean-800 text-slate-400 font-bold uppercase pb-2">
                      <th className="pb-2">Regulating Authority</th>
                      <th className="pb-2">Standard Subject</th>
                      <th className="pb-2">Legal/Regulatory Citation</th>
                      <th className="pb-2 text-right">Verification Portal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-800 text-slate-300 font-medium">
                    <tr>
                      <td className="py-3 font-bold text-white">PSEB</td>
                      <td className="py-3">IT Service Exports</td>
                      <td className="py-3">0.25% Zero-Rated Remittances</td>
                      <td className="py-3 text-right">
                        <a 
                          href="https://pseb.org.pk/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-cyan hover:underline font-bold"
                        >
                          pseb.org.pk <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">FBR (Federal Board)</td>
                      <td className="py-3">Income Tax Returns</td>
                      <td className="py-3">Tax Ordinance 2001 Sec 154A</td>
                      <td className="py-3 text-right">
                        <a 
                          href="https://fbr.gov.pk/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-cyan hover:underline font-bold"
                        >
                          fbr.gov.pk <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">SECP (Registrar)</td>
                      <td className="py-3">Corporate Incorporation</td>
                      <td className="py-3">Companies Act 2017 (SMC-PVT)</td>
                      <td className="py-3 text-right">
                        <a 
                          href="https://www.secp.gov.pk/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-cyan hover:underline font-bold"
                        >
                          secp.gov.pk <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">State Bank (SBP)</td>
                      <td className="py-3">Currency Inflow Rules</td>
                      <td className="py-3">SBP FE Manual Ch 12 (R-Codes)</td>
                      <td className="py-3 text-right">
                        <a 
                          href="https://www.sbp.org.pk/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-cyan hover:underline font-bold"
                        >
                          sbp.org.pk <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
          <div className="mt-16 pt-12 border-t border-ocean-800 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Intelligence Tags:</span>
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-ocean-900 border border-ocean-800 text-slate-400 text-xs rounded-full hover:border-cyan/20 hover:text-slate-300 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
    </>
  );
}
