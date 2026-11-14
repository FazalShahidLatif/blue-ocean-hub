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

/** Business identities for the embedded review widgets. */
export const REVIEW_PROVIDERS = {
  /**
   * Trustpilot business unit id and template id. Fill these in from the
   * Trustpilot business dashboard once the profile is created; the widget
   * renders a "leave a review" prompt until then.
   */
  trustpilot: {
    businessUnitId: "",
    templateId: "",
    reviewUrl: "https://www.trustpilot.com/review/blueoceanhub.info",
  },
  /**
   * Google Business Profile place id. Fill this in from the Google Business
   * Profile manager. A Google review listing requires a verified business
   * profile; a publication can qualify.
   */
  google: {
    placeId: "",
    reviewUrl: "",
    mapsUrl: "",
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
