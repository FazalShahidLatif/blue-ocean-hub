import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-ocean-900 border border-cyan/20 rounded-2xl p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex-grow">
            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Cookie Intelligence</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              We use cookies to analyze traffic and optimize your strategic reading experience. By continuing, you agree to our <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', {detail: 'cookie-policy'}))} className="text-cyan underline">Cookie Policy</button>.
            </p>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={accept} className="btn-primary flex-grow !py-2 text-[10px] uppercase tracking-[0.2em] font-bold">
            Accept All
          </button>
          <button onClick={() => setIsVisible(false)} className="btn-outline flex-grow !py-2 text-[10px] uppercase tracking-[0.2em] font-bold">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
