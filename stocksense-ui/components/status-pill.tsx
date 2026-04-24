import type { ReactNode } from "react";

type Variant = "high" | "low" | "medium" | "success" | "danger" | "neutral" | "accent";

const STYLES: Record<Variant, string> = {
  high:    "bg-[rgba(232,92,92,0.12)] text-[var(--color-risk-high)] border border-[rgba(232,92,92,0.25)]",
  medium:  "bg-[rgba(232,168,87,0.12)] text-[var(--color-risk-med)] border border-[rgba(232,168,87,0.25)]",
  low:     "bg-[rgba(123,168,107,0.12)] text-[var(--color-risk-low)] border border-[rgba(123,168,107,0.25)]",
  success: "bg-[rgba(123,168,107,0.12)] text-[var(--color-success)] border border-[rgba(123,168,107,0.25)]",
  danger:  "bg-[rgba(232,92,92,0.12)] text-[var(--color-danger)] border border-[rgba(232,92,92,0.25)]",
  neutral: "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-line)]",
  accent:  "bg-[var(--color-accent-glow)] text-[var(--color-accent)] border border-[rgba(232,168,87,0.3)]",
};

export function StatusPill({
  variant = "neutral",
  children,
  dot = false,
}: {
  variant?: Variant;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] tracking-[0.15em] uppercase font-mono font-medium whitespace-nowrap ${STYLES[variant]}`}
    >
      {dot && <span className="w-1 h-1 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// Helper — picks a variant based on a risk string
export function riskVariant(risk: string | undefined): Variant {
  if (!risk) return "neutral";
  const r = risk.toLowerCase();
  if (r === "high") return "high";
  if (r === "medium" || r === "med") return "medium";
  if (r === "low") return "low";
  return "neutral";
}

// Helper — picks a variant based on confidence
export function confidenceVariant(c: string | undefined): Variant {
  if (!c) return "neutral";
  const v = c.toLowerCase();
  if (v === "high") return "success";
  if (v === "medium") return "medium";
  if (v === "low") return "danger";
  return "neutral";
}
