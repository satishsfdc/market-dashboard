import { NextRequest, NextResponse } from "next/server";
import { geoRiskEvents } from "@/lib/mock-data";
import { splitEventsByWeek } from "@/lib/upcoming-events";

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
  revenueEstimate?: string;
  epsEstimate?: string;
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
    // empty body is fine, fall back to defaults
  }

  const symbols = body.symbols ?? [];
  const news = body.news ?? [];
  const earnings = body.earnings ?? [];

  const now = new Date();
  const { thisWeek, nextWeek } = splitEventsByWeek(now);

  const topRisks = [...geoRiskEvents]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3)
    .map((g) => ({ title: g.title, riskScore: g.riskScore, affectedSectors: g.affectedSectors }));

  const context = {
    watchlist: symbols,
    economicEventsThisWeek: thisWeek.map((e) => ({ name: e.name, date: e.date, time: e.time, impact: e.impact })),
    economicEventsNextWeek: nextWeek.map((e) => ({ name: e.name, date: e.date, time: e.time, impact: e.impact })),
    earnings,
    news,
    geoRisks: topRisks,
  };

  const systemPrompt = `You are a financial markets analyst writing a concise daily briefing for an individual investor. Given structured data about upcoming economic events, earnings, news sentiment, and geopolitical risks, write 5-7 short bullet points covering: today's key events, this week's main risks, earnings to watch, bullish factors, bearish factors, and a portfolio-specific note. Each bullet should be one sentence, plain language, no markdown formatting, no headers. If a data category is empty, skip that topic rather than inventing information. Return ONLY a JSON array of strings, nothing else.`;

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
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: `OpenAI error: ${errBody}` }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "[]";

    let lines: string[];
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      lines = JSON.parse(cleaned);
    } catch {
      lines = [content];
    }

    return NextResponse.json({ briefing: lines });
  } catch {
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 502 });
  }
}
