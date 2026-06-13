"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MarketOverview } from "@/components/MarketOverview";
import { EconomicCalendar } from "@/components/EconomicCalendar";
import { Watchlist } from "@/components/Watchlist";
import { EarningsTracker } from "@/components/EarningsTracker";
import { NewsFeed } from "@/components/NewsFeed";
import { GlobalRiskMonitor } from "@/components/GlobalRiskMonitor";
import { HeatMap } from "@/components/HeatMap";
import { PortfolioImpact } from "@/components/PortfolioImpact";
import { AIBriefing } from "@/components/AIBriefing";
import { AlertsPanel } from "@/components/AlertsPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LoginScreen } from "@/components/LoginScreen";

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
      {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function DashboardView() {
  return (
    <div>
      <SectionHeading title="Dashboard" subtitle="Your market overview at a glance" />
      <div className="mb-4">
        <MarketOverview />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <EconomicCalendar />
          <Watchlist />
          <HeatMap />
        </div>
        <div className="space-y-4">
          <AIBriefing />
          <PortfolioImpact />
          <EarningsTracker />
        </div>
      </div>
      <div className="mt-4">
        <NewsFeed />
      </div>
      <div className="mt-4">
        <GlobalRiskMonitor />
      </div>
    </div>
  );
}

function CalendarView() {
  return (
    <div>
      <SectionHeading title="Economic Calendar" subtitle="Market-moving events for this week and next" />
      <EconomicCalendar />
    </div>
  );
}

function WatchlistsView() {
  return (
    <div>
      <SectionHeading title="Watchlists" subtitle="Track the stocks that matter to you" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Watchlist />
        <HeatMap />
      </div>
    </div>
  );
}

function EarningsView() {
  return (
    <div>
      <SectionHeading title="Earnings Tracker" subtitle="Upcoming reports and historical performance" />
      <EarningsTracker />
    </div>
  );
}

function NewsView() {
  return (
    <div>
      <SectionHeading title="News" subtitle="Real-time news and sentiment for your watchlist" />
      <NewsFeed />
    </div>
  );
}

function RisksView() {
  return (
    <div>
      <SectionHeading title="Global Risks" subtitle="Geopolitical and macro events affecting markets" />
      <GlobalRiskMonitor />
    </div>
  );
}

function AlertsView() {
  return (
    <div>
      <SectionHeading title="Alerts" subtitle="Choose what you're notified about and how" />
      <AlertsPanel />
    </div>
  );
}

function BriefingView() {
  return (
    <div>
      <SectionHeading title="AI Briefings" subtitle="Daily synthesized market summary" />
      <div className="grid gap-4 lg:grid-cols-2">
        <AIBriefing />
        <PortfolioImpact />
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <SectionHeading title="Settings" subtitle="Account, security, and data source configuration" />
      <SettingsPanel />
    </div>
  );
}

const views: Record<string, () => React.ReactElement> = {
  dashboard: DashboardView,
  calendar: CalendarView,
  watchlists: WatchlistsView,
  earnings: EarningsView,
  news: NewsView,
  risks: RisksView,
  alerts: AlertsView,
  briefing: BriefingView,
  settings: SettingsView,
};

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    fetch("/api/check-auth")
      .then((res) => res.json())
      .then((data) => setAuthed(!!data.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <div className="min-h-screen bg-[var(--bg-deep)]" />;
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  const ActiveView = views[active] ?? DashboardView;

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onSelect={setActive} />
      <div className="flex-1 min-w-0">
        <MobileHeader active={active} onSelect={setActive} />
        <main className="p-4 lg:p-6 max-w-[1400px]">
          <ActiveView />
        </main>
      </div>
    </div>
  );
}
