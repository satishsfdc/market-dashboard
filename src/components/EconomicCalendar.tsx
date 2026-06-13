"use client";

import { useEffect, useState } from "react";
import { economicEventsThisWeek, economicEventsNextWeek } from "@/lib/mock-data";
import { Panel, Badge } from "./ui";
import { impactColor, impactBg, formatEventDate, countdownTo } from "@/lib/utils";
import { EconomicEvent } from "@/types";

function EventRow({ event, now }: { event: EconomicEvent; now: Date }) {
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
        <div className="text-xs text-[var(--text-secondary)] mt-1 font-mono-data">
          Exp <span className="text-[var(--text-primary)]">{event.expected}</span> · Prev{" "}
          <span className="text-[var(--text-primary)]">{event.previous}</span>
        </div>
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

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const events = tab === "this" ? economicEventsThisWeek : economicEventsNextWeek;

  return (
    <Panel
      eyebrow="Economic Calendar"
      title="Market-Moving Events"
      action={
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
      }
    >
      {now &&
        events.map((event) => <EventRow key={event.id} event={event} now={now} />)}
    </Panel>
  );
}
