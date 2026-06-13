"use client";

import { useState, useEffect } from "react";
import { sectorPerformance as fallbackSectors, watchlistDefault } from "@/lib/mock-data";
import { Panel } from "./ui";
import { formatSigned } from "@/lib/utils";

interface SectorData {
  sector: string;
  changePercent: number;
}

interface MoverData {
  symbol: string;
  changePercent: number;
}

interface QuoteResult {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  error?: boolean;
}

const SECTOR_ETFS: { symbol: string; sector: string }[] = [
  { symbol: "XLK", sector: "Technology" },
  { symbol: "XLE", sector: "Energy" },
  { symbol: "XLF", sector: "Financials" },
  { symbol: "XLV", sector: "Healthcare" },
  { symbol: "XLI", sector: "Industrials" },
  { symbol: "XLY", sector: "Consumer Disc." },
  { symbol: "XLU", sector: "Utilities" },
  { symbol: "XLRE", sector: "Real Estate" },
];

export function HeatMap() {
  const [sectors, setSectors] = useState<SectorData[]>(fallbackSectors);
  const [gainers, setGainers] = useState<MoverData[]>([]);
  const [losers, setLosers] = useState<MoverData[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch sector ETFs + watchlist stocks in one call
        const watchlistSymbols = watchlistDefault.map((s) => s.symbol);
        const sectorSymbols = SECTOR_ETFS.map((e) => e.symbol);
        const allSymbols = [...sectorSymbols, ...watchlistSymbols];

        const res = await fetch(`/api/quotes?symbols=${allSymbols.join(",")}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load market data");
          return;
        }

        const quotes: QuoteResult[] = data.quotes;

        // Build sector performance from ETF quotes
        const liveSectors: SectorData[] = SECTOR_ETFS.map((etf) => {
          const quote = quotes.find((q) => q.symbol === etf.symbol);
          const fallback = fallbackSectors.find((s) => s.sector === etf.sector);
          return {
            sector: etf.sector,
            changePercent: (!quote || quote.error) ? (fallback?.changePercent ?? 0) : (quote.changePercent ?? 0),
          };
        }).sort((a, b) => b.changePercent - a.changePercent);

        // Build movers from watchlist quotes
        const watchlistQuotes: MoverData[] = watchlistSymbols
          .map((symbol) => {
            const quote = quotes.find((q) => q.symbol === symbol);
            return {
              symbol,
              changePercent: (!quote || quote.error) ? 0 : (quote.changePercent ?? 0),
            };
          })
          .filter((q) => q.changePercent !== 0);

        const sortedGainers = [...watchlistQuotes]
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, 3);

        const sortedLosers = [...watchlistQuotes]
          .sort((a, b) => a.changePercent - b.changePercent)
          .slice(0, 3);

        setSectors(liveSectors);
        setGainers(sortedGainers);
        setLosers(sortedLosers);
        setLive(true);
      } catch {
        setError("Failed to load market data");
      }
    }
    load();
  }, []);

  const maxAbs = Math.max(...sectors.map((s) => Math.abs(s.changePercent)), 0.01);

  return (
    <Panel
      eyebrow="Heat Map"
      title="Sector Performance & Movers"
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
      <div className="grid grid-cols-2 gap-4">
        {/* Sector bars */}
        <div className="space-y-1.5">
          {sectors.map((sector) => {
            const positive = sector.changePercent >= 0;
            const intensity = Math.min(Math.abs(sector.changePercent) / maxAbs, 1);
            return (
              <div key={sector.sector} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-secondary)] truncate">{sector.sector}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-[var(--bg-deep)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
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
          {live && (
            <div className="text-[10px] text-[var(--text-muted)] font-mono-data pt-1">
              via XLK, XLE, XLF, XLV, XLI, XLY, XLU, XLRE
            </div>
          )}
        </div>

        {/* Gainers / Losers */}
        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-mono-data tracking-widest text-[var(--text-muted)] uppercase mb-1.5">
              Top Gainers
            </div>
            <div className="space-y-1">
              {(gainers.length > 0 ? gainers : watchlistDefault.slice(0, 3).map((s) => ({
                symbol: s.symbol,
                changePercent: s.changePercent,
              }))).map((s) => (
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
              {(losers.length > 0 ? losers : watchlistDefault.slice(-3).map((s) => ({
                symbol: s.symbol,
                changePercent: s.changePercent,
              }))).map((s) => (
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
