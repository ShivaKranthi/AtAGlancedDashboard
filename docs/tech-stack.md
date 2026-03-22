# ProRx Analytics — Tech Stack

> All versions verified as of March 2026.

## Core

| Package | Version | Purpose |
|---------|---------|---------|
| **Next.js** | `16.1.x` | App Router, Server Components, API routes |
| **React** | `19.x` | UI library (bundled with Next.js 16) |
| **TypeScript** | `5.7.x` | Type safety (bundled with Next.js) |
| **pnpm** | `9.x` | Package manager |

## Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | `4.x` | CSS-first config (no `tailwind.config.js` needed) |
| **@tailwindcss/postcss** | `4.x` | PostCSS integration for Next.js |
| **shadcn/ui** | `latest` | Pre-built accessible components (Card, Table, Badge, Dialog) |
| **Recharts** | `3.7.x` | Charts — bar, donut, area, line |
| **Lucide React** | `latest` | Icon set |

## Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| **Supabase CLI** | `2.76.x` | Local PostgreSQL via Docker (OrbStack) |
| **drizzle-orm** | `1.0.0-beta.x` | Type-safe ORM for PostgreSQL |
| **drizzle-kit** | `latest` | Migrations, schema push, studio |
| **postgres** | `3.x` | PostgreSQL client driver (`postgres.js`) |

## Data & State

| Package | Version | Purpose |
|---------|---------|---------|
| **PapaParse** | `5.5.x` | CSV parsing in browser/server |
| **@tanstack/react-table** | `8.21.x` | Sortable, filterable data tables |
| **@tanstack/react-query** | `5.90.x` | Server state, caching, data fetching |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **supabase** | `2.76.x` | Supabase CLI (dev dependency) |
| **drizzle-kit** | `latest` | DB migrations & Drizzle Studio |
| **@types/papaparse** | `latest` | TypeScript types for PapaParse |

## API Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/upload` | Upload CSV, auto-replaces same date |
| `GET` | `/api/upload` | List all reports with per-table row counts |
| `GET` | `/api/upload/[id]` | Get single report with data counts |
| `DELETE` | `/api/upload/[id]` | Delete report + all child data |

> **Note:** The DB client uses `max: 3` connections and `idle_timeout: 20s` to avoid exhausting the local Supabase connection pool. All API queries run sequentially (not parallel) for the same reason.

## Setup Commands (Exact)

### 1. Create Next.js Project

```bash
pnpm create next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

> This creates the project in the current directory (`./`) with TypeScript, Tailwind v4, ESLint, App Router, `src/` directory, and `@/*` import alias.

### 2. Install Supabase CLI (local dev dependency)

```bash
pnpm add -D supabase
```

### 3. Initialize Supabase

```bash
npx supabase init
```

> Creates a `supabase/` directory with `config.toml`. Make sure OrbStack (Docker) is running.

### 4. Start Local Supabase

```bash
npx supabase start
```

> First run downloads Docker images (~7GB). After startup, it prints:
> - API URL: `http://127.0.0.1:54321`
> - DB URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
> - Studio: `http://127.0.0.1:54323`

### 5. Install Drizzle ORM

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

### 6. Install shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

> Follow prompts — select dark theme, New York style.

Then add components as needed:

```bash
pnpm dlx shadcn@latest add card table badge button dialog tabs separator
```

### 7. Install Recharts

```bash
pnpm add recharts
```

### 8. Install TanStack Table & Query

```bash
pnpm add @tanstack/react-table @tanstack/react-query
```

### 9. Install PapaParse

```bash
pnpm add papaparse
pnpm add -D @types/papaparse
```

---

## Config Files

### `drizzle.config.ts`

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

### `.env.local`

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
```

### `postcss.config.mjs` (Tailwind v4)

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### `src/app/globals.css` (Tailwind v4 — CSS-first)

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #0a0e1a;
  --color-bg-card: #1a2035;
  --color-border: #2a3454;
  --color-accent-blue: #3b82f6;
  --color-accent-cyan: #06d6a0;
  --color-accent-red: #ef4444;
  --color-accent-orange: #f59e0b;
  --color-accent-purple: #8b5cf6;
}
```

---

## Package Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:migrate": "drizzle-kit migrate",
    "supabase:start": "npx supabase start",
    "supabase:stop": "npx supabase stop"
  }
}
```
