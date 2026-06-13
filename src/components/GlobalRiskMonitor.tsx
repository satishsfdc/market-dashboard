import { geoRiskEvents } from "@/lib/mock-data";
import { Panel, Pill } from "./ui";
import { riskScoreColor, timeAgo } from "@/lib/utils";

export function GlobalRiskMonitor() {
  const now = new Date("2026-06-12T14:00:00Z");
  const sorted = [...geoRiskEvents].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <Panel eyebrow="Global Risk Monitor" title="Geopolitical & Macro Events">
      <div className="space-y-3">
        {sorted.map((event) => (
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
    </Panel>
  );
}
