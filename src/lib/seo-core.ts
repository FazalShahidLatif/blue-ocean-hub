/**
 * Shared SEO metadata resolution for Blue Ocean Hub.
 *
 * Extracted verbatim from server.ts so the build-time prerenderer and the
 * runtime server cannot drift apart. Both import from here.
 *
 * getSEOForUrl(urlPath) -> meta object for a route, or null if the route has
 * no dedicated metadata. injectMeta(html, meta) -> HTML with the metadata and
 * JSON-LD injected.
 */

import { ARTICLES } from "../data/articles";
import { LEGAL_PAGES } from "../data/legal";
import { CATEGORIES } from "../data/categories";
import { HOMEPAGE_FAQS, PILLAR_FAQS } from "../data/faqs";

export function getSEOForUrl(urlPath: string) {
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
        "@type": "NewsMediaOrganization",
        "name": "Blue Ocean Hub",
        "url": "https://blueoceanhub.info/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://blueoceanhub.info/favicon.svg",
          "width": 512,
          "height": 512
        },
        "image": "https://blueoceanhub.info/og-image.jpg",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "hello@blueoceanhub.info",
          "contactType": "editorial support"
        },
        "sameAs": [
          "https://twitter.com",
          "https://linkedin.com/company/blue-ocean-hub"
        ],
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "South Asia"
        },
        "publishingPrinciples": "https://blueoceanhub.info/page/editorial-policy",
        "correctionsPolicy": "https://blueoceanhub.info/page/editorial-policy",
        "ethicsPolicy": "https://blueoceanhub.info/page/editorial-policy",
        "masthead": "https://blueoceanhub.info/page/about-us",
        "description": "South Asia's premier strategic financial magazine and intelligence publication. Delivering elite cashflow allocation and currency hedging blueprints."
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": HOMEPAGE_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
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
      const articleSection = article.category || "Financial Intelligence";
      const categorySlug = article.category?.toLowerCase().replace(/\s+/g, '-') || 'passive-income';

      const todayStr = new Date().toISOString().split("T")[0];
      const isFutureScheduled = article.pubDate > todayStr;

      const jsonLdArticle: any = {
        "@context": "https://schema.org",
        "@type": article.schema || "NewsArticle",
        "headline": article.title,
        "description": article.metaDescription || article.description,
        "image": [
          "https://blueoceanhub.info/og-image.jpg"
        ],
        "datePublished": `${isFutureScheduled ? todayStr : article.pubDate}T08:00:00+05:00`,
        "dateModified": `${isFutureScheduled ? todayStr : article.pubDate}T08:00:00+05:00`,
        "inLanguage": "en-US",
        "isAccessibleForFree": "true",
        "articleSection": articleSection,
        "keywords": (article.tags || []).join(", "),
        "author": {
          "@type": "Person",
          "name": article.author || "Blue Ocean Hub Editorial",
          "jobTitle": "Financial Analyst",
          "url": article.authorLinkedIn || "https://blueoceanhub.info/page/about-us"
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "Blue Ocean Hub",
          "url": "https://blueoceanhub.info/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://blueoceanhub.info/favicon.svg",
            "width": 512,
            "height": 512
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".executive-summary", ".article-lead"]
        }
      };

      const jsonLdBreadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://blueoceanhub.info/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": articleSection,
            "item": `https://blueoceanhub.info/${categorySlug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": canonical
          }
        ]
      };

      const schemas: any[] = [jsonLdArticle, jsonLdBreadcrumb];

      // Add FAQ schema if this article has structured FAQs
      const articleFaqs = PILLAR_FAQS[article.id];
      if (articleFaqs && articleFaqs.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": articleFaqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        });
      }

      return {
        title: `${article.title} | Blue Ocean Hub`,
        description: article.metaDescription || article.description,
        url: canonical,
        ogType: "article",
        robots: isFutureScheduled ? "noindex, follow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
        publishedTime: `${isFutureScheduled ? todayStr : article.pubDate}T08:00:00+05:00`,
        modifiedTime: `${isFutureScheduled ? todayStr : article.pubDate}T08:00:00+05:00`,
        author: article.author || "Blue Ocean Hub Editorial",
        section: articleSection,
        jsonLd: schemas
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

      const jsonLdPage = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "headline": page.title,
        "description": page.metaDescription || page.description,
        "datePublished": `${page.pubDate || '2026-05-15'}T08:00:00+05:00`,
        "inLanguage": "en-US",
        "author": {
          "@type": "Person",
          "name": page.author || "Blue Ocean Hub Editorial"
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "Blue Ocean Hub",
          "logo": {
            "@type": "ImageObject",
            "url": "https://blueoceanhub.info/favicon.svg",
            "width": 512,
            "height": 512
          },
          "url": "https://blueoceanhub.info/"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical
        }
      };

      const jsonLdBreadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://blueoceanhub.info/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": page.title,
            "item": canonical
          }
        ]
      };

      return {
        title: `${page.title} | Blue Ocean Hub`,
        description: page.metaDescription || page.description || "",
        url: canonical,
        ogType: "website",
        jsonLd: [jsonLdPage, jsonLdBreadcrumb]
      };
    }
  }

  // 4. Strategic Tool Hub (/toolkit)
  if (cleanUrl === "/toolkit" || cleanUrl === "/toolkit/") {
    const canonical = "https://blueoceanhub.info/toolkit";
    const toolJsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Blue Ocean Strategic Tool Hub",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "url": canonical,
        "description": "Tactical calculation engines: PSEB IT Remittance Tax Savings Estimator and Global Nomad Travel Logistics Optimizer.",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "2026.2",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://blueoceanhub.info/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Strategic Tool Hub",
            "item": canonical
          }
        ]
      }
    ];

    return {
      title: "Strategic Tool Hub: PSEB Tax & Nomad Travel Engines | Blue Ocean Hub",
      description: "Calculate PSEB 0.25% export tax savings, remittance withholding optimization, and international travel logistics arbitrage with interactive models.",
      url: canonical,
      ogType: "website",
      jsonLd: toolJsonLd
    };
  }

  // 5. Category Pages
  const categoryId = cleanUrl.replace(/^\//, ''); // e.g. 'passive-income'
  const categoryData = CATEGORIES.find(c => c.id === categoryId);
  if (categoryData) {
    const canonical = `https://blueoceanhub.info/${categoryData.id}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const categoryArticles = ARTICLES.filter(art =>
      art.category.toLowerCase().replace(/\s+/g, "-") === categoryId && art.pubDate <= todayStr
    );
    const jsonLdCollection = {
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

    const jsonLdBreadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://blueoceanhub.info/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": categoryData.title.split("—")[0].trim(),
          "item": canonical
        }
      ]
    };

    return {
      title: `${categoryData.seoTitle} | Blue Ocean Hub`,
      description: categoryData.seoDescription,
      url: canonical,
      ogType: "website",
      jsonLd: [jsonLdCollection, jsonLdBreadcrumb]
    };
  }

  return null;
}

