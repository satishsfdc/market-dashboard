"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Search, RefreshCw, Loader2 } from "lucide-react";
import { watchlistDefault } from "@/lib/mock-data";
import { Panel } from "./ui";
import { formatNumber, formatSigned } from "@/lib/utils";
import { WatchlistStock } from "@/types";

interface QuoteResult {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  error?: boolean;
}

function placeholderStock(symbol: string): WatchlistStock {
  const fallback = watchlistDefault.find((s) => s.symbol === symbol);
  return fallback ?? { symbol, name: symbol, price: 0, change: 0, changePercent: 0 };
}

export function Watchlist() {
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async (syms: string[]) => {
    if (syms.length === 0) return;
    setLoadingQuotes(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes?symbols=${syms.join(",")}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load live data");
        setLive(false);
        return;
      }

      setLive(true);
      setStocks((prev) =>
        prev.map((stock) => {
          const quote = data.quotes.find((q: QuoteResult) => q.symbol === stock.symbol);
          if (!quote || quote.error) return stock;
          return {
            ...stock,
            price: quote.price ?? stock.price,
            change: quote.change ?? stock.change,
            changePercent: quote.changePercent ?? stock.changePercent,
          };
        })
      );
    } catch {
      setError("Failed to load live data");
      setLive(false);
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  // Load persisted watchlist symbols on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/watchlist");
        const data = await res.json();

        if (!res.ok) {
          setListError(data.error || "Failed to load watchlist");
          setStocks(watchlistDefault);
          setLoadingList(false);
          fetchQuotes(watchlistDefault.map((s) => s.symbol));
          return;
        }

        const loaded: WatchlistStock[] = data.symbols.map(placeholderStock);
        setStocks(loaded);
        setLoadingList(false);
        fetchQuotes(data.symbols);
      } catch {
        setListError("Failed to load watchlist");
        setStocks(watchlistDefault);
        setLoadingList(false);
        fetchQuotes(watchlistDefault.map((s) => s.symbol));
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addStock() {
    const symbol = input.trim().toUpperCase();
    if (!symbol) return;
    if (stocks.some((s) => s.symbol === symbol)) {
      setInput("");
      return;
    }

    setInput("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();

      if (!res.ok) {
        setListError(data.error || "Failed to save");
        return;
      }

      const updated: WatchlistStock[] = data.symbols.map(placeholderStock);
      setStocks(updated);
      fetchQuotes([symbol]);
    } catch {
      setListError("Failed to save watchlist");
    }
  }

  async function removeStock(symbol: string) {
    try {
      const res = await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setListError(data.error || "Failed to remove");
        return;
      }

      const updated: WatchlistStock[] = data.symbols.map(placeholderStock);
      setStocks((prev) => updated.map((s) => prev.find((p) => p.symbol === s.symbol) ?? s));
    } catch {
      setListError("Failed to remove from watchlist");
    }
  }

  return (
    <Panel
      eyebrow="Watchlist"
      title="My Stocks"
      action={
        <div className="flex items-center gap-2">
          {live && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono-data text-[var(--bull)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
              LIVE
            </span>
          )}
          <button
            onClick={() => fetchQuotes(stocks.map((s) => s.symbol))}
            disabled={loadingQuotes}
            aria-label="Refresh quotes"
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-raised)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loadingQuotes ? "animate-spin" : ""} />
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
          {error}. Showing sample prices — check FINNHUB_API_KEY is set correctly.
        </div>
      )}
      {listError && (
        <div className="mb-3 text-xs text-[var(--bear)] bg-[var(--bear-dim)] border border-[var(--bear)] rounded-md px-3 py-2">
          {listError}. Watchlist changes may not be saved — check database connection.
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addStock()}
            placeholder="Add ticker symbol (e.g. AMD)"
            className="w-full bg-[var(--bg-deep)] border border-[var(--border-hair)] rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--signal)] transition-colors"
          />
        </div>
        <button
          onClick={addStock}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--signal)] text-[var(--bg-deep)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add
        </button>
      </div>

      <div className="space-y-1">
        {loadingList && (
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] py-6">
            <Loader2 size={14} className="animate-spin" />
            Loading watchlist...
          </div>
        )}
        {!loadingList && stocks.length === 0 && (
          <div className="text-sm text-[var(--text-muted)] text-center py-6">
            No stocks yet. Add a ticker to start tracking.
          </div>
        )}
        {stocks.map((stock) => {
          const positive = stock.change >= 0;
          return (
            <div
              key={stock.symbol}
              className="group flex items-center justify-between gap-3 py-2.5 px-2 rounded-md hover:bg-[var(--bg-panel-raised)] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold font-mono-data">{stock.symbol}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate">{stock.name}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-mono-data font-medium">${formatNumber(stock.price)}</div>
                  <div
                    className="text-xs font-mono-data"
                    style={{ color: positive ? "var(--bull)" : "var(--bear)" }}
                  >
                    {formatSigned(stock.change)} ({formatSigned(stock.changePercent)}%)
                  </div>
                </div>
                <button
                  onClick={() => removeStock(stock.symbol)}
                  aria-label={`Remove ${stock.symbol} from watchlist`}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--bear)] transition-all p-1"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
