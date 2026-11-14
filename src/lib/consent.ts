/**
 * Site-wide consent state.
 *
 * Design rule this module exists to enforce: **advertising is never gated
 * behind a consent wall.** Advertising is the site's only revenue source, so
 * the default state must be "ads load". What the banner actually governs is
 * *behavioural personalisation* and analytics, which are opt-in.
 *
 * Stored under a single key so the banner, the ad slots and the analytics
 * wrapper can never disagree (the previous implementation used two different
 * keys and the ad gate never unlocked).
 */

export const CONSENT_KEY = "boh-consent-v1";

export interface ConsentState {
  /** Always true. Needed for the site to function; cannot be refused. */
  essential: true;
  /** Behavioural ad personalisation. Opt-in. Ads still show without it. */
  personalisedAdvertising: boolean;
  /** Analytics. Opt-in. */
  analytics: boolean;
  /** When the choice was recorded. */
  updatedAt: string;
}

/**
 * The default: ads display (non-personalised, contextual), analytics off
 * until the reader opts in. Returning `null` means "no choice recorded yet",
 * which must behave exactly like this default.
 */
export function defaultConsent(): ConsentState {
  return {
    essential: true,
    personalisedAdvertising: false,
    analytics: false,
    updatedAt: "",
  };
}

export function readConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return defaultConsent();
    const parsed = JSON.parse(raw);
    return { ...defaultConsent(), ...parsed, essential: true };
  } catch {
    return defaultConsent();
  }
}

export function writeConsent(patch: Partial<Omit<ConsentState, "essential">>): ConsentState {
  const next: ConsentState = {
    ...readConsent(),
    ...patch,
    essential: true,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable (private mode etc.) — keep the in-memory value
  }
  window.dispatchEvent(new CustomEvent("boh:consent", { detail: next }));
  return next;
}

/** True when ad scripts may load. Default true — revenue must never be gated. */
export function adsAllowed(): boolean {
  return true;
}

/** True only when the reader has explicitly accepted personalisation. */
export function personalisationAllowed(): boolean {
  return readConsent().personalisedAdvertising === true;
}

/** True only when the reader has explicitly accepted analytics. */
export function analyticsAllowed(): boolean {
  return readConsent().analytics === true;
}

/** Backwards-compatible alias for the old ad-gate event name. */
export const CONSENT_EVENT = "boh:consent";