export function injectMeta(
  html: string,
  meta: {
    title: string;
    description: string;
    url: string;
    ogType: string;
    robots?: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
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
    /<meta (?:property|name)="twitter:title" content="[^]*?"\s*\/?>/,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`
  );

  // Replace twitter:description
  result = result.replace(
    /<meta (?:property|name)="twitter:description" content="[^]*?"\s*\/?>/,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`
  );

  // Replace twitter:url
  result = result.replace(
    /<meta (?:property|name)="twitter:url" content="[^]*?"\s*\/?>/,
    `<meta name="twitter:url" content="${meta.url}" />`
  );

  // Replace google-site-verification if set in environment
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    result = result.replace(
      /<meta name="google-site-verification" content="[^]*?"\s*\/?>/,
      `<meta name="google-site-verification" content="${esc(process.env.GOOGLE_SITE_VERIFICATION)}" />`
    );
  }

  // Replace robots directives if custom robots is specified
  if (meta.robots) {
    result = result.replace(
      /<meta name="robots" content="[^]*?"\s*\/?>/,
      `<meta name="robots" content="${esc(meta.robots)}" />`
    );
    result = result.replace(
      /<meta name="googlebot" content="[^]*?"\s*\/?>/,
      `<meta name="googlebot" content="${esc(meta.robots)}" />`
    );
    result = result.replace(
      /<meta name="bingbot" content="[^]*?"\s*\/?>/,
      `<meta name="bingbot" content="${esc(meta.robots)}" />`
    );
  }

  // Inject article metadata tags if article type
  if (meta.ogType === "article") {
    let articleTags = "";
    if (meta.publishedTime) articleTags += `\n  <meta property="article:published_time" content="${esc(meta.publishedTime)}" />`;
    if (meta.modifiedTime) articleTags += `\n  <meta property="article:modified_time" content="${esc(meta.modifiedTime)}" />`;
    if (meta.author) articleTags += `\n  <meta property="article:author" content="${esc(meta.author)}" />`;
    if (meta.section) articleTags += `\n  <meta property="article:section" content="${esc(meta.section)}" />`;
    if (articleTags) {
      result = result.replace('</head>', `${articleTags}\n</head>`);
    }
  }

  // Remove baseline static schema from index.html if custom page-level schema is provided
  if (meta.jsonLd) {
    result = result.replace(/<script type="application\/ld\+json" id="baseline-schema">[\s\S]*?<\/script>/, '');
    const jsonLdStr = `<script type="application/ld+json" id="json-ld-structured-data">${JSON.stringify(meta.jsonLd)}</script>\n</head>`;
    result = result.replace('</head>', jsonLdStr);
  }

  return result;
}