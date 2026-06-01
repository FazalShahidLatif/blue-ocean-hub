import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { JWT } from "google-auth-library";
import { ARTICLES } from "./src/data/articles";
import { LEGAL_PAGES } from "./src/data/legal";
import { CATEGORIES } from "./src/data/categories";

function getSEOForUrl(urlPath: string) {
  // strip query params or hashes
  const cleanUrl = urlPath.split('?')[0].split('#')[0];

  // 1. Home Page
  if (cleanUrl === '/' || cleanUrl === '') {
    const homeJsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Blue Ocean Hub",
        "alternateName": "Blue Ocean Hub: Strategic Financial Intelligence",
        "url": "https://blueoceanhub.info/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://blueoceanhub.info/?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Blue Ocean Hub",
        "url": "https://blueoceanhub.info/",
        "logo": "https://blueoceanhub.info/favicon.svg",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "hello@blueoceanhub.info",
          "contactType": "editorial support"
        },
        "sameAs": [
          "https://linkedin.com/company/blue-ocean-hub"
        ],
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "South Asia"
        },
        "description": "South Asia's premier strategic financial magazine and intelligence publication. Delivering elite cashflow allocation and currency hedging blueprints."
      }
    ];
    return {
      title: "Blue Ocean Hub: Personal Wealth Allocation and Dollar Revenue Strategies for South Asian Founders",
      description: "Strategic financial intelligence for South Asian entrepreneurs. Expert analysis on PSX stock dividends, dollar-denominated export revenue, and high-yield saving strategies.",
      url: "https://blueoceanhub.info/",
      ogType: "website",
      jsonLd: homeJsonLd
    };
  }

  // 2. Article Page (/article/:id)
  const articleMatch = cleanUrl.match(/^\/article\/([^/]+)/);
  if (articleMatch) {
    const id = articleMatch[1];
    const article = ARTICLES.find(a => a.id === id);
    if (article) {
      const canonical = `https://blueoceanhub.info/article/${article.id}`;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": article.schema || "Article",
        "headline": article.title,
        "description": article.metaDescription || article.description,
        "datePublished": article.pubDate,
        "author": {
          "@type": "Person",
          "name": article.author || "Blue Ocean Hub Editorial",
          "url": article.authorLinkedIn || undefined
        },
        "publisher": {
          "@type": "Organization",
          "name": "Blue Ocean Hub",
          "logo": {
            "@type": "ImageObject",
            "url": "https://blueoceanhub.info/favicon.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical
        }
      };
      return {
        title: `${article.title} | Blue Ocean Hub`,
        description: article.metaDescription || article.description,
        url: canonical,
        ogType: "article",
        jsonLd
      };
    }
  }

  // 3. Legal/Information Page (/page/:id)
  const pageMatch = cleanUrl.match(/^\/page\/([^/]+)/);
  if (pageMatch) {
    const id = pageMatch[1];
    const page = LEGAL_PAGES.find(p => p.id === id);
    if (page) {
      const canonical = `https://blueoceanhub.info/page/${page.id}`;
      let schemaType = "WebPage";
      if (page.id === "about-us") schemaType = "AboutPage";
      else if (page.id === "contact") schemaType = "ContactPage";

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "headline": page.title,
        "description": page.metaDescription || page.description,
        "datePublished": page.pubDate,
        "author": {
          "@type": "Person",
          "name": page.author || "Blue Ocean Hub Editorial"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Blue Ocean Hub",
          "logo": {
            "@type": "ImageObject",
            "url": "https://blueoceanhub.info/favicon.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical
        }
      };
      return {
        title: `${page.title} | Blue Ocean Hub`,
        description: page.metaDescription || page.description || "",
        url: canonical,
        ogType: "website",
        jsonLd
      };
    }
  }

  // 4. Category Pages
  const categoryId = cleanUrl.replace(/^\//, ''); // e.g. 'passive-income'
  const categoryData = CATEGORIES.find(c => c.id === categoryId);
  if (categoryData) {
    const canonical = `https://blueoceanhub.info/${categoryData.id}`;
    const categoryArticles = ARTICLES.filter(art => 
      art.category.toLowerCase().replace(/\s+/g, "-") === categoryId
    );
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${categoryData.seoTitle} | Blue Ocean Hub`,
      "description": categoryData.seoDescription,
      "url": canonical,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": categoryArticles.length,
        "itemListElement": categoryArticles.map((art, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `https://blueoceanhub.info/article/${art.id}`,
          "name": art.title
        }))
      }
    };
    return {
      title: `${categoryData.seoTitle} | Blue Ocean Hub`,
      description: categoryData.seoDescription,
      url: canonical,
      ogType: "website",
      jsonLd
    };
  }

  return null;
}

