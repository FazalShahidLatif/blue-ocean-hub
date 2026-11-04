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

export function renderArticlePage(article: ArticleLike): string {
  const body = renderMarkdown(article.content || "");
  const cat = findCategory(article.category);
  const tags = (article.tags || [])
    .map((t) => `        <span class="text-xs text-slate-400">#${escapeHtml(t)}</span>`)
    .join("\n");

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

        <div class="markdown-body prose prose-invert prose-cyan max-w-none
          prose-h2:text-white prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-cyan prose-a:no-underline hover:prose-a:underline
          prose-li:text-slate-300 prose-strong:text-white">
          ${body}
        </div>

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
${renderRelated(article)}
      </article>
    </main>`;
}

/* ------------------------------------------------------------------ */
/* Category hub                                                        */
/* ------------------------------------------------------------------ */

export function renderCategoryPage(categoryId: string): string {
  const cat = findCategory(categoryId);
  if (!cat) return renderFallback(categoryId);

  const intro = renderMarkdown(cat.content || "");
  const items = ARTICLES.filter((a) => a.category === cat.id && a.content).slice(0, 40);

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
      <section aria-label="Articles">
        <h2 class="text-2xl font-bold text-white mb-6">Latest Articles</h2>
        <ul class="divide-y divide-slate-800/60">
${list}
        </ul>
      </section>
    </main>`;
}

/* ------------------------------------------------------------------ */
/* Legal / info pages                                                  */
/* ------------------------------------------------------------------ */

export function renderLegalPage(page: Partial<Article>): string {
  const body = renderMarkdown(page.content || "");
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
        <div class="markdown-body prose prose-invert prose-cyan max-w-none
          prose-h2:text-white prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-li:text-slate-300 prose-strong:text-white">
          ${body}
        </div>
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
