import { n8nGetSafe, N8N_ENDPOINTS } from "@/lib/n8n";
import type { DiscoveredSupplier } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDiscovered(): Promise<DiscoveredSupplier[]> {
  const data = await n8nGetSafe<DiscoveredSupplier[] | { data: DiscoveredSupplier[] }>(
    N8N_ENDPOINTS.discoveredSuppliers,
    []
  );
  if (Array.isArray(data)) return data;
  if (data && "data" in data && Array.isArray(data.data)) return data.data;
  return [];
}

function cleanEmail(e: string) {
  return (e || "").replace(/^.*?:\s*/, "").trim();
}

export default async function DiscoveredPage() {
  const suppliers = await getDiscovered();

  // Filter out "no_results" placeholders
  const real = suppliers.filter(
    (s) => s.status !== "no_results" && s.primary_email && s.company_name
  );

  // Group by week → category
  const byWeek = new Map<string, DiscoveredSupplier[]>();
  for (const s of real) {
    const key = s.week_label || "Unknown week";
    const arr = byWeek.get(key) || [];
    arr.push(s);
    byWeek.set(key, arr);
  }

  const weeks = Array.from(byWeek.entries()).sort((a, b) => {
    // newest first — parse the discovered_at timestamps
    const aDate = a[1][0]?.discovered_at || "";
    const bDate = b[1][0]?.discovered_at || "";
    return bDate.localeCompare(aDate);
  });

  // Category tally for the whole archive
  const categoryTally = new Map<string, number>();
  for (const s of real) {
    categoryTally.set(s.category, (categoryTally.get(s.category) || 0) + 1);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-up">
        <span className="text-[11px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
          Weekly Dispatches
        </span>
        <div className="rule-dashed my-4" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1
            className="font-display text-[var(--color-text)] leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300 }}
          >
            Discovered <em className="font-serif italic text-[var(--color-accent)] font-normal">Suppliers</em>
          </h1>
          <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)] font-serif italic md:max-w-md md:text-right">
            {real.length > 0
              ? `${real.length} new suppliers discovered across ${byWeek.size} weekly runs. Every entry was scraped from public search results.`
              : "Run the supplier discovery workflow to populate this archive."}
          </p>
        </div>
        <div className="rule-dashed mt-4" />
      </header>

      {/* Category tally */}
      {categoryTally.size > 0 && (
        <section className="flex flex-wrap items-center gap-3 animate-fade-up stagger-2">
          <span className="text-[10px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
            Archive totals:
          </span>
          {Array.from(categoryTally.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <span
                key={cat}
                className="inline-flex items-baseline gap-2 px-3 py-1.5 border border-[var(--color-line)] rounded-sm bg-[var(--color-surface)]"
              >
                <span className="text-[13px] font-serif italic text-[var(--color-text)]">
                  {cat}
                </span>
                <span className="font-mono tabular text-[12px] text-[var(--color-accent)]">
                  {count}
                </span>
              </span>
            ))}
        </section>
      )}

      {/* Dispatches */}
      {real.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="font-serif italic text-2xl text-[var(--color-text-muted)] mb-2">
            The archive is empty
          </div>
          <p className="text-sm text-[var(--color-text-faint)]">
            Trigger the supplier discovery workflow from the Triggers panel.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {weeks.map(([week, items], weekIndex) => {
            // Group within week by category
            const byCat = new Map<string, DiscoveredSupplier[]>();
            for (const s of items) {
              const arr = byCat.get(s.category) || [];
              arr.push(s);
              byCat.set(s.category, arr);
            }

            return (
              <section
                key={week}
                className="animate-fade-up"
                style={{ animationDelay: `${weekIndex * 100}ms` }}
              >
                {/* Week header — big editorial display */}
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-display text-[28px] text-[var(--color-text)] leading-none font-normal">
                    Week of <em className="font-serif italic text-[var(--color-accent)]">{week}</em>
                  </h2>
                  <span className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-text-faint)] font-mono">
                    {items.length} {items.length === 1 ? "supplier" : "suppliers"}
                  </span>
                </div>

                <div className="space-y-6">
                  {Array.from(byCat.entries()).map(([cat, list]) => (
                    <div key={cat}>
                      <div className="flex items-baseline gap-3 mb-2">
                        <h3 className="font-serif italic text-[17px] text-[var(--color-text)]">
                          {cat}
                        </h3>
                        <span className="text-[11px] tracking-wide uppercase text-[var(--color-text-faint)] font-mono">
                          {list.length}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {list.map((s, i) => (
                          <a
                            key={`${s.company_name}-${i}`}
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card p-4 block hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)] transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="font-display text-[17px] text-[var(--color-text)] leading-tight min-w-0 flex-1">
                                {s.company_name}
                              </div>
                              {s.priority === "high" && (
                                <StatusPill variant="accent" dot>
                                  Urgent
                                </StatusPill>
                              )}
                            </div>

                            {s.description && (
                              <p className="text-[12px] leading-relaxed text-[var(--color-text-muted)] line-clamp-2 mb-3 font-serif italic">
                                {s.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono pt-2 border-t border-[var(--color-line-soft)]">
                              <span className="text-[var(--color-accent)] truncate">
                                {cleanEmail(s.primary_email)}
                              </span>
                              <span className="text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)] transition-colors shrink-0">
                                Visit →
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
