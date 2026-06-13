import { ImpactLevel, Sentiment } from "@/types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatSigned(value: number, decimals = 2): string {
  const formatted = formatNumber(Math.abs(value), decimals);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function impactColor(impact: ImpactLevel): string {
  switch (impact) {
    case "High":
      return "var(--risk-extreme)";
    case "Medium":
      return "var(--risk-high)";
    case "Low":
      return "var(--risk-low)";
  }
}

export function impactBg(impact: ImpactLevel): string {
  switch (impact) {
    case "High":
      return "rgba(255, 93, 93, 0.12)";
    case "Medium":
      return "rgba(255, 138, 76, 0.12)";
    case "Low":
      return "rgba(61, 220, 151, 0.12)";
  }
}

export function sentimentColor(sentiment: Sentiment): string {
  switch (sentiment) {
    case "Bullish":
      return "var(--bull)";
    case "Bearish":
      return "var(--bear)";
    case "Neutral":
      return "var(--neutral)";
  }
}

export function riskScoreColor(score: number): string {
  if (score >= 8) return "var(--risk-extreme)";
  if (score >= 6) return "var(--risk-high)";
  if (score >= 4) return "var(--risk-med)";
  return "var(--risk-low)";
}

export function daysUntilColor(days: number): string {
  if (days <= 7) return "var(--bear)";
  if (days <= 14) return "var(--risk-high)";
  return "var(--neutral)";
}

export function daysUntilBg(days: number): string {
  if (days <= 7) return "rgba(255, 93, 93, 0.1)";
  if (days <= 14) return "rgba(255, 138, 76, 0.1)";
  return "rgba(245, 215, 110, 0.1)";
}

export function timeAgo(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function countdownTo(isoDate: string, time: string, now: Date = new Date()): string {
  // time like "08:30 ET" - parse hour:minute, treat as ET (UTC-4 approx for simplicity)
  const match = time.match(/(\d{1,2}):(\d{2})/);
  const hours = match ? parseInt(match[1], 10) : 0;
  const minutes = match ? parseInt(match[2], 10) : 0;

  const target = new Date(isoDate + "T00:00:00");
  target.setUTCHours(hours + 4, minutes, 0, 0); // approximate ET -> UTC

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Released";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;

  if (diffDays > 0) return `${diffDays}d ${remHours}h`;
  const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${diffHours}h ${diffMins}m`;
}
