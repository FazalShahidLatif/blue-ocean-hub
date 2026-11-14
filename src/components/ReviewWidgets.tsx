import { useEffect, useRef } from "react";
import { Star, ExternalLink, MessageSquareQuote, ShieldCheck } from "lucide-react";
import {
  REVIEWS,
  REVIEW_PROVIDERS,
  hasReviews,
  aggregateRating,
} from "../data/reviews";

function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(rating) ? "fill-cyan text-cyan" : "text-slate-600"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/**
 * Renders reader reviews from Trustpilot and Google.
 *
 * Emits nothing fabricated: while no verified review exists, the panel shows
 * the "leave a review" route rather than an invented score. The aggregate
 * block only appears once at least one review is in `REVIEWS`.
 */
export default function ReviewWidgets() {
  const tpRef = useRef<HTMLDivElement>(null);
  const configured = !!REVIEW_PROVIDERS.trustpilot.businessUnitId;

  useEffect(() => {
    if (!configured || !tpRef.current) return;

    const el = tpRef.current;
    el.setAttribute("data-locale", "en-US");
    el.setAttribute("data-template-id", REVIEW_PROVIDERS.trustpilot.templateId);
    el.setAttribute("data-businessunit-id", REVIEW_PROVIDERS.trustpilot.businessUnitId);
    el.setAttribute("data-style-height", "520");
    el.setAttribute("data-style-width", "100%");
    el.setAttribute("data-theme", "dark");
    el.setAttribute("data-reviews-schema", "true");

    if (!document.querySelector('script[src*="tp.widget.bootstrap"]')) {
      const s = document.createElement("script");
      s.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
      s.async = true;
      document.body.appendChild(s);
    }
    if ((window as unknown as { tp?: { init: () => void } }).tp?.init) {
      (window as unknown as { tp: { init: () => void } }).tp.init();
    }
  }, [configured]);

  const agg = aggregateRating();

  return (
    <div className="mt-10 space-y-8" id="reviews">
      {hasReviews() && agg && (
        <div className="rounded-2xl border border-cyan/30 bg-ocean-900/80 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="text-4xl font-bold text-white font-display leading-none">
                {agg.ratingValue.toFixed(1)}
              </div>
              <div className="mt-2">
                <Stars rating={agg.ratingValue} />
              </div>
              <p className="mt-2 text-[11px] text-slate-400 uppercase tracking-wider">
                {agg.reviewCount} verified review{agg.reviewCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex-grow">
              <h3 className="text-white font-bold mb-3 font-display">Reader reviews</h3>
              <div className="space-y-4">
                {REVIEWS.map((r) => (
                  <figure
                    key={r.id}
                    className="rounded-xl border border-slate-800/70 bg-ocean-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <figcaption className="text-sm font-semibold text-white">
                        {r.author}
                      </figcaption>
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} size="w-3.5 h-3.5" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          via {r.source.platform}
                        </span>
                      </div>
                    </div>
                    {r.title && <p className="text-sm font-semibold text-cyan mb-1">{r.title}</p>}
                    <blockquote className="text-sm text-slate-300 leading-relaxed">{r.body}</blockquote>
                    <a
                      href={r.source.url}
                      target="_blank"
                      rel="nofollow noopener"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-cyan hover:underline"
                    >
                      View original review <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/70 bg-ocean-950/40 p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-cyan/10 flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-4 h-4 text-cyan" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-white font-bold font-display">Leave a review</h3>
            <p className="text-sm text-slate-400 mt-1">
              We collect reviews on Trustpilot. We do not host reviews we cannot
              verify, and we never edit them.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <a
            href={REVIEW_PROVIDERS.trustpilot.reviewUrl}
            target="_blank"
            rel="nofollow noopener"
            className="group rounded-xl border border-slate-800/70 bg-ocean-900/60 p-5 hover:border-cyan/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-sm">Review on Trustpilot</span>
              <ExternalLink
                className="w-4 h-4 text-slate-500 group-hover:text-cyan transition-colors"
                aria-hidden="true"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Independent, publicly visible, and never edited by us.
            </p>
          </a>
          <div className="rounded-xl border border-dashed border-slate-800/70 p-5">
            <span className="text-white font-bold text-sm">Google reviews</span>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Not collected. Google reviews require a verified Business Profile,
              which we do not maintain for this publication.
            </p>
          </div>
        </div>

        {configured ? (
          <div ref={tpRef} className="mt-6" aria-label="Trustpilot reviews" />
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-4 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-slate-500 leading-relaxed">
              The Trustpilot widget appears here once the business profile is
              connected. Reviews written on Trustpilot display automatically,
              exactly as written.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
