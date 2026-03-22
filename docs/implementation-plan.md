# ProRx Analytics — Implementation Plan

## What We're Building

A web app where a compounding pharmacy admin uploads daily "At a Glance" CSV reports and gets instant analytics on:
- **Inventory** — what's released, pending, quarantine, at PerfectRx
- **Production pipeline** — what's scheduled, what's stuck in QA
- **Quality** — quarantine reasons, trends, repeat failures
- **Shipping** — what shipped, accuracy, tracking
- **Demand** — run rates, days of supply, critical alerts

**Solo dev. Single repo. Local Supabase. Deploy on AWS.**

---

## Quick Start (After Setup)

```bash
# Clone and install
cd kranthi
pnpm install

# Start Supabase (OrbStack must be running)
npx supabase start

# Push DB schema
pnpm db:push

# Start dev server
pnpm dev
# → http://localhost:3000
```

---

## Setup Steps (One-Time)

### Step 1: Create Next.js project

```bash
cd /Users/nithin/Developer/Apps/fills/kranthi
pnpm create next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

### Step 2: Install all dependencies

```bash
# Database
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit supabase

# UI
pnpm add recharts lucide-react
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add card table badge button tabs separator dialog dropdown-menu

# Data
pnpm add papaparse @tanstack/react-table @tanstack/react-query
pnpm add -D @types/papaparse
```

### Step 3: Init Supabase

```bash
npx supabase init
npx supabase start
```

Take note of the output — copy the DB URL and anon key into `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
```

### Step 4: Create Drizzle config

Create `drizzle.config.ts` in project root:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Step 5: Push schema to DB

```bash
pnpm db:push
```

---

## Project Structure

```
kranthi/
├── docs/                          ← You are here
│   ├── implementation-plan.md     ← This file
│   ├── tech-stack.md              ← All packages + versions + commands
│   └── data-tables.md             ← DB schema + CSV mapping
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← Dark theme, fonts, query provider
│   │   ├── page.tsx               ← Dashboard home (latest report)
│   │   ├── upload/
│   │   │   └── page.tsx           ← CSV upload page
│   │   ├── api/
│   │   │   └── upload/
│   │   │       └── route.ts       ← POST: parse CSV → insert to DB
│   │   ├── reports/
│   │   │   └── [id]/
│   │   │       └── page.tsx       ← Single report drill-down
│   │   └── trends/
│   │       └── page.tsx           ← Compare reports over time
│   ├── components/
│   │   ├── navbar.tsx
│   │   ├── kpi-strip.tsx          ← 5 top-line metric cards
│   │   ├── supply-gauge.tsx       ← Days of supply horizontal bars
│   │   ├── quarantine-donut.tsx   ← Donut chart + legend
│   │   ├── pipeline-chart.tsx     ← Bar chart: scheduled→pending→released→quarantine→shipped
│   │   ├── demand-table.tsx       ← Top SKUs by 30-day run rate
│   │   ├── data-table.tsx         ← Reusable TanStack Table wrapper
│   │   └── csv-uploader.tsx       ← Drag-drop file upload
│   ├── lib/
│   │   ├── csv-parser.ts          ← Parse multi-table CSV into typed objects
│   │   ├── db.ts                  ← Drizzle client initialization
│   │   ├── queries.ts             ← Reusable DB query functions
│   │   └── utils.ts               ← cn() helper, formatters
│   └── db/
│       └── schema.ts              ← Drizzle table definitions (7 tables)
├── drizzle/                       ← Auto-generated migration files
├── supabase/                      ← Supabase local config
├── public/
├── .env.local                     ← DB credentials (git-ignored)
├── drizzle.config.ts
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

---

## Sprint Plan (Solo — ~4-5 hrs/day)

### Week 1: Foundation (3 days)

| Day | Focus | Deliverable |
|-----|-------|-------------|
| **1** | Project scaffolding | Next.js + Tailwind + shadcn + Supabase local running. Dark theme layout matching `dashboard.html`. |
| **2** | Database + CSV parser | All 7 Drizzle tables. CSV parser that splits multi-table CSV into typed objects. `/api/upload` route. |
| **3** | Upload flow | Drag-drop CSV uploader. Data flowing from CSV → API → Supabase. Verify in Drizzle Studio. |

### Week 2: Dashboard (4 days)

| Day | Focus | Deliverable |
|-----|-------|-------------|
| **4** | KPIs + Supply gauges | 5 KPI cards with real data. Days-of-supply bars for PerfectRx inventory (color-coded by severity). |
| **5** | Charts + Quarantine | Quarantine donut chart. Production pipeline bar chart. Top SKUs demand table. |
| **6** | Data tables | Full sortable/filterable tables: Pending Release, Quarantine, Shipments, Released Inventory. |
| **7** | Multi-report | Report selector dropdown. Trend page comparing 2+ reports for inventory movement over time. |

### Week 3: Polish + Deploy (3 days)

| Day | Focus | Deliverable |
|-----|-------|-------------|
| **8** | Alerts + Responsive | Critical supply alerts (< 7 days). BUD expiry warnings. Mobile-responsive layout. |
| **9** | Edge cases + Polish | CSV parsing edge cases (#DIV/0!, quoted commas, missing fields). Animations, loading states. |
| **10** | Deploy to AWS | AWS Amplify (or EC2) deployment. RDS PostgreSQL or Supabase Cloud. Domain setup. |

---

## Key Design Decisions

1. **Local Supabase over cloud** — Free, fast, no network latency during dev. Switch to Supabase Cloud or AWS RDS for production.
2. **Drizzle over Prisma** — Lighter, faster, SQL-like API. Better for a single-dev project.
3. **PapaParse on server** — CSV parsing happens in the API route (server-side), not in the browser, to handle large files.
4. **No auth for MVP** — Single admin user. Add authentication later if needed.
5. **Tailwind v4 CSS-first** — No `tailwind.config.js`. All theming in `globals.css` via `@theme` directive.

---

## Portability

This project is designed to work on any machine with:
- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **Docker** (or OrbStack) running

```bash
git clone <repo>
cd kranthi
pnpm install
npx supabase start
pnpm db:push
pnpm dev
```

That's it. No global installs, no manual configuration.
