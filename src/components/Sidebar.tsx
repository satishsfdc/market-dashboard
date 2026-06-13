"use client";

import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  TrendingUp,
  Newspaper,
  Globe2,
  Bell,
  Sparkles,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Calendar", icon: CalendarDays, id: "calendar" },
  { label: "Watchlists", icon: ListChecks, id: "watchlists" },
  { label: "Earnings", icon: TrendingUp, id: "earnings" },
  { label: "News", icon: Newspaper, id: "news" },
  { label: "Global Risks", icon: Globe2, id: "risks" },
  { label: "Alerts", icon: Bell, id: "alerts" },
  { label: "AI Briefings", icon: Sparkles, id: "briefing" },
  { label: "Settings", icon: Settings, id: "settings" },
];

export function Sidebar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-[var(--border-hair)] bg-[var(--bg-panel)] h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-[var(--border-hair)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[var(--signal)] flex items-center justify-center">
            <Activity size={16} className="text-[var(--bg-deep)]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight leading-none">Lookout</div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono-data tracking-wider mt-0.5">
              MARKET INTEL
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                isActive
                  ? "bg-[var(--bg-panel-raised)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-panel-raised)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon
                size={16}
                className={isActive ? "text-[var(--signal)]" : ""}
                strokeWidth={2}
              />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-[var(--signal)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--border-hair)]">
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono-data">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] pulse-dot" />
          <span>MARKET OPEN</span>
        </div>
      </div>
    </aside>
  );
}
