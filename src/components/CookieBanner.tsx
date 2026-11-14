import { useState, useEffect } from "react";
import { ShieldCheck, X, ChevronDown, ChevronUp } from "lucide-react";
import { writeConsent, readConsent, CONSENT_KEY } from "../lib/consent";

/**
 * Cookie notice.
 *
 * This is an *information* notice, not a wall. It never blocks content and it
 * never gates advertising or affiliate links — those are the site's only
 * revenue source. The choices here govern analytics and behavioural ad
 * personalisation; ads display either way (contextual when personalisation
 * is declined).
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [personalised, setPersonalised] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    const c = readConsent();
    setPersonalised(c.personalisedAdvertising);
    setAnalytics(c.analytics);
  }, []);

  const save = (opts: { personalisedAdvertising: boolean; analytics: boolean }) => {
    writeConsent(opts);
    setPersonalised(opts.personalisedAdvertising);
    setAnalytics(opts.analytics);
    setIsVisible(false);
    setExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[26rem] z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-ocean-900 border border-cyan/20 rounded-2xl p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-cyan/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-cyan" />
          </div>
          <div className="flex-grow">
            <p className="text-white font-bold text-xs mb-1 uppercase tracking-wider">Cookie Notice</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              We use essential cookies to run the site, and optional ones for
              analytics and ad personalisation. Advertising and affiliate links
              always display and are never gated. Read our{" "}
              <button
                type="button"
                aria-label="Read our full Cookie Policy"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("navigate", { detail: "cookie-policy" }))
                }
                className="text-cyan hover:underline font-semibold cursor-pointer"
              >
                Cookie Policy
              </button>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => save({ personalisedAdvertising: personalised, analytics })}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close cookie notice"
            title="Close cookie notice"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Close cookie notice</span>
          </button>
        </div>

        {expanded && (
          <div className="mb-3 rounded-xl border border-slate-800/70 bg-ocean-950/40 p-3 space-y-3">
            <label className="flex items-start gap-2.5 text-xs text-slate-300">
              <input type="checkbox" checked disabled className="mt-0.5 accent-cyan" />
              <span>
                <span className="font-semibold text-white">Essential</span> — required for the site to
                function. Always on.
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5 accent-cyan"
              />
              <span>
                <span className="font-semibold text-white">Analytics</span> — anonymous usage
                measurement. Ads still display either way.
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={personalised}
                onChange={(e) => setPersonalised(e.target.checked)}
                className="mt-0.5 accent-cyan"
              />
              <span>
                <span className="font-semibold text-white">Personalised advertising</span> — allows
                behavioural ad targeting. Without it you see contextual ads only.
              </span>
            </label>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => save({ personalisedAdvertising: true, analytics: true })}
            aria-label="Accept all cookies"
            className="btn-primary flex-grow !py-2 text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => save({ personalisedAdvertising: false, analytics: false })}
            aria-label="Use essential cookies only"
            className="btn-outline flex-grow !py-2 text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse cookie settings" : "Expand cookie settings"}
            aria-expanded={expanded}
            className="btn-outline !px-3 !py-2 text-[10px] font-bold"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
