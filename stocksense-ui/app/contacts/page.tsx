import { n8nGetSafe, N8N_ENDPOINTS } from "@/lib/n8n";
import type { ContactLog } from "@/lib/types";
import { StatusPill, riskVariant } from "@/components/status-pill";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getContactLogs(): Promise<ContactLog[]> {
  const data = await n8nGetSafe<ContactLog[] | { data: ContactLog[] }>(
    N8N_ENDPOINTS.contactLogs,
    []
  );
  if (Array.isArray(data)) return data;
  if (data && "data" in data && Array.isArray(data.data)) return data.data;
  return [];
}

// Group by run_id → list of contacts
function groupByRun(logs: ContactLog[]): Map<string, ContactLog[]> {
  const map = new Map<string, ContactLog[]>();
  for (const log of logs) {
    const key = log.run_id || "unknown";
    const arr = map.get(key) || [];
    arr.push(log);
    map.set(key, arr);
  }
  return map;
}

export default async function ContactsPage() {
  const logs = await getContactLogs();
  const grouped = groupByRun(logs);
  const runs = Array.from(grouped.entries()).sort((a, b) => {
    // Newest first by run_at of first log
    const aDate = a[1][0]?.run_at || "";
    const bDate = b[1][0]?.run_at || "";
    return bDate.localeCompare(aDate);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-up">
        <span className="text-[11px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
          Outbound Ledger
        </span>
        <div className="rule-dashed my-4" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1
            className="font-display text-[var(--color-text)] leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300 }}
          >
            Supplier <em className="font-serif italic text-[var(--color-accent)] font-normal">Contacts</em>
          </h1>
          <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)] font-serif italic md:max-w-md md:text-right">
            {logs.length > 0
              ? `${logs.length} outbound emails logged across ${runs.length} workflow runs.`
              : "No contact logs yet. The supplier outreach workflow writes here after each run."}
          </p>
        </div>
        <div className="rule-dashed mt-4" />
      </header>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="font-serif italic text-2xl text-[var(--color-text-muted)] mb-2">
            The ledger is empty
          </div>
          <p className="text-sm text-[var(--color-text-faint)]">
            Trigger the supplier outreach workflow to send emails and populate this log.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {runs.map(([runId, items], runIndex) => (
            <section
              key={runId}
              className="animate-fade-up"
              style={{ animationDelay: `${runIndex * 80}ms` }}
            >
              {/* Run header */}
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[20px] text-[var(--color-accent)] font-normal">
                    Run <span className="tabular">{runId}</span>
                  </span>
                  <span className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-text-faint)] font-mono">
                    {items[0]?.run_at ? new Date(items[0].run_at).toLocaleString() : "—"}
                  </span>
                </div>
                <span className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-text-muted)] font-mono">
                  {items.length} {items.length === 1 ? "email" : "emails"}
                </span>
              </div>

              {/* Contact cards */}
              <div className="grid md:grid-cols-2 gap-3">
                {items.map((c, i) => (
                  <div
                    key={`${c.supplier_id}-${c.product_id}-${i}`}
                    className="card p-4 hover:border-[var(--color-accent)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[17px] text-[var(--color-text)] leading-tight truncate">
                          {c.company_name}
                        </div>
                        <div className="text-[11px] tracking-wide text-[var(--color-text-faint)] font-mono mt-1 truncate">
                          {c.sent_to}
                        </div>
                      </div>
                      <StatusPill variant={riskVariant(String(c.stockout_risk))} dot>
                        {c.stockout_risk}
                      </StatusPill>
                    </div>

                    {c.email_subject && (
                      <div className="text-[12px] text-[var(--color-text-muted)] font-serif italic mb-3 line-clamp-1">
                        "{c.email_subject}"
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--color-line-soft)]">
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--color-text-muted)]">
                        <span className="text-[var(--color-text)]">{c.product_id}</span>
                        <span>·</span>
                        <span>{c.category}</span>
                        <span>·</span>
                        <span>{c.region}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--color-text-muted)]">
                        <span className="text-[9px] tracking-[0.15em] uppercase text-[var(--color-text-faint)] mr-1">
                          Qty
                        </span>
                        <span className="text-[var(--color-text)] tabular">
                          {c.predicted_demand}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
