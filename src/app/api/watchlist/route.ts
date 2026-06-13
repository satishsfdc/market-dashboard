import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@vercel/postgres";

// Single-user demo: all symbols are stored in one shared table since
// there's currently only one login. If multi-user auth is added later,
// add a user_id column and filter by it.

function getClient() {
  // POSTGRES_URL is typically the pooled connection string Vercel provides.
  // Fall back to DATABASE_URL if that's what's configured instead.
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  return createClient({ connectionString });
}

async function ensureTable(client: ReturnType<typeof getClient>) {
  await client.sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      added_at TIMESTAMPTZ DEFAULT now()
    );
  `;
}

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META"];

export async function GET() {
  const client = getClient();
  try {
    await client.connect();
    await ensureTable(client);

    const { rows } = await client.sql`SELECT symbol FROM watchlist ORDER BY added_at ASC;`;

    // Seed with defaults on first run if table is empty
    if (rows.length === 0) {
      for (const symbol of DEFAULT_SYMBOLS) {
        await client.sql`INSERT INTO watchlist (symbol) VALUES (${symbol}) ON CONFLICT (symbol) DO NOTHING;`;
      }
      return NextResponse.json({ symbols: DEFAULT_SYMBOLS });
    }

    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function POST(req: NextRequest) {
  const client = getClient();
  try {
    await client.connect();
    await ensureTable(client);

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const upper = symbol.trim().toUpperCase();
    await client.sql`INSERT INTO watchlist (symbol) VALUES (${upper}) ON CONFLICT (symbol) DO NOTHING;`;

    const { rows } = await client.sql`SELECT symbol FROM watchlist ORDER BY added_at ASC;`;
    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function DELETE(req: NextRequest) {
  const client = getClient();
  try {
    await client.connect();
    await ensureTable(client);

    const symbol = req.nextUrl.searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol query param" }, { status: 400 });
    }

    await client.sql`DELETE FROM watchlist WHERE symbol = ${symbol.toUpperCase()};`;

    const { rows } = await client.sql`SELECT symbol FROM watchlist ORDER BY added_at ASC;`;
    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  } finally {
    await client.end();
  }
}
