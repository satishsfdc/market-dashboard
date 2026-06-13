"use client";

import { useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { watchlistDefault } from "@/lib/mock-data";
import { Panel } from "./ui";
import { formatNumber, formatSigned } from "@/lib/utils";
import { WatchlistStock } from "@/types";

function randomQuote(symbol: string): WatchlistStock {
  const price = 50 + Math.random() * 500;
  const changePercent = (Math.random() - 0.5) * 4;
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Holdings`,
    price,
    change: (price * changePercent) / 100,
    changePercent,
  };
}

export function Watchlist() {
  const [stocks, setStocks] = useState<WatchlistStock[]>(watchlistDefault);
  const [input, setInput] = useState("");

  function addStock() {
    const symbol = input.trim().toUpperCase();
    if (!symbol) return;
    if (stocks.some((s) => s.symbol === symbol)) {
      setInput("");
      return;
    }
    setStocks([...stocks, randomQuote(symbol)]);
    setInput("");
  }

  function removeStock(symbol: string) {
    setStocks(stocks.filter((s) => s.symbol !== symbol));
  }

  return (
    <Panel eyebrow="Watchlist" title="My Stocks">
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
        {stocks.length === 0 && (
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
