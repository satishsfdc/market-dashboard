import { NextResponse } from "next/server";

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

interface GeoRiskResult {
  id: string;
  title: string;
  summary: string;
  countries: string[];
  potentialImpact: string;
  affectedSectors: string[];
  riskScore: number;
  lastUpdated: string;
}

// A small set of search topics covering the categories from the spec.
// Each topic maps to likely countries/sectors for fallback if AI scoring fails.
const RISK_TOPICS: { query: string; countries: string[]; sectors: string[] }[] = [
  { query: "Middle East conflict oil shipping", countries: ["Israel", "Iran"], sectors: ["Energy", "Transportation"] },
  { query: "China Taiwan tensions", countries: ["China", "Taiwan"], sectors: ["Technology", "Semiconductors"] },
  { query: "Russia Ukraine war economy", countries: ["Russia", "Ukraine"], sectors: ["Energy", "Defense", "Agriculture"] },
  { query: "United States tariffs trade", countries: ["United States", "China"], sectors: ["Technology", "Consumer Discretionary"] },
];

async function fetchTopicNews(query: string, apiKey: string): Promise<GNewsArticle[]> {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=1&apikey=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles || [];
}

async function scoreRisks(
  items: { title: string; description: string; sectors: string[] }[],
  openaiKey: string
): Promise<Record<string, { riskScore: number; potentialImpact: string }>> {
  if (items.length === 0) return {};

  const prompt = `For each geopolitical/macro news item below, assess its potential impact on financial markets. Respond with a JSON object where each key is the array index (as a string) and the value is an object with "riskScore" (1-10 integer, 10 = severe market risk) and "potentialImpact" (one short sentence describing the likely market effect). Return ONLY the JSON object, no markdown.

News items:
${items.map((a, i) => `${i}: ${a.title} — ${a.description} (relevant sectors: ${a.sectors.join(", ")})`).join("\n")}`;

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

export async function GET() {
  const gnewsKey = process.env.GNEWS_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!gnewsKey) {
    return NextResponse.json({ error: "GNEWS_API_KEY not configured" }, { status: 500 });
  }

  try {
    const topicResults: { topic: typeof RISK_TOPICS[number]; article: GNewsArticle }[] = [];

    for (const topic of RISK_TOPICS) {
      const articles = await fetchTopicNews(topic.query, gnewsKey);
      if (articles.length > 0) {
        topicResults.push({ topic, article: articles[0] });
      }
    }

    let scores: Record<string, { riskScore: number; potentialImpact: string }> = {};
    if (openaiKey && topicResults.length > 0) {
      scores = await scoreRisks(
        topicResults.map((r) => ({
          title: r.article.title,
          description: r.article.description,
          sectors: r.topic.sectors,
        })),
        openaiKey
      );
    }

    const results: GeoRiskResult[] = topicResults.map((r, i) => {
      const score = scores[String(i)];
      return {
        id: `geo-${i}`,
        title: r.article.title,
        summary: r.article.description,
        countries: r.topic.countries,
        potentialImpact: score?.potentialImpact ?? "Potential market impact unclear without AI scoring.",
        affectedSectors: r.topic.sectors,
        riskScore: score?.riskScore ?? 5,
        lastUpdated: r.article.publishedAt,
      };
    });

    results.sort((a, b) => b.riskScore - a.riskScore);

    return NextResponse.json({ risks: results, scored: !!openaiKey });
  } catch {
    return NextResponse.json({ error: "Failed to fetch geopolitical risk data" }, { status: 502 });
  }
}
