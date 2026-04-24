// Shared types — mirror the Google Sheets columns + n8n workflow outputs

export type Region = "North" | "South" | "East" | "West";
export type RiskLevel = "high" | "low";
export type Confidence = "high" | "medium" | "low";
export type Action = "stock up" | "maintain" | "reduce";
export type Trend = "increasing" | "stable" | "decreasing";

export interface Forecast {
  run_id: string;
  forecast_date: string;
  product_id: string;
  category: string;
  region: Region | string;
  historical_avg_Demand: number | string;
  historical_trend: Trend | string;
  predicted_demand: number | string;
  confidence: Confidence | string;
  confidence_reason: string;
  key_drivers: string;
  stockout_risk: RiskLevel | string;
  recomended_action: Action | string;
  action_detail: string;
}

export interface ContactLog {
  run_id: string;
  run_at: string;
  supplier_id: string;
  company_name: string;
  product_id: string;
  category: string;
  region: string;
  email_subject: string;
  email_priority: string;
  sent_to: string;
  predicted_demand: number | string;
  stockout_risk: string;
  status: string;
}

export interface DiscoveredSupplier {
  run_id: string;
  week_label: string;
  discovered_at: string;
  category: string;
  priority: string;
  company_name: string;
  primary_email: string;
  all_emails: string;
  website: string;
  description: string;
  status: string;
}

// Workflow trigger responses
export type WorkflowId = "forecast" | "supplier-contact" | "newsletter";

export interface TriggerResponse {
  status: "success" | "error" | "pending";
  run_id?: string;
  completed_at?: string;
  summary_message?: string;
  error?: string;
  // WF-1 fields
  forecasts_generated?: number;
  regions_covered?: string[];
  stockout_risks?: number;
  // WF-2 fields
  emails_sent?: number;
  suppliers_contacted?: number;
  skipped?: boolean;
  skip_reason?: string;
  // WF-3 fields
  suppliers_discovered?: number;
  categories_covered?: string[];
}

export interface StatsBreakdown {
  total_forecasts: number;
  high_risk_count: number;
  regions: string[];
  categories: string[];
  last_run: string | null;
}
