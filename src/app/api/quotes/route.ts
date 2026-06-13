import { NextRequest, NextResponse } from "next/server";

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number;
  l: number;
  o: number;
  pc: number; // previous close
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

  const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          return { symbol, error: true };
        }
        const data: FinnhubQuote = await res.json();
        // Finnhub returns all zeros for invalid symbols rather than an error
        if (data.c === 0 && data.pc === 0) {
          return { symbol, error: true };
        }
        return {
          symbol,
          price: data.c,
          change: data.d,
          changePercent: data.dp,
        };
      })
    );

    return NextResponse.json({ quotes: results });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 502 });
  }
}
