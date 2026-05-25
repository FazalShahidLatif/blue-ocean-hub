export interface FAQItem {
  question: string;
  answer: string;
}

export const HOMEPAGE_FAQS: FAQItem[] = [
  {
    question: "What is Blue Ocean Hub?",
    answer: "Blue Ocean Hub is South Asia's premier digital financial magazine and strategic intelligence platform. We provide Pakistani entrepreneurs, freelancers, tech professionals, and corporate leaders with actionable blueprints for wealth preservation, high-yield local investing, and global USD revenue scaling."
  },
  {
    question: "Who is this platform designed for?",
    answer: "Our content is specifically tailored for salaried employees looking for passive income, software engineers transitioning into agency founders, freelancers scaling high-ticket clients, and asset managers seeking institutional-grade yield strategies in a high-inflation environment."
  },
  {
    question: "What topics and investment classes does the Hub cover?",
    answer: "We publish in-depth research, calculators, and guides across five core categories: Passive Income, Local & Global Investing (including PSX, REITs, Money Market Funds), High-Ticket Freelancing / Agency Building, Corporate & Personal Saving, and Digital Asset Monetization (SaaS, Newsletters)."
  },
  {
    question: "Is Blue Ocean Hub a registered financial advisory service?",
    answer: "No. Blue Ocean Hub is an independent media house and educational publication. All analysis, research, and models provided here are for educational and strategic information purposes only and should not be construed as registered personal financial advice."
  }
];

export const PILLAR_FAQS: Record<string, FAQItem[]> = {
  "10-passive-income-ideas-pakistan": [
    {
      question: "What is the absolute minimum capital required to start earning passive income in Pakistan?",
      answer: "You can start with as little as Rs. 500 to Rs. 1,000 by investing in money market mutual funds or purchasing Government of Pakistan retail Sukuk bonds. Digital passive assets like newsletters, courses, or Excel templates can also be built with zero initial capital, leveraging your existing expertise."
    },
    {
      question: "How does inflation affect regional passive income streams?",
      answer: "In a high-inflation environment, holding raw cash or fixed bank deposits degrades your spending power. The best hedges are equity-linked assets (growth/dividend stocks), REITs (which adjust rent to inflation), or offshore revenue sources generated in strong foreign currencies like USD."
    },
    {
      question: "Is passive income in Pakistan subject to income taxes?",
      answer: "Yes. All income is taxable under FBR rules. For filers, mutual fund dividends and stock earnings typically face a withholding tax of 15% (which climbs to 30% for non-filers). Ensuring active filer status is critical to protecting your investment yields."
    }
  ],
  "how-to-invest-in-psx-as-a-beginner-2026": [
    {
      question: "Is the Pakistan Stock Exchange (PSX) safe for an absolute beginner?",
      answer: "Yes, provided you avoid day trading, leveraging, and speculative penny stocks. For beginners, the safest paths are buying shares of blue-chip dividend-paying companies or investing in broad-market index-tracking mutual funds or ETFs."
    },
    {
      question: "What is a CDC account, and why do I need one?",
      answer: "The Central Depository Company (CDC) is an SECP-regulated institution that acts as a digital vault for your shares. Whenever you buy stocks through a broker, the CDC records and preserves your ownership under your unique identification, preventing fraud."
    },
    {
      question: "What is the difference between custom brokers and CDC's direct Investor Account?",
      answer: "Commercial brokers provide the trading software/app interface and market order execution. A CDC Investor Account holds the assets directly under your absolute custody with the Depository. For most retail investors, a broker-managed sub-account is secure enough as long as you use SECP-regulated brokers."
    }
  ],
  "freelancing-guide-pakistan-2026": [
    {
      question: "Can I legally receive international USD revenue in Pakistan?",
      answer: "Yes, absolutely. Under State Bank of Pakistan (SBP) rules, freelancers and software developers can receive foreign exchange. Registering your agency with the Pakistan Software Export Board (PSEB) offers attractive cash rebates and tax exemptions on your IT export earnings."
    },
    {
      question: "What are the best payout platforms for Pakistani freelancers in 2026?",
      answer: "The primary routes include Payoneer (integrated directly inside local banking apps), Wise Business (for offshore entities), and direct international wire transfers via standard SWIFT codes. Digital wallets like SadaPay and NayaPay also support foreign inflows."
    },
    {
      question: "Should I register a local company or use a US LLC/UK LTD?",
      answer: "If you are working as a solo freelancer, a local sole proprietorship is easiest. Once you start scaling into a team or agency with larger enterprise contracts, setting up an offshore US LLC or UK LTD simplifies getting approved by international payment processors like Stripe."
    }
  ]
};
