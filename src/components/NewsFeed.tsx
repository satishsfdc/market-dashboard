"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { newsFeed as fallbackNews, watchlistDefault } from "@/lib/mock-data";
import { Panel, Badge, Pill } from "./ui";
import { sentimentColor, timeAgo } from "@/lib/utils";
import { NewsItem } from "@/types";

const filters = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
] as const;

export function NewsFeed() {
  const [filter, setFilter] = useState<"24h" | "7d" | "30d">("7d");
  const [items, setItems] = useState<NewsItem[]>(fallbackNews);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [sentimentScored, setSentimentScored] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const symbols = watchlistDefault.map((s) => s.symbol).join(",");
        const res = await fetch(`/api/news?symbols=${symbols}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load news");
          setLoading(false);
          return;
        }

        setItems(data.news);
        setSentimentScored(!!data.sentimentScored);
        setLive(true);
        setLoading(false);
      } catch {
        setError("Failed to load news");
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();
  const cutoffHours = filter === "24h" ? 24 : filter === "7d" ? 24 * 7 : 24 * 30;

  const filtered = items.filter((item) => {
    const hours = (now.getTime() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    return hours <= cutoffHours;
  });

  return (
    <Panel
      eyebrow="News Feed"
      title="Watchlist News"
      action={
        <div className="flex items-center gap-2">
          {live && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
              LIVE
            </span>
          )}
          <div className="flex gap-1 bg-[var(--bg-deep)] rounded-md p-0.5 border border-[var(--border-hair)]">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
                  filter === f.id ? "bg-[var(--bg-panel-raised)] text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
          {error}. Showing sample news — check GNEWS_API_KEY is set correctly.
        </div>
      )}
      {live && !sentimentScored && (
        <div className="mb-3 text-xs text-[var(--neutral)] bg-[var(--bg-deep)] border border-[var(--border-hair)] rounded-md px-3 py-2">
          Live headlines loaded, but sentiment scoring unavailable — check OPENAI_API_KEY.
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] py-8">
          <Loader2 size={14} className="animate-spin" />
          Loading news...
        </div>
      )}
      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-sm text-[var(--text-muted)] text-center py-6">No news in this window.</div>
          )}
          {filtered.map((item) => (
            <div key={item.id} className="pb-3 border-b border-[var(--border-hair-soft)] last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Pill>${item.symbol}</Pill>
                <Badge color={sentimentColor(item.sentiment)}>{item.sentiment}</Badge>
                <span className="text-[10px] font-mono-data text-[var(--text-muted)] ml-auto">
                  {timeAgo(item.publishedAt, now)}
                </span>
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{item.headline}</div>
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed mb-1.5">{item.summary}</div>
              <div className="flex items-center gap-3 text-[11px] font-mono-data text-[var(--text-muted)]">
                <span>{item.source}</span>
                <span>·</span>
                <span>{item.sourceCredibility} credibility</span>
                <span>·</span>
                <span>Impact {item.impactScore}/10</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
