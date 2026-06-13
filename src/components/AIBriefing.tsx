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
} from "@/lib/mock-data";

function buildBriefing(): string[] {
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

  function generate() {
    setGenerating(true);
    setBriefing(null);
    setTimeout(() => {
      setBriefing(buildBriefing());
      setGenerating(false);
    }, 1100);
  }

  return (
    <Panel eyebrow="AI Market Briefing" title="Daily Summary">
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
