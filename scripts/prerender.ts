/**
 * Build-time prerenderer.
 *
 * Runs after `vite build` and writes a real, fully-formed index.html into
 * dist/ for every indexable route, with per-page title, description,
 * canonical, robots directives and JSON-LD already injected.
 *
 * This is what makes the SEO surface visible to crawlers. Without it Vercel
 * serves one identical shell for every URL.
 *
 * Routes written:
 *   dist/index.html                      (homepage)
 *   dist/<category>/index.html           (5 category hubs)
 *   dist/toolkit/index.html
 *   dist/page/<id>/index.html            (legal/policy pages)
 *   dist/article/<id>/index.html         (published articles only)
 *
 * Future-dated (scheduled) articles are written with noindex, follow so they
 * are crawlable but never indexed before their date.
 */

import fs from "fs/promises";
import path from "path";
import { getSEOForUrl, injectMeta } from "../src/lib/seo-core";
import { ARTICLES } from "../src/data/articles";
import { LEGAL_PAGES } from "../src/data/legal";
import { CATEGORIES } from "../src/data/categories";
import {
  getArticle,
  getLegalPage,
  renderArticlePage,
  renderCategoryPage,
  renderLegalPage,
  renderToolkitPage,
  renderFallback,
} from "./render-content";

const DIST = path.resolve(process.cwd(), "dist");
const TODAY = new Date().toISOString().split("T")[0];
const SITE_BASE = "https://blueoceanhub.info";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The exact opening sentences of the batch-generated placeholder bodies.
 * An article whose body starts with one of these carries no unique
 * information, so it must not be advertised in the sitemap until rewritten.
 *
 * Keep in sync with scripts/verify_prerender.py and the project audit —
 * a partial match here means placeholder URLs stay discoverable.
 */
const PLACEHOLDER_OPENINGS = [
  "Developing durable financial systems requires disciplined",
  "Building sustainable financial systems requires structured",
];

function isTemplated(article: { content?: string }): boolean {
  const body = (article.content || "").replace(/^\\n/, "").trimStart();
  return PLACEHOLDER_OPENINGS.some((opening) => body.startsWith(opening));
}

interface Route {
  /** URL path, e.g. "/" or "/article/foo" */
  urlPath: string;
  /** directory to write under dist/, "" for root */
  outDir: string;
  /** whether this route should be listed in the generated sitemap */
  inSitemap: boolean;
  /** pre-rendered page body injected into #root (crawler-visible content) */
  content?: string;
}

/**
 * The Vite build emits an empty `<div id="root"></div>` because the app is
 * client-rendered. Replace it with the real page content so crawlers get the
 * article body instead of an empty shell.
 */
function injectContent(html: string, content?: string): string {
  if (!content) return html;
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) return html;
  return html.replace(marker, `<div id="root">${content}</div>`);
}

async function writeRoute(route: Route, template: string): Promise<boolean> {
  const meta = getSEOForUrl(route.urlPath);

  let html = injectMeta(template, meta);
  html = injectContent(html, route.content);
  const dir = path.join(DIST, route.outDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html, "utf-8");
  return true;
}

