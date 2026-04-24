"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",           label: "Overview" },
  { href: "/triggers",   label: "Triggers" },
  { href: "/forecasts",  label: "Forecasts" },
  { href: "/contacts",   label: "Contacts" },
  { href: "/discovered", label: "Discovered" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(12,12,14,0.75)] border-b border-[var(--color-line-soft)]">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Monogram */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm border border-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent)] font-display text-[14px] leading-none transition-all group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-ink)]">
            S
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[17px] tracking-tight text-[var(--color-text)]">
              StockSense
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-faint)] mt-0.5">
              Supply Intelligence
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-3 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors
                  ${active
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }
                `}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-[var(--color-accent)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[var(--color-line)] bg-[var(--color-surface)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse-soft" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-muted)]">
            n8n live
          </span>
        </div>
      </div>
    </header>
  );
}
