// n8n webhook client — server-side only
// Handles base URL, optional auth, and JSON parsing

const BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL || "http://localhost:5678";
const AUTH = process.env.N8N_WEBHOOK_AUTH; // "user:pass" if webhook is protected

function authHeader(): Record<string, string> {
  if (!AUTH) return {};
  const encoded = Buffer.from(AUTH).toString("base64");
  return { Authorization: `Basic ${encoded}` };
}

export const N8N_ENDPOINTS = {
  // POST — trigger workflows
  runForecast:        "/webhook/stocksense/run-forecast",
  runSupplierContact: "/webhook/stocksense/run-supplier-contact",
  runNewsletter:      "/webhook/stocksense/run-newsletter",
  // GET — fetch data from Google Sheets via n8n
  forecasts:            "/webhook/stocksense/forecasts",
  contactLogs:          "/webhook/stocksense/contact-logs",
  discoveredSuppliers:  "/webhook/stocksense/discovered-suppliers",
} as const;

export async function n8nPost<T = unknown>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(body),
    // Workflows can take a few minutes — don't cache, don't timeout prematurely
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n POST ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

export async function n8nGet<T = unknown>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeader() },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n GET ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// Safe wrapper — returns empty array on failure so pages still render
export async function n8nGetSafe<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    return await n8nGet<T>(endpoint);
  } catch (err) {
    console.error(`[n8n] GET ${endpoint} failed:`, err);
    return fallback;
  }
}
