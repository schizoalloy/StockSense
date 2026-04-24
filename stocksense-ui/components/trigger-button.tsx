"use client";

import { useState } from "react";
import type { TriggerResponse, WorkflowId } from "@/lib/types";

interface Props {
  wf: WorkflowId;
  title: string;
  description: string;
  icon: "forecast" | "email" | "newsletter";
  index?: number;
}

export function TriggerButton({ wf, title, description, icon, index = 0 }: Props) {
  const [state, setState] = useState<"idle" | "running" | "success" | "error">("idle");
  const [result, setResult] = useState<TriggerResponse | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  async function trigger() {
    setState("running");
    setResult(null);
    setStartedAt(Date.now());
    setElapsed(0);

    // Start a timer to show elapsed seconds while running
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    try {
      const res = await fetch(`/api/trigger/${wf}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runAt: new Date().toISOString() }),
      });
      const json: TriggerResponse = await res.json();
      clearInterval(interval);

      if (!res.ok || json.status === "error") {
        setState("error");
        setResult(json);
      } else {
        setState("success");
        setResult(json);
      }
    } catch (err) {
      clearInterval(interval);
      setState("error");
      setResult({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return (
    <div
      className="card-raised p-7 animate-fade-up flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon + title */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-sm border border-[var(--color-line)] flex items-center justify-center text-[var(--color-accent)]">
          <WorkflowIcon icon={icon} />
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-faint)] font-mono">
          WF-{index + 1}
        </span>
      </div>

      <h3 className="font-display text-[24px] leading-tight text-[var(--color-text)] mb-2">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)] mb-6 flex-1">
        {description}
      </p>

      {/* Button */}
      <button
        onClick={trigger}
        disabled={state === "running"}
        className={`
          relative w-full h-11 rounded-sm text-[11px] tracking-[0.2em] uppercase font-mono font-medium
          transition-all duration-200 border
          ${
            state === "running"
              ? "bg-[var(--color-surface-2)] border-[var(--color-line)] text-[var(--color-text-muted)] cursor-wait"
              : state === "success"
              ? "bg-[rgba(123,168,107,0.14)] border-[rgba(123,168,107,0.3)] text-[var(--color-success)]"
              : state === "error"
              ? "bg-[rgba(232,92,92,0.14)] border-[rgba(232,92,92,0.3)] text-[var(--color-danger)]"
              : "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-ink)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(232,168,87,0.3)]"
          }
        `}
      >
        {state === "idle" && <span>Run Workflow →</span>}
        {state === "running" && (
          <span className="inline-flex items-center gap-2 justify-center">
            <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin-slow" />
            Running · {elapsed}s
          </span>
        )}
        {state === "success" && <span>✓ Completed</span>}
        {state === "error" && <span>✗ Failed — retry</span>}
      </button>

      {/* Result panel */}
      {result && (
        <div className="mt-5 pt-5 border-t border-dashed border-[var(--color-line)] animate-fade-in space-y-3">
          {state === "success" && result.summary_message && (
            <p className="text-[13px] leading-relaxed text-[var(--color-text)] font-serif italic">
              "{result.summary_message}"
            </p>
          )}
          {state === "error" && (
            <p className="text-[12px] text-[var(--color-danger)] font-mono break-words">
              {result.error || "Workflow failed — check n8n logs"}
            </p>
          )}

          {/* Structured results */}
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            {result.forecasts_generated !== undefined && (
              <ResultStat label="Forecasts" value={result.forecasts_generated} />
            )}
            {result.stockout_risks !== undefined && (
              <ResultStat label="Stockout Risks" value={result.stockout_risks} accent />
            )}
            {result.emails_sent !== undefined && (
              <ResultStat label="Emails Sent" value={result.emails_sent} />
            )}
            {result.suppliers_contacted !== undefined && (
              <ResultStat
                label="Suppliers"
                value={result.suppliers_contacted}
              />
            )}
            {result.suppliers_discovered !== undefined && (
              <ResultStat
                label="New Suppliers"
                value={result.suppliers_discovered}
              />
            )}
            {result.skipped && (
              <div className="col-span-2 text-[var(--color-text-muted)] italic">
                Skipped: {result.skip_reason}
              </div>
            )}
            {startedAt && (
              <ResultStat
                label="Duration"
                value={`${Math.round((Date.now() - startedAt) / 1000)}s`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-faint)] mb-1">
        {label}
      </div>
      <div
        className={`font-display tabular text-[20px] leading-none ${
          accent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function WorkflowIcon({ icon }: { icon: "forecast" | "email" | "newsletter" }) {
  if (icon === "forecast") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 20 L3 4 M3 20 L21 20" />
        <path d="M6 16 L10 10 L14 13 L20 6" />
        <circle cx="20" cy="6" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (icon === "email") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="M3 7 L12 13 L21 7" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M7 9 L17 9 M7 13 L17 13 M7 17 L13 17" />
    </svg>
  );
}
