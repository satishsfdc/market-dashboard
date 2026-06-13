import { sectorPerformance, watchlistDefault } from "@/lib/mock-data";
import { Panel } from "./ui";
import { formatSigned } from "@/lib/utils";

export function HeatMap() {
  const sorted = [...sectorPerformance].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = [...watchlistDefault].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const losers = [...watchlistDefault].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s.changePercent)));

  return (
    <Panel eyebrow="Heat Map" title="Sector Performance & Movers">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          {sorted.map((sector) => {
            const positive = sector.changePercent >= 0;
            const intensity = Math.min(Math.abs(sector.changePercent) / maxAbs, 1);
            return (
              <div key={sector.sector} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-secondary)] truncate">{sector.sector}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-[var(--bg-deep)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${intensity * 100}%`,
                        backgroundColor: positive ? "var(--bull)" : "var(--bear)",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono-data font-medium w-12 text-right"
                    style={{ color: positive ? "var(--bull)" : "var(--bear)" }}
                  >
                    {formatSigned(sector.changePercent)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-mono-data tracking-widest text-[var(--text-muted)] uppercase mb-1.5">
              Top Gainers
            </div>
            <div className="space-y-1">
              {gainers.map((s) => (
                <div key={s.symbol} className="flex items-center justify-between text-xs">
                  <span className="font-mono-data font-medium">{s.symbol}</span>
                  <span className="font-mono-data" style={{ color: "var(--bull)" }}>
                    {formatSigned(s.changePercent)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono-data tracking-widest text-[var(--text-muted)] uppercase mb-1.5">
              Top Losers
            </div>
            <div className="space-y-1">
              {losers.map((s) => (
                <div key={s.symbol} className="flex items-center justify-between text-xs">
                  <span className="font-mono-data font-medium">{s.symbol}</span>
                  <span className="font-mono-data" style={{ color: "var(--bear)" }}>
                    {formatSigned(s.changePercent)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
