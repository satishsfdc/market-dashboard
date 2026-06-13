import { NextRequest, NextResponse } from "next/server";
import { geoRiskEvents } from "@/lib/mock-data";
import { upcomingEvents, splitEventsByWeek } from "@/lib/upcoming-events";

interface NewsItemInput {
  symbol: string;
  headline: string;
  sentiment: string;
  impactScore: number;
}

interface EarningsItemInput {
  symbol: string;
  date: string;
  timing: string;
  daysUntil: number;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  let body: { symbols?: string[]; news?: NewsItemInput[]; earnings?: EarningsItemInput[] } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const symbols = body.symbols ?? [];
  const news = body.news ?? [];
  const earnings = body.earnings ?? [];

  const now = new Date();
  const { thisWeek, nextWeek } = splitEventsByWeek(now);
  const upcoming = [...thisWeek, ...nextWeek].map((e) => ({
    name: e.name,
    date: e.date,
    impact: e.impact,
  }));

  const topRisks = [...geoRiskEvents]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3)
    .map((g) => ({ title: g.title, riskScore: g.riskScore, affectedSectors: g.affectedSectors }));

  const context = {
    watchlist: symbols,
    upcomingEconomicEvents: upcoming,
    earnings,
    news,
    geoRisks: topRisks,
  };

  const systemPrompt = `You are a financial analyst. Given a watchlist of stock symbols plus context on upcoming economic events, earnings dates, recent news sentiment, and geopolitical risks, produce a catalyst analysis for EACH symbol in the watchlist.

For each symbol, identify an overall risk level ("High", "Medium", or "Low") and 2-3 specific catalysts (upcoming events, earnings, news, or geopolitical factors) that could move the stock, each labeled as "bullish" or "bearish" with an impact level ("High", "Medium", or "Low").

Return ONLY a JSON array, one object per symbol, in this exact shape:
[
  {
    "symbol": "AAPL",
    "riskLevel": "Medium",
    "catalysts": [
      { "label": "short description of the catalyst", "type": "bullish", "impact": "Medium" }
    ]
  }
]

No markdown, no explanation, just the JSON array. Cover every symbol in the watchlist provided.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(context) },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: `OpenAI error: ${errBody}` }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "[]";

    let insights;
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      insights = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
    }

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ error: "Failed to generate portfolio analysis" }, { status: 502 });
  }
}
