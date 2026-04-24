"use client";

import { useMemo, useState } from "react";
import type { Forecast } from "@/lib/types";
import { StatusPill, riskVariant, confidenceVariant } from "./status-pill";

type SortKey = "product_id" | "category" | "region" | "predicted_demand" | "confidence" | "stockout_risk";

export function ForecastTable({ forecasts }: { forecasts: Forecast[] }) {
  const [regionFilter, setRegion]   = useState<string>("all");
  const [categoryFilter, setCat]    = useState<string>("all");
  const [riskFilter, setRisk]       = useState<string>("all");
  const [search, setSearch]         = useState<string>("");
  const [sortKey, setSortKey]       = useState<SortKey>("stockout_risk");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");

  const regions = useMemo(
    () => [...new Set(forecasts.map((f) => String(f.region)))].sort(),
    [forecasts]
  );
  const categories = useMemo(
    () => [...new Set(forecasts.map((f) => String(f.category)))].sort(),
    [forecasts]
  );

  const filtered = useMemo(() => {
    let arr = forecasts.filter((f) => {
      if (regionFilter !== "all" && String(f.region) !== regionFilter) return false;
      if (categoryFilter !== "all" && String(f.category) !== categoryFilter) return false;
      if (riskFilter !== "all" && String(f.stockout_risk).toLowerCase() !== riskFilter) return false;
      if (search && !String(f.product_id).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    arr = [...arr].sort((a, b) => {
      let av: string | number = (a[sortKey] ?? "") as string | number;
      let bv: string | number = (b[sortKey] ?? "") as string | number;

      // For numeric columns: coerce
      if (sortKey === "predicted_demand") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      }
      // For risk: high > low
      if (sortKey === "stockout_risk") {
        const rank = (v: string | number) => (String(v).toLowerCase() === "high" ? 1 : 0);
        av = rank(av);
        bv = rank(bv);
      }
      // For confidence
      if (sortKey === "confidence") {
        const rank = (v: string | number) => {
          const s = String(v).toLowerCase();
          if (s === "high") return 3;
          if (s === "medium") return 2;
          if (s === "low") return 1;
          return 0;
        };
        av = rank(av);
        bv = rank(bv);
      }

      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [forecasts, regionFilter, categoryFilter, riskFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function headerCell(label: string, key: SortKey, align: "left" | "right" | "center" = "left") {
    const active = sortKey === key;
    return (
      <th
        onClick={() => toggleSort(key)}
        className={`
          sticky top-0 bg-[var(--color-surface)] px-3 py-3 font-normal cursor-pointer select-none
          text-[10px] tracking-[0.18em] uppercase
          transition-colors hover:text-[var(--color-text)]
          ${active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}
          ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
          border-b border-[var(--color-line)]
        `}
      >
        <span className="inline-flex items-center gap-1.5">
          {label}
          {active && (
            <span className="text-[8px]">{sortDir === "asc" ? "▲" : "▼"}</span>
          )}
        </span>
      </th>
    );
  }

  return (
    <div className="card-raised overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[var(--color-line)]">
        <input
          type="text"
          placeholder="Search product ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-[var(--color-canvas)] border border-[var(--color-line)] rounded-sm px-3 py-2 text-[13px] font-mono text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
        />

        <FilterSelect label="Region" value={regionFilter} onChange={setRegion} options={regions} />
        <FilterSelect label="Category" value={categoryFilter} onChange={setCat} options={categories} />
        <FilterSelect label="Risk" value={riskFilter} onChange={setRisk} options={["high", "low"]} />

        <div className="ml-auto text-[11px] tracking-[0.18em] uppercase text-[var(--color-text-faint)] font-mono">
          {filtered.length} / {forecasts.length} results
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headerCell("Product", "product_id")}
              {headerCell("Category", "category")}
              {headerCell("Region", "region")}
              {headerCell("Predicted", "predicted_demand", "right")}
              {headerCell("Confidence", "confidence", "center")}
              {headerCell("Risk", "stockout_risk", "center")}
              <th className="sticky top-0 bg-[var(--color-surface)] px-3 py-3 text-left text-[10px] tracking-[0.18em] uppercase text-[var(--color-text-muted)] font-normal border-b border-[var(--color-line)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="font-serif italic text-xl text-[var(--color-text-muted)]">
                    No forecasts match these filters
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((f, i) => (
                <tr
                  key={`${f.product_id}-${f.region}-${i}`}
                  className="border-t border-[var(--color-line-soft)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="px-3 py-2.5 font-mono text-[13px] text-[var(--color-text)]">
                    {f.product_id}
                  </td>
                  <td className="px-3 py-2.5 text-[13px] text-[var(--color-text-muted)] font-serif italic">
                    {f.category}
                  </td>
                  <td className="px-3 py-2.5 text-[13px] text-[var(--color-text-muted)]">
                    {f.region}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular text-[14px] text-[var(--color-text)]">
                    {f.predicted_demand}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusPill variant={confidenceVariant(String(f.confidence))}>
                      {f.confidence}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusPill variant={riskVariant(String(f.stockout_risk))} dot>
                      {f.stockout_risk}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-[var(--color-text-muted)] max-w-xs truncate">
                    <span className="text-[var(--color-text)]">{f.recomended_action}</span>
                    {f.action_detail && (
                      <span className="text-[var(--color-text-faint)]"> — {f.action_detail}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-faint)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--color-canvas)] border border-[var(--color-line)] rounded-sm px-2 py-1.5 text-[12px] font-mono text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none cursor-pointer"
      >
        <option value="all">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
