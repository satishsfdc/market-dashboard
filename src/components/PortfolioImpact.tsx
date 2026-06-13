"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { portfolioInsights as fallbackInsights, watchlistDefault } from "@/lib/mock-data";
import { Panel, Badge } from "./ui";
import { impactColor, impactBg } from "@/lib/utils";
import { PortfolioInsight } from "@/types";

export function PortfolioImpact() {
  const [insights, setInsights] = useState<PortfolioInsight[]>(fallbackInsights);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Get current watchlist symbols
        const watchlistRes = await fetch("/api/watchlist");
        const watchlistData = await watchlistRes.json();
        const symbols: string[] = watchlistRes.ok ? watchlistData.symbols : watchlistDefault.map((s) => s.symbol);

        // Get live news for context (best-effort, ignore failures)
        let news: { symbol: string; headline: string; sentiment: string; impactScore: number }[] = [];
        try {
          const newsRes = await fetch(`/api/news?symbols=${symbols.join(",")}`);
          const newsData = await newsRes.json();
          if (newsRes.ok) {
            news = newsData.news.map((n: { symbol: string; headline: string; sentiment: string; impactScore: number }) => ({
              symbol: n.symbol,
              headline: n.headline,
              sentiment: n.sentiment,
              impactScore: n.impactScore,
            }));
          }
        } catch {
          // ignore, proceed without news context
        }

        // Get live earnings for context (best-effort)
        let earnings: { symbol: string; date: string; timing: string; daysUntil: number }[] = [];
        try {
          const earningsRes = await fetch(`/api/earnings?symbols=${symbols.join(",")}`);
          const earningsData = await earningsRes.json();
          if (earningsRes.ok) {
            earnings = earningsData.earnings.map((e: { symbol: string; date: string; timing: string; daysUntil: number }) => ({
              symbol: e.symbol,
              date: e.date,
              timing: e.timing,
              daysUntil: e.daysUntil,
            }));
          }
        } catch {
          // ignore
        }

        const res = await fetch("/api/portfolio-impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols, news, earnings }),
        });
        const data = await res.json();

        if (!res.ok || !Array.isArray(data.insights)) {
          setError(data.error || "Failed to generate portfolio analysis");
          setLoading(false);
          return;
        }

        setInsights(data.insights);
        setLive(true);
        setLoading(false);
      } catch {
        setError("Failed to generate portfolio analysis");
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Panel
      eyebrow="Market Impact Intelligence"
      title="Portfolio Catalyst Analysis"
      action={
        live ? (
          <span className="flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)]">
            <Sparkles size={11} />
            AI-GENERATED
          </span>
        ) : undefined
      }
    >
      {error && (
        <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
          {error}. Showing sample analysis — check OPENAI_API_KEY is set correctly.
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] py-8">
          <Loader2 size={14} className="animate-spin" />
          Analyzing portfolio catalysts...
        </div>
      )}
      {!loading && (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.symbol} className="pb-3 border-b border-[var(--border-hair-soft)] last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold font-mono-data">{insight.symbol}</span>
                <Badge color={impactColor(insight.riskLevel)} bg={impactBg(insight.riskLevel)}>
                  {insight.riskLevel} Risk
                </Badge>
              </div>
              <div className="space-y-1.5">
                {insight.catalysts.map((cat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {cat.type === "bullish" ? (
                      <TrendingUp size={13} className="text-[var(--bull)] mt-0.5 shrink-0" />
                    ) : (
                      <TrendingDown size={13} className="text-[var(--bear)] mt-0.5 shrink-0" />
                    )}
                    <span className="text-[var(--text-secondary)] leading-relaxed">
                      {cat.label} <span className="text-[var(--text-muted)]">({cat.impact} impact)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
