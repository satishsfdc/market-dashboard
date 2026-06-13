import { KeyRound, Palette, Shield, User } from "lucide-react";
import { Panel } from "./ui";

const apiSlots = [
  { name: "FRED (Economic Calendar)", env: "FRED_API_KEY", status: "Not connected" },
  { name: "Polygon.io (Market Data)", env: "POLYGON_API_KEY", status: "Not connected" },
  { name: "Finnhub (Market Data)", env: "FINNHUB_API_KEY", status: "Not connected" },
  { name: "NewsAPI (News Feed)", env: "NEWSAPI_KEY", status: "Not connected" },
  { name: "OpenAI (AI Briefings)", env: "OPENAI_API_KEY", status: "Not connected" },
];

export function SettingsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel eyebrow="Account" title="Profile">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-panel-raised)] border border-[var(--border-hair)] flex items-center justify-center">
            <User size={18} className="text-[var(--text-secondary)]" />
          </div>
          <div>
            <div className="text-sm font-medium">Demo User</div>
            <div className="text-xs text-[var(--text-muted)]">demo@lookout.app</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] mb-2">
          <Shield size={14} />
          Two-factor authentication
          <span className="ml-auto text-xs text-[var(--text-muted)]">Not enabled</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
          <Palette size={14} />
          Theme
          <span className="ml-auto text-xs text-[var(--text-muted)]">Dark (default)</span>
        </div>
      </Panel>

      <Panel eyebrow="Integrations" title="Data source API keys">
        <div className="space-y-2.5 mb-3">
          {apiSlots.map((slot) => (
            <div key={slot.env} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="font-medium">{slot.name}</div>
                <div className="text-[11px] font-mono-data text-[var(--text-muted)]">{slot.env}</div>
              </div>
              <span className="text-[11px] font-mono-data text-[var(--text-muted)] flex items-center gap-1.5">
                <KeyRound size={11} />
                {slot.status}
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[var(--text-muted)] leading-relaxed pt-3 border-t border-[var(--border-hair-soft)]">
          Add keys as environment variables in your Vercel project settings, then wire them
          into the data-fetching functions in <span className="font-mono-data">src/lib</span>.
          The dashboard runs on sample data until real keys are connected.
        </div>
      </Panel>
    </div>
  );
}
