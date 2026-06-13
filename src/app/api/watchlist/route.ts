import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Single-user demo: all symbols are stored in one shared table since
// there's currently only one login. If multi-user auth is added later,
// add a user_id column and filter by it.

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("No database connection string configured (POSTGRES_URL / DATABASE_URL)");
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    max: 1,
  });
  return pool;
}

async function ensureTable() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      added_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META"];

export async function GET() {
  try {
    await ensureTable();
    const db = getPool();

    const { rows } = await db.query("SELECT symbol FROM watchlist ORDER BY added_at ASC;");

    if (rows.length === 0) {
      for (const symbol of DEFAULT_SYMBOLS) {
        await db.query("INSERT INTO watchlist (symbol) VALUES ($1) ON CONFLICT (symbol) DO NOTHING;", [symbol]);
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
    const db = getPool();

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const upper = symbol.trim().toUpperCase();
    await db.query("INSERT INTO watchlist (symbol) VALUES ($1) ON CONFLICT (symbol) DO NOTHING;", [upper]);

    const { rows } = await db.query("SELECT symbol FROM watchlist ORDER BY added_at ASC;");
    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureTable();
    const db = getPool();

    const symbol = req.nextUrl.searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol query param" }, { status: 400 });
    }

    await db.query("DELETE FROM watchlist WHERE symbol = $1;", [symbol.toUpperCase()]);

    const { rows } = await db.query("SELECT symbol FROM watchlist ORDER BY added_at ASC;");
    return NextResponse.json({ symbols: rows.map((r) => r.symbol as string) });
  } catch (err) {
    return NextResponse.json({ error: "Database error: " + String(err) }, { status: 500 });
  }
}
