import { NextRequest, NextResponse } from "next/server";
import { n8nGet, N8N_ENDPOINTS } from "@/lib/n8n";

const RESOURCE_ENDPOINTS: Record<string, string> = {
  "forecasts":            N8N_ENDPOINTS.forecasts,
  "contact-logs":         N8N_ENDPOINTS.contactLogs,
  "discovered-suppliers": N8N_ENDPOINTS.discoveredSuppliers,
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  const endpoint = RESOURCE_ENDPOINTS[resource];

  if (!endpoint) {
    return NextResponse.json(
      { error: `Unknown resource: ${resource}` },
      { status: 400 }
    );
  }

  try {
    const data = await n8nGet<unknown[]>(endpoint);
    return NextResponse.json({ data: Array.isArray(data) ? data : [data] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, data: [] }, { status: 502 });
  }
}
