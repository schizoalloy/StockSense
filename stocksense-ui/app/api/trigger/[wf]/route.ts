import { NextRequest, NextResponse } from "next/server";
import { n8nPost, N8N_ENDPOINTS } from "@/lib/n8n";
import type { WorkflowId, TriggerResponse } from "@/lib/types";

const WORKFLOW_ENDPOINTS: Record<WorkflowId, string> = {
  "forecast":         N8N_ENDPOINTS.runForecast,
  "supplier-contact": N8N_ENDPOINTS.runSupplierContact,
  "newsletter":       N8N_ENDPOINTS.runNewsletter,
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ wf: string }> }
) {
  const { wf } = await context.params;
  const endpoint = WORKFLOW_ENDPOINTS[wf as WorkflowId];

  if (!endpoint) {
    return NextResponse.json(
      { status: "error", error: `Unknown workflow: ${wf}` },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const result = await n8nPost<TriggerResponse | TriggerResponse[]>(endpoint, body);

    // n8n sometimes returns arrays — unwrap
    const data = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({
      status: "success",
      ...data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: 502 }
    );
  }
}
