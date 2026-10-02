import { Compass, TrendingUp, Zap, Globe, Search, X, BookOpen, ArrowRight, Menu, Calculator, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ARTICLES } from "../data/articles";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
                <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">{item.label}</span>
                <span className="text-[10px] font-mono text-cyan font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link 
            to="/" 
            aria-label="Blue Ocean Hub Strategic Financial Intelligence Home"
            className="flex flex-col cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-cyan flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-cyan/20">
                <Compass className="text-ocean-950 w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">BlueOcean<span className="text-cyan">Hub</span></span>
            </div>
            <span className="text-[7.5px] sm:text-[8px] text-slate-300 font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-0.5 ml-1 group-hover:text-cyan transition-colors">Strategic Financial Intelligence</span>
          </Link>

          {/* Desktop Primary Category Links & Toolkit (SEO Interlinking) */}
          <nav aria-label="Main Navigation" className="hidden xl:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Link to="/passive-income" className="hover:text-cyan transition-colors">Passive Income</Link>
            <Link to="/investing" className="hover:text-cyan transition-colors">Investing</Link>
            <Link to="/freelancing" className="hover:text-cyan transition-colors">Freelancing</Link>
            <Link to="/saving-money" className="hover:text-cyan transition-colors">Saving Money</Link>
            <Link to="/dollar-earning" className="hover:text-cyan transition-colors">Dollar Earning</Link>
            <Link to="/toolkit" className="text-cyan hover:text-white transition-colors flex items-center gap-1 font-extrabold bg-cyan/10 border border-cyan/30 px-2.5 py-1 rounded-lg">
              <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Toolkit</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Search Trigger Button */}
            <button 
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search financial intelligence briefings"
              className="flex items-center gap-2 bg-ocean-900 border border-ocean-800 hover:border-cyan/40 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-slate-200 hover:text-white transition-all text-xs cursor-pointer min-h-[38px]"
              title="Search Intelligence Reports (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan" aria-hidden="true" />
              <span className="hidden md:inline text-[11px] font-semibold">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-ocean-950 text-[9px] font-mono rounded text-slate-300 border border-ocean-800">⌘K</kbd>
            </button>

            <Link
              to="/toolkit"
              aria-label="Open Strategic Tool Hub"
              className="xl:hidden flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-cyan bg-cyan/10 border border-cyan/30 px-2.5 py-1.5 rounded-lg hover:bg-cyan hover:text-ocean-950 transition-all min-h-[38px]"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Tools</span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="xl:hidden p-2 text-slate-300 hover:text-cyan bg-ocean-900 border border-ocean-800 rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-cyan" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 text-cyan" aria-hidden="true" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" aria-hidden="true"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-cyan hidden md:inline">Live Hub</span>
            </div>
          </div>
        </div>

        {/* MOBILE RESPONSIVE DRAWER (All Devices Friendly) */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-ocean-950/98 border-b border-ocean-800 backdrop-blur-xl px-6 py-6 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400 block border-b border-ocean-850 pb-2">
                Primary Intelligence Hubs
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link 
                  to="/passive-income" 
                  className="flex items-center justify-between p-3 rounded-xl bg-ocean-900/60 border border-ocean-850 text-slate-200 hover:text-cyan hover:border-cyan/30 text-sm font-semibold transition-all min-h-[44px]"
                >
                  <span>Passive Income</span>
                  <ChevronRight className="w-4 h-4 text-cyan/70" />
                </Link>
                <Link 
                  to="/investing" 
                  className="flex items-center justify-between p-3 rounded-xl bg-ocean-900/60 border border-ocean-850 text-slate-200 hover:text-cyan hover:border-cyan/30 text-sm font-semibold transition-all min-h-[44px]"
                >
                  <span>Investing</span>
                  <ChevronRight className="w-4 h-4 text-cyan/70" />
                </Link>
                <Link 
                  to="/freelancing" 
                  className="flex items-center justify-between p-3 rounded-xl bg-ocean-900/60 border border-ocean-850 text-slate-200 hover:text-cyan hover:border-cyan/30 text-sm font-semibold transition-all min-h-[44px]"
                >
                  <span>Freelancing</span>
                  <ChevronRight className="w-4 h-4 text-cyan/70" />
                </Link>
                <Link 
                  to="/saving-money" 
                  className="flex items-center justify-between p-3 rounded-xl bg-ocean-900/60 border border-ocean-850 text-slate-200 hover:text-cyan hover:border-cyan/30 text-sm font-semibold transition-all min-h-[44px]"
                >
                  <span>Saving Money</span>
                  <ChevronRight className="w-4 h-4 text-cyan/70" />
                </Link>
                <Link 
                  to="/dollar-earning" 
                  className="flex items-center justify-between p-3 rounded-xl bg-ocean-900/60 border border-ocean-850 text-slate-200 hover:text-cyan hover:border-cyan/30 text-sm font-semibold transition-all min-h-[44px]"
                >
                  <span>Dollar Earning</span>
                  <ChevronRight className="w-4 h-4 text-cyan/70" />
                </Link>
                <Link 
                  to="/toolkit" 
                  className="flex items-center justify-between p-3 rounded-xl bg-cyan/15 border border-cyan/40 text-cyan hover:bg-cyan hover:text-ocean-950 text-sm font-bold transition-all min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Strategic Tool Hub
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-3 border-t border-ocean-850 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
                <Link to="/toolkit#pseb-tax-calculator" className="px-2.5 py-1.5 bg-ocean-900 rounded-lg hover:text-cyan">
                  # PSEB Tax Calculator
                </Link>
                <Link to="/toolkit#nomad-travel-logistics" className="px-2.5 py-1.5 bg-ocean-900 rounded-lg hover:text-cyan">
                  # Nomad Travel Logistics
                </Link>
                <Link to="/indexing-console" className="px-2.5 py-1.5 bg-ocean-900 rounded-lg text-cyan">
                  # Indexing Console
                </Link>
              </div>
            </div>
          </div>
        )}
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
                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-slate-300 text-sm"
              />
              <button 
                onClick={() => setSearchOpen(false)}
                aria-label="Close search dialog"
                className="p-1 text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close search dialog</span>
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 px-2 font-semibold">
                {query.trim() ? `Search Results (${searchResults.length})` : 'Popular Briefings'}
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-300 text-sm font-medium">
                  No matching briefings found for "{query}". Try keywords like <span className="text-cyan font-bold">tax</span>, <span className="text-cyan font-bold">PSEB</span>, or <span className="text-cyan font-bold">PSX</span>.
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
                    className="w-full text-left p-3.5 rounded-xl bg-ocean-950/60 border border-ocean-800 hover:border-cyan/40 hover:bg-ocean-800/50 transition-all flex items-start justify-between gap-4 group cursor-pointer"
                  >
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cyan mb-1 inline-block">
                        {a.category}
                      </span>
                      <span className="block text-sm font-bold text-white group-hover:text-cyan transition-colors leading-snug">
                        {a.title}
                      </span>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-light">
                        {a.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                  </button>
                ))
              )}
            </div>

            <div className="p-3 bg-ocean-950 border-t border-ocean-800 text-[10px] text-slate-300 flex justify-between items-center px-4 font-medium">
              <span>238 Active Financial Intelligence Reports Indexed</span>
              <span>Press <kbd className="font-mono text-cyan font-bold">ESC</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

