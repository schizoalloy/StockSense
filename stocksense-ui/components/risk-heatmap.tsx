import type { Forecast } from "@/lib/types";

export function RiskHeatmap({ forecasts }: { forecasts: Forecast[] }) {
  // Build region × category matrix
  const regions = [...new Set(forecasts.map((f) => String(f.region)))]
    .filter(Boolean)
    .sort();
  const categories = [...new Set(forecasts.map((f) => String(f.category)))]
    .filter(Boolean)
    .sort();

  if (regions.length === 0 || categories.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="font-serif italic text-2xl text-[var(--color-text-muted)] mb-2">
          No forecast data yet
        </div>
        <p className="text-sm text-[var(--color-text-faint)]">
          Run the forecast workflow from the Triggers page to populate this heatmap.
        </p>
      </div>
    );
  }

  // For each cell: count products + high-risk count
  function cell(region: string, category: string) {
    const items = forecasts.filter(
      (f) => String(f.region) === region && String(f.category) === category
    );
    const total = items.length;
    const high = items.filter(
      (f) => String(f.stockout_risk).toLowerCase() === "high"
    ).length;
    const pct = total > 0 ? high / total : 0;
    return { total, high, pct, items };
  }

  function cellColor(pct: number, empty: boolean) {
    if (empty) return "bg-[var(--color-surface-2)]";
    if (pct === 0)     return "bg-[rgba(123,168,107,0.08)] hover:bg-[rgba(123,168,107,0.14)]";
    if (pct < 0.25)    return "bg-[rgba(232,168,87,0.10)] hover:bg-[rgba(232,168,87,0.18)]";
    if (pct < 0.5)     return "bg-[rgba(232,168,87,0.20)] hover:bg-[rgba(232,168,87,0.30)]";
    if (pct < 0.75)    return "bg-[rgba(232,92,92,0.18)]  hover:bg-[rgba(232,92,92,0.28)]";
    return "bg-[rgba(232,92,92,0.30)] hover:bg-[rgba(232,92,92,0.42)]";
  }

  function cellTextColor(pct: number, empty: boolean) {
    if (empty) return "text-[var(--color-text-faint)]";
    if (pct >= 0.25) return "text-[var(--color-text)]";
    return "text-[var(--color-text-muted)]";
  }

  return (
    <div className="card-raised overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between px-6 py-5 border-b border-[var(--color-line)]">
        <div>
          <h2 className="font-display text-[26px] leading-none text-[var(--color-text)]">
            Stockout Risk
          </h2>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-text-faint)] mt-2">
            Region × Category — darker cells mean higher risk concentration
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
          <span>Low</span>
          <div className="flex">
            <span className="w-5 h-3 bg-[rgba(123,168,107,0.14)]" />
            <span className="w-5 h-3 bg-[rgba(232,168,87,0.18)]" />
            <span className="w-5 h-3 bg-[rgba(232,168,87,0.30)]" />
            <span className="w-5 h-3 bg-[rgba(232,92,92,0.28)]" />
            <span className="w-5 h-3 bg-[rgba(232,92,92,0.42)]" />
          </div>
          <span>High</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[var(--color-surface)] px-5 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-faint)] font-normal border-b border-[var(--color-line)] z-10">
                Region \ Category
              </th>
              {categories.map((cat) => (
                <th
                  key={cat}
                  className="px-3 py-3 text-center text-[11px] tracking-wide text-[var(--color-text-muted)] font-serif italic font-normal border-b border-[var(--color-line)] min-w-[100px]"
                >
                  {cat}
                </th>
              ))}
              <th className="px-5 py-3 text-right text-[10px] tracking-[0.2em] uppercase text-[var(--color-accent)] font-normal border-b border-[var(--color-line)] border-l border-[var(--color-line-soft)]">
                Σ
              </th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region, ri) => {
              const rowHighTotal = categories.reduce(
                (acc, c) => acc + cell(region, c).high,
                0
              );
              const rowTotal = categories.reduce(
                (acc, c) => acc + cell(region, c).total,
                0
              );
              return (
                <tr
                  key={region}
                  className="animate-fade-up border-t border-[var(--color-line-soft)]"
                  style={{ animationDelay: `${50 + ri * 40}ms` }}
                >
                  <th className="sticky left-0 bg-[var(--color-surface)] px-5 py-0 text-left font-serif italic text-[18px] text-[var(--color-text)] z-10 border-r border-[var(--color-line-soft)]">
                    {region}
                  </th>
                  {categories.map((cat) => {
                    const c = cell(region, cat);
                    const empty = c.total === 0;
                    return (
                      <td
                        key={cat}
                        className={`relative p-0 transition-colors border-l border-[var(--color-line-soft)] ${cellColor(
                          c.pct,
                          empty
                        )}`}
                      >
                        <div
                          className={`flex flex-col items-center justify-center h-16 ${cellTextColor(
                            c.pct,
                            empty
                          )}`}
                        >
                          <span className="font-display tabular text-[22px] leading-none">
                            {empty ? "—" : c.total}
                          </span>
                          {c.high > 0 && (
                            <span className="text-[10px] tracking-wider uppercase mt-1 font-mono text-[var(--color-risk-high)]">
                              {c.high} risk
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-5 py-0 text-right border-l border-[var(--color-line)] bg-[rgba(0,0,0,0.15)]">
                    <div className="flex flex-col items-end justify-center h-16">
                      <span className="font-display tabular text-[20px] leading-none text-[var(--color-text)]">
                        {rowTotal}
                      </span>
                      {rowHighTotal > 0 && (
                        <span className="text-[10px] tracking-wider uppercase mt-1 font-mono text-[var(--color-risk-high)]">
                          {rowHighTotal} risk
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
