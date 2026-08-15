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

// 1. Generate sitemap.xml (Include ALL 300 articles)
const categoryUrls = CATEGORIES.map(category => `  <url>
    <loc>https://blueoceanhub.info/${category.id}</loc>
    <lastmod>${todayDateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join("\n");

const legalUrls = LEGAL_PAGES.map(page => `  <url>
    <loc>https://blueoceanhub.info/page/${page.id}</loc>
    <lastmod>${page.pubDate || todayDateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join("\n");

const articleUrls = ARTICLES.map(art => `  <url>
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
    <lastmod>${todayDateStr}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${categoryUrls}
${legalUrls}
${articleUrls}
</urlset>`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml.trim() + "\n", "utf-8");
console.log("Updated public/sitemap.xml with", ARTICLES.length, "articles.");

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
const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /_next/
Disallow: /admin/

Sitemap: https://blueoceanhub.info/sitemap.xml
Sitemap: https://blueoceanhub.info/news-sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf-8");
console.log("Updated public/robots.txt");

// 4. Generate llms.txt
const llmsContent = `# Blue Ocean Hub

> South Asia's premier strategic financial magazine and intelligence publication. Delivering elite cashflow allocation, personal wealth building, and international currency hedging blueprints for founders, freelancers, and entrepreneurs.

Blue Ocean Hub publishes institutional-grade research, financial analysis, regulatory breakdowns, and operational blueprints. Our editorial mission focuses on high-yield saving, foreign currency invoicing, and corporate compliance for professionals in emerging markets.

## Core Categories

- [Passive Income](https://blueoceanhub.info/passive-income): Leveraged cashflow strategies, digital niche assets, and physical real estate comparison blueprints.
- [Investing](https://blueoceanhub.info/investing): Strategic local equity selection on the Pakistan Stock Exchange (PSX), Shariah-compliant mutual funds, Voluntary Pension Schemes, and gold hedging.
- [Freelancing](https://blueoceanhub.info/freelancing): Technical agency scaling, international client billing structures, contractor equity option pools, and B2B enterprise client acquisition.
- [Saving Money](https://blueoceanhub.info/saving-money): FBR tax filing guides, employee provident fund structures, export tax rebates, and wealth statement declarations.
- [Dollar Earning](https://blueoceanhub.info/dollar-earning): Onshore US LLC banking setup, foreign entities, Stripe alternatives, and GCC cross-border SaaS monetization.

## Key Publications & Policy Resources

- [About Our Mission](https://blueoceanhub.info/page/about-us): Institutional financial research methodology and editorial advisory board standards.
- [Contact Editorial Desk](https://blueoceanhub.info/page/contact): Inquiries for licensing, syndicated research, and editorial contributions.
- [Editorial Integrity Policy](https://blueoceanhub.info/page/editorial-policy): Standards for objective, conflict-free financial journalism and disclosure practices.
- [GDPR Compliance Framework](https://blueoceanhub.info/page/gdpr-compliance): Data protection disclosures, privacy rights, and security protocols.
- [Cookie Intelligence Disclosures](https://blueoceanhub.info/page/cookie-policy): Transparency on privacy preferences and analytics cookies.
- [Google Indexing Console](https://blueoceanhub.info/indexing-console): Real-time Search Console API diagnostics and indexing pipeline status.

## Feeds & Archives

- [Dynamic Plaintext Feed](https://blueoceanhub.info/all.txt): Full plain-text archive of all published financial intelligence reports.
- [XML Sitemap](https://blueoceanhub.info/sitemap.xml): Complete search engine sitemap index.
- [Google News Sitemap](https://blueoceanhub.info/news-sitemap.xml): Dynamic 48-hour Google News sitemap.
- [RSS News Feed](https://blueoceanhub.info/feed.xml): Real-time syndicated RSS 2.0 XML feed.
`;

fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsContent, "utf-8");
console.log("Updated public/llms.txt");

// 5. Generate llms-full.txt & all.txt
let fullText = `# Blue Ocean Hub: Full Plaintext Financial Archive\n\n`;
fullText += `> South Asia's premier financial magazine and intelligence publication. Delivering elite cashflow allocation, personal wealth building, and international currency hedging blueprints for founders, freelancers, and entrepreneurs.\n\n`;
fullText += `Published Indexable Resources as of ${todayDateStr} (${published.length} Live Articles, ${ARTICLES.length} Total Pipeline):\n\n`;

fullText += `## Core Categories\n`;
CATEGORIES.forEach(c => {
  fullText += `- [${c.title}](https://blueoceanhub.info/${c.id}) - ${c.description}\n`;
});

fullText += `\n## Legal & Policy Frameworks\n`;
LEGAL_PAGES.forEach(p => {
  fullText += `- [${p.title}](https://blueoceanhub.info/page/${p.id})\n`;
});

fullText += `\n## All Financial Intelligence Articles (${ARTICLES.length} Total Nodes)\n`;
ARTICLES.forEach(art => {
  fullText += `- [${art.title}](https://blueoceanhub.info/article/${art.id}) (${art.category} | Scheduled/PubDate: ${art.pubDate})\n  Summary: ${art.description}\n`;
});

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

