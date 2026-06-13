export type ImpactLevel = "High" | "Medium" | "Low";
export type Sentiment = "Bullish" | "Neutral" | "Bearish";
export type EarningsTiming = "Before Open" | "After Close";

export interface EconomicEvent {
  id: string;
  date: string; // ISO date
  time: string; // e.g. "08:30 ET"
  name: string;
  expected: string;
  previous: string;
  impact: ImpactLevel;
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface EarningsEntry {
  symbol: string;
  date: string; // ISO date
  timing: EarningsTiming;
  daysUntil: number;
  revenueEstimate: string;
  epsEstimate: string;
  historicalNote: string;
}

export interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  sentiment: Sentiment;
  impactScore: number; // 1-10
  source: string;
  sourceCredibility: "High" | "Medium" | "Low";
  publishedAt: string; // ISO datetime
}

export interface GeoRiskEvent {
  id: string;
  title: string;
  summary: string;
  countries: string[];
  potentialImpact: string;
  affectedSectors: string[];
  riskScore: number; // 1-10
  lastUpdated: string; // ISO datetime
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
}

export interface PortfolioInsight {
  symbol: string;
  riskLevel: ImpactLevel;
  catalysts: { label: string; type: "bullish" | "bearish"; impact: ImpactLevel }[];
}
