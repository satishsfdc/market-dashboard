# Lookout — Market Intelligence Dashboard

A Next.js 15 + TypeScript + Tailwind dashboard for active investors: economic
calendar, watchlists, earnings tracker, news feed with sentiment, global risk
monitor, sector heat map, portfolio impact analysis, AI daily briefing, alerts,
and settings — all running on realistic sample data out of the box.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the demo login screen (any password works).

## Deploy to Vercel (free, ~5 minutes)

1. Push this folder to a GitHub repo.
2. Go to vercel.com -> "Add New Project" -> import the repo.
3. Framework preset: Next.js (auto-detected). No config needed.
4. Click Deploy. You'll get a live URL immediately.

No database or API keys are required to get a working live dashboard --
everything runs on the sample data in `src/lib/mock-data.ts`.

## What's real vs. sample data

| Feature | Status |
|---|---|
| UI, layout, navigation, all 9 sections | Fully built |
| Watchlist add/remove | Functional (in-memory, resets on reload) |
| Economic calendar, earnings, news, risk monitor, heat map | Sample data, structured like real API responses |
| AI Market Briefing | Generates from sample data client-side (swap for OpenAI API call) |
| Login | Demo gate -- any password works |
| Alerts toggles | UI only, no notifications sent yet |

## Connecting real data (optional, do incrementally)

Add keys to `.env.local` (see `.env.example`), then replace the imports in
`src/lib/mock-data.ts` with fetch calls inside each component or a new
`src/lib/api/*.ts` module:

- **Economic calendar**: FRED (free) or Trading Economics
- **Market quotes**: Finnhub (generous free tier) or Polygon.io
- **News + sentiment**: NewsAPI or Financial Modeling Prep
- **AI briefing**: OpenAI API -- send the day's events/news as context, ask for
  a synthesized summary
- **Auth**: swap `LoginScreen` for NextAuth.js, Clerk, or Auth0 with real
  password hashing and session management
- **Persistence**: add a Postgres database (e.g. Vercel Postgres or Supabase)
  + Prisma for per-user watchlists, alert preferences, and saved sessions

## Estimated running costs

- **Free tier (this version, as-is)**: $0/mo on Vercel's free plan
- **With real free-tier APIs** (FRED, Finnhub free, NewsAPI free): still ~$0,
  but rate-limited
- **With paid market data + news + OpenAI for moderate use**: roughly $50-300/mo
- **Adding a database** (Vercel Postgres/Supabase free tier): $0 to start,
  $25+/mo once you exceed free limits

Start free, add one paid API at a time as you need higher rate limits or more
data sources.
