import { Compass, TrendingUp, Zap, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
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
          <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 border border-ocean-800 px-3 py-1 rounded hover:text-cyan hover:border-cyan transition-all hidden sm:block">Volume 8.2</button>
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-cyan">Live Hub</span>
        </div>
      </div>
    </nav>
  );
}