function buildRoutes(): Route[] {
  const routes: Route[] = [
    {
      urlPath: "/",
      outDir: "",
      inSitemap: true,
      content: `
    <main class="mx-auto max-w-5xl px-6 py-16">
      <header class="mb-12">
        <h1 class="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
          Strategic Financial Intelligence for South Asian Founders
        </h1>
        <p class="mt-6 text-lg text-slate-300 leading-relaxed max-w-3xl">
          Expert analysis on PSX dividends, dollar-denominated export revenue,
          passive cashflow systems, and SaaS growth playbooks for Pakistan's
          founder economy.
        </p>
      </header>
      <section aria-label="Featured topics">
        <h2 class="text-2xl font-bold text-white mb-6">Explore the Hub</h2>
        <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${CATEGORIES.map(
            (c) => `          <li>
            <a href="${SITE_BASE}/${c.id}" class="block rounded-xl border border-slate-800 p-6 hover:border-cyan/50 transition-colors">
              <h3 class="text-lg font-semibold text-white">${escapeHtml(c.seoTitle || c.title)}</h3>
              <p class="mt-2 text-sm text-slate-400">${escapeHtml(c.seoDescription || c.description || "")}</p>
            </a>
          </li>`,
          ).join("\n")}
        </ul>
      </section>
      <section aria-label="Latest articles" class="mt-16">
        <h2 class="text-2xl font-bold text-white mb-6">Latest Analysis</h2>
        <ul class="divide-y divide-slate-800/60">
          ${ARTICLES.filter((a) => a.content)
            .slice(0, 12)
            .map(
              (a) => `          <li class="py-5">
            <a href="${SITE_BASE}/article/${a.id}" class="group block">
              <h3 class="text-xl font-semibold text-white group-hover:text-cyan transition-colors">${escapeHtml(a.title)}</h3>
              <p class="mt-2 text-sm text-slate-400">${escapeHtml(a.description || "")}</p>
              <p class="mt-1 text-xs text-slate-500"><time datetime="${a.pubDate}">${a.pubDate}</time></p>
            </a>
          </li>`,
            )
            .join("\n")}
        </ul>
      </section>
    </main>`,
    },
  ];
  const seenIds = new Set<string>();

  for (const c of CATEGORIES) {
    routes.push({
      urlPath: `/${c.id}`,
      outDir: c.id,
      inSitemap: true,
      content: renderCategoryPage(c.id),
    });
  }

  routes.push({
    urlPath: "/toolkit",
    outDir: "toolkit",
    inSitemap: true,
    content: renderToolkitPage(),
  });

  for (const p of LEGAL_PAGES) {
    routes.push({
      urlPath: `/page/${p.id}`,
      outDir: `page/${p.id}`,
      inSitemap: true,
      content: renderLegalPage(p),
    });
  }

  for (const a of ARTICLES) {
    const future = a.pubDate > TODAY;
    const dup = seenIds.has(a.id);
    seenIds.add(a.id);
    if (dup) {
      // A duplicate id makes ARTICLES.find() resolve to the first entry only,
      // so the second URL would serve the wrong article. Emit it noindex and
      // keep it out of the sitemap.
      console.warn(`PRERENDER WARN: duplicate article id "${a.id}" - written noindex, excluded from sitemap`);
    }
    // Future-dated articles get a noindex page so crawlers can see the date,
    // but they are kept OUT of the sitemap until they publish.
    // Placeholder (templated) articles are excluded from the sitemap too, but
    // keep index,follow so genuine value in a rewritten body can still rank.
    routes.push({
      urlPath: `/article/${a.id}`,
      outDir: `article/${a.id}`,
      inSitemap: !future && !dup && !isTemplated(a),
      content: renderArticlePage(a),
    });
  }

  return routes;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(routes: Route[]): string {
  const urls = routes
    .filter((r) => r.inSitemap)
    .map((r) => {
      const loc = `https://blueoceanhub.info${r.urlPath === "/" ? "/" : r.urlPath}`;
      const priority = r.urlPath === "/" ? "1.0"
        : r.urlPath.startsWith("/article/") ? "0.8"
        : r.urlPath.startsWith("/page/") ? "0.5"
        : "0.9";
      const freq = r.urlPath === "/" ? "always"
        : r.urlPath.startsWith("/article/") ? "monthly"
        : "weekly";
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function buildNewsSitemap(routes: Route[]): string | null {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split("T")[0];
  const recent = ARTICLES
    .filter((a) => a.pubDate <= TODAY && a.pubDate >= cutoff)
    .sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1))
    .slice(0, 20);

  // An empty news sitemap is reported as an error in Search Console. Only emit
  // one when there is genuinely fresh news content.
  if (recent.length === 0) return null;

  const items = recent
    .map((a) => `  <url>
    <loc>${xmlEscape(`https://blueoceanhub.info/article/${a.id}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Blue Ocean Hub</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.pubDate}T08:00:00+05:00</news:publication_date>
      <news:title>${xmlEscape(a.title)}</news:title>
    </news:news>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;
}

async function main() {
  let template: string;
  try {
    template = await fs.readFile(path.join(DIST, "index.html"), "utf-8");
  } catch {
    console.error("PRERENDER FAILED: dist/index.html not found. Did `vite build` run?");
    process.exit(1);
  }

  const routes = buildRoutes();
  let written = 0;
  const skipped: string[] = [];

  for (const r of routes) {
    try {
      if (await writeRoute(r, template)) written++;
      else skipped.push(r.urlPath);
    } catch (e) {
      skipped.push(`${r.urlPath} (${e instanceof Error ? e.message : String(e)})`);
    }
  }

  // Rewrite the root sitemap + news sitemap from the same route table, so the
  // sitemap can never disagree with what was actually prerendered.
  await fs.writeFile(path.join(DIST, "sitemap.xml"), buildSitemap(routes), "utf-8");
  const news = buildNewsSitemap(routes);
  if (news) {
    await fs.writeFile(path.join(DIST, "news-sitemap.xml"), news, "utf-8");
  } else {
    await fs.rm(path.join(DIST, "news-sitemap.xml"), { force: true });
  }

  const inSitemap = routes.filter((r) => r.inSitemap).length;
  const noindex = routes.length - inSitemap;
  const placeholder = ARTICLES.filter(isTemplated).length;
  const scheduled = ARTICLES.filter((a) => a.pubDate > TODAY).length;

  console.log(`PRERENDER: wrote ${written}/${routes.length} HTML routes to dist/`);
  console.log(`PRERENDER: sitemap lists ${inSitemap} URLs`);
  console.log(`PRERENDER: excluded ${noindex} route(s) from sitemap = ${scheduled} scheduled + ${placeholder} placeholder + duplicates`);
  if (skipped.length) {
    console.log(`PRERENDER: ${skipped.length} route(s) had no SEO metadata (no getSEOForUrl match):`);
    for (const s of skipped.slice(0, 20)) console.log(`   - ${s}`);
    if (skipped.length > 20) console.log(`   ... and ${skipped.length - 20} more`);
  }
}

main().catch((e) => {
  console.error("Prerender failed:", e);
  process.exit(1);
});