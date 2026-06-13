import { marketIndices } from "@/lib/mock-data";
import { formatNumber, formatSigned } from "@/lib/utils";

export function MarketOverview() {
  const items = [...marketIndices, ...marketIndices];

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-hair)] rounded-lg overflow-hidden">
      <div className="flex overflow-x-hidden">
        <div className="ticker-track flex shrink-0">
          {items.map((idx, i) => {
            const positive = idx.change >= 0;
            return (
              <div
                key={`${idx.symbol}-${i}`}
                className="flex items-center gap-3 px-5 py-3 border-r border-[var(--border-hair-soft)] shrink-0"
              >
                <div>
                  <div className="text-[10px] font-mono-data tracking-wider text-[var(--text-muted)]">
                    {idx.symbol}
                  </div>
                  <div className="text-sm font-semibold font-mono-data">
                    {idx.symbol === "VIX" || idx.symbol === "TNX"
                      ? formatNumber(idx.value, 2)
                      : formatNumber(idx.value, idx.value > 1000 ? 0 : 2)}
                  </div>
                </div>
                <div
                  className="text-xs font-mono-data font-medium"
                  style={{ color: positive ? "var(--bull)" : "var(--bear)" }}
                >
                  {formatSigned(idx.changePercent)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
