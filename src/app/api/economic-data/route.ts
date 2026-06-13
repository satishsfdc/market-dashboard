import { NextRequest, NextResponse } from "next/server";

// Maps friendly names to FRED series IDs
const SERIES_MAP: Record<string, string> = {
  CPI: "CPIAUCSL", // Consumer Price Index
  CORE_CPI: "CPILFESL", // Core CPI (less food & energy)
  PPI: "PPIACO", // Producer Price Index
  UNEMPLOYMENT: "UNRATE", // Unemployment Rate
  FED_FUNDS: "FEDFUNDS", // Federal Funds Effective Rate
  GDP: "GDP", // Gross Domestic Product
  RETAIL_SALES: "RSAFS", // Retail Sales
  CONSUMER_SENTIMENT: "UMCSENT", // U Mich Consumer Sentiment
};

interface FredObservation {
  date: string;
  value: string;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FRED_API_KEY not configured" }, { status: 500 });
  }

  const seriesParam = req.nextUrl.searchParams.get("series");
  const keys = seriesParam
    ? seriesParam.split(",").map((s) => s.trim().toUpperCase())
    : Object.keys(SERIES_MAP);

  try {
    const results = await Promise.all(
      keys.map(async (key) => {
        const seriesId = SERIES_MAP[key];
        if (!seriesId) return { key, error: "Unknown series" };

        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return { key, error: true };

        const data = await res.json();
        const observations: FredObservation[] = data.observations || [];

        const latest = observations[0];
        const previous = observations[1];

        return {
          key,
          seriesId,
          latestValue: latest?.value ?? null,
          latestDate: latest?.date ?? null,
          previousValue: previous?.value ?? null,
          previousDate: previous?.date ?? null,
        };
      })
    );

    return NextResponse.json({ series: results });
  } catch {
    return NextResponse.json({ error: "Failed to fetch FRED data" }, { status: 502 });
  }
}
