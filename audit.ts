import { ARTICLES } from "./src/data/articles";

function runConciseAudit() {
  console.log("==========================================");
  console.log("      CONCISE BLUE OCEAN HUB AUDIT        ");
  console.log("==========================================\n");

  const total = ARTICLES.length;
  console.log(`Total Live/Created Articles: ${total}`);

  // Count by category
  const categories: { [cat: string]: number } = {};
  for (const a of ARTICLES) {
    categories[a.category] = (categories[a.category] || 0) + 1;
  }
  console.log("\nArticles by Category:");
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`  - ${cat}: ${count}`);
  }

  const articleMap = new Map(ARTICLES.map(a => [a.id, a]));
  const linkStats: { [id: string]: { inbound: number; outbound: number; unoptimized: string[] } } = {};

  for (const art of ARTICLES) {
    linkStats[art.id] = { inbound: 0, outbound: 0, unoptimized: [] };
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const unoptimizedWords = [
    "here", "click here", "read here", "this guide", "this article", "read more", "link", "website", "source", "guide", "article", "page",
    "click", "read", "view", "this"
  ];

  for (const art of ARTICLES) {
    let match;
    const content = art.content;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const anchor = match[1].trim();
      const url = match[2].trim();

      const articleUrlMatch = url.match(/^\/article\/([a-zA-Z0-9-_]+)$/);
      if (articleUrlMatch) {
        const targetId = articleUrlMatch[1];
        linkStats[art.id].outbound++;
        
        if (articleMap.has(targetId)) {
          linkStats[targetId].inbound++;
        }

        const anchorLower = anchor.toLowerCase();
        const isOptimized = !unoptimizedWords.includes(anchorLower) && 
                            anchorLower.split(/\s+/).length > 1 && 
                            !anchorLower.includes("http") && 
                            !anchorLower.match(/^\d+$/);

        if (!isOptimized) {
          linkStats[art.id].unoptimized.push(`Link to "${targetId}" using anchor "${anchor}"`);
        }
      }
    }
  }

  // Interlinking Analysis
  const orphaned = ARTICLES.filter(a => linkStats[a.id].inbound === 0).map(a => a.id);
  const noOutbound = ARTICLES.filter(a => linkStats[a.id].outbound === 0).map(a => a.id);
  const badAnchors = ARTICLES.filter(a => linkStats[a.id].unoptimized.length > 0);

  console.log("\n==========================================");
  console.log("          INTERLINKING METRICS            ");
  console.log("==========================================");
  console.log(`\n- Highly Interlinked Articles (Inbound >= 1): ${total - orphaned.length} / ${total}`);
  console.log(`- Orphaned Articles (Inbound = 0): ${orphaned.length} / ${total}`);
  console.log(`- Articles with Zero Outbound Links: ${noOutbound.length} / ${total}`);
  console.log(`- Articles with Unoptimized Anchors: ${badAnchors.length} / ${total}`);

  console.log("\nDetailed Orphaned Articles (Need internal backlinks pointing to them):");
  orphaned.forEach((id, idx) => {
    const art = articleMap.get(id);
    console.log(`  ${idx + 1}. [${art?.category}] ID: "${id}" -> "${art?.title}"`);
  });

  console.log("\nArticles with Unoptimized Anchor Texts:");
  if (badAnchors.length > 0) {
    badAnchors.forEach(art => {
      console.log(`  - "${art.title}" (ID: ${art.id}):`);
      linkStats[art.id].unoptimized.forEach(err => console.log(`    * ${err}`));
    });
  } else {
    console.log("  - 🎉 None! All existing articles use highly descriptive, high-impact semantic anchor texts.");
  }
}

runConciseAudit();
