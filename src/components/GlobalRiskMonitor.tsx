"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { geoRiskEvents as fallbackRisks } from "@/lib/mock-data";
import { Panel, Pill } from "./ui";
import { riskScoreColor, timeAgo } from "@/lib/utils";
import { GeoRiskEvent } from "@/types";

export function GlobalRiskMonitor() {
  const [risks, setRisks] = useState<GeoRiskEvent[]>(fallbackRisks);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [scored, setScored] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/geo-risks");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load geopolitical risk data");
          setLoading(false);
          return;
        }

        if (data.risks.length > 0) {
          setRisks(data.risks);
          setLive(true);
          setScored(!!data.scored);
        }
        setLoading(false);
      } catch {
        setError("Failed to load geopolitical risk data");
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();

  return (
    <Panel
      eyebrow="Global Risk Monitor"
      title="Geopolitical & Macro Events"
      action={
        live ? (
          <span className="flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
            LIVE
          </span>
        ) : undefined
      }
    >
      {error && (
        <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
          {error}. Showing sample data — check GNEWS_API_KEY is set correctly.
        </div>
      )}
      {live && !scored && (
        <div className="mb-3 text-xs text-[var(--neutral)] bg-[var(--bg-deep)] border border-[var(--border-hair)] rounded-md px-3 py-2">
          Live headlines loaded, but risk scoring unavailable — check OPENAI_API_KEY.
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] py-8">
          <Loader2 size={14} className="animate-spin" />
          Loading risk monitor...
        </div>
      )}
      {!loading && (
        <div className="space-y-3">
          {risks.map((event) => (
            <div key={event.id} className="pb-3 border-b border-[var(--border-hair-soft)] last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="text-sm font-medium text-[var(--text-primary)] leading-snug">{event.title}</div>
                <div
                  className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center font-mono-data text-sm font-bold border"
                  style={{
                    color: riskScoreColor(event.riskScore),
                    borderColor: riskScoreColor(event.riskScore),
                    backgroundColor: `${riskScoreColor(event.riskScore)}1a`,
                  }}
                >
                  {event.riskScore}
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{event.summary}</div>
              <div className="text-xs text-[var(--text-secondary)] mb-2">
                <span className="text-[var(--text-muted)]">Potential impact: </span>
                {event.potentialImpact}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {event.countries.map((c) => (
                  <Pill key={c}>{c}</Pill>
                ))}
                {event.affectedSectors.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
                <span className="text-[10px] font-mono-data text-[var(--text-muted)] ml-auto">
                  Updated {timeAgo(event.lastUpdated, now)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
