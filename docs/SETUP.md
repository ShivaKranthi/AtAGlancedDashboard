# ProRx Analytics Dashboard — Complete Developer Setup Guide

> **Audience:** A developer on a **Mac** who has nothing installed yet.
> This guide takes you from a fresh Mac to a running ProRx Analytics dashboard.

---

## Table of Contents

1. [Prerequisites — Install Everything](#1-prerequisites--install-everything)
2. [Get the Code](#2-get-the-code)
3. [Install Dependencies](#3-install-dependencies)
4. [Start Local Supabase (Database)](#4-start-local-supabase-database)
5. [Push the Database Schema](#5-push-the-database-schema)
6. [Start the Dev Server](#6-start-the-dev-server)
7. [Upload Your First CSV](#7-upload-your-first-csv)
8. [Database Access & Queries](#8-database-access--queries)
9. [Project Structure](#9-project-structure)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites — Install Everything

### 1a. Install Homebrew (Mac Package Manager)

Open **Terminal** (search "Terminal" in Spotlight) and paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, follow the on-screen instructions to add Homebrew to your PATH. Then verify:

```bash
brew --version
# Should print something like: Homebrew 4.x.x
```

### 1b. Install Node.js (v20+)

```bash
brew install node@22
```

Verify:

```bash
node --version   # Should print v22.x.x
npm --version    # Should print 10.x.x
```

### 1c. Install pnpm (Fast Package Manager)

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm --version   # Should print 9.x.x or 10.x.x
```

### 1d. Install Docker Desktop (Required for Local Supabase)

Download and install from: https://www.docker.com/products/docker-desktop/

1. Download the **Mac (Apple Silicon)** or **Mac (Intel)** version
2. Open the `.dmg` and drag Docker to Applications
3. Launch Docker Desktop from Applications
4. Wait for the Docker engine to start (whale icon in the menu bar should stop animating)

Alternatively, if you already have **OrbStack** installed, that works too — it's a Docker-compatible runtime.

Verify Docker is running:

```bash
docker --version   # Should print Docker version 2x.x.x
docker ps          # Should show an empty table (no error)
```

### 1e. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

Verify:

```bash
supabase --version   # Should print 2.x.x
```

### 1f. Install PostgreSQL Client (for direct DB access)

```bash
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify:

```bash
psql --version   # Should print psql (PostgreSQL) 17.x.x
```

---

## 2. Get the Code

Unzip the project folder you received and `cd` into it:

```bash
cd ~/path-to/kranthi
```

---

## 3. Install Dependencies

```bash
pnpm install
```

This installs all Node.js packages listed in `package.json`. It should take 30–60 seconds.

---

## 4. Start Local Supabase (Database)

> **Docker must be running before this step.**

```bash
npx supabase start
```

This will download Supabase Docker images on first run (may take 2–5 minutes).
When done, it prints connection details:

```
         API URL: http://127.0.0.1:54321
    Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
```

**Important URLs:**
| Service | URL | Purpose |
|---------|-----|---------|
| API | http://127.0.0.1:54321 | Supabase REST API |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct PostgreSQL |
| Studio | http://127.0.0.1:54323 | Visual database browser (like phpMyAdmin) |

The `.env.local` file is already configured with these defaults. You shouldn't need to change anything.

---

## 5. Push the Database Schema

This creates all 7 database tables:

```bash
pnpm db:push
```

You should see output like:

```
Changes applied
 + reports
 + lots_pending_release
 + released_inventory
 + lots_in_quarantine
 + skus_on_schedule
 + shipments
 + perfectrx_inventory
```

---

## 6. Start the Dev Server

```bash
pnpm dev
```

Open **http://localhost:3000** in your browser. You should see the empty-state dashboard.

To stop the server, press `Ctrl+C` in the terminal.

---

## 7. Upload Your First CSV

1. Go to **http://localhost:3000/upload**
2. Drag and drop your `At a Glance Report - MM_DD_YYYY.csv` file
3. Wait for parsing to complete
4. You'll be redirected to the dashboard with data

**Or via command line:**

```bash
curl -X POST -F "file=@path/to/your-report.csv" http://localhost:3000/api/upload
```

### 7a. Report Management (CRUD)

The **Upload CSV** page also shows all uploaded reports in a management table. You can:

- **View** — see row counts per data table (pending, released, quarantine, etc.)
- **Delete** — click the Delete button → confirm with ✓ → report and all its child data are removed
- **Re-upload** — uploading a CSV for the same date automatically replaces the old data
- **Refresh** — click the ↻ button to reload the report list

### 7b. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/upload` | Upload a CSV (auto-replaces same date) |
| `GET` | `/api/upload` | List all reports with row counts |
| `GET` | `/api/upload/[id]` | Get a single report with counts |
| `DELETE` | `/api/upload/[id]` | Delete a report and all its data |

**Example: Delete a report via CLI**

```bash
# List all reports
curl -s http://localhost:3000/api/upload | python3 -m json.tool

# Delete report with id=5
curl -s -X DELETE http://localhost:3000/api/upload/5 | python3 -m json.tool
```

---

## 8. Database Access & Queries

### 8a. Supabase Studio (Visual Browser)

Open **http://127.0.0.1:54323** in your browser. This gives you a visual table editor like phpMyAdmin.

### 8b. Command Line (psql)

Connect to the database:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Once connected, useful commands:

```sql
-- List all tables
\dt

-- See table structure
\d reports
\d lots_pending_release
\d shipments

-- View all reports (uploads)
SELECT id, report_date, filename, uploaded_at FROM reports ORDER BY id DESC;

-- Count rows per table
SELECT 'reports' AS tbl, COUNT(*) FROM reports
UNION ALL SELECT 'lots_pending_release', COUNT(*) FROM lots_pending_release
UNION ALL SELECT 'released_inventory', COUNT(*) FROM released_inventory
UNION ALL SELECT 'lots_in_quarantine', COUNT(*) FROM lots_in_quarantine
UNION ALL SELECT 'skus_on_schedule', COUNT(*) FROM skus_on_schedule
UNION ALL SELECT 'shipments', COUNT(*) FROM shipments
UNION ALL SELECT 'perfectrx_inventory', COUNT(*) FROM perfectrx_inventory;

-- View quarantine reasons breakdown
SELECT reason, COUNT(*) as lot_count, SUM(quantity) as total_vials
FROM lots_in_quarantine
GROUP BY reason ORDER BY lot_count DESC;

-- Find critical supply items (< 7 days)
SELECT sku, quantity, in_transit, run_rate_30d, days_supply
FROM perfectrx_inventory
WHERE days_supply < 7 AND run_rate_30d > 0
ORDER BY days_supply ASC;

-- View top demand SKUs
SELECT sku, run_rate_30d, quantity, in_transit, days_supply
FROM perfectrx_inventory
WHERE run_rate_30d > 0
ORDER BY run_rate_30d DESC
LIMIT 10;

-- Delete a specific report and all its data
-- (cascading delete handles child tables if you set up foreign keys)
DELETE FROM shipments WHERE report_id = 1;
DELETE FROM perfectrx_inventory WHERE report_id = 1;
DELETE FROM skus_on_schedule WHERE report_id = 1;
DELETE FROM lots_in_quarantine WHERE report_id = 1;
DELETE FROM released_inventory WHERE report_id = 1;
DELETE FROM lots_pending_release WHERE report_id = 1;
DELETE FROM reports WHERE id = 1;

-- Exit psql
\q
```

### 8c. Drizzle Studio (ORM-based visual browser)

```bash
pnpm db:studio
```

This opens a visual database browser at **https://local.drizzle.studio** with autocomplete and type-safe queries.

---

## 9. Project Structure

```
kranthi/
├── docs/               # Documentation
│   ├── SETUP.md        # This file
│   ├── data-tables.md  # Database schema reference
│   ├── glossary.md     # Business terminology
│   └── tech-stack.md   # Technologies used
├── src/
│   ├── app/            # Next.js pages
│   │   ├── page.tsx    # Main dashboard
│   │   ├── upload/     # CSV upload & report management
│   │   ├── guide/      # Business guide page
│   │   ├── trends/     # Trends page (coming soon)
│   │   ├── api/upload/       # POST (upload), GET (list)
│   │   ├── api/upload/[id]/  # GET (single), DELETE
│   │   ├── layout.tsx  # Root layout
│   │   └── globals.css # Theme & styles
│   ├── components/     # UI components
│   │   ├── ui/         # shadcn/ui primitives
│   │   ├── navbar.tsx
│   │   ├── kpi-strip.tsx
│   │   ├── supply-gauge.tsx
│   │   ├── quarantine-panel.tsx
│   │   ├── csv-uploader.tsx
│   │   ├── report-manager.tsx  # Report CRUD table
│   │   └── tip.tsx     # Tooltip helper
│   ├── db/
│   │   ├── schema.ts   # Database table definitions
│   │   └── index.ts    # Database client (max 3 connections)
│   └── lib/
│       ├── csv-parser.ts  # CSV parsing logic
│       ├── queries.ts     # Database queries
│       └── utils.ts       # Utilities
├── supabase/           # Supabase config
├── .env.local          # Environment variables (DO NOT SHARE)
├── drizzle.config.ts   # Drizzle ORM config
├── package.json
└── pnpm-lock.yaml
```

---

## 10. Troubleshooting

### "Docker is not running"
Launch Docker Desktop (or OrbStack) and wait for it to fully start before running `npx supabase start`.

### "Port 3000 is in use"
Kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### "supabase start" hangs
Make sure Docker has at least **4GB RAM** allocated (Docker Desktop → Settings → Resources).

### "pnpm db:push" fails with "connection refused"
Supabase isn't running. Run `npx supabase start` first and wait for it to finish.

### "Module not found" errors
Run `pnpm install` again — you may have a stale `node_modules`.

### "too many clients already" error
The local Supabase PostgreSQL has a limited connection pool. Restart Supabase to clear stuck connections:
```bash
npx supabase stop && npx supabase start
```

### Reset the entire database
```bash
npx supabase db reset
pnpm db:push
```

### Stop everything
```bash
# Stop the dev server
Ctrl+C

# Stop Supabase (keeps data)
npx supabase stop

# Stop Supabase (wipe data)
npx supabase stop --no-backup
```

---

## Quick Start (TL;DR)

If everything is installed, this is the 4-command start:

```bash
npx supabase start     # Start database (Docker must be running)
pnpm db:push           # Create tables
pnpm dev               # Start app → http://localhost:3000
# Upload CSV at /upload
```
