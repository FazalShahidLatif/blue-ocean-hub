import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "profile" | "book" | "music";
  robots?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export default function SEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  robots = "index, follow",
  jsonLd,
}: SEOProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Set/Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // 3. Set/Update Meta Title Tag (primary)
    let metaTitle = document.querySelector('meta[name="title"]');
    if (!metaTitle) {
      metaTitle = document.createElement("meta");
      metaTitle.setAttribute("name", "title");
      document.head.appendChild(metaTitle);
    }
    metaTitle.setAttribute("content", title);

    // 4. Set/Update Canonical URL
    const finalCanonicalUrl = canonicalUrl || `https://blueoceanhub.info${pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", finalCanonicalUrl);

    // 5. Set/Update Robots Indexing
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", robots);

    // 6. Set Open Graph (OG) Tags
    const ogTags = {
      "og:title": title,
      "og:description": description,
      "og:url": finalCanonicalUrl,
      "og:type": ogType,
      "og:image": "https://blueoceanhub.info/favicon.svg",
    };

    Object.entries(ogTags).forEach(([property, value]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    });

    // 7. Set Twitter Cards Tags
    const twitterTags = {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:url": finalCanonicalUrl,
      "twitter:card": "summary_large_image",
      "twitter:image": "https://blueoceanhub.info/favicon.svg",
    };

    Object.entries(twitterTags).forEach(([name, value]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    });

    // 8. Handle JSON-LD Structured Data
    const scriptId = "json-ld-structured-data";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (jsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Cleanup on unmount or tag change
    return () => {
      const scriptToClean = document.getElementById(scriptId);
      if (scriptToClean) {
        scriptToClean.remove();
      }
    };
  }, [title, description, canonicalUrl, ogType, robots, pathname, jsonLd]);

  return null;
}
