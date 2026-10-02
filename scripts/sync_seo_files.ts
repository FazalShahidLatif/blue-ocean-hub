import fs from "fs";
import path from "path";
import { ARTICLES } from "../src/data/articles.js";
import { LEGAL_PAGES } from "../src/data/legal.js";
import { CATEGORIES } from "../src/data/categories.js";

const publicDir = path.resolve(process.cwd(), "public");
const todayDateStr = new Date().toISOString().split("T")[0];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 1. Generate sitemap.xml (Include ONLY live published articles and canonical resources)
const publishedArticles = ARTICLES.filter(a => a.pubDate <= todayDateStr)
  .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

const latestLiveDate = publishedArticles[0]?.pubDate || todayDateStr;

const categoryUrls = CATEGORIES.map(category => {
  const catArticles = publishedArticles.filter(art =>
    art.category.toLowerCase().replace(/\s+/g, "-") === category.id
  );
  const catLastmod = catArticles[0]?.pubDate || latestLiveDate;
  return `  <url>
    <loc>https://blueoceanhub.info/${category.id}</loc>
    <lastmod>${catLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
}).join("\n");

const toolUrls = `  <url>
    <loc>https://blueoceanhub.info/toolkit</loc>
    <lastmod>2026-09-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

const legalUrls = LEGAL_PAGES.map(page => `  <url>
    <loc>https://blueoceanhub.info/page/${page.id}</loc>
    <lastmod>${page.pubDate || "2026-08-29"}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join("\n");

const articleUrls = publishedArticles.map(art => `  <url>
    <loc>https://blueoceanhub.info/article/${art.id}</loc>
    <lastmod>${art.pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Brand Homepage -->
  <url>
    <loc>https://blueoceanhub.info/</loc>
    <lastmod>${latestLiveDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${categoryUrls}
${toolUrls}
${legalUrls}
${articleUrls}
</urlset>`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml.trim() + "\n", "utf-8");
console.log("Updated public/sitemap.xml with", publishedArticles.length, "live articles.");

// 2. Generate news-sitemap.xml
const published = ARTICLES.filter(a => a.pubDate <= todayDateStr)
  .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
const newsArticles = published.slice(0, 10);

const newsUrlsXml = newsArticles.map(art => `  <url>
    <loc>https://blueoceanhub.info/article/${art.id}</loc>
    <news:news>
      <news:publication>
        <news:name>Blue Ocean Hub</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${art.pubDate}T00:00:00Z</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>`).join("\n");

const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrlsXml}
</urlset>`;

fs.writeFileSync(path.join(publicDir, "news-sitemap.xml"), newsSitemapXml.trim() + "\n", "utf-8");
console.log("Updated public/news-sitemap.xml");

// 3. Generate robots.txt
const robotsTxt = `# Search Engine Indexers & AI Foundation Models
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: YandexBot
Allow: /

User-agent: Baiduspider
Allow: /

# AI Crawlers, Large Language Models & AI Overviews
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: CCBot
Allow: /

# Global Crawler Rules
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Sitemaps
Sitemap: https://blueoceanhub.info/sitemap.xml
Sitemap: https://blueoceanhub.info/news-sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf-8");
console.log("Updated public/robots.txt");

// 4. Generate llms.txt
const llmsContent = `# Blue Ocean Hub

> Strategic financial intelligence, personal wealth allocation, and foreign currency hedging blueprints for South Asian founders, freelancers, and remote professionals.

Blue Ocean Hub is an institutional-grade financial magazine and tactical intelligence publication. We deliver operational frameworks, regulatory guides (FBR, SBP, SECP, PSEB), dividend analyses, cross-border banking playbooks, and passive income systems designed to give operators a decisive financial edge.

## Strategic Computational Toolkits & Financial Models

- [Strategic Financial Tool Hub](https://blueoceanhub.info/toolkit): Interactive computational engines for South Asian operators and digital nomads.
- [2026 PSEB 0.25% Remittance Tax Calculator](https://blueoceanhub.info/toolkit#pseb-tax-calculator): Model FBR Section 154A 0.25% withholding vs standard non-filer tax rates for foreign remittance inflows.
- [Global Nomad Travel Logistics & Currency Optimizer](https://blueoceanhub.info/toolkit#nomad-travel-logistics): Calculate international FX margins, eSIM costs (Saily/Airalo), flight bundling discounts, and zero-deposit car rentals.

## Core Financial Intelligence Categories

- [Passive Income Hub](https://blueoceanhub.info/passive-income): Systematic cashflow strategies, digital niche assets, PSX dividends, and physical real estate REIT models.
- [Investing Hub](https://blueoceanhub.info/investing): Strategic equity selection on the Pakistan Stock Exchange (PSX), Shariah-compliant mutual funds, Voluntary Pension Schemes (VPS), and gold hedging.
- [Freelancing Hub](https://blueoceanhub.info/freelancing): Global agency scaling, international client billing structures, contractor equity option pools, and foreign currency retention.
- [Saving Money Hub](https://blueoceanhub.info/saving-money): Corporate treasury management, FBR Section 154A tax exemptions, wealth statement declarations, and inflation-hedging strategies.
- [Dollar Earning Hub](https://blueoceanhub.info/dollar-earning): Onshore US LLC banking setup (Mercury/Wise), foreign entity legal structures, Stripe alternatives, and GCC cross-border SaaS monetization.

## Key Publications & Policy Resources

- [About Blue Ocean Hub](https://blueoceanhub.info/page/about-us): Editorial methodology, advisory standards, and institutional research principles.
- [Contact Editorial Desk](https://blueoceanhub.info/page/contact): Inquiries for licensing, syndicated research, and editorial contributions.
- [Editorial Integrity Policy](https://blueoceanhub.info/page/editorial-policy): Standards for objective, conflict-free financial journalism and disclosure practices.
- [GDPR Compliance Framework](https://blueoceanhub.info/page/gdpr-compliance): Data protection disclosures, privacy rights, and security protocols.
- [Cookie Intelligence Disclosures](https://blueoceanhub.info/page/cookie-policy): Transparency on privacy preferences and analytics cookies.
- [Terms of Service](https://blueoceanhub.info/page/terms-of-service): Terms of service, educational disclaimers, and user agreements.
- [Affiliate Disclosure](https://blueoceanhub.info/page/affiliate-disclosure): Transparent monetization, affiliate partnerships, and testing methodology.

## Machine Feeds & Discovery Indexes

- [Complete XML Sitemap](https://blueoceanhub.info/sitemap.xml): Full search engine sitemap index with verified lastmod timestamps.
- [Google News Sitemap](https://blueoceanhub.info/news-sitemap.xml): Real-time 48-hour Google News publication feed.
- [Syndicated RSS Feed](https://blueoceanhub.info/feed.xml): Real-time syndicated RSS 2.0 XML feed.
- [Full Plaintext Deep Archive](https://blueoceanhub.info/all.txt): Complete plain-text archive of all published financial intelligence reports.
- [Agentic AI Discovery Catalog](https://blueoceanhub.info/ai-catalog.json): Machine-readable resource discovery schema (ARD spec).
- [LLMs Deep Plaintext Archive](https://blueoceanhub.info/llms-full.txt): Comprehensive deep-crawl plaintext index.
- [Google Indexing Console](https://blueoceanhub.info/indexing-console): Real-time Search Console API diagnostics and indexing pipeline status.
`;

fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsContent, "utf-8");
console.log("Updated public/llms.txt");

// 5. Generate llms-full.txt & all.txt
let fullText = `# Blue Ocean Hub: Full Plaintext Financial Archive\n\n`;
fullText += `> South Asia's premier financial magazine and intelligence publication. Delivering elite cashflow allocation, personal wealth building, and international currency hedging blueprints for founders, freelancers, and entrepreneurs.\n\n`;
fullText += `Published Indexable Resources as of ${todayDateStr} (${published.length} Live Articles, ${ARTICLES.length} Total Pipeline):\n\n`;

fullText += `## Strategic Computational Toolkits & Financial Models\n`;
fullText += `- [Strategic Financial Tool Hub](https://blueoceanhub.info/toolkit): Interactive computational engines for South Asian operators and digital nomads.\n`;
fullText += `- [2026 PSEB 0.25% Remittance Tax Calculator](https://blueoceanhub.info/toolkit#pseb-tax-calculator): Model FBR Section 154A 0.25% withholding vs standard tax brackets for foreign remittances.\n`;
fullText += `- [Global Nomad Travel Logistics & Currency Optimizer](https://blueoceanhub.info/toolkit#nomad-travel-logistics): Calculate international FX margins, eSIM costs, and corporate travel savings.\n\n`;

fullText += `## Core Categories\n`;
CATEGORIES.forEach(c => {
  fullText += `- [${c.title}](https://blueoceanhub.info/${c.id}) - ${c.description}\n`;
});

fullText += `\n## Legal & Policy Frameworks\n`;
LEGAL_PAGES.forEach(p => {
  fullText += `- [${p.title}](https://blueoceanhub.info/page/${p.id})\n`;
});

fullText += `\n## Live Published Financial Intelligence Articles (${published.length} Live Nodes)\n`;
published.forEach(art => {
  fullText += `- [${art.title}](https://blueoceanhub.info/article/${art.id}) (${art.category} | Published: ${art.pubDate})\n  Summary: ${art.description}\n`;
});

const scheduledQueue = ARTICLES.filter(a => a.pubDate > todayDateStr);
if (scheduledQueue.length > 0) {
  fullText += `\n## Editorial Pipeline Queue (${scheduledQueue.length} Scheduled Releases through November 30, 2026)\n`;
  scheduledQueue.forEach(art => {
    fullText += `- [${art.title}](https://blueoceanhub.info/article/${art.id}) (${art.category} | Scheduled Release: ${art.pubDate})\n  Summary: ${art.description}\n`;
  });
}

fs.writeFileSync(path.join(publicDir, "llms-full.txt"), fullText, "utf-8");
fs.writeFileSync(path.join(publicDir, "all.txt"), fullText, "utf-8");
console.log("Updated public/llms-full.txt and public/all.txt with", ARTICLES.length, "articles.");

// 6. Generate ads.txt
const adsTxt = `# Blue Ocean Hub - ads.txt
# Authorized Digital Sellers
# Contact: hello@blueoceanhub.info
`;
fs.writeFileSync(path.join(publicDir, "ads.txt"), adsTxt, "utf-8");
console.log("Updated public/ads.txt");

// 7. Generate security.txt
const securityTxt = `Contact: mailto:security@blueoceanhub.info
Contact: https://blueoceanhub.info/page/contact
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://blueoceanhub.info/.well-known/security.txt
Policy: https://blueoceanhub.info/page/editorial-policy
`;
fs.writeFileSync(path.join(publicDir, "security.txt"), securityTxt, "utf-8");
console.log("Updated public/security.txt");

// 8. Generate humans.txt
const humansTxt = `/* TEAM */
Publisher: Blue Ocean Hub Editorial Board
Contact: hello@blueoceanhub.info
Location: South Asia / Global

/* SITE */
Standards: HTML5, CSS3, ES6+, TypeScript, React
Software: Express, Vite, Tailwind CSS
Language: English
`;
fs.writeFileSync(path.join(publicDir, "humans.txt"), humansTxt, "utf-8");
console.log("Updated public/humans.txt");