function injectMeta(
  html: string,
  meta: {
    title: string;
    description: string;
    url: string;
    ogType: string;
    jsonLd?: Record<string, any> | Record<string, any>[];
  }
): string {
  let result = html;

  // Escape HTML helper for attributes
  const esc = (str: string) => str.replace(/"/g, '&quot;');

  // Replace <title>...</title>
  result = result.replace(/<title>[^]*?<\/title>/, `<title>${meta.title}</title>`);

  // Replace <meta name="title" ... />
  result = result.replace(
    /<meta name="title" content="[^]*?"\s*\/?>/,
    `<meta name="title" content="${esc(meta.title)}" />`
  );

  // Replace <meta name="description" ... />
  result = result.replace(
    /<meta name="description" content="[^]*?"\s*\/?>/,
    `<meta name="description" content="${esc(meta.description)}" />`
  );

  // Replace <link rel="canonical" ... />
  result = result.replace(
    /<link rel="canonical" href="[^]*?"\s*\/?>/,
    `<link rel="canonical" href="${meta.url}" />`
  );

  // Replace og:title
  result = result.replace(
    /<meta property="og:title" content="[^]*?"\s*\/?>/,
    `<meta property="og:title" content="${esc(meta.title)}" />`
  );

  // Replace og:description
  result = result.replace(
    /<meta property="og:description" content="[^]*?"\s*\/?>/,
    `<meta property="og:description" content="${esc(meta.description)}" />`
  );

  // Replace og:url
  result = result.replace(
    /<meta property="og:url" content="[^]*?"\s*\/?>/,
    `<meta property="og:url" content="${meta.url}" />`
  );

  // Replace og:type
  result = result.replace(
    /<meta property="og:type" content="[^]*?"\s*\/?>/,
    `<meta property="og:type" content="${meta.ogType}" />`
  );

  // Replace twitter:title
  result = result.replace(
    /<meta property="twitter:title" content="[^]*?"\s*\/?>/,
    `<meta property="twitter:title" content="${esc(meta.title)}" />`
  );

  // Replace twitter:description
  result = result.replace(
    /<meta property="twitter:description" content="[^]*?"\s*\/?>/,
    `<meta property="twitter:description" content="${esc(meta.description)}" />`
  );

  // Replace twitter:url
  result = result.replace(
    /<meta property="twitter:url" content="[^]*?"\s*\/?>/,
    `<meta property="twitter:url" content="${meta.url}" />`
  );

  // Inject JSON-LD immediately before </head>
  if (meta.jsonLd) {
    const jsonLdStr = `<script type="application/ld+json" id="json-ld-structured-data">${JSON.stringify(meta.jsonLd)}</script>\n</head>`;
    result = result.replace('</head>', jsonLdStr);
  }

  return result;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // 1. Redirects
  app.use((req, res, next) => {
    const host = req.get('host');
    if (host === 'www.blueoceanhub.info') {
      return res.redirect(301, `https://blueoceanhub.info${req.originalUrl}`);
    }
    next();
  });

  // 2. Global Security Headers
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  // 3. Dynamic XML and RSS Feed Pipeline Custom Implementation
  
  // Custom XML Escaping/Formatting helper
  function cleanXmlText(text: string): string {
    return text
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

  // Dynamic Standard XML Sitemap Handler
  app.get('/sitemap.xml', (req, res) => {
    try {
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split("T")[0];
      const published = ARTICLES.filter(a => a.pubDate <= todayStr);

      const categoryUrls = CATEGORIES.map(category => `
  <url>
    <loc>https://blueoceanhub.info/${category.id}</loc>
    <lastmod>${todayDateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join("");

      const legalUrls = LEGAL_PAGES.map(page => `
  <url>
    <loc>https://blueoceanhub.info/page/${page.id}</loc>
    <lastmod>${page.pubDate || todayDateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join("");

      const articleUrls = published.map(art => `
  <url>
    <loc>https://blueoceanhub.info/article/${art.id}</loc>
    <lastmod>${art.pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("");

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

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=43200, stale-while-revalidate");
      res.status(200).send(sitemapXml);
    } catch (e) {
      console.error("Failed to generate standard sitemap:", e);
      res.status(500).send("Internal Server Error");
    }
  });

  // Dynamic Google News XML Sitemap Handler (Separate required endpoint)
  app.get('/news-sitemap.xml', (req, res) => {
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

      const newsUrlsXml = newsArticles.map(art => `
  <url>
    <loc>https://blueoceanhub.info/article/${art.id}</loc>
    <news:news>
      <news:publication>
        <news:name><![CDATA[Blue Ocean Hub]]></news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${art.pubDate}T00:00:00Z</news:publication_date>
      <news:title><![CDATA[${art.title}]]></news:title>
    </news:news>
  </url>`).join("");

      const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsUrlsXml}
</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate");
      res.status(200).send(newsSitemapXml);
    } catch (e) {
      console.error("Failed to generate Google News sitemap:", e);
      res.status(500).send("Internal Server Error");
    }
  });

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

    // Compile list of eligible URLs from our data model
    const todayStr = new Date().toISOString().split("T")[0];
    const published = ARTICLES.filter(a => a.pubDate <= todayStr);

    const urls = [
      "https://blueoceanhub.info/",
      ...CATEGORIES.map(c => `https://blueoceanhub.info/${c.id}`),
      ...LEGAL_PAGES.map(p => `https://blueoceanhub.info/page/${p.id}`),
      ...published.map(a => `https://blueoceanhub.info/article/${a.id}`)
    ];

    res.json({
      success: true,
      isConfigured,
      clientEmail: fallbackClientEmail ? `${fallbackClientEmail.slice(0, 4)}...${fallbackClientEmail.slice(-12)}` : null,
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // SPA Fallback for development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
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
        // Send the transformed HTML
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        if (e instanceof Error) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // In production, serve static files from /dist
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static assets with correct headers
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sitemap.xml')) {
           res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate");
        }
      }
    }));

    // Fallback to index.html for SPA routing
    app.get('*', async (req, res) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
        // Inject server-side SEO pre-rendering
        const parsedSEO = getSEOForUrl(url);
        if (parsedSEO) {
          template = injectMeta(template, parsedSEO);
        }
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
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
