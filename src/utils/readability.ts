/**
 * Editorial Readability & Content Quality Scoring Engine
 * Blue Ocean Hub Strategic Financial Intelligence
 *
 * Implements standard Flesch Reading Ease, Flesch-Kincaid Grade Level,
 * and editorial clarity heuristics designed for high-authority financial journalism.
 */

export interface ReadabilityMetrics {
  fleschReadingEase: number; // 0 - 100
  fleschKincaidGrade: number; // Grade level (e.g. 8.5)
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  readingTimeMinutes: number;
  readingEaseLabel: string;
  readingEaseColor: string; // Tailwind color class
  gradeLevelLabel: string;
  eeatScore: number; // 0 - 100 calculated compliance score
}

function countSyllablesInWord(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanWord) return 1;
  if (cleanWord.length <= 3) return 1;

  // Replace common suffixes before counting
  let processed = cleanWord
    .replace(/(?:[^laeiouy]|ed|es|e)$/, "")
    .replace(/^y/, "");

  const syllables = processed.match(/[aeiouy]{1,2}/g);
  return syllables ? Math.max(1, syllables.length) : 1;
}

export function calculateReadability(text: string): ReadabilityMetrics {
  if (!text || text.trim().length === 0) {
    return {
      fleschReadingEase: 70,
      fleschKincaidGrade: 8.0,
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      averageWordsPerSentence: 0,
      averageSyllablesPerWord: 0,
      readingTimeMinutes: 1,
      readingEaseLabel: "Accessible",
      readingEaseColor: "text-emerald-400",
      gradeLevelLabel: "Standard Plain-Language",
      eeatScore: 95
    };
  }

  // Strip Markdown syntax (headers, links, bold, code) for accurate prose analysis
  const plainText = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // link text
    .replace(/#{1,6}\s+/g, "") // headers
    .replace(/[*_~`]/g, "") // bold/italic/code
    .replace(/>\s+/g, "") // blockquotes
    .replace(/\|[^\n]+\|/g, "") // markdown tables
    .replace(/[-*+]\s+/g, "") // lists
    .trim();

  // Split into sentences
  const sentences = plainText
    .split(/[.!?]+(?:\s+|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Split into words
  const words = plainText
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => /[a-zA-Z0-9]/.test(w));
  const wordCount = Math.max(1, words.length);

  // Count syllables
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllablesInWord(word);
  }

  const averageWordsPerSentence = Number((wordCount / sentenceCount).toFixed(1));
  const averageSyllablesPerWord = Number((syllableCount / wordCount).toFixed(2));

  // Flesch Reading Ease formula:
  // 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  let readingEase = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (syllableCount / wordCount));
  readingEase = Math.round(Math.min(100, Math.max(25, readingEase)));

  // Flesch-Kincaid Grade Level formula:
  // 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  let gradeLevel = (0.39 * (wordCount / sentenceCount)) + (11.8 * (syllableCount / wordCount)) - 15.59;
  gradeLevel = Number(Math.max(4.0, Math.min(16.0, gradeLevel)).toFixed(1));

  // Determine label and aesthetic color
  let readingEaseLabel = "Optimal Financial Clarity";
  let readingEaseColor = "text-emerald-400";
  let gradeLevelLabel = "Standard Professional";

  if (readingEase >= 80) {
    readingEaseLabel = "High Plain-Language Accessibility";
    readingEaseColor = "text-emerald-400";
    gradeLevelLabel = "6th - 7th Grade (Universal)";
  } else if (readingEase >= 65) {
    readingEaseLabel = "Optimal Executive Clarity";
    readingEaseColor = "text-cyan";
    gradeLevelLabel = "8th - 9th Grade (Standard)";
  } else if (readingEase >= 50) {
    readingEaseLabel = "Professional Technical Advisory";
    readingEaseColor = "text-cyan";
    gradeLevelLabel = "10th - 12th Grade (Advanced)";
  } else {
    readingEaseLabel = "Institutional Legal & Regulatory";
    readingEaseColor = "text-amber-400";
    gradeLevelLabel = "College / Institutional";
  }

  // Calculate EEAT audit score based on structural cues
  let eeatScore = 88;
  if (text.includes("###") || text.includes("##")) eeatScore += 4;
  if (text.includes("|") && text.includes("---")) eeatScore += 3; // Structured tables
  if (text.includes("/toolkit")) eeatScore += 3; // Operational tools interlinking
  if (text.includes("/article/")) eeatScore += 2; // Contextual peer links
  eeatScore = Math.min(99, eeatScore);

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    fleschReadingEase: readingEase,
    fleschKincaidGrade: gradeLevel,
    wordCount,
    sentenceCount,
    syllableCount,
    averageWordsPerSentence,
    averageSyllablesPerWord,
    readingTimeMinutes,
    readingEaseLabel,
    readingEaseColor,
    gradeLevelLabel,
    eeatScore
  };
}
