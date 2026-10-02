import fs from "fs";
import path from "path";
import { ARTICLES } from "../src/data/articles.js";

console.log("Analyzing articles for interlinking enrichment...");

// Group all articles by category
const byCategory: { [cat: string]: typeof ARTICLES } = {};
for (const art of ARTICLES) {
  if (!byCategory[art.category]) byCategory[art.category] = [];
  byCategory[art.category].push(art);
}

// Map each article to 2 peers in the same category
const peersMap = new Map<string, { peer1: typeof ARTICLES[0]; peer2: typeof ARTICLES[0]; toolLink: { anchor: string; url: string } }>();

for (const [cat, list] of Object.entries(byCategory)) {
  const n = list.length;
  for (let i = 0; i < n; i++) {
    const current = list[i];
    const peer1 = list[(i + 1) % n];
    const peer2 = list[(i + 2) % n];

    let toolLink = {
      anchor: "Strategic Financial Tool Hub & Computational Models",
      url: "/toolkit"
    };

    if (cat === "Freelancing") {
      toolLink = {
        anchor: "2026 PSEB 0.25% Remittance Tax Savings Estimator",
        url: "/toolkit#pseb-tax-calculator"
      };
    } else if (cat === "Dollar Earning" || cat === "Saving Money") {
      toolLink = {
        anchor: "Global Nomad Travel Logistics & Currency Optimizer",
        url: "/toolkit#nomad-travel-logistics"
      };
    }

    peersMap.set(current.id, { peer1, peer2, toolLink });
  }
}

function enrichFile(filePath: string) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log("File not found:", filePath);
    return;
  }

  let code = fs.readFileSync(fullPath, "utf-8");
  let modifiedCount = 0;

  for (const art of ARTICLES) {
    if (!code.includes(`"${art.id}"`)) continue;
    const peers = peersMap.get(art.id);
    if (!peers) continue;

    // Check if this article already links to peer1
    if (code.includes(`/article/${peers.peer1.id}`)) continue;

    const crossRefBlock = `\\n\\n### Strategic Cross-References & Operational Peer Reports\\n\\n- [${peers.peer1.title}](/article/${peers.peer1.id}): Verified tactical execution guidelines and market compliance principles.\\n- [${peers.peer2.title}](/article/${peers.peer2.id}): Institutional portfolio allocation and risk-hedging frameworks.\\n- [${peers.toolLink.anchor}](${peers.toolLink.url}): Interactive computational engines and statutory models for South Asian operators.\\n`;

    const escapedId = art.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Pattern 1: JSON double-quoted string: content: "..."
    const jsonRegex = new RegExp(`(id:\\s*["']${escapedId}["'][\\s\\S]*?content:\\s*")([\\s\\S]*?)("(?=[\\s\\S]*?(?:\\n\\s*\\},?|\\n\\s*schema)))`, 'm');
    const jsonMatch = code.match(jsonRegex);
    if (jsonMatch) {
      const prefix = jsonMatch[1];
      const body = jsonMatch[2];
      const closeQuote = jsonMatch[3];

      // Avoid double-enriching
      if (!body.includes(peers.peer1.id)) {
        const updatedBody = body + crossRefBlock;
        code = code.replace(jsonMatch[0], `${prefix}${updatedBody}${closeQuote}`);
        modifiedCount++;
        continue;
      }
    }

    // Pattern 2: Template literal: content: `...`
    const templateRegex = new RegExp(`(id:\\s*["']${escapedId}["'][\\s\\S]*?content:\\s*\`)([\\s\\S]*?)(\`(?=[\\s\\S]*?(?:\\n\\s*\\},?|\\n\\s*schema)))`, 'm');
    const templateMatch = code.match(templateRegex);
    if (templateMatch) {
      const prefix = templateMatch[1];
      const body = templateMatch[2];
      const closeTick = templateMatch[3];

      if (!body.includes(peers.peer1.id)) {
        const cleanCrossRef = `\n\n### Strategic Cross-References & Operational Peer Reports\n\n- [${peers.peer1.title}](/article/${peers.peer1.id}): Verified tactical execution guidelines and market compliance principles.\n- [${peers.peer2.title}](/article/${peers.peer2.id}): Institutional portfolio allocation and risk-hedging frameworks.\n- [${peers.toolLink.anchor}](${peers.toolLink.url}): Interactive computational engines and statutory models for South Asian operators.\n`;
        const updatedBody = body + cleanCrossRef;
        code = code.replace(templateMatch[0], `${prefix}${updatedBody}${closeTick}`);
        modifiedCount++;
      }
    }
  }

  if (modifiedCount > 0) {
    fs.writeFileSync(fullPath, code, "utf-8");
    console.log(`Successfully enriched ${modifiedCount} articles in ${filePath}`);
  } else {
    console.log(`No articles updated in ${filePath}`);
  }
}

enrichFile("src/data/articles_travel_monetization.ts");
enrichFile("src/data/articles_scheduled_september.ts");
enrichFile("src/data/articles_scheduled_october.ts");
enrichFile("src/data/articles_scheduled_november.ts");
enrichFile("src/data/articles_fill_june.ts");
enrichFile("src/data/articles_fill_july_p1.ts");
enrichFile("src/data/articles_fill_july_p2.ts");
enrichFile("src/data/articles_scheduled_august.ts");
enrichFile("src/data/articles_scheduled_august_part2.ts");
enrichFile("src/data/articles_scheduled_august_part3.ts");
enrichFile("src/data/articles_scheduled_august_part4.ts");

console.log("Enrichment run finished.");
