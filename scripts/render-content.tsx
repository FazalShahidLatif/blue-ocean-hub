/**
 * Build-time HTML renderers for the prerender step.
 *
 * The site is a client-rendered React SPA, so the raw Vite output has an empty
 * `<div id="root">`. Crawlers see nothing. These functions produce real,
 * semantic, fully-formed HTML that is injected into #root before the React app
 * boots, so every route serves its actual content to Googlebot.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ARTICLES } from "../src/data/articles";
import { LEGAL_PAGES } from "../src/data/legal";
import { CATEGORIES } from "../src/data/categories";

const SITE = "https://blueoceanhub.info";

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

export function renderMarkdown(markdown: string): string {
  if (!markdown) return "";
  return renderToStaticMarkup(
    createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, markdown),
  );
}

/**
 * The page template already renders the article title as the single <h1>.
 * Many source bodies open with a duplicated "# Title" heading, which would
 * produce a second <h1> on the page. Drop that leading H1 line so the
 * document has exactly one heading level-1.
 */
function stripLeadingH1(markdown: string): string {
  return markdown
    .replace(/^\s*\n/, "")
    .replace(/^#\s+.*(?:\n|$)/, "")
    .replace(/^\s*\n/, "");
}

/** Stable anchor id for a heading's text. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Give every <h2> in the rendered article a stable id and return the heading
 * texts, so the "In this guide" list can deep-link into the page.
 */
function anchorify(html: string): { html: string; headings: string[] } {
  const headings: string[] = [];
  const out = html.replace(/<h2>(.*?)<\/h2>/g, (_m, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const id = slugify(text) || `section-${headings.length + 1}`;
    headings.push(text);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/* Article                                                             */
/* ------------------------------------------------------------------ */

interface ArticleLike {
  id: string;
  title: string;
  description?: string;
  metaDescription?: string;
  pubDate?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
  content?: string;
}

function findCategory(categoryId?: string) {
  return CATEGORIES.find((c) => c.id === categoryId);
}

/** Related articles: same category first, then most recent, excluding self. */
function relatedArticles(article: ArticleLike, limit = 6): ArticleLike[] {
  const pool = ARTICLES.filter((a) => a.id !== article.id && a.content);
  const sameCat = pool.filter((a) => a.category === article.category);
  const rest = pool.filter((a) => a.category !== article.category);
  return [...sameCat, ...rest].slice(0, limit);
}

function renderRelated(article: ArticleLike): string {
  const items = relatedArticles(article);
  if (!items.length) return "";
  const links = items
    .map(
      (r) => `        <li>
          <a href="${SITE}/article/${r.id}" class="text-cyan underline underline-offset-4 hover:text-cyan/80 font-medium">
            ${escapeHtml(r.title)}
          </a>
        </li>`,
    )
    .join("\n");
  return `
      <section aria-label="Related articles" class="mt-16 border-t border-slate-800 pt-10">
        <h2 class="text-2xl font-bold text-white mb-6">Keep Reading</h2>
        <ul class="space-y-4 text-slate-300">
${links}
        </ul>
      </section>`;
}

function renderAffiliate(category?: string): string {
  const links: Record<string, { label: string; href: string; note: string }[]> = {
    Investing: [
      { label: "Open a CDC / PSX trading account", href: "https://www.arifhabiblimited.com/", note: "Licensed TREC holder" },
      { label: "Wise — mid-market FX rates", href: "https://wise.com/", note: "Convert export earnings at the real exchange rate" },
    ],
    Freelancing: [
      { label: "Payoneer — receive global payments", href: "https://www.payoneer.com/", note: "Local receiving accounts for US, EU and UK clients" },
      { label: "Register with PSEB", href: "https://pseb.gov.pk/", note: "Secure the 0.25% export-tax rate" },
    ],
    "Passive Income": [
      { label: "TravelPayouts — travel affiliate stack", href: "https://www.travelpayouts.com/?marker=685596", note: "Earn commission on travel bookings you recommend" },
      { label: "Wise Business — dollar account", href: "https://wise.com/", note: "Hold and convert USD without bank markup" },
    ],
    "Dollar Earning": [
      { label: "Lemon Squeezy — Merchant of Record", href: "https://www.lemonsqueezy.com/", note: "Sell software globally without multi-country VAT registration" },
      { label: "CallHippo — virtual business phone", href: "https://join.callhippo.com/9ug76tv8mxqb", note: "Local numbers in 50+ countries" },
    ],
    "Saving Money": [
      { label: "Wise — avoid FX markup", href: "https://wise.com/", note: "Cheapest way to move money in and out of Pakistan" },
    ],
  };
  const list = (category && links[category]) || [
    { label: "Work with Blue Ocean Hub", href: "https://blueoceanhub.info/page/contact", note: "Consulting, compliance and growth advisory for founders" },
    { label: "Advertise to our audience", href: "https://blueoceanhub.info/page/advertise", note: "Reach South Asian founders and investors directly" },
  ];
  const items = list
    .map(
      (l) =>
        `        <li><a href="${l.href}" target="_blank" rel="nofollow sponsored noopener" class="block rounded-xl border border-slate-800/70 p-4 hover:border-cyan/50 transition-colors"><span class="block text-sm font-semibold text-white">${escapeHtml(l.label)}</span><span class="block text-xs text-slate-400 mt-1">${escapeHtml(l.note)}</span></a></li>`,
    )
    .join("\n");
  return `
      <aside aria-label="Recommended partners" class="my-14 rounded-2xl border border-cyan/25 bg-ocean-900/70 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-4 mb-5">
          <h2 class="text-lg font-bold text-white uppercase tracking-widest">Recommended Partners</h2>
          <span class="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">May contain affiliate links</span>
        </div>
        <ul class="space-y-4">
${items}
        </ul>
        <p class="mt-5 text-[11px] text-slate-500 leading-relaxed">
          Blue Ocean Hub may earn a commission when you use these links, at no extra cost to you. Read our <a href="https://blueoceanhub.info/page/affiliate-disclosure" class="text-cyan/80 underline underline-offset-2">full affiliate disclosure</a>.
        </p>
      </aside>`;
}

export function renderArticlePage(article: ArticleLike): string {
  const rendered = anchorify(renderMarkdown(stripLeadingH1(article.content || "")));
  const body = rendered.html;
  const cat = findCategory(article.category);
  const tags = (article.tags || [])
    .map((t) => `        <span class="text-xs text-slate-400">#${escapeHtml(t)}</span>`)
    .join("\n");

  // "In this guide" — the article's own section headings, each linked to the
  // anchor injected above. Derived from the published content, never invented.
  const inThisGuide =
    rendered.headings.length > 1
      ? `        <nav aria-label="In this guide" class="my-10 rounded-2xl border border-slate-800/70 bg-ocean-900/50 p-6">
          <p class="text-xs font-semibold uppercase tracking-widest text-cyan mb-4">In this guide</p>
          <ol class="space-y-2 text-sm">
${rendered.headings
  .map(
    (h, i) =>
      `            <li><a href="#${slugify(h) || `section-${i + 1}`}" class="text-slate-300 hover:text-cyan transition-colors">${escapeHtml(h)}</a></li>`,
  )
  .join("\n")}
          </ol>
        </nav>`
      : "";

  // Related guides from the same hub, so every article links laterally.
  const related = ARTICLES.filter(
    (a) => a.id !== article.id && a.content && a.category === article.category,
  ).slice(0, 5);
  const relatedHtml =
    related.length > 0
      ? `        <section aria-label="Related guides" class="mt-14 border-t border-slate-800 pt-10">
          <h2 class="text-2xl font-bold text-white mb-6">Related Guides</h2>
          <ul class="space-y-4">
${related
  .map(
    (r) => `            <li><a href="${SITE}/article/${r.id}" class="text-cyan underline underline-offset-4 hover:text-cyan/80 font-medium">${escapeHtml(r.title)}</a>
              <p class="mt-1 text-sm text-slate-400">${escapeHtml(r.description || "")}</p></li>`,
  )
  .join("\n")}
          </ul>
        </section>`
      : "";

  return `
    <main class="mx-auto max-w-3xl px-6 py-16">
      <article>
        <header class="mb-10 border-b border-slate-800 pb-8">
          ${
            cat
              ? `<nav aria-label="Breadcrumb" class="mb-6 text-sm text-slate-400">
            <a href="${SITE}/${cat.id}" class="text-cyan hover:underline">${escapeHtml(cat.id.replace(/-/g, " "))}</a>
            <span aria-hidden="true"> / </span>
            <span>${escapeHtml(article.category || "")}</span>
          </nav>`
              : ""
          }
          <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            ${escapeHtml(article.title)}
          </h1>
          <p class="mt-6 text-slate-400 text-sm">
            By <span class="text-slate-200">${escapeHtml(article.author || "Blue Ocean Hub Editorial")}</span>
            <span aria-hidden="true"> · </span>
            <time datetime="${escapeHtml(article.pubDate || "")}">${formatDate(article.pubDate || "")}</time>
            <span aria-hidden="true"> · </span>
            ${article.readingTime || Math.max(1, Math.round((article.content || "").split(/\s+/).length / 200))} min read
          </p>
          ${
            article.description
              ? `<p class="mt-4 text-lg text-slate-300 leading-relaxed">${escapeHtml(article.description)}</p>`
              : ""
          }
        </header>

        <!-- Hero: the article's own generated share image, also served as the
             visible banner so the page carries a real, indexable image. -->
        <figure class="mb-10">
          <img
            src="${SITE}/og-image/${article.id}.jpg"
            alt="${escapeHtml(article.title)}"
            width="1200"
            height="630"
            fetchpriority="high"
            decoding="async"
            class="w-full h-auto rounded-2xl border border-slate-800/70"
          />
        </figure>

        ${inThisGuide}

        <div class="markdown-body prose prose-invert prose-cyan max-w-none
          prose-h2:text-white prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-cyan prose-a:no-underline hover:prose-a:underline
          prose-li:text-slate-300 prose-strong:text-white">
          ${body}
        </div>

        ${renderAffiliate(article.category)}

        ${
          tags
            ? `
        <footer class="mt-12 border-t border-slate-800 pt-8">
          <div class="flex flex-wrap gap-3">
${tags}
          </div>
        </footer>`
            : ""
        }
${relatedHtml}
      </article>
    </main>`;
}

/* ------------------------------------------------------------------ */
/* Category hub                                                        */
/* ------------------------------------------------------------------ */

export function renderCategoryPage(categoryId: string): string {
  const cat = findCategory(categoryId);
  if (!cat) return renderFallback(categoryId);

  const intro = renderMarkdown(stripLeadingH1(cat.content || ""));
  // Category ids are slugs ("passive-income") while article.category holds the
  // display name ("Passive Income"). Normalise both sides or the hub renders
  // an almost-empty list — the same normalisation CategoryPage.tsx uses.
  const items = ARTICLES.filter(
    (a) => a.content && a.category.toLowerCase().replace(/\s+/g, "-") === cat.id,
  ).slice(0, 40);

  const list = items
    .map(
      (a) => `        <li class="border-b border-slate-800/60 py-5">
          <a href="${SITE}/article/${a.id}" class="group block">
            <h3 class="text-xl font-semibold text-white group-hover:text-cyan transition-colors">
              ${escapeHtml(a.title)}
            </h3>
            <p class="mt-2 text-slate-400 text-sm leading-relaxed">${escapeHtml(a.description || "")}</p>
            <p class="mt-2 text-xs text-slate-500">
              <time datetime="${escapeHtml(a.pubDate)}">${formatDate(a.pubDate)}</time>
            </p>
          </a>
        </li>`,
    )
    .join("\n");

  // "Start here" reading path: the three most recent substantive guides in
  // this hub, each with the reason a reader would start with it. Derived from
  // the real article records, never invented.
  const startHere = items.slice(0, 3);
  const startHereHtml = startHere
    .map(
      (a, i) => `        <li class="rounded-xl border border-slate-800/70 p-5">
          <p class="text-xs font-semibold uppercase tracking-widest text-cyan mb-2">Step ${i + 1}</p>
          <a href="${SITE}/article/${a.id}" class="text-white font-semibold hover:text-cyan transition-colors">${escapeHtml(a.title)}</a>
          <p class="mt-2 text-sm text-slate-400 leading-relaxed">${escapeHtml(a.description || "")}</p>
        </li>`,
    )
    .join("\n");

  // Related hubs: every other category, so the hub graph is fully connected.
  const related = CATEGORIES.filter((c) => c.id !== cat.id);
  const relatedHtml = related
    .map(
      (c) => `        <li><a href="${SITE}/${c.id}" class="text-cyan hover:underline underline-offset-4">${escapeHtml(c.title)}</a></li>`,
    )
    .join("\n");

  return `
    <main class="mx-auto max-w-4xl px-6 py-16">
      <header class="mb-12 border-b border-slate-800 pb-10">
        <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
          ${escapeHtml(cat.seoTitle || cat.title)}
        </h1>
        <p class="mt-4 text-lg text-slate-300 leading-relaxed">
          ${escapeHtml(cat.seoDescription || cat.description || "")}
        </p>
      </header>
      <div class="markdown-body prose prose-invert prose-cyan max-w-none mb-12">${intro}</div>

      <figure class="mb-12">
        <img
          src="${SITE}/og-image/${cat.id}.jpg"
          alt="${escapeHtml(cat.seoTitle || cat.title)}"
          width="1200"
          height="630"
          fetchpriority="high"
          decoding="async"
          class="w-full h-auto rounded-2xl border border-slate-800/70"
        />
      </figure>

      <section aria-label="Start here" class="mb-14">
        <h2 class="text-2xl font-bold text-white mb-6">Start Here</h2>
        <ol class="space-y-4">
${startHereHtml}
        </ol>
        <p class="mt-5 text-sm text-slate-400 leading-relaxed">
          New to this hub? Work through these three guides in order. Each one
          builds on the last, and each links onward to the deeper articles in
          the list below.
        </p>
      </section>

      <section aria-label="Articles">
        <h2 class="text-2xl font-bold text-white mb-6">Latest Articles</h2>
        <ul class="divide-y divide-slate-800/60">
${list}
        </ul>
      </section>

      <section aria-label="Related hubs" class="mt-14 border-t border-slate-800 pt-10">
        <h2 class="text-2xl font-bold text-white mb-6">Explore Other Hubs</h2>
        <ul class="grid sm:grid-cols-2 gap-3 text-slate-300">
${relatedHtml}
        </ul>
      </section>
    </main>`;
}

/* ------------------------------------------------------------------ */
/* Legal / info pages                                                  */
/* ------------------------------------------------------------------ */

/* Cross-links between policy pages. The site's nav/footer are rendered by the
   React app, so these static links are what a crawler sees on a policy page. */
const RELATED_PAGES = [
  { id: "editorial-policy", label: "Editorial Integrity Policy" },
  { id: "cookie-policy", label: "Cookie Policy" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "affiliate-disclosure", label: "Affiliate Disclosure" },
  { id: "advertise", label: "Advertise With Us" },
  { id: "reviews", label: "Reader Reviews & Ratings" },
];

export function renderLegalPage(page: Partial<Article>): string {
  const body = renderMarkdown(stripLeadingH1(page.content || ""));
  const related = RELATED_PAGES.filter((p) => p.id !== page.id)
    .map((p) => `<a href="${SITE}/page/${p.id}">${p.label}</a>`)
    .join("");
  return `
    <main class="mx-auto max-w-3xl px-6 py-16">
      <article>
        <header class="mb-10 border-b border-slate-800 pb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
            ${escapeHtml(page.title || "")}
          </h1>
          <p class="mt-4 text-lg text-slate-300 leading-relaxed">
            ${escapeHtml(page.description || "")}
          </p>
          <p class="mt-4 text-slate-400 text-sm">
            Last updated <time datetime="${escapeHtml(page.pubDate || "")}">${formatDate(page.pubDate || "")}</time>
          </p>
        </header>
        <figure class="mb-10">
          <img
            src="${SITE}/og-image/page/${page.id}.jpg"
            alt="${escapeHtml(page.title || "")}"
            width="1200"
            height="630"
            fetchpriority="high"
            decoding="async"
            class="w-full h-auto rounded-2xl border border-slate-800/70"
          />
        </figure>
        <div class="markdown-body prose prose-invert prose-cyan max-w-none
          prose-h2:text-white prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-li:text-slate-300 prose-strong:text-white">
          ${body}
        </div>
        <nav class="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 pt-8" aria-label="Related pages">
          ${related}
        </nav>
      </article>
    </main>`;
}

/* ------------------------------------------------------------------ */
/* Toolkit + fallback                                                  */
/* ------------------------------------------------------------------ */

export function renderToolkitPage(): string {
  return `
    <main class="mx-auto max-w-4xl px-6 py-16">
      <header class="mb-12 border-b border-slate-800 pb-10">
        <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">Blue Ocean Toolkit</h1>
        <p class="mt-4 text-lg text-slate-300 leading-relaxed">
          Interactive calculators and planning models for South Asian founders:
          PSEB export tax savings, remittance withholding, capital-gain scenarios,
          and dollar-revenue allocation.
        </p>
      </header>

      <figure class="mb-12">
        <img
          src="${SITE}/og-image/toolkit.jpg"
          alt="Blue Ocean Toolkit"
          width="1200"
          height="630"
          fetchpriority="high"
          decoding="async"
          class="w-full h-auto rounded-2xl border border-slate-800/70"
        />
      </figure>

      <div class="markdown-body prose prose-invert prose-cyan max-w-none mb-12">
        <h2>What This Toolkit Is For</h2>
        <p>Most financial decisions a founder faces in Pakistan come down to arithmetic that is tedious to do by hand and easy to get wrong. This toolkit exists to do that arithmetic cleanly: to show what a given rate, fee, or holding period actually does to the number you care about, before you commit to it.</p>
        <p>The models are deliberately simple. Each one asks for the few inputs that drive the result, shows the working, and states its limits. Where a figure depends on a rate set by a regulator or a provider, the model shows the rate it used so you can check it against the current schedule.</p>
        <h2>How to Use It</h2>
        <p>Start from the hub that matches your question. Each hub below carries the calculators and planning models relevant to its topic, alongside the guides that explain the reasoning behind them. If you are unsure which hub applies, begin with the question you are trying to answer rather than the tool you think you need.</p>
        <h2>What the Models Cannot Do</h2>
        <p>These are planning aids, not advice. They do not know your full position, your jurisdiction's specific treatment, or your appetite for risk. A model that returns a number has done arithmetic, not made a recommendation. Before acting on a result, take it to a qualified professional.</p>
        <h2>Where the Figures Come From</h2>
        <p>Rates and thresholds used in the models come from the regulator or provider that sets them: the State Bank of Pakistan and the Federal Board of Revenue for tax and withholding figures, the Pakistan Stock Exchange and the Central Depository Company for market mechanics, and the individual provider for any fee or commission. Where a figure is a market rate that moves daily, the model shows the value it used and the date it was set.</p>
        <h2>Reporting an Error</h2>
        <p>If a model returns a result you believe is wrong, tell us which model, which inputs you used, and what you expected. A model that is wrong is worse than no model at all, because it gives a false sense of certainty.</p>
      </div>

      <section aria-label="Calculators">
        <ul class="space-y-6">
          ${CATEGORIES.map(
            (c) => `          <li>
            <a href="${SITE}/${c.id}" class="block rounded-xl border border-slate-800 p-6 hover:border-cyan/50 transition-colors">
              <h2 class="text-xl font-semibold text-white">${escapeHtml(c.seoTitle || c.title)}</h2>
              <p class="mt-2 text-slate-400 text-sm">${escapeHtml(c.seoDescription || c.description || "")}</p>
            </a>
          </li>`,
          ).join("\n")}
        </ul>
      </section>
    </main>`;
}

export function renderFallback(path: string): string {
  const name = path.replace(/^\//, "").replace(/-/g, " ") || "Home";
  return `
    <main class="mx-auto max-w-3xl px-6 py-16">
      <h1 class="text-4xl font-bold text-white capitalize">${escapeHtml(name)}</h1>
      <p class="mt-4 text-slate-300">Content for this page is being prepared.</p>
    </main>`;
}

/* ------------------------------------------------------------------ */
/* Lookup helpers                                                      */
/* ------------------------------------------------------------------ */

export function getArticle(id: string): ArticleLike | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getLegalPage(id: string): Partial<Article> | undefined {
  return LEGAL_PAGES.find((p) => p.id === id);
}
