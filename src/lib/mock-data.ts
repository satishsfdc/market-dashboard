import {
  EconomicEvent,
  WatchlistStock,
  EarningsEntry,
  NewsItem,
  GeoRiskEvent,
  MarketIndex,
  SectorPerformance,
  PortfolioInsight,
} from "@/types";

export const economicEventsThisWeek: EconomicEvent[] = [
  {
    id: "ev1",
    date: "2026-06-12",
    time: "08:30 ET",
    name: "Core CPI (MoM)",
    expected: "0.3%",
    previous: "0.2%",
    impact: "High",
  },
  {
    id: "ev2",
    date: "2026-06-12",
    time: "10:00 ET",
    name: "Consumer Sentiment (Prelim)",
    expected: "68.5",
    previous: "67.2",
    impact: "Medium",
  },
  {
    id: "ev3",
    date: "2026-06-13",
    time: "08:30 ET",
    name: "PPI (MoM)",
    expected: "0.2%",
    previous: "0.1%",
    impact: "Medium",
  },
  {
    id: "ev4",
    date: "2026-06-13",
    time: "10:00 ET",
    name: "10-Year Treasury Auction",
    expected: "—",
    previous: "4.42%",
    impact: "Low",
  },
];

export const economicEventsNextWeek: EconomicEvent[] = [
  {
    id: "ev5",
    date: "2026-06-17",
    time: "08:30 ET",
    name: "Retail Sales (MoM)",
    expected: "0.4%",
    previous: "0.1%",
    impact: "High",
  },
  {
    id: "ev6",
    date: "2026-06-18",
    time: "14:00 ET",
    name: "FOMC Rate Decision",
    expected: "4.25–4.50%",
    previous: "4.25–4.50%",
    impact: "High",
  },
  {
    id: "ev7",
    date: "2026-06-18",
    time: "14:30 ET",
    name: "Fed Chair Press Conference",
    expected: "—",
    previous: "—",
    impact: "High",
  },
  {
    id: "ev8",
    date: "2026-06-19",
    time: "08:30 ET",
    name: "Initial Jobless Claims",
    expected: "232K",
    previous: "248K",
    impact: "Medium",
  },
  {
    id: "ev9",
    date: "2026-06-20",
    time: "09:45 ET",
    name: "ISM Manufacturing PMI",
    expected: "49.8",
    previous: "48.7",
    impact: "Medium",
  },
];

export const watchlistDefault: WatchlistStock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 207.34, change: 1.42, changePercent: 0.69 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 462.18, change: -2.05, changePercent: -0.44 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 138.92, change: 3.61, changePercent: 2.67 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 312.77, change: -5.23, changePercent: -1.65 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 198.45, change: 0.88, changePercent: 0.45 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 634.21, change: 4.97, changePercent: 0.79 },
];

export const earningsTracker: EarningsEntry[] = [
  {
    symbol: "NVDA",
    date: "2026-06-17",
    timing: "After Close",
    daysUntil: 5,
    revenueEstimate: "$43.2B",
    epsEstimate: "$0.87",
    historicalNote: "Beat EPS estimates in 7 of last 8 quarters",
  },
  {
    symbol: "TSLA",
    date: "2026-06-15",
    timing: "After Close",
    daysUntil: 3,
    revenueEstimate: "$26.8B",
    epsEstimate: "$0.62",
    historicalNote: "Missed revenue estimates in 2 of last 4 quarters",
  },
  {
    symbol: "META",
    date: "2026-06-30",
    timing: "After Close",
    daysUntil: 18,
    revenueEstimate: "$44.1B",
    epsEstimate: "$6.12",
    historicalNote: "Average post-earnings move: +/- 8.3%",
  },
  {
    symbol: "AAPL",
    date: "2026-07-24",
    timing: "After Close",
    daysUntil: 42,
    revenueEstimate: "$94.5B",
    epsEstimate: "$1.58",
    historicalNote: "Beat EPS estimates in 11 of last 12 quarters",
  },
];

