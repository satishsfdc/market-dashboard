import { NextRequest, NextResponse } from "next/server";

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

interface NewsItemResult {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  impactScore: number;
  source: string;
  sourceCredibility: "High" | "Medium" | "Low";
  publishedAt: string;
}

const HIGH_CREDIBILITY_SOURCES = [
  "reuters",
  "bloomberg",
  "the wall street journal",
  "financial times",
  "cnbc",
  "associated press",
  "ap news",
];

function credibilityFor(sourceName: string): "High" | "Medium" | "Low" {
  const lower = sourceName.toLowerCase();
  if (HIGH_CREDIBILITY_SOURCES.some((s) => lower.includes(s))) return "High";
  return "Medium";
}

// Company name lookup for better GNews search results (ticker alone is noisy)
const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  NVDA: "NVIDIA",
  TSLA: "Tesla",
  AMZN: "Amazon",
  META: "Meta",
  GOOGL: "Google",
  GOOG: "Google",
  AMD: "AMD",
  NFLX: "Netflix",
};

async function fetchNewsForSymbol(symbol: string, apiKey: string): Promise<GNewsArticle[]> {
  const query = COMPANY_NAMES[symbol] ?? symbol;
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query + " stock")}&lang=en&max=3&apikey=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles || [];
}

async function scoreSentiment(
  articles: { symbol: string; title: string; description: string }[],
  openaiKey: string
): Promise<Record<string, { sentiment: "Bullish" | "Neutral" | "Bearish"; impactScore: number }>> {
  if (articles.length === 0) return {};

  const prompt = `For each news item below, assess its likely impact on the stock's price. Respond with a JSON object where each key is the array index (as a string) and the value is an object with "sentiment" (one of "Bullish", "Neutral", "Bearish") and "impactScore" (1-10 integer, where 10 is highly impactful). Return ONLY the JSON object.

News items:
${articles.map((a, i) => `${i}: [${a.symbol}] ${a.title} — ${a.description}`).join("\n")}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!res.ok) return {};
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest) {
  const gnewsKey = process.env.GNEWS_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!gnewsKey) {
    return NextResponse.json({ error: "GNEWS_API_KEY not configured" }, { status: 500 });
  }

  const symbolsParam = req.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols query param" }, { status: 400 });
  }
  const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 6);

  try {
    // Fetch news for each symbol (sequential to respect rate limits on free tier)
    const allArticles: { symbol: string; article: GNewsArticle }[] = [];
    for (const symbol of symbols) {
      const articles = await fetchNewsForSymbol(symbol, gnewsKey);
      for (const article of articles) {
        allArticles.push({ symbol, article });
      }
    }

    // Score sentiment via OpenAI if configured; otherwise default to Neutral
    let scores: Record<string, { sentiment: "Bullish" | "Neutral" | "Bearish"; impactScore: number }> = {};
    if (openaiKey && allArticles.length > 0) {
      scores = await scoreSentiment(
        allArticles.map((a) => ({ symbol: a.symbol, title: a.article.title, description: a.article.description })),
        openaiKey
      );
    }

    const results: NewsItemResult[] = allArticles.map((item, i) => {
      const score = scores[String(i)];
      return {
        id: `news-${i}`,
        symbol: item.symbol,
        headline: item.article.title,
        summary: item.article.description,
        sentiment: score?.sentiment ?? "Neutral",
        impactScore: score?.impactScore ?? 5,
        source: item.article.source?.name ?? "Unknown",
        sourceCredibility: credibilityFor(item.article.source?.name ?? ""),
        publishedAt: item.article.publishedAt,
      };
    });

    // Sort newest first
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ news: results, sentimentScored: !!openaiKey });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 502 });
  }
}
