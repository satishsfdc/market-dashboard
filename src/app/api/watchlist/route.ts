import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Single-user demo: all symbols are stored in one shared table since
// there's currently only one login. If multi-user auth is added later,
// add a user_id column and filter by it.

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      added_at TIMESTAMPTZ DEFAULT now()
    );
  `;
}

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META"];

export async function GET() {
  try {
    await ensureTable();

    const { rows } = await sql`SELECT symbol FROM watchlist ORDER BY added_at ASC;`;

    // Seed with defaults on first run if table is empty
    if (rows.length === 0) {
      for (const symbol of DEFAULT_SYMBOLS) {
        await sql`INSERT INTO watchlist (symbol) VALUES (${symbol}) ON CONFLICT (symbol) DO NOTHING;`;
      }
      return NextResponse.json({ symbols: DEFAULT_SYMBOLS });
    }

    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const upper = symbol.trim().toUpperCase();
    await sql`INSERT INTO watchlist (symbol) VALUES (${upper}) ON CONFLICT (symbol) DO NOTHING;`;

    const { rows } = await sql`SELECT symbol FROM watchlist ORDER BY added_at ASC;`;
    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureTable();

    const symbol = req.nextUrl.searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol query param" }, { status: 400 });
    }

    await sql`DELETE FROM watchlist WHERE symbol = ${symbol.toUpperCase()};`;

    const { rows } = await sql`SELECT symbol FROM watchlist ORDER BY added_at ASC;`;
    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  }
}
