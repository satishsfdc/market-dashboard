"use client";

import { useState } from "react";
import { newsFeed } from "@/lib/mock-data";
import { Panel, Badge, Pill } from "./ui";
import { sentimentColor, timeAgo } from "@/lib/utils";

const filters = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
] as const;

export function NewsFeed() {
  const [filter, setFilter] = useState<"24h" | "7d" | "30d">("7d");

  const now = new Date("2026-06-12T14:00:00Z");
  const cutoffHours = filter === "24h" ? 24 : filter === "7d" ? 24 * 7 : 24 * 30;

  const filtered = newsFeed.filter((item) => {
    const hours = (now.getTime() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    return hours <= cutoffHours;
  });

  return (
    <Panel
      eyebrow="News Feed"
      title="Watchlist News"
      action={
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
      }
    >
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-sm text-[var(--text-muted)] text-center py-6">
            No news in this window.
          </div>
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
    </Panel>
  );
}
