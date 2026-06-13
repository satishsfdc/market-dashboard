import { NextResponse } from "next/server";
import {
  economicEventsThisWeek,
  economicEventsNextWeek,
  earningsTracker,
  geoRiskEvents,
  newsFeed,
  watchlistDefault,
} from "@/lib/mock-data";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  // Build a compact context block from data already in the app.
  const context = {
    watchlist: watchlistDefault.map((s) => s.symbol),
    economicEventsThisWeek: economicEventsThisWeek.map((e) => ({
      name: e.name,
      date: e.date,
      time: e.time,
      impact: e.impact,
      expected: e.expected,
      previous: e.previous,
    })),
    economicEventsNextWeek: economicEventsNextWeek.map((e) => ({
      name: e.name,
      date: e.date,
      time: e.time,
      impact: e.impact,
      expected: e.expected,
      previous: e.previous,
    })),
    earnings: earningsTracker.map((e) => ({
      symbol: e.symbol,
      date: e.date,
      timing: e.timing,
      daysUntil: e.daysUntil,
      revenueEstimate: e.revenueEstimate,
      epsEstimate: e.epsEstimate,
    })),
    news: newsFeed.map((n) => ({
      symbol: n.symbol,
      headline: n.headline,
      sentiment: n.sentiment,
      impactScore: n.impactScore,
    })),
    geoRisks: geoRiskEvents.map((g) => ({
      title: g.title,
      riskScore: g.riskScore,
      affectedSectors: g.affectedSectors,
    })),
  };

  const systemPrompt = `You are a financial markets analyst writing a concise daily briefing for an individual investor. Given structured data about upcoming economic events, earnings, news sentiment, and geopolitical risks, write 5-7 short bullet points covering: today's key events, this week's main risks, earnings to watch, bullish factors, bearish factors, and a portfolio-specific note. Each bullet should be one sentence, plain language, no markdown formatting, no headers. Return ONLY a JSON array of strings, nothing else.`;

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
