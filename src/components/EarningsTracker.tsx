import { Clock } from "lucide-react";
import { earningsTracker } from "@/lib/mock-data";
import { Panel, Badge } from "./ui";
import { daysUntilColor, daysUntilBg, formatEventDate } from "@/lib/utils";

export function EarningsTracker() {
  const sorted = [...earningsTracker].sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <Panel eyebrow="Earnings Tracker" title="Upcoming Earnings (Next 30 Days)">
      <div className="space-y-2">
        {sorted.map((entry) => (
          <div
            key={entry.symbol}
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
