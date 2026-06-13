import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-panel)] border border-[var(--border-hair)] rounded-lg",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-hair-soft)]">
          <div>
            {eyebrow && (
              <div className="text-[10px] font-mono-data tracking-widest text-[var(--text-muted)] uppercase mb-0.5">
                {eyebrow}
              </div>
            )}
            {title && <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Badge({
  children,
  color,
  bg,
}: {
  children: ReactNode;
  color: string;
  bg?: string;
}) {
  return (
    <span
      className="text-[11px] font-mono-data font-medium px-2 py-0.5 rounded-md whitespace-nowrap"
      style={{ color, backgroundColor: bg ?? "transparent", border: bg ? "none" : `1px solid ${color}` }}
    >
      {children}
    </span>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full border border-[var(--border-hair)] text-[var(--text-secondary)] whitespace-nowrap">
      {children}
    </span>
  );
}
