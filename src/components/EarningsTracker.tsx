"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { earningsTracker as fallbackEarnings, watchlistDefault } from "@/lib/mock-data";
import { Panel, Badge } from "./ui";
import { daysUntilColor, daysUntilBg, formatEventDate } from "@/lib/utils";
import { EarningsEntry } from "@/types";

export function EarningsTracker() {
  const [entries, setEntries] = useState<EarningsEntry[]>(fallbackEarnings);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const symbols = watchlistDefault.map((s) => s.symbol).join(",");
        const res = await fetch(`/api/earnings?symbols=${symbols}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load earnings calendar");
          return;
        }

        const withHistorical: EarningsEntry[] = data.earnings.map((e: Omit<EarningsEntry, "historicalNote">) => ({
          ...e,
          historicalNote: "Historical performance data not available via free API tier",
        }));

        setEntries(withHistorical);
        setLive(true);
      } catch {
        setError("Failed to load earnings calendar");
      }
    }
    load();
  }, []);

  return (
    <Panel
      eyebrow="Earnings Tracker"
      title="Upcoming Earnings (Next 30 Days)"
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
          {error}. Showing sample data — check FINNHUB_API_KEY is set correctly.
        </div>
      )}
      {entries.length === 0 && (
        <div className="text-sm text-[var(--text-muted)] text-center py-6">
          No earnings reports in the next 30 days for your watchlist.
        </div>
      )}
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={`${entry.symbol}-${entry.date}`}
            className="flex items-center justify-between gap-3 p-3 rounded-md border border-[var(--border-hair-soft)]"
            style={{ backgroundColor: daysUntilBg(entry.daysUntil) }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold font-mono-data">{entry.symbol}</span>
                <Badge color={daysUntilColor(entry.daysUntil)}>
                  {entry.daysUntil === 0 ? "Today" : `${entry.daysUntil}d`}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Clock size={12} />
                {formatEventDate(entry.date)} · {entry.timing}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{entry.historicalNote}</div>
            </div>
            <div className="text-right shrink-0 font-mono-data">
              <div className="text-xs text-[var(--text-secondary)]">
                Rev <span className="text-[var(--text-primary)]">{entry.revenueEstimate}</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                EPS <span className="text-[var(--text-primary)]">{entry.epsEstimate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
