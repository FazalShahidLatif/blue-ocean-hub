import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
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

  // 3. Cache Control for sitemap.xml
  app.get('/sitemap.xml', (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate");
    next();
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
