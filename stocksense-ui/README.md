# StockSense Dashboard

A demo-ready Next.js dashboard for the StockSense n8n automation system. Triggers workflows on-demand, displays forecasts, visualises stockout risk, and shows supplier activity — all wired to your n8n instance via webhooks.

## What's inside

- **Dashboard home** — live stockout risk heatmap (region × category)
- **Trigger panel** — one-click buttons to fire WF-1, WF-2, WF-3 with live status
- **Forecasts** — filterable table of the latest demand forecasts
- **Supplier contacts** — log of every email sent to suppliers
- **Discovered suppliers** — archive of suppliers found by the weekly newsletter

Built for hackathon demo use: bold editorial typography, dark theme, fast animations, zero fluff.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- React Server Components for data fetching
- n8n webhooks as the backend

## Setup

### 1. Install dependencies

```bash
cd stocksense-ui
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your n8n webhook base URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_N8N_BASE_URL=https://your-n8n-instance.com
```

If running n8n locally, this is typically `http://localhost:5678`.

### 3. Add webhook endpoints to your n8n instance

See `N8N_SETUP.md` for step-by-step instructions. You need 6 webhook workflows:

- `POST /webhook/stocksense/run-forecast` — triggers WF-1
- `POST /webhook/stocksense/run-supplier-contact` — triggers WF-2
- `POST /webhook/stocksense/run-newsletter` — triggers WF-3
- `GET /webhook/stocksense/forecasts` — returns latest forecast rows
- `GET /webhook/stocksense/contact-logs` — returns supplier contact log rows
- `GET /webhook/stocksense/discovered-suppliers` — returns discovered supplier rows

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Deploying

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set `NEXT_PUBLIC_N8N_BASE_URL` as an environment variable in the Vercel dashboard. Your n8n instance must be publicly accessible (not localhost) for the deployed site to reach it.

### Self-hosted

```bash
npm run build
npm run start
```

## Folder structure

```
stocksense-ui/
├── app/
│   ├── layout.tsx           # root layout + theme + fonts
│   ├── page.tsx             # dashboard home (stockout heatmap)
│   ├── triggers/page.tsx    # workflow trigger panel
│   ├── forecasts/page.tsx   # forecast table
│   ├── contacts/page.tsx    # supplier contact log
│   ├── discovered/page.tsx  # discovered suppliers
│   ├── globals.css          # theme tokens + typography
│   └── api/
│       └── trigger/[wf]/route.ts   # proxies to n8n webhooks
├── components/
│   ├── nav.tsx              # top navigation
│   ├── trigger-button.tsx   # animated workflow trigger
│   ├── risk-heatmap.tsx     # region × category heatmap
│   ├── forecast-table.tsx   # sortable/filterable forecast table
│   ├── status-pill.tsx      # success/failure badge
│   └── stat-card.tsx        # top-of-page metric cards
├── lib/
│   ├── n8n.ts               # webhook client
│   └── types.ts             # shared TypeScript types
├── public/
├── .env.example
├── N8N_SETUP.md             # n8n webhook config guide
└── package.json
```

## Troubleshooting

- **CORS errors when triggering workflows**: n8n blocks cross-origin requests by default. Use the built-in API routes at `/api/trigger/[wf]` instead of hitting n8n directly — the Next.js server acts as a proxy.
- **Empty forecast table**: check the `GET /webhook/stocksense/forecasts` endpoint directly in your browser. If it returns nothing, the Google Sheets node inside that workflow isn't reading the right tab.
- **Webhook returns 404**: make sure you activated each webhook workflow in n8n (top-right toggle).
