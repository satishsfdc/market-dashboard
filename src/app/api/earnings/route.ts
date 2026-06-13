import { NextRequest, NextResponse } from "next/server";

interface FinnhubEarningsEntry {
  symbol: string;
  date: string; // YYYY-MM-DD
  hour: string; // "bmo" (before market open), "amc" (after market close), "dmh" (during market hours), or ""
  epsEstimate: number | null;
  revenueEstimate: number | null;
}

function formatRevenue(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

function formatEps(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `$${value.toFixed(2)}`;
}

function timingLabel(hour: string): "Before Open" | "After Close" {
  return hour === "amc" ? "After Close" : "Before Open";
}

function daysBetween(dateStr: string, now: Date): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY not configured" }, { status: 500 });
  }

  const symbolsParam = req.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols query param" }, { status: 400 });
  }
  const symbols = new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean));

  const now = new Date();
  const from = now.toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // 60 days out

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${apiKey}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch earnings calendar" }, { status: 502 });
    }

    const data = await res.json();
    const calendar: FinnhubEarningsEntry[] = data.earningsCalendar || [];

    const filtered = calendar
      .filter((e) => symbols.has(e.symbol.toUpperCase()))
      .map((e) => ({
        symbol: e.symbol.toUpperCase(),
        date: e.date,
        timing: timingLabel(e.hour),
        daysUntil: daysBetween(e.date, now),
        revenueEstimate: formatRevenue(e.revenueEstimate),
        epsEstimate: formatEps(e.epsEstimate),
      }))
      .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return NextResponse.json({ earnings: filtered });
  } catch {
    return NextResponse.json({ error: "Failed to fetch earnings calendar" }, { status: 502 });
  }
}
