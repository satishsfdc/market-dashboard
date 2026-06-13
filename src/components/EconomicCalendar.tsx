"use client";

import { useEffect, useState } from "react";
import { Panel, Badge } from "./ui";
import { impactColor, impactBg, formatEventDate, countdownTo } from "@/lib/utils";
import { UpcomingEvent, splitEventsByWeek } from "@/lib/upcoming-events";

interface FredSeriesResult {
  key: string;
  seriesId?: string;
  latestValue: string | null;
  latestDate: string | null;
  previousValue: string | null;
  previousDate: string | null;
  error?: boolean | string;
}

// Reverse-lookup: FRED series ID -> friendly key used by /api/economic-data
const SERIES_KEY_BY_ID: Record<string, string> = {
  CPIAUCSL: "CPI",
  CPILFESL: "CORE_CPI",
  PPIACO: "PPI",
  UNRATE: "UNEMPLOYMENT",
  FEDFUNDS: "FED_FUNDS",
  GDP: "GDP",
  RSAFS: "RETAIL_SALES",
  UMCSENT: "CONSUMER_SENTIMENT",
};

function formatFredValue(value: string | null, seriesId?: string): string {
  if (value === null || value === undefined) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  if (seriesId === "UNRATE" || seriesId === "FEDFUNDS") return `${num.toFixed(2)}%`;
  if (seriesId === "GDP" || seriesId === "RSAFS") return `$${(num / 1000).toFixed(2)}T`;
  return num.toFixed(2);
}

function EventRow({
  event,
  now,
  fredData,
}: {
  event: UpcomingEvent;
  now: Date;
  fredData: Record<string, FredSeriesResult>;
}) {
  const seriesData = event.fredSeries ? fredData[SERIES_KEY_BY_ID[event.fredSeries]] : undefined;
  const expected = seriesData ? formatFredValue(seriesData.latestValue, event.fredSeries) : "—";
  const previous = seriesData ? formatFredValue(seriesData.previousValue, event.fredSeries) : "—";

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[var(--border-hair-soft)] last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono-data text-[var(--text-muted)] whitespace-nowrap">
            {formatEventDate(event.date)} · {event.time}
          </span>
          <Badge color={impactColor(event.impact)} bg={impactBg(event.impact)}>
            {event.impact}
          </Badge>
        </div>
        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{event.name}</div>
        {seriesData ? (
          <div className="text-xs text-[var(--text-secondary)] mt-1 font-mono-data">
            Latest <span className="text-[var(--text-primary)]">{expected}</span>{" "}
            <span className="text-[var(--text-muted)]">({seriesData.latestDate})</span> · Prev{" "}
            <span className="text-[var(--text-primary)]">{previous}</span>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)] mt-1 font-mono-data">No FRED series for this event</div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase mb-0.5">Countdown</div>
        <div className="text-sm font-mono-data font-semibold" style={{ color: impactColor(event.impact) }}>
          {countdownTo(event.date, event.time, now)}
        </div>
      </div>
    </div>
  );
}

export function EconomicCalendar() {
  const [now, setNow] = useState<Date | null>(null);
  const [tab, setTab] = useState<"this" | "next">("this");
  const [fredData, setFredData] = useState<Record<string, FredSeriesResult>>({});
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/economic-data");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load economic data");
          return;
        }
        const map: Record<string, FredSeriesResult> = {};
        for (const series of data.series) {
          map[series.key] = series;
        }
        setFredData(map);
        setLive(true);
      } catch {
        setError("Failed to load economic data");
      }
    }
    load();
  }, []);

  const { thisWeek, nextWeek } = now ? splitEventsByWeek(now) : { thisWeek: [], nextWeek: [] };
  const events = tab === "this" ? thisWeek : nextWeek;

  return (
    <Panel
      eyebrow="Economic Calendar"
      title="Market-Moving Events"
      action={
        <div className="flex items-center gap-2">
          {live && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
              LIVE
            </span>
          )}
          <div className="flex gap-1 bg-[var(--bg-deep)] rounded-md p-0.5 border border-[var(--border-hair)]">
            <button
              onClick={() => setTab("this")}
              className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                tab === "this" ? "bg-[var(--bg-panel-raised)] text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTab("next")}
              className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                tab === "next" ? "bg-[var(--bg-panel-raised)] text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}
            >
              Next Week
            </button>
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
          {error}. Latest values unavailable — check FRED_API_KEY is set correctly.
        </div>
      )}
      {now && events.length === 0 && (
        <div className="text-sm text-[var(--text-muted)] text-center py-6">No major events scheduled.</div>
      )}
      {now &&
        events.map((event) => <EventRow key={event.id} event={event} now={now} fredData={fredData} />)}
    </Panel>
  );
}
