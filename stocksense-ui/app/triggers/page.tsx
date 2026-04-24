import { TriggerButton } from "@/components/trigger-button";

export default function TriggersPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="animate-fade-up">
        <span className="text-[11px] tracking-[0.22em] uppercase text-[var(--color-text-faint)] font-mono">
          Control Panel
        </span>

        <div className="rule-dashed my-4" />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1
            className="font-display text-[var(--color-text)] leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300 }}
          >
            Trigger a <em className="font-serif italic text-[var(--color-accent)] font-normal">Workflow</em>
          </h1>
          <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)] font-serif italic md:max-w-md md:text-right">
            Fire any sub-workflow on demand. Results stream back into this panel when complete. Forecasts typically take 4–8 minutes.
          </p>
        </div>

        <div className="rule-dashed mt-4" />
      </header>

      {/* Trigger cards */}
      <section className="grid md:grid-cols-3 gap-5">
        <TriggerButton
          wf="forecast"
          title="Demand Forecasting"
          description="Reads stock data from Google Sheets, groups by region, and calls GLM-5.1 to forecast demand for every product. Writes results to forecast_results tab."
          icon="forecast"
          index={0}
        />
        <TriggerButton
          wf="supplier-contact"
          title="Supplier Outreach"
          description="Finds urgent stockout products from the latest forecast, matches them to suppliers, and sends personalised order request emails."
          icon="email"
          index={1}
        />
        <TriggerButton
          wf="newsletter"
          title="Supplier Discovery"
          description="Scans the web for new Malaysian suppliers in your active categories, drafts a newsletter with GLM-5.1, and emails it to the supply manager."
          icon="newsletter"
          index={2}
        />
      </section>

      {/* Warning / info strip */}
      <section className="card p-5 animate-fade-up stagger-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-sm border border-[var(--color-accent)] text-[var(--color-accent)] flex items-center justify-center shrink-0 text-sm font-serif italic">
          !
        </div>
        <div className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          <span className="text-[var(--color-text)] font-medium">Demo note:</span> workflows execute live against your n8n instance.
          The Ilmu.ai GLM-5.1 endpoint enforces a 60-second per-request limit, so the forecast workflow uses sequential batching and can take up to 8 minutes end-to-end. Grab a coffee.
        </div>
      </section>
    </div>
  );
}
