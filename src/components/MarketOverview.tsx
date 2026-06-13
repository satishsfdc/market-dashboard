"use client";

import { useState, useEffect } from "react";
import { marketIndices as fallbackIndices } from "@/lib/mock-data";
import { formatNumber, formatSigned } from "@/lib/utils";
import { MarketIndex } from "@/types";

interface QuoteResult {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  error?: boolean;
}

// Finnhub free tier doesn't expose index/commodity tickers directly,
// so we use widely-tracked ETF/crypto proxies as stand-ins.
const PROXIES: { symbol: string; label: string; finnhubSymbol: string }[] = [
  { symbol: "SPY", label: "S&P 500 (SPY)", finnhubSymbol: "SPY" },
  { symbol: "QQQ", label: "Nasdaq (QQQ)", finnhubSymbol: "QQQ" },
  { symbol: "DIA", label: "Dow Jones (DIA)", finnhubSymbol: "DIA" },
  { symbol: "IWM", label: "Russell 2000 (IWM)", finnhubSymbol: "IWM" },
  { symbol: "VIXY", label: "VIX (VIXY)", finnhubSymbol: "VIXY" },
  { symbol: "USO", label: "Crude Oil (USO)", finnhubSymbol: "USO" },
  { symbol: "GLD", label: "Gold (GLD)", finnhubSymbol: "GLD" },
  { symbol: "BTC-USD", label: "Bitcoin", finnhubSymbol: "BINANCE:BTCUSDT" },
];

export function MarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>(fallbackIndices);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const symbols = PROXIES.map((p) => p.finnhubSymbol).join(",");
        const res = await fetch(`/api/quotes?symbols=${symbols}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load market data");
          return;
        }

        const updated: MarketIndex[] = PROXIES.map((proxy) => {
          const quote = data.quotes.find((q: QuoteResult) => q.symbol === proxy.finnhubSymbol);
          if (!quote || quote.error) {
            const fallback = fallbackIndices.find((f) => proxy.label.includes(f.name)) ;
            return (
              fallback ?? {
                symbol: proxy.symbol,
                name: proxy.label,
                value: 0,
                change: 0,
                changePercent: 0,
              }
            );
          }
          return {
            symbol: proxy.symbol,
            name: proxy.label,
            value: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
          };
        });

        setIndices(updated);
        setLive(true);
      } catch {
        setError("Failed to load market data");
      }
    }
    load();
  }, []);

  const items = [...indices, ...indices];

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-hair)] rounded-lg overflow-hidden">
      {error && (
        <div className="px-4 py-2 text-xs text-[var(--bear)] border-b border-[var(--border-hair-soft)]">
          {error}. Showing sample data — check FINNHUB_API_KEY is set correctly.
        </div>
      )}
      {live && (
        <div className="px-4 py-1.5 flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)] border-b border-[var(--border-hair-soft)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
          LIVE · via ETF proxies (SPY, QQQ, DIA, IWM, VIXY, USO, GLD) + Bitcoin
        </div>
      )}
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
                    {idx.name}
                  </div>
                  <div className="text-sm font-semibold font-mono-data">
                    {formatNumber(idx.value, idx.value > 1000 ? 0 : 2)}
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