export const newsFeed: NewsItem[] = [
  {
    id: "n1",
    symbol: "NVDA",
    headline: "NVIDIA expands AI chip supply deals ahead of earnings",
    summary:
      "Reports indicate NVIDIA has signed expanded supply agreements with major cloud providers, with analysts framing this as a tailwind heading into next week's earnings report.",
    sentiment: "Bullish",
    impactScore: 8,
    source: "Reuters",
    sourceCredibility: "High",
    publishedAt: "2026-06-12T13:15:00Z",
  },
  {
    id: "n2",
    symbol: "TSLA",
    headline: "Tesla delivery estimates trimmed by several analysts",
    summary:
      "A handful of sell-side analysts lowered Q2 delivery estimates citing softer demand signals in key markets, adding pressure ahead of Tesla's earnings later this week.",
    sentiment: "Bearish",
    impactScore: 6,
    source: "Bloomberg",
    sourceCredibility: "High",
    publishedAt: "2026-06-12T11:40:00Z",
  },
  {
    id: "n3",
    symbol: "AAPL",
    headline: "Apple supplier reports steady component orders",
    summary:
      "A key Apple supplier indicated component orders remain in line with seasonal expectations, suggesting no major near-term changes to production plans.",
    sentiment: "Neutral",
    impactScore: 4,
    source: "Nikkei",
    sourceCredibility: "Medium",
    publishedAt: "2026-06-12T09:05:00Z",
  },
  {
    id: "n4",
    symbol: "MSFT",
    headline: "Microsoft cloud unit announces new enterprise AI partnerships",
    summary:
      "Microsoft's cloud division unveiled a set of new enterprise partnerships focused on AI deployment tooling, which analysts see as incrementally positive for cloud segment growth.",
    sentiment: "Bullish",
    impactScore: 5,
    source: "CNBC",
    sourceCredibility: "Medium",
    publishedAt: "2026-06-11T22:30:00Z",
  },
  {
    id: "n5",
    symbol: "AMZN",
    headline: "Amazon logistics arm faces regional labor dispute",
    summary:
      "A labor dispute at several regional logistics facilities has raised concerns about short-term delivery delays, though the company says operations remain largely unaffected.",
    sentiment: "Bearish",
    impactScore: 3,
    source: "AP News",
    sourceCredibility: "High",
    publishedAt: "2026-06-11T18:00:00Z",
  },
  {
    id: "n6",
    symbol: "META",
    headline: "Meta's ad revenue trends remain resilient, survey shows",
    summary:
      "A survey of digital ad buyers suggests spending on Meta's platforms remains stable heading into the back half of the year, supporting current revenue estimates.",
    sentiment: "Neutral",
    impactScore: 4,
    source: "Financial Times",
    sourceCredibility: "High",
    publishedAt: "2026-06-11T15:20:00Z",
  },
];

export const geoRiskEvents: GeoRiskEvent[] = [
  {
    id: "g1",
    title: "Middle East shipping lane tensions persist",
    summary:
      "Ongoing tensions in regional shipping lanes continue to affect freight routing, with insurers maintaining elevated premiums for vessels transiting the area.",
    countries: ["Israel", "Iran", "Yemen"],
    potentialImpact: "Elevated energy and shipping costs; volatility in oil-sensitive sectors.",
    affectedSectors: ["Energy", "Transportation", "Materials"],
    riskScore: 7,
    lastUpdated: "2026-06-12T08:00:00Z",
  },
  {
    id: "g2",
    title: "China–Taiwan rhetoric escalates ahead of joint drills",
    summary:
      "Heightened rhetoric between Beijing and Taipei ahead of scheduled military exercises has drawn attention from semiconductor investors monitoring regional stability.",
    countries: ["China", "Taiwan", "United States"],
    potentialImpact: "Potential volatility in semiconductor and hardware supply chains.",
    affectedSectors: ["Technology", "Semiconductors"],
    riskScore: 6,
    lastUpdated: "2026-06-12T06:30:00Z",
  },
  {
    id: "g3",
    title: "Russia–Ukraine ceasefire talks resume in Geneva",
    summary:
      "Renewed diplomatic talks were reported in Geneva, with markets watching for any signals that could affect European energy supply and defense sector outlooks.",
    countries: ["Russia", "Ukraine", "Switzerland"],
    potentialImpact: "Possible easing of European energy price volatility if talks progress.",
    affectedSectors: ["Energy", "Defense", "Agriculture"],
    riskScore: 5,
    lastUpdated: "2026-06-11T20:15:00Z",
  },
  {
    id: "g4",
    title: "New tariff proposals target select tech imports",
    summary:
      "Proposed tariff changes on a category of electronics imports are under review, with industry groups warning of potential cost pass-through to consumer hardware prices.",
    countries: ["United States", "China"],
    potentialImpact: "Margin pressure for hardware importers; potential consumer price increases.",
    affectedSectors: ["Technology", "Consumer Discretionary"],
    riskScore: 5,
    lastUpdated: "2026-06-11T17:45:00Z",
  },
];

