import { ExternalLink } from "lucide-react";

/**
 * Contextual affiliate / partner recommendations rendered at the end of
 * articles. Links are category-matched so the recommendation is relevant to
 * what the reader just finished reading.
 *
 * Every link is marked rel="nofollow sponsored noopener" as required by
 * affiliate disclosure rules and Google's link guidelines.
 */

interface AffiliateLink {
  label: string;
  href: string;
  note: string;
}

const LINKS: Record<string, AffiliateLink[]> = {
  Investing: [
    {
      label: "Open a CDC / PSX trading account",
      href: "https://www.arifhabiblimited.com/",
      note: "Licensed TREC holder — begin with as little as Rs 5,000",
    },
    {
      label: "Wise — mid-market FX rates",
      href: "https://wise.com/",
      note: "Convert export earnings at the real exchange rate",
    },
    {
      label: "Download the Investor Handbook",
      href: "/page/advertise",
      note: "Our curated PSX starter checklist (free)",
    },
  ],
  Freelancing: [
    {
      label: "Payoneer — receive global payments",
      href: "https://www.payoneer.com/",
      note: "Local receiving accounts for US, EU and UK clients",
    },
    {
      label: "Register with PSEB",
      href: "https://pseb.gov.pk/",
      note: "Secure the 0.25% export-tax rate",
    },
    {
      label: "Book a 1:1 freelance audit",
      href: "/page/contact",
      note: "Rate, positioning and tax review with our team",
    },
  ],
  "Passive Income": [
    {
      label: "Wise Business — dollar account",
      href: "https://wise.com/",
      note: "Hold and convert USD without bank markup",
    },
    {
      label: "TravelPayouts — travel affiliate stack",
      href: "https://www.travelpayouts.com/?marker=685596",
      note: "Earn commission on travel bookings you recommend",
    },
    {
      label: "See all income playbooks",
      href: "/passive-income",
      note: "The full Blue Ocean passive income library",
    },
  ],
  "Dollar Earning": [
    {
      label: "Lemon Squeezy — Merchant of Record",
      href: "https://www.lemonsqueezy.com/",
      note: "Sell software globally without multi-country VAT registration",
    },
    {
      label: "Paddle — full-stack MoR",
      href: "https://www.paddle.com/",
      note: "Subscriptions, dunning and global tax handled",
    },
    {
      label: "CallHippo — virtual business phone",
      href: "https://join.callhippo.com/9ug76tv8mxqb",
      note: "Local numbers in 50+ countries for your agency",
    },
  ],
  "Saving Money": [
    {
      label: "Wise — avoid FX markup",
      href: "https://wise.com/",
      note: "The cheapest way to move money in and out of Pakistan",
    },
    {
      label: "Read the tax rebate guide",
      href: "/article/tax-rebates-section-60-plus-saving",
      note: "Legally cut your tax bill with Section 62 and 63",
    },
  ],
};

const DEFAULT_LINKS: AffiliateLink[] = [
  {
    label: "Work with Blue Ocean Hub",
    href: "/page/contact",
    note: "Consulting, compliance and growth advisory for founders",
  },
  {
    label: "Advertise to our audience",
    href: "/page/advertise",
    note: "Reach South Asian founders and investors directly",
  },
];

export default function AffiliateBox({ category }: { category?: string }) {
  const links = (category && LINKS[category]) || DEFAULT_LINKS;

  return (
    <aside
      aria-label="Recommended partners"
      className="my-14 rounded-2xl border border-cyan/25 bg-ocean-900/70 p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <h2 className="text-lg font-bold text-white uppercase tracking-widest">
          Recommended Partners
        </h2>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">
          May contain affiliate links
        </span>
      </div>

      <ul className="space-y-4">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="group flex items-start gap-3 rounded-xl border border-slate-800/70 p-4 hover:border-cyan/50 transition-colors"
            >
              <ExternalLink
                className="w-4 h-4 mt-0.5 text-cyan shrink-0"
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-semibold text-white group-hover:text-cyan transition-colors">
                  {l.label}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  {l.note}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
        Blue Ocean Hub may earn a commission when you use these links, at no
        extra cost to you. This supports our independent editorial work. Read
        our{" "}
        <a
          href="/page/affiliate-disclosure"
          className="text-cyan/80 underline underline-offset-2"
        >
          full affiliate disclosure
        </a>
        .
      </p>
    </aside>
  );
}
