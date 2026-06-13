"use client";

import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  TrendingUp,
  Newspaper,
  Globe2,
  Menu,
  X,
  Bell,
  Sparkles,
  Settings,
  Activity,
} from "lucide-react";
import { useState } from "react";
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

export function MobileHeader({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeLabel = navItems.find((n) => n.id === active)?.label ?? "Dashboard";

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-[var(--bg-panel)] border-b border-[var(--border-hair)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[var(--signal)] flex items-center justify-center">
            <Activity size={16} className="text-[var(--bg-deep)]" strokeWidth={2.5} />
          </div>
          <div className="text-sm font-semibold">{activeLabel}</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-panel-raised)]"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="px-3 pb-3 grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-3 rounded-md text-[11px]",
                  isActive
                    ? "bg-[var(--bg-panel-raised)] text-[var(--signal)]"
                    : "text-[var(--text-secondary)]"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
