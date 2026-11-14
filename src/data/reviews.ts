/**
 * Reader reviews.
 *
 * HONESTY CONTRACT: this file is the single source of truth for any rating the
 * site displays or emits as structured data. An entry may only be added for a
 * review that actually exists on a verifiable third-party platform
 * (Trustpilot, Google Business Profile) and that we can link to.
 *
 * While the list is empty the site displays NO star rating, NO aggregate
 * score and emits NO AggregateRating schema. Invented ratings violate
 * Google's structured-data policy and would be a false claim to readers.
 */

export interface ReviewSource {
  /** Where the review genuinely lives. */
  platform: "trustpilot" | "google";
  /** Link to the public review or to the listing page. */
  url: string;
}

export interface Review {
  id: string;
  author: string;
  /** Rating out of 5. */
  rating: number;
  date: string;
  title?: string;
  body: string;
  source: ReviewSource;
}

/**
 * Verified third-party reviews. Empty until real reviews are collected.
 * Add an entry only when the review is publicly visible at `source.url`.
 */
export const REVIEWS: Review[] = [];

/** Review sources. Google reviews are not collected (no Business Profile). */
export const REVIEW_PROVIDERS = {
  /**
   * Trustpilot business unit id and widget template id. Fill these in from the
   * Trustpilot business dashboard (TrustBox → Widget) once the profile exists.
   * The widget renders a "leave a review" prompt until a review exists.
   */
  trustpilot: {
    businessUnitId: "",
    templateId: "",
    reviewUrl: "https://www.trustpilot.com/review/blueoceanhub.info",
  },
  /**
   * Not collected. Kept as an explicit record of the decision rather than an
   * empty field, so the reviews page can explain why.
   */
  google: {
    collected: false,
    reason:
      "Google reviews require a verified Business Profile, which we do not maintain for this publication.",
  },
};

export function hasReviews(): boolean {
  return REVIEWS.length > 0;
}

/** Aggregate rating, only meaningful when at least one review exists. */
export function aggregateRating(): { ratingValue: number; reviewCount: number } | null {
  if (!REVIEWS.length) return null;
  const total = REVIEWS.reduce((s, r) => s + r.rating, 0);
  return {
    ratingValue: Math.round((total / REVIEWS.length) * 10) / 10,
    reviewCount: REVIEWS.length,
  };
}
