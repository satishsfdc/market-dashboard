"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Panel } from "./ui";
import {
  economicEventsThisWeek,
  economicEventsNextWeek,
  earningsTracker,
  geoRiskEvents,
  newsFeed,
  watchlistDefault,
} from "@/lib/mock-data";

// Fallback briefing built from sample data, used if OpenAI isn't configured
// or the request fails.
function buildFallbackBriefing(): string[] {
  const todayEvents = economicEventsThisWeek.slice(0, 2);
  const keyRisk = [...geoRiskEvents].sort((a, b) => b.riskScore - a.riskScore)[0];
  const nearEarnings = [...earningsTracker].sort((a, b) => a.daysUntil - b.daysUntil)[0];
  const bullish = newsFeed.find((n) => n.sentiment === "Bullish");
  const bearish = newsFeed.find((n) => n.sentiment === "Bearish");
  const fomc = economicEventsNextWeek.find((e) => e.name.includes("FOMC"));

  return [
    `Today's calendar includes ${todayEvents.map((e) => e.name).join(" and ")}, both watched closely for signals on inflation trends.`,
    `The most significant near-term risk this week: ${keyRisk.title.toLowerCase()}, currently rated ${keyRisk.riskScore}/10 with potential effects on ${keyRisk.affectedSectors.join(", ").toLowerCase()}.`,
    `${nearEarnings.symbol} reports earnings in ${nearEarnings.daysUntil} day${nearEarnings.daysUntil === 1 ? "" : "s"} (${nearEarnings.timing.toLowerCase()}), with consensus estimates of ${nearEarnings.revenueEstimate} revenue and ${nearEarnings.epsEstimate} EPS.`,
    fomc
      ? `Next week's FOMC rate decision is the dominant macro catalyst — markets currently expect rates to hold at ${fomc.expected}.`
      : `No major Fed events scheduled in the coming days.`,
    bullish
      ? `Bullish factor: ${bullish.headline.toLowerCase()}, flagged with an impact score of ${bullish.impactScore}/10.`
      : `No standout bullish catalysts identified today.`,
    bearish
      ? `Bearish factor: ${bearish.headline.toLowerCase()}, flagged with an impact score of ${bearish.impactScore}/10.`
      : `No standout bearish catalysts identified today.`,
    `Portfolio note: positions in higher-risk names tied to upcoming earnings or geopolitical exposure may see elevated volatility through the FOMC decision on June 18.`,
  ];
}

export function AIBriefing() {
  const [generating, setGenerating] = useState(false);
  const [briefing, setBriefing] = useState<string[] | null>(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setBriefing(null);
    setError(null);

    try {
      // Get current watchlist
      const watchlistRes = await fetch("/api/watchlist");
      const watchlistData = await watchlistRes.json();
      const symbols: string[] = watchlistRes.ok ? watchlistData.symbols : watchlistDefault.map((s) => s.symbol);

      // Get live earnings (best-effort)
      let earnings: unknown[] = [];
      try {
        const earningsRes = await fetch(`/api/earnings?symbols=${symbols.join(",")}`);
        const earningsData = await earningsRes.json();
        if (earningsRes.ok) earnings = earningsData.earnings;
      } catch {
        // ignore
      }

      // Get live news (best-effort)
      let news: unknown[] = [];
      try {
        const newsRes = await fetch(`/api/news?symbols=${symbols.join(",")}`);
        const newsData = await newsRes.json();
        if (newsRes.ok) news = newsData.news;
      } catch {
        // ignore
      }

      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, earnings, news }),
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.briefing) && data.briefing.length > 0) {
        setBriefing(data.briefing);
        setAiPowered(true);
      } else {
        setError(data.error || "AI briefing unavailable");
        setBriefing(buildFallbackBriefing());
        setAiPowered(false);
      }
    } catch {
      setError("AI briefing unavailable");
      setBriefing(buildFallbackBriefing());
      setAiPowered(false);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Panel
      eyebrow="AI Market Briefing"
      title="Daily Summary"
      action={
        aiPowered ? (
          <span className="flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
            AI-GENERATED
          </span>
        ) : undefined
      }
    >
      {!briefing && !generating && (
        <div className="text-center py-6">
          <div className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm mx-auto">
            Generate a synthesized briefing covering today&apos;s events, key risks, earnings to watch,
            and portfolio-specific insights based on your watchlist.
          </div>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--signal)] text-[var(--bg-deep)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Sparkles size={15} />
            Generate Today&apos;s Market Brief
          </button>
        </div>
      )}

      {generating && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--text-secondary)]">
          <Loader2 size={16} className="animate-spin" />
          Synthesizing today&apos;s briefing&hellip;
        </div>
      )}

      {briefing && (
        <div>
          {error && (
            <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
              {error}. Showing a sample briefing — check OPENAI_API_KEY is set correctly.
            </div>
          )}
          <div className="space-y-2.5 mb-4">
            {briefing.map((line, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--signal)] shrink-0" />
                <span>{line}</span>
              </div>
            ))}
          </div>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-hair)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--signal)] transition-colors"
          >
            <Sparkles size={13} />
            Regenerate
          </button>
        </div>
      )}
    </Panel>
  );
}
