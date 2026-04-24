import { n8nGetSafe, N8N_ENDPOINTS } from "@/lib/n8n";
import type { Forecast } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { RiskHeatmap } from "@/components/risk-heatmap";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getForecasts(): Promise<Forecast[]> {
  const data = await n8nGetSafe<Forecast[] | { data: Forecast[] }>(
    N8N_ENDPOINTS.forecasts,
    []
  );
  if (Array.isArray(data)) return data;
  if (data && "data" in data && Array.isArray(data.data)) return data.data;
  return [];
}

export default async function OverviewPage() {
  const forecasts = await getForecasts();

  const totalProducts = new Set(forecasts.map((f) => f.product_id)).size;
  const highRisk = forecasts.filter(
    (f) => String(f.stockout_risk).toLowerCase() === "high"
  ).length;
  const regions = [...new Set(forecasts.map((f) => String(f.region)))].filter(Boolean);
  const categories = [...new Set(forecasts.map((f) => String(f.category)))].filter(Boolean);
  const lastRunDate = forecasts[0]?.forecast_date || "—";

  return (
    <div className="space-y-10">
      {/* Masthead */}
      <header className="animate-fade-up">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
            Issue № 01 · Week of {new Date().toLocaleDateString("en-MY", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-[11px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
            Demo mode
          </span>
        </div>

        <div className="rule-dashed mb-6" />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1
              className="font-display text-[var(--color-text)] leading-[0.9] tracking-[-0.03em]"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", fontWeight: 300 }}
            >
              The State of
              <br />
              <em className="font-serif italic text-[var(--color-accent)] font-normal">
                Your Supply Chain
              </em>
            </h1>
          </div>
          <div className="md:max-w-sm md:text-right">
            <p className="text-[15px] leading-relaxed text-[var(--color-text-muted)] font-serif italic">
              Automated demand forecasting, supplier outreach, and procurement intelligence — orchestrated by n8n.
            </p>
            <Link
              href="/triggers"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] rounded-sm text-[11px] tracking-[0.2em] uppercase font-mono hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] transition-colors"
            >
              Trigger workflow →
            </Link>
          </div>
        </div>

        <div className="rule-dashed mt-8" />
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Products tracked"
          value={totalProducts}
          hint={`across ${categories.length} categories`}
          delay={50}
        />
        <StatCard
          label="Stockout risks"
          value={highRisk}
          hint={highRisk > 0 ? "requires urgent action" : "none detected"}
          accent={highRisk > 0}
          delay={100}
        />
        <StatCard
          label="Regions covered"
          value={regions.length}
          hint={regions.join(" · ") || "—"}
          delay={150}
        />
        <StatCard
          label="Last forecast"
          value={
            <span className="font-mono text-[24px]">
              {typeof lastRunDate === "string" ? lastRunDate.slice(0, 10) : "—"}
            </span>
          }
          hint="run forecast from triggers panel"
          delay={200}
        />
      </section>

      {/* Heatmap */}
      <section className="animate-fade-up stagger-4">
        <RiskHeatmap forecasts={forecasts} />
      </section>

      {/* Quick actions row */}
      <section className="grid md:grid-cols-3 gap-4 animate-fade-up stagger-5">
        <QuickLink
          href="/forecasts"
          title="Explore forecasts"
          desc="Filter by region, category, risk level. Drill into every product."
        />
        <QuickLink
          href="/contacts"
          title="Supplier contact log"
          desc="Every email sent to every supplier, with context and status."
        />
        <QuickLink
          href="/discovered"
          title="Discovered suppliers"
          desc="Fresh supplier leads from the weekly newsletter run."
        />
      </section>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="card p-6 group hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-[20px] text-[var(--color-text)] leading-tight">
          {title}
        </h3>
        <span className="text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)] font-serif italic">
        {desc}
      </p>
    </Link>
  );
}
