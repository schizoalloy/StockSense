import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  accent = false,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="card-raised p-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[10px] tracking-[0.22em] uppercase text-[var(--color-text-muted)]">
          {label}
        </span>
      </div>
      <div
        className={`font-display tabular leading-none ${
          accent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"
        }`}
        style={{ fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)", fontWeight: 300 }}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-3 text-[11px] tracking-wide text-[var(--color-text-faint)] font-mono">
          {hint}
        </div>
      )}
    </div>
  );
}
