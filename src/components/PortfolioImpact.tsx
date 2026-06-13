import { TrendingUp, TrendingDown } from "lucide-react";
import { portfolioInsights } from "@/lib/mock-data";
import { Panel, Badge } from "./ui";
import { impactColor, impactBg } from "@/lib/utils";

export function PortfolioImpact() {
  return (
    <Panel eyebrow="Market Impact Intelligence" title="Portfolio Catalyst Analysis">
      <div className="space-y-3">
        {portfolioInsights.map((insight) => (
          <div key={insight.symbol} className="pb-3 border-b border-[var(--border-hair-soft)] last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold font-mono-data">{insight.symbol}</span>
              <Badge color={impactColor(insight.riskLevel)} bg={impactBg(insight.riskLevel)}>
                {insight.riskLevel} Risk
              </Badge>
            </div>
            <div className="space-y-1.5">
              {insight.catalysts.map((cat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {cat.type === "bullish" ? (
                    <TrendingUp size={13} className="text-[var(--bull)] mt-0.5 shrink-0" />
                  ) : (
                    <TrendingDown size={13} className="text-[var(--bear)] mt-0.5 shrink-0" />
                  )}
                  <span className="text-[var(--text-secondary)] leading-relaxed">
                    {cat.label}{" "}
                    <span className="text-[var(--text-muted)]">({cat.impact} impact)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