export const marketIndices: MarketIndex[] = [
  { symbol: "SPX", name: "S&P 500", value: 6042.18, change: 12.4, changePercent: 0.21 },
  { symbol: "IXIC", name: "Nasdaq", value: 19684.55, change: 58.9, changePercent: 0.3 },
  { symbol: "DJI", name: "Dow Jones", value: 43512.07, change: -45.2, changePercent: -0.1 },
  { symbol: "RUT", name: "Russell 2000", value: 2184.33, change: 6.1, changePercent: 0.28 },
  { symbol: "VIX", name: "VIX", value: 14.62, change: -0.38, changePercent: -2.53 },
  { symbol: "TNX", name: "10Y Treasury", value: 4.42, change: 0.03, changePercent: 0.68 },
  { symbol: "WTI", name: "Crude Oil", value: 71.85, change: 0.92, changePercent: 1.29 },
  { symbol: "GOLD", name: "Gold", value: 2398.4, change: -8.6, changePercent: -0.36 },
  { symbol: "BTC", name: "Bitcoin", value: 71240, change: 1180, changePercent: 1.68 },
];

export const sectorPerformance: SectorPerformance[] = [
  { sector: "Technology", changePercent: 1.4 },
  { sector: "Energy", changePercent: 0.9 },
  { sector: "Financials", changePercent: 0.5 },
  { sector: "Healthcare", changePercent: 0.2 },
  { sector: "Industrials", changePercent: -0.1 },
  { sector: "Consumer Disc.", changePercent: -0.3 },
  { sector: "Utilities", changePercent: -0.6 },
  { sector: "Real Estate", changePercent: -1.1 },
];

export const portfolioInsights: PortfolioInsight[] = [
  {
    symbol: "NVDA",
    riskLevel: "High",
    catalysts: [
      { label: "Earnings report June 17 (After Close)", type: "bullish", impact: "High" },
      { label: "FOMC rate decision June 18", type: "bearish", impact: "Medium" },
      { label: "China–Taiwan tensions affecting chip supply chain", type: "bearish", impact: "High" },
    ],
  },
  {
    symbol: "TSLA",
    riskLevel: "High",
    catalysts: [
      { label: "Earnings report June 15, delivery estimates trimmed", type: "bearish", impact: "High" },
      { label: "Retail sales data could indicate consumer demand strength", type: "bullish", impact: "Medium" },
    ],
  },
  {
    symbol: "AAPL",
    riskLevel: "Medium",
    catalysts: [
      { label: "Supplier orders steady, signals stable production", type: "bullish", impact: "Low" },
      { label: "Tariff proposals on electronics imports", type: "bearish", impact: "Medium" },
    ],
  },
  {
    symbol: "MSFT",
    riskLevel: "Low",
    catalysts: [
      { label: "New enterprise AI partnerships announced", type: "bullish", impact: "Medium" },
      { label: "FOMC decision could affect rate-sensitive valuation", type: "bearish", impact: "Medium" },
    ],
  },
  {
    symbol: "AMZN",
    riskLevel: "Medium",
    catalysts: [
      { label: "Retail sales data directly relevant to e-commerce demand", type: "bullish", impact: "High" },
      { label: "Regional labor dispute at logistics facilities", type: "bearish", impact: "Low" },
    ],
  },
  {
    symbol: "META",
    riskLevel: "Low",
    catalysts: [
      { label: "Ad spend survey shows resilient demand", type: "bullish", impact: "Medium" },
      { label: "Earnings not until June 30, limited near-term catalyst risk", type: "bullish", impact: "Low" },
    ],
  },
];
