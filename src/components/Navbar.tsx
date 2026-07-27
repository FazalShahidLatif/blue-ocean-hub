import { Compass, TrendingUp, Zap, Globe, Search, X, BookOpen, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ARTICLES } from "../data/articles";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut Ctrl/Cmd + K for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    setCurrentDate(formatted);
  }, []);

  const tickerItems = [
    { label: "MARKET DATA AS OF", value: currentDate.toUpperCase(), icon: Compass },
    { label: "PSX", value: "81,423 (+1.4%)", icon: TrendingUp },
    { label: "USD/PKR", value: "278.40 (-0.2%)", icon: Globe },
    { label: "GOLD", value: "242,500 (+0.8%)", icon: Zap },
    { label: "BRENT", value: "$82.40 (+1.1%)", icon: Globe },
  ];

  // Search Results Filter
  const searchResults = query.trim() 
    ? ARTICLES.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) || 
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase()) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
      ).slice(0, 6)
    : ARTICLES.slice(0, 5);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-ocean-950/90 backdrop-blur-md border-b border-ocean-800' : 'bg-transparent'}`}>
        <div className="border-b border-ocean-800/50 bg-ocean-950/50 backdrop-blur-sm overflow-hidden whitespace-nowrap py-2">
          <div className="flex animate-marquee gap-12 items-center">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 border-r border-ocean-800 last:border-none">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</span>
                <span className="text-[10px] font-mono text-cyan">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex flex-col cursor-pointer group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-cyan flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-cyan/20">
                <Compass className="text-ocean-950 w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight uppercase">BlueOcean<span className="text-cyan">Hub</span></span>
            </div>
            <span className="text-[8px] text-slate-500 font-medium uppercase tracking-[0.4em] mt-1 ml-1 group-hover:text-cyan/60 transition-colors">Strategic Financial Intelligence</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Search Trigger Button */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 bg-ocean-900 border border-ocean-800 hover:border-cyan/40 px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all text-xs"
              title="Search 238+ Intelligence Reports (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan" />
              <span className="hidden md:inline text-[11px] font-medium">Search Briefings...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-ocean-950 text-[9px] font-mono rounded text-slate-500 border border-ocean-800">⌘K</kbd>
            </button>

            <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 border border-ocean-800 px-3 py-1 rounded hover:text-cyan hover:border-cyan transition-all hidden sm:block">Volume 8.2</button>
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-cyan hidden xs:inline">Live Hub</span>
          </div>
        </div>
      </nav>

      {/* SEARCH MODAL DIALOG */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="bg-ocean-900 border border-cyan/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-ocean-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-cyan shrink-0" />
              <input 
                type="text" 
                placeholder="Search by topic, FBR, PSEB, PSX, Wise, SECP..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-500 text-sm"
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
                {query.trim() ? `Search Results (${searchResults.length})` : 'Popular Briefings'}
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No matching briefings found for "{query}". Try keywords like <span className="text-cyan">tax</span>, <span className="text-cyan">PSEB</span>, or <span className="text-cyan">PSX</span>.
                </div>
              ) : (
                searchResults.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                      navigate(`/article/${a.id}`);
                    }}
                    className="w-full text-left p-3.5 rounded-xl bg-ocean-950/60 border border-ocean-800 hover:border-cyan/40 hover:bg-ocean-800/50 transition-all flex items-start justify-between gap-4 group"
                  >
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cyan mb-1 inline-block">
                        {a.category}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan transition-colors leading-snug">
                        {a.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-light">
                        {a.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                  </button>
                ))
              )}
            </div>

            <div className="p-3 bg-ocean-950 border-t border-ocean-800 text-[10px] text-slate-500 flex justify-between items-center px-4">
              <span>238 Active Financial Intelligence Reports Indexed</span>
              <span>Press <kbd className="font-mono text-cyan">ESC</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

