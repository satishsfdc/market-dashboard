"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { Panel } from "./ui";

const alertTypes = [
  { id: "economic", label: "Upcoming economic reports", desc: "CPI, PPI, jobs reports, FOMC decisions" },
  { id: "earnings", label: "Earnings announcements", desc: "Reports for stocks in your watchlist" },
  { id: "breaking", label: "Breaking news", desc: "High-impact news on watchlist stocks" },
  { id: "geo", label: "Geopolitical developments", desc: "Major shifts in global risk events" },
  { id: "stock", label: "Significant stock-specific news", desc: "Sentiment shifts and impact alerts" },
];

const channels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "push", label: "Push", icon: Smartphone },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-9 h-5 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? "var(--signal)" : "var(--border-hair)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--bg-deep)] transition-transform"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

export function AlertsPanel() {
  const [alertState, setAlertState] = useState<Record<string, boolean>>({
    economic: true,
    earnings: true,
    breaking: true,
    geo: false,
    stock: false,
  });
  const [channelState, setChannelState] = useState<Record<string, boolean>>({
    email: true,
    sms: false,
    push: true,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel eyebrow="Alerts" title="Notify me about">
        <div className="space-y-3">
          {alertTypes.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{a.label}</div>
                <div className="text-xs text-[var(--text-muted)]">{a.desc}</div>
              </div>
              <Toggle
                checked={alertState[a.id]}
                onChange={() => setAlertState((s) => ({ ...s, [a.id]: !s[a.id] }))}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Delivery" title="Notification channels">
        <div className="space-y-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium">{c.label}</span>
                </div>
                <Toggle
                  checked={channelState[c.id]}
                  onChange={() => setChannelState((s) => ({ ...s, [c.id]: !s[c.id] }))}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-hair-soft)] flex items-start gap-2 text-xs text-[var(--text-muted)]">
          <Bell size={13} className="mt-0.5 shrink-0" />
          <span>
            Connect SendGrid, Twilio, or Firebase Cloud Messaging to enable real notifications. These
            toggles are stored locally for this demo session.
          </span>
        </div>
      </Panel>
    </div>
  );
}
