import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Send, 
  Play, 
  Globe, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Info, 
  List, 
  Flame,
  Terminal,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "./SEO";

interface IndexingStatus {
  success: boolean;
  isConfigured: boolean;
  clientEmail: string | null;
  urls: string[];
}

interface LogEntry {
  time: string;
  type: "info" | "success" | "error" | "warn";
  message: string;
}

export default function IndexingConsole() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<IndexingStatus | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const [isSubmittingSitemap, setIsSubmittingSitemap] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/google-indexing/status");
      const data = await res.json();
      setStatus(data);
      if (!silent) {
        addLog("info", `Webmaster status fetched. Found ${data.urls?.length || 0} indexable URLs in sitemap.`);
        if (data.isConfigured) {
          addLog("success", `Google API Credentials detected: ${data.clientEmail}`);
        } else {
          addLog("warn", "Google API Credentials are not configured in environment variables yet.");
        }
      }
    } catch (e: any) {
      addLog("error", `Failed to load indexing status: ${e.message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const addLog = (type: LogEntry["type"], message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, type, message }, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("info", "Logs console cleared.");
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;

    if (status && !status.urls.includes(customUrl) && !customUrl.startsWith("https://blueoceanhub.info")) {
      addLog("warn", "Submitted URL is external or not part of blueoceanhub.info. Proceeding anyway.");
    }

    setIsSubmittingUrl(true);
    addLog("info", `Submitting URL: ${customUrl} with status URL_UPDATED...`);
    
    try {
      const res = await fetch("/api/google-indexing/submit-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: customUrl, type: "URL_UPDATED" })
      });
      const data = await res.json();
      
      if (data.success) {
        addLog("success", `Successfully indexed! response: ${JSON.stringify(data.data)}`);
        setCustomUrl("");
      } else {
        addLog("error", `Google Indexing API rejected: ${data.error}. ${data.details?.error?.message || ""}`);
      }
    } catch (e: any) {
      addLog("error", `Request failed: ${e.message}`);
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  const triggerSitemapPing = async () => {
    setIsSubmittingSitemap(true);
    addLog("info", "Initiating sitemap.xml PUT request directly to Google Search Console API...");
    try {
      const res = await fetch("/api/google-indexing/submit-sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_sitemap_ping" })
      });
      const data = await res.json();

      if (data.success) {
        addLog("success", `Pristine sitemap ping successful. ${data.message || ""}`);
      } else {
        addLog("error", `Sitemap ping rejected: ${data.error}. Ensure the Service Account is set as an Owner.`);
      }
    } catch (e: any) {
      addLog("error", `GSC connection failed: ${e.message}`);
    } finally {
      setIsSubmittingSitemap(false);
    }
  };

  const triggerBulkIndexing = async () => {
    if (!status?.urls?.length) return;
    setIsSubmittingSitemap(true);
    addLog("info", `Starting bulk URL push pipeline for ${status.urls.length} target URLs.`);
    
    try {
      addLog("info", "Submitting URLs sequential-mode to throttle API requests gracefully...");
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < status.urls.length; i++) {
        const url = status.urls[i];
        setProgress({ current: i + 1, total: status.urls.length });

        try {
          const res = await fetch("/api/google-indexing/submit-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, type: "URL_UPDATED" })
          });
          const data = await res.json();

          if (data.success) {
            successCount++;
            addLog("success", `[${i + 1}/${status.urls.length}] Crawl requested for: ${url}`);
          } else {
            failCount++;
            addLog("error", `[${i + 1}/${status.urls.length}] Push failed for: ${url} (${data.error})`);
          }
        } catch (err: any) {
          failCount++;
          addLog("error", `[${i + 1}/${status.urls.length}] Network error: ${url} (${err.message})`);
        }

        // 300ms throttle to comply with Google concurrent guidelines
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      addLog("success", `Bulk update pipeline completed. Successful: ${successCount}, Failed: ${failCount}.`);
    } catch (e: any) {
      addLog("error", `Bulk indexing pipeline crashed: ${e.message}`);
    } finally {
      setIsSubmittingSitemap(false);
      setProgress(null);
    }
  };

  return (
    <>
      <SEO 
        title="Google SEO Indexing Engine | Blue Ocean Hub"
        description="Submit XML sitemaps and individual financial intelligence article nodes directly to the Google Indexing and Search Console API."
        canonicalUrl="https://blueoceanhub.info/indexing-console"
      />

      <article className="pt-32 pb-20 bg-ocean-950 min-h-screen text-slate-300">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-ocean-900">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan transition-colors uppercase text-xs font-bold tracking-widest group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </button>
          </div>

          <header className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 font-display">
              Google Indexing <span className="text-cyan">Ecosystem Console</span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
              Real-time submission pipeline for search engines. Instantly request indexing for newly published South Asian financial reports to secure high spots in GEO engine bots.
            </p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-ocean-900 border border-ocean-800 rounded-2xl mb-8">
              <RefreshCw className="w-8 h-8 text-cyan animate-spin mb-4" />
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Loading Indexing Pipelines...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: API Status & Setup Guide or Manual indexing triggers */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Dynamic Authentication Status Board */}
                <div className="p-6 rounded-2xl bg-ocean-900 border border-ocean-800 shadow-xl overflow-hidden relative">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-cyan/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-ocean-800/80">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${status?.isConfigured ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                        {status?.isConfigured ? (
                          <ShieldCheck className="w-6 h-6 stroke-[2]" />
                        ) : (
                          <ShieldAlert className="w-6 h-6 stroke-[2]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">API Pipeline Status</h2>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${status?.isConfigured ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                            {status?.isConfigured ? "CONNECTED" : "UNCONFIGURED"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {status?.isConfigured 
                            ? `Authenticated: ${status.clientEmail}` 
                            : "Awaiting Google Service Account keys configuration"}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => fetchStatus(false)}
                      className="px-4 py-2 bg-ocean-850 hover:bg-ocean-800 border border-ocean-800 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 transition-all self-start md:self-auto shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-Check
                    </button>
                  </div>

                  {/* 2. Interactive Controls (Active only if authenticated) */}
                  {status?.isConfigured ? (
                    <div className="pt-6 space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Pipeline Controls</h3>
                      
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={triggerBulkIndexing}
                          disabled={isSubmittingSitemap}
                          className="px-5 py-3 bg-cyan hover:bg-cyan/90 disabled:opacity-50 text-ocean-950 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-cyan/10"
                        >
                          <Play className="w-4 h-4 text-ocean-950 fill-ocean-950" />
                          Bulk Index Sitemap ({status.urls.length} URLs)
                        </button>

                        <button 
                          onClick={triggerSitemapPing}
                          disabled={isSubmittingSitemap}
                          className="px-5 py-3 bg-ocean-850 hover:bg-ocean-800 disabled:opacity-50 border border-ocean-800 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                        >
                          <Globe className="w-4 h-4 text-cyan" />
                          Submit Sitemap To Search Console PUT
                        </button>
                      </div>

                      {/* Custom input submission */}
                      <form onSubmit={handleSingleSubmit} className="mt-6 pt-6 border-t border-ocean-800/60">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Submit Custom Individual URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="url" 
                            required
                            placeholder="e.g. https://blueoceanhub.info/article/pseb-registration" 
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            className="bg-ocean-950 border border-ocean-800 text-white rounded-lg px-4 py-2.5 text-sm flex-grow focus:outline-none focus:border-cyan transition-colors font-mono"
                          />
                          <button 
                            type="submit"
                            disabled={isSubmittingUrl}
                            className="px-4 bg-ocean-800 hover:bg-ocean-700 disabled:opacity-50 border border-ocean-700 text-cyan rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Notify
                          </button>
                        </div>
                      </form>

                      {progress && (
                        <div className="mt-4 p-4 rounded-xl bg-ocean-950 border border-ocean-800">
                          <div className="flex justify-between items-center text-xs mb-2">
                            <span className="text-cyan font-bold uppercase tracking-wider">Push Pipeline Progress</span>
                            <span className="font-mono text-slate-400">{progress.current} / {progress.total}</span>
                          </div>
                          <div className="w-full h-2 bg-ocean-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan transition-all duration-300"
                              style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Elegant detailed wizard on how to setup auth */
                    <div className="pt-6">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-cyan uppercase tracking-widest mb-3">
                        <Info className="w-4 h-4" /> Three-Step Setup Protocol:
                      </span>
                      <ol className="space-y-4 text-xs text-slate-400">
                        <li className="flex gap-3 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-ocean-950 border border-cyan/30 text-cyan flex items-center justify-center shrink-0 font-bold">1</span>
                          <div>
                            <strong className="text-slate-300 block mb-0.5">Generate Google Service Account Credentials</strong>
                            Go to <a 
                              href="https://console.cloud.google.com/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              aria-label="Open Google Cloud Console in a new tab"
                              className="text-cyan hover:underline inline-flex items-center gap-0.5 font-bold"
                            >
                              Google Cloud Console <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>, enable the <strong>Webmaster / Search Console API</strong> and <strong>Indexing API</strong>, create a Service Account, and download its <strong>JSON Credentials Private Key</strong> file.
                          </div>
                        </li>
                        <li className="flex gap-3 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-ocean-950 border border-cyan/30 text-cyan flex items-center justify-center shrink-0 font-bold">2</span>
                          <div>
                            <strong className="text-slate-300 block mb-0.5">Register as Search Console Owner</strong>
                            Open your website property on <a 
                              href="https://search.google.com/search-console" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              aria-label="Open Google Search Console in a new tab"
                              className="text-cyan hover:underline inline-flex items-center gap-0.5 font-bold"
                            >
                              Google Search Console <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>. Add the Service Account's email address (e.g., <code>your-sc-acct@gcp-project.iam.gserviceaccount.com</code>) under Settings &rarr; Users & Permissions as an <strong>Owner</strong>.
                          </div>
                        </li>
                        <li className="flex gap-3 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-ocean-950 border border-cyan/30 text-cyan flex items-center justify-center shrink-0 font-bold">3</span>
                          <div>
                            <strong className="text-slate-300 block mb-0.5">Paste Credentials in Environment Configuration</strong>
                            In your platform settings, set the environment variable <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> with the full content of the downloaded JSON key file as a single-line string. Or set <code>GOOGLE_CLIENT_EMAIL</code> and <code>GOOGLE_PRIVATE_KEY</code>.
                          </div>
                        </li>
                      </ol>

                      <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Once configured correctly, the Status Board will switch to <span className="text-emerald-400 font-bold">CONNECTED</span>, activating sitemap submission buttons so you can trigger real-time search bot crawls.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. LIVE TELEMETRY CONSOLE logs */}
                <div className="p-6 rounded-2xl bg-ocean-900 border border-ocean-800 shadow-xl">
                  <div className="flex justify-between items-center pb-4 border-b border-ocean-800">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Pipeline Terminal Logging</h3>
                    </div>
                    <button 
                      onClick={clearLogs}
                      className="text-[10px] text-slate-400 hover:text-cyan font-semibold uppercase tracking-wider transition-colors"
                    >
                      Clear Terminal
                    </button>
                  </div>

                  <div className="h-48 mt-4 overflow-y-auto bg-ocean-950 p-4 rounded-xl border border-ocean-850 font-mono text-[11px] leading-relaxed flex flex-col-reverse gap-2 text-slate-300">
                    <AnimatePresence>
                      {logs.length === 0 ? (
                        <div className="text-slate-400 text-center py-10 italic">Awaiting action commands. Terminal is clear.</div>
                      ) : (
                        logs.map((log, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-slate-400 shrink-0">[{log.time}]</span>
                            <span className={`shrink-0 font-bold uppercase text-[10px] ${
                              log.type === "success" ? "text-emerald-400" :
                              log.type === "error" ? "text-red-400" :
                              log.type === "warn" ? "text-amber-400" : "text-cyan"
                            }`}>
                              [{log.type}]
                            </span>
                            <span className="break-all">{log.message}</span>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-3 flex justify-between items-center ultra-data text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Protocol: HTTPS URL_UPDATED Webmaster REST</span>
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-cyan animate-pulse" /> SGE / SEO Engines Compatible</span>
                  </div>
                </div>

              </div>

              {/* Right Column: List of Sitemap URL Resources */}
              <div className="col-span-1">
                <div className="p-6 rounded-2xl bg-ocean-900 border border-ocean-800 shadow-xl h-full flex flex-col">
                  <div className="flex items-center gap-2 pb-4 border-b border-ocean-800">
                    <List className="w-4 h-4 text-cyan" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Sitemap URL Registry ({status ? status.urls.length : 0})
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-3 mb-4">
                    The following URLs represent all active resources mapped directly in your standard dynamically generated sitemap.
                  </p>

                  <div className="flex-grow space-y-2 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
                    {status?.urls?.map((url, idx) => {
                      const relativeUrl = url.replace("https://blueoceanhub.info", "");
                      return (
                        <div 
                          key={idx} 
                          className="p-2 bg-ocean-950 hover:bg-ocean-850 rounded border border-ocean-850 transition-colors uppercase text-[9px] font-semibold tracking-wider flex justify-between items-center group font-mono"
                        >
                          <span className="text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap mr-2" title={url}>
                            {relativeUrl === "" ? "/" : relativeUrl}
                          </span>
                          <button 
                            onClick={() => {
                              setCustomUrl(url);
                              addLog("info", `Selected URL: ${url} (Ready for single push notification)`);
                            }}
                            className="bg-ocean-900 hover:bg-cyan hover:text-ocean-950 text-cyan px-2 py-0.5 rounded transition-all flex items-center gap-0.5 text-[8px]"
                          >
                            SELECT
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-ocean-800 flex items-center justify-between text-[11px] font-bold text-slate-400 gap-2 flex-wrap">
                    <a 
                      href="/sitemap.xml" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="View Live XML Sitemap in a new tab"
                      className="text-cyan hover:underline hover:text-cyan/80 flex items-center gap-1.5"
                    >
                      View Live Sitemap
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                    <a 
                      href="/all.txt" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="View all.txt Feed in a new tab"
                      className="text-emerald-400 hover:underline hover:text-emerald-300 flex items-center gap-1.5"
                    >
                      View all.txt Feed
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                    <a 
                      href="/llms.txt" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="View llms.txt in a new tab"
                      className="text-amber-400 hover:underline hover:text-amber-300 flex items-center gap-1.5"
                    >
                      View llms.txt
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </article>
    </>
  );
}
