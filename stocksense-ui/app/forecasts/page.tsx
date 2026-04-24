import { n8nGetSafe, N8N_ENDPOINTS } from "@/lib/n8n";
import type { Forecast } from "@/lib/types";
import { ForecastTable } from "@/components/forecast-table";

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

export default async function ForecastsPage() {
  const forecasts = await getForecasts();

  return (
    <div className="space-y-8">
      <header className="animate-fade-up">
        <span className="text-[11px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
          Catalogue of the Near Future
        </span>
        <div className="rule-dashed my-4" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1
            className="font-display text-[var(--color-text)] leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300 }}
          >
            Forecast <em className="font-serif italic text-[var(--color-accent)] font-normal">Results</em>
          </h1>
          <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)] font-serif italic md:max-w-md md:text-right">
            {forecasts.length > 0
              ? `${forecasts.length} predictions across ${new Set(forecasts.map((f) => f.region)).size} regions. Sort and filter to find what you need.`
              : "No forecasts loaded yet. Run the forecast workflow from the triggers panel to populate this table."}
          </p>
        </div>
        <div className="rule-dashed mt-4" />
      </header>

      <ForecastTable forecasts={forecasts} />
    </div>
  );
}
