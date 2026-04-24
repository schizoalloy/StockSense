import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "StockSense — Supply Chain Intelligence",
  description:
    "Automated demand forecasting, supplier outreach, and procurement intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="relative z-10 min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8 md:py-12">
            {children}
          </main>
          <footer className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8 text-[11px] tracking-wider uppercase text-[var(--color-text-faint)] flex justify-between">
            <span>StockSense / v0.1 / n8n-powered</span>
            <span>Built for the hackathon demo</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
