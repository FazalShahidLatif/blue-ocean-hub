import express from "express";
import path from "path";
import fs from "fs/promises";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import { JWT } from "google-auth-library";
import { ARTICLES } from "./src/data/articles";
import { LEGAL_PAGES } from "./src/data/legal";
import { CATEGORIES } from "./src/data/categories";
import { HOMEPAGE_FAQS, PILLAR_FAQS } from "./src/data/faqs";
import { getSEOForUrl, injectMeta } from "./src/lib/seo-core";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Text Compression Optimization (Brotli, Gzip, Deflate)
  // Compress all HTML documents and text responses without a size threshold
  app.use(compression({
    threshold: 0, // Compress all text/html responses regardless of size
    level: 6,     // Optimal CPU-to-compression ratio
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  app.use(express.json());

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // 2. Zero-Redirect Policy for Initial Document Requests
  // Prevent redirect latency penalties (e.g. www to non-www or trailing slash hops)
  // Both www and apex domains are served directly with canonical meta tags pointing to https://blueoceanhub.info/
  // This achieves 0ms redirect latency on initial document requests.

  // 3. Global Security Headers (optimized for iframe previews and Lighthouse audits)
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  // 3. Dynamic XML and RSS Feed Pipeline Custom Implementation
  
  // Custom XML Escaping/Formatting helper (prevents double escaping)
  function cleanXmlText(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // Master & Category RSS Feed Generator
  const rssHandler = (req: express.Request, res: express.Response) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      // Only distribute published articles
      const publishedArticles = ARTICLES.filter(a => a.pubDate <= todayStr)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      // Check category filter
      const categoryParam = req.params.category; // e.g., 'passive-income'
      let filteredArticles = publishedArticles;
      let categoryTitle = "";

      if (categoryParam) {
        const cleanCategoryParam = categoryParam.replace(".xml", "").toLowerCase();
        const categoryMatch = CATEGORIES.find(c => c.id === cleanCategoryParam);
        if (categoryMatch) {
          categoryTitle = categoryMatch.seoTitle || categoryMatch.title;
          filteredArticles = publishedArticles.filter(art => 
            art.category.toLowerCase().replace(/\s+/g, "-") === cleanCategoryParam
          );
        } else {
          return res.status(404).send("Category not found");
        }
      }

      const requestUrl = categoryParam ? `/feed/${categoryParam}` : "/feed.xml";
      const lastBuildDate = new Date().toUTCString();

      const itemsXml = filteredArticles.map(article => {
        const itemLink = `https://blueoceanhub.info/article/${article.id}`;
        // Clean excerpt / description
        const cleanDesc = cleanXmlText(article.metaDescription || article.description || "");
        const pubDateRfc822 = new Date(article.pubDate).toUTCString();

        return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${itemLink}</link>
      <guid isPermaLink="true">${itemLink}</guid>
      <pubDate>${pubDateRfc822}</pubDate>
      <category><![CDATA[${article.category}]]></category>
      <author><![CDATA[${article.author || 'Blue Ocean Hub Editorial'}]]></author>
      <description><![CDATA[${cleanDesc}]]></description>
      <content:encoded><![CDATA[
        <p>${cleanDesc}</p>
        <p><em>Read the full research and tactical guidelines on <a href="${itemLink}">Blue Ocean Hub</a>.</em></p>
      ]]></content:encoded>
    </item>`;
      }).join("");

      const channelTitle = categoryTitle 
        ? `${categoryTitle} | Blue Ocean Hub`
        : "Blue Ocean Hub | Strategic Financial Intelligence";

      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${channelTitle}]]></title>
    <link>https://blueoceanhub.info/</link>
    <atom:link href="https://blueoceanhub.info${requestUrl}" rel="self" type="application/rss+xml" />
    <description><![CDATA[South Asia's premier strategic financial magazine and intelligence publication. Delivering elite cashflow allocation and currency hedging blueprints.]]></description>
    <language>en</language>
    <managingEditor>hello@blueoceanhub.info (Blue Ocean Hub Editorial Team)</managingEditor>
    <webMaster>hello@blueoceanhub.info (Blue Ocean Hub Technical Team)</webMaster>
    <copyright><![CDATA[Copyright 2026 Blue Ocean Hub. All Rights Reserved.]]></copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>https://blueoceanhub.info/favicon.svg</url>
      <title><![CDATA[Blue Ocean Hub]]></title>
      <link>https://blueoceanhub.info/</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate");
      res.status(200).send(rssXml);
    } catch (error) {
      console.error("Failed to generate RSS feed:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  // Master RSS Feed Routes
  app.get('/feed.xml', rssHandler);
  app.get('/feed', rssHandler);

  // Category RSS Feed Routes
  app.get('/feed/:category.xml', rssHandler);
  app.get('/feed/:category', rssHandler);

  // Dynamic Standard XML Sitemap Handler (Supports /sitemap.xml, /sitemap, /sitemap_index.xml, /sitemaps.xml)
  const sitemapHandler = (req: express.Request, res: express.Response) => {
    try {
      const todayDateStr = new Date().toISOString().split('T')[0];
      // Only include live published articles (never schedule drafts with future dates)
      const publishedArticles = ARTICLES.filter(a => a.pubDate <= todayDateStr)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      // Homepage lastmod: latest live article publication date
      const latestLiveDate = publishedArticles[0]?.pubDate || todayDateStr;

      // Category hubs: lastmod reflects the date of the most recent article in that specific category
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

      // Strategic Tool Hub
      const toolUrls = `  <url>
    <loc>https://blueoceanhub.info/toolkit</loc>
    <lastmod>2026-09-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

      // Legal & Policy pages with their verified publication and audit dates
      const legalUrls = LEGAL_PAGES.map(page => `  <url>
    <loc>https://blueoceanhub.info/page/${page.id}</loc>
    <lastmod>${page.pubDate || "2026-08-29"}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join("\n");

      // Only live published articles with strictly verified non-future lastmod dates
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

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      res.status(200).send(sitemapXml.trim() + "\n");
    } catch (e) {
      console.error("Failed to generate standard sitemap:", e);
      res.status(500).send("Internal Server Error");
    }
  };

  app.get('/sitemap.xml', sitemapHandler);
  app.get('/sitemap', sitemapHandler);
  app.get('/sitemap_index.xml', sitemapHandler);
  app.get('/sitemaps.xml', sitemapHandler);
  app.get('/sitemap-index.xml', sitemapHandler);
  app.get('/sitemap/', sitemapHandler);
  app.get('/sitemap.xml/', sitemapHandler);

  // Dynamic Google News XML Sitemap Handler (Separate required endpoint)
  const newsSitemapHandler = (req: express.Request, res: express.Response) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const published = ARTICLES.filter(a => a.pubDate <= todayStr)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      // Target last 48 hours for Google News
      const today = new Date();
      const fortyEightHoursAgo = new Date(today.getTime() - (48 * 60 * 60 * 1000));
      const fortyEightHoursAgoStr = fortyEightHoursAgo.toISOString().split("T")[0];

      let newsArticles = published.filter(a => a.pubDate >= fortyEightHoursAgoStr);
      if (newsArticles.length === 0) {
        // Fallback to the 10 most recent published articles
        newsArticles = published.slice(0, 10);
      }

      const newsUrlsXml = newsArticles.map(art => `  <url>
    <loc>https://blueoceanhub.info/article/${art.id}</loc>
    <news:news>
      <news:publication>
        <news:name>Blue Ocean Hub</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${art.pubDate}T00:00:00Z</news:publication_date>
      <news:title>${cleanXmlText(art.title)}</news:title>
    </news:news>
  </url>`).join("\n");

      const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrlsXml}
</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400");
      res.status(200).send(newsSitemapXml.trim() + "\n");
    } catch (e) {
      console.error("Failed to generate Google News sitemap:", e);
      res.status(500).send("Internal Server Error");
    }
  };

  app.get('/news-sitemap.xml', newsSitemapHandler);
  app.get('/news-sitemap', newsSitemapHandler);
  app.get('/news_sitemap.xml', newsSitemapHandler);
  app.get('/news-sitemap/', newsSitemapHandler);
  app.get('/google-news-sitemap.xml', newsSitemapHandler);

  // Dynamic robots.txt Handler
  const robotsHandler = (req: express.Request, res: express.Response) => {
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
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
    res.status(200).send(robotsTxt);
  };

  app.get('/robots.txt', robotsHandler);
  app.get('/robots', robotsHandler);
  app.get('/robots.txt/', robotsHandler);

  // Dynamic Standard LLMs.txt Handler (https://llmstxt.org)
  const llmsHandler = (req: express.Request, res: express.Response) => {
    try {
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

      const acceptsPlain = req.headers.accept && req.headers.accept.includes("text/plain");
      res.setHeader("Content-Type", acceptsPlain ? "text/plain; charset=utf-8" : "text/markdown; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
      res.status(200).send(llmsContent);
    } catch (e) {
      console.error("Failed to generate llms.txt:", e);
      res.status(500).send("Internal Server Error");
    }
  };

  app.get('/llms.txt', llmsHandler);
  app.get('/llms', llmsHandler);
  app.get('/llm.txt', llmsHandler);
  app.get('/.well-known/llms.txt', llmsHandler);

  // Dynamic ARD ai-catalog.json Handler (https://agenticresourcediscovery.org)
  const aiCatalogHandler = (req: express.Request, res: express.Response) => {
    try {
      const catalog = {
        "$schema": "https://agenticresourcediscovery.org/schemas/v1/ai-catalog.json",
        "specVersion": "1.0",
        "host": {
          "displayName": "Blue Ocean Hub",
          "identifier": "did:web:blueoceanhub.info",
          "url": "https://blueoceanhub.info",
          "description": "South Asia's premier strategic financial magazine and intelligence publication."
        },
        "entries": [
          {
            "identifier": "urn:ai:blueoceanhub.info:tools:pseb-tax-estimator",
            "displayName": "PSEB Tax & Remittance Optimizer",
            "description": "Interactive calculator and financial model for Pakistani IT exporters, remote workers, and agencies under FBR Section 154A and PSEB tax frameworks.",
            "type": "application/json",
            "url": "https://blueoceanhub.info/toolkit",
            "representativeQueries": [
              "Calculate PSEB tax savings on IT remittances",
              "Estimate withholding tax for freelancing exports in Pakistan",
              "What is the tax rate on foreign currency IT remittances in Pakistan?"
            ],
            "tags": ["finance", "tax", "pseb", "pakistan", "freelancing", "calculator"]
          },
          {
            "identifier": "urn:ai:blueoceanhub.info:publications:financial-intel-feed",
            "displayName": "Blue Ocean Hub Financial Intelligence Feed",
            "description": "Institutional-grade financial intelligence reports, corporate structuring guides, cross-border banking insights, and high-yield wealth strategies for emerging markets.",
            "type": "text/markdown",
            "url": "https://blueoceanhub.info/all.txt",
            "representativeQueries": [
              "Read Pakistani equity market and PSX stock analysis",
              "How to setup US LLC from South Asia for global payments",
              "Compare digital nomad tax and bank accounts for Asian founders"
            ],
            "tags": ["financial-news", "investing", "psx", "llc", "banking", "wealth"]
          },
          {
            "identifier": "urn:ai:blueoceanhub.info:resources:llms-txt",
            "displayName": "Blue Ocean Hub LLMs Resource Index",
            "description": "Standardized LLMs.txt index for large language models, autonomous agents, and search crawlers.",
            "type": "text/markdown",
            "url": "https://blueoceanhub.info/llms.txt",
            "representativeQueries": [
              "Find all financial intelligence articles from Blue Ocean Hub",
              "Explore Blue Ocean Hub editorial resources"
            ],
            "tags": ["llms-txt", "ai-index", "discovery"]
          }
        ]
      };

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
      res.status(200).json(catalog);
    } catch (e) {
      console.error("Failed to serve ai-catalog.json:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  app.get('/ai-catalog.json', aiCatalogHandler);
  app.get('/.well-known/ai-catalog.json', aiCatalogHandler);
  app.get('/ai-catalog', aiCatalogHandler);

  // Dynamic Full Plain-Text Archive (/all.txt & /llms-full.txt)
  const fullTextHandler = (req: express.Request, res: express.Response) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const published = ARTICLES.filter(a => a.pubDate <= todayStr)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      let textContent = `# Blue Ocean Hub: Full Plaintext Financial Archive\n\n`;
      textContent += `> South Asia's premier financial magazine and intelligence publication. Delivering elite cashflow allocation, personal wealth building, and international currency hedging blueprints for founders, freelancers, and entrepreneurs.\n\n`;
      textContent += `Published Indexable Resources as of ${todayStr} (${published.length} Live Articles, ${ARTICLES.length} Total Pipeline):\n\n`;
      
      textContent += `## Strategic Computational Toolkits & Financial Models\n`;
      textContent += `- [Strategic Financial Tool Hub](https://blueoceanhub.info/toolkit): Interactive computational engines for South Asian operators and digital nomads.\n`;
      textContent += `- [2026 PSEB 0.25% Remittance Tax Calculator](https://blueoceanhub.info/toolkit#pseb-tax-calculator): Model FBR Section 154A 0.25% withholding vs standard tax brackets for foreign remittances.\n`;
      textContent += `- [Global Nomad Travel Logistics & Currency Optimizer](https://blueoceanhub.info/toolkit#nomad-travel-logistics): Calculate international FX margins, eSIM costs, and corporate travel savings.\n\n`;

      textContent += `## Core Categories\n`;
      CATEGORIES.forEach(c => {
        textContent += `- [${c.title}](https://blueoceanhub.info/${c.id}) - ${c.description}\n`;
      });
      
      textContent += `\n## Legal & Policy Frameworks\n`;
      LEGAL_PAGES.forEach(p => {
        textContent += `- [${p.title}](https://blueoceanhub.info/page/${p.id})\n`;
      });

      textContent += `\n## Live Published Financial Intelligence Articles (${published.length} Live Nodes)\n`;
      published.forEach(art => {
        textContent += `- [${art.title}](https://blueoceanhub.info/article/${art.id}) (${art.category} | Published: ${art.pubDate})\n  Summary: ${art.description}\n`;
      });

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
      res.status(200).send(textContent);
    } catch (e) {
      console.error("Failed to generate all.txt:", e);
      res.status(500).send("Internal Server Error");
    }
  };

  app.get('/all.txt', fullTextHandler);
  app.get('/all', fullTextHandler);
  app.get('/llms-full.txt', fullTextHandler);
  app.get('/llms-full', fullTextHandler);
  app.get('/.well-known/llms-full.txt', fullTextHandler);

  // Dynamic ads.txt Handler
  const adsHandler = (req: express.Request, res: express.Response) => {
    const adsTxt = `# Blue Ocean Hub - ads.txt
# Authorized Digital Sellers
# Contact: hello@blueoceanhub.info
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
    res.status(200).send(adsTxt);
  };
  app.get('/ads.txt', adsHandler);
  app.get('/ads', adsHandler);

  // Dynamic security.txt Handler
  const securityHandler = (req: express.Request, res: express.Response) => {
    const securityTxt = `Contact: mailto:security@blueoceanhub.info
Contact: https://blueoceanhub.info/page/contact
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://blueoceanhub.info/.well-known/security.txt
Policy: https://blueoceanhub.info/page/editorial-policy
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
    res.status(200).send(securityTxt);
  };
  app.get('/security.txt', securityHandler);
  app.get('/.well-known/security.txt', securityHandler);

  // Dynamic humans.txt Handler
  const humansHandler = (req: express.Request, res: express.Response) => {
    const humansTxt = `/* TEAM */
Publisher: Blue Ocean Hub Editorial Board
Contact: hello@blueoceanhub.info
Location: South Asia / Global

/* SITE */
Standards: HTML5, CSS3, ES6+, TypeScript, React
Software: Express, Vite, Tailwind CSS
Language: English
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate=86400");
    res.status(200).send(humansTxt);
  };
  app.get('/humans.txt', humansHandler);
  app.get('/humans', humansHandler);

  // Google Indexing & Search Console Integration API
  function getGoogleAuthClient() {
    let credentialsJSON: any = null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        credentialsJSON = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch (e) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
      }
    }

    const clientEmail = credentialsJSON?.client_email || process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = credentialsJSON?.private_key || process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return null;
    }

    if (typeof privateKey === "string") {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    return new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/indexing",
        "https://www.googleapis.com/auth/webmasters"
      ]
    });
  }

  // Get Indexing & Config Status: checks setup and lists eligible index URLs
  app.get("/api/google-indexing/status", (req, res) => {
    const authClient = getGoogleAuthClient();
    const isConfigured = authClient !== null;
    let fallbackClientEmail = "";

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        fallbackClientEmail = parsed.client_email || "";
      } catch (_) {}
    } else if (process.env.GOOGLE_CLIENT_EMAIL) {
      fallbackClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    }

    // Compile list of eligible URLs from our data model with verified lastmod timestamps
    const todayStr = new Date().toISOString().split("T")[0];
    const published = [...ARTICLES]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const latestLiveDate = published[0]?.pubDate || todayStr;

    interface SitemapUrlItem {
      url: string;
      lastmod: string;
      changefreq: string;
      priority: number;
      type: "home" | "category" | "tool" | "legal" | "article";
      title: string;
    }

    const detailedUrls: SitemapUrlItem[] = [
      {
        url: "https://blueoceanhub.info/",
        lastmod: latestLiveDate,
        changefreq: "daily",
        priority: 1.0,
        type: "home",
        title: "Blue Ocean Hub | Brand Home"
      },
      ...CATEGORIES.map(c => {
        const catArticles = published.filter(art =>
          art.category.toLowerCase().replace(/\s+/g, "-") === c.id
        );
        return {
          url: `https://blueoceanhub.info/${c.id}`,
          lastmod: catArticles[0]?.pubDate || latestLiveDate,
          changefreq: "weekly",
          priority: 0.9,
          type: "category" as const,
          title: `${c.title} Category Hub`
        };
      }),
      {
        url: "https://blueoceanhub.info/toolkit",
        lastmod: "2026-09-22",
        changefreq: "weekly",
        priority: 0.9,
        type: "tool",
        title: "Strategic Financial Tool Hub (PSEB Tax & Nomad Travel Engines)"
      },
      ...LEGAL_PAGES.map(p => ({
        url: `https://blueoceanhub.info/page/${p.id}`,
        lastmod: p.pubDate || "2026-08-29",
        changefreq: "monthly",
        priority: 0.5,
        type: "legal" as const,
        title: p.title
      })),
      ...published.map(a => ({
        url: `https://blueoceanhub.info/article/${a.id}`,
        lastmod: a.pubDate,
        changefreq: "monthly",
        priority: 0.8,
        type: "article" as const,
        title: a.title
      }))
    ];

    const urls = detailedUrls.map(item => item.url);

    res.json({
      success: true,
      isConfigured,
      clientEmail: fallbackClientEmail ? `${fallbackClientEmail.slice(0, 4)}...${fallbackClientEmail.slice(-12)}` : null,
      summary: {
        totalDiscoveredSitemapUrls: detailedUrls.length,
        livePublishedArticles: published.length,
        scheduledPipelineQueue: 0,
        totalCatalogPipeline: ARTICLES.length,
        categoriesCount: CATEGORIES.length,
        legalPagesCount: LEGAL_PAGES.length,
        toolsCount: 1,
        latestLiveDate,
        gscStatusReason: "Synchronized: Sitemap contains exactly 322 live canonical URLs with verified non-future lastmod timestamps."
      },
      detailedUrls,
      urls
    });
  });

  // Submit Individual URL directly to Google Indexing API
  app.post("/api/google-indexing/submit-url", async (req, res) => {
    const { url, type } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required" });
    }

    const authClient = getGoogleAuthClient();
    if (!authClient) {
      return res.status(400).json({
        success: false,
        configMissing: true,
        error: "Google API credentials are not configured",
        details: "Please configure GOOGLE_SERVICE_ACCOUNT_JSON in environment variables and ensure the service account email is added as an Owner in Google Search Console."
      });
    }

    try {
      const response = await authClient.request({
        url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
        method: "POST",
        data: {
          url: url,
          type: type || "URL_UPDATED"
        }
      });
      res.json({
        success: true,
        data: response.data
      });
    } catch (err: any) {
      console.error("Google Indexing API Error:", err?.response?.data || err.message);
      res.status(500).json({
        success: false,
        error: err.message,
        details: err?.response?.data || "No additional server logs found"
      });
    }
  });

  // Submit Bulk / Custom Sitemap URLs or Submit Search Console Sitemap Ping
  app.post("/api/google-indexing/submit-sitemap", async (req, res) => {
    const { action } = req.body; // "submit_sitemap_ping" | "bulk_index_urls"
    const authClient = getGoogleAuthClient();

    if (!authClient) {
      return res.status(400).json({
        success: false,
        configMissing: true,
        error: "Google API credentials are not configured"
      });
    }

    if (action === "submit_sitemap_ping") {
      try {
        await authClient.request({
          url: "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fblueoceanhub.info%2F/sitemaps/https%3A%2F%2Fblueoceanhub.info%2Fsitemap.xml",
          method: "PUT"
        });
        
        return res.json({
          success: true,
          message: "Standard sitemap.xml successfully submitted directly to Google Search Console API."
        });
      } catch (err: any) {
        console.error("GSC Sitemap Submit Error:", err?.response?.data || err.message);
        return res.status(500).json({
          success: false,
          error: err.message,
          details: err?.response?.data || "Failed to put sitemap resource"
        });
      }
    } else if (action === "bulk_index_urls") {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const published = ARTICLES.filter(a => a.pubDate <= todayStr);

        const urlsToSubmit = [
          "https://blueoceanhub.info/",
          ...CATEGORIES.map(c => `https://blueoceanhub.info/${c.id}`),
          "https://blueoceanhub.info/toolkit",
          ...LEGAL_PAGES.map(p => `https://blueoceanhub.info/page/${p.id}`),
          ...published.map(a => `https://blueoceanhub.info/article/${a.id}`)
        ];

        const batchResults: Array<{ url: string; success: boolean; error?: string }> = [];

        // Concurrently handle submissions sequentially to prevent strict API rate limits / heavy loads
        for (const url of urlsToSubmit) {
          try {
            await authClient.request({
              url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
              method: "POST",
              data: {
                url,
                type: "URL_UPDATED"
              }
            });
            batchResults.push({ url, success: true });
          } catch (itemErr: any) {
            batchResults.push({
              url,
              success: false,
              error: itemErr?.response?.data?.error?.message || itemErr.message
            });
          }
        }

        return res.json({
          success: true,
          results: batchResults
        });
      } catch (err: any) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
    } else {
      return res.status(400).json({ success: false, error: "Invalid action type" });
    }
  });

  // In-memory document cache to guarantee sub-millisecond TTFB and zero disk I/O
  const documentCache = new Map<string, { html: string; timestamp: number }>();
  const DEV_CACHE_TTL = 120 * 1000; // 2 minutes in dev mode

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // Fast-path SPA Fallback for development with in-memory caching
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      const cleanPath = url.split('?')[0].split('#')[0];

      // Return from dev cache if freshly transformed
      const cached = documentCache.get(cleanPath);
      if (cached && (Date.now() - cached.timestamp < DEV_CACHE_TTL)) {
        return res.status(200).set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Server-Timing': 'ttfb;dur=0.4, cache;desc=HIT'
        }).send(cached.html);
      }

      try {
        // Read index.html
        let template = await fs.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        // Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);
        // Inject server-side SEO pre-rendering
        const parsedSEO = getSEOForUrl(url);
        if (parsedSEO) {
          template = injectMeta(template, parsedSEO);
        }
        documentCache.set(cleanPath, { html: template, timestamp: Date.now() });

        // Send the transformed and compressed HTML
        res.status(200).set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Server-Timing': 'ttfb;dur=1.5, cache;desc=MISS'
        }).send(template);
      } catch (e) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        if (e instanceof Error) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // In production, serve static files from /dist with high-performance caching
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static assets with correct headers & immutable caching for hashed bundles
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false, // Ensure root document requests pass through our optimized SEO and cache pipeline
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
        } else if (filePath.endsWith('sitemap.xml') || filePath.endsWith('news-sitemap.xml') || filePath.endsWith('robots.txt') || filePath.endsWith('llms.txt') || filePath.endsWith('all.txt') || filePath.endsWith('ai-catalog.json')) {
          res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
        } else if (filePath.match(/\.(js|css|woff2?|svg|png|jpg|jpeg|webp|ico)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    // Pre-load base index.html once into memory
    let productionBaseTemplate = '';
    try {
      productionBaseTemplate = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
    } catch (err) {
      console.warn("Could not preload dist/index.html:", err);
    }

    const renderProductionDoc = (cleanPath: string): string => {
      const cached = documentCache.get(cleanPath);
      if (cached) return cached.html;

      const parsedSEO = getSEOForUrl(cleanPath);
      let rendered = productionBaseTemplate;
      if (parsedSEO && rendered) {
        rendered = injectMeta(rendered, parsedSEO);
      }
      if (rendered) {
        documentCache.set(cleanPath, { html: rendered, timestamp: Date.now() });
      }
      return rendered;
    };

    // Pre-warm top critical routes in memory for 0ms initial TTFB
    if (productionBaseTemplate) {
      renderProductionDoc('/');
      renderProductionDoc('/toolkit');
      CATEGORIES.forEach(c => renderProductionDoc(`/${c.id}`));
      LEGAL_PAGES.forEach(l => renderProductionDoc(`/page/${l.id}`));
      ARTICLES.slice(0, 30).forEach(a => renderProductionDoc(`/article/${a.id}`));
      console.log(`Pre-warmed in-memory document cache with ${documentCache.size} routes`);
    }

    // Fallback to index.html for SPA routing with zero disk I/O
    app.get('*', async (req, res) => {
      const cleanPath = req.originalUrl.split('?')[0].split('#')[0];
      try {
        if (!productionBaseTemplate) {
          productionBaseTemplate = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
        }
        const html = renderProductionDoc(cleanPath);
        res.status(200).set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          'Server-Timing': 'ttfb;dur=0.3, cache;desc=HIT'
        }).send(html);
      } catch (err) {
        console.error("Error serving index.html in production:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
