# ProRx Analytics — Database Tables & Schema

> All tables use Drizzle ORM with PostgreSQL (local Supabase).

---

## Entity Relationship

```
reports (1) ──→ (many) lots_pending_release
reports (1) ──→ (many) released_inventory
reports (1) ──→ (many) lots_in_quarantine
reports (1) ──→ (many) skus_on_schedule
reports (1) ──→ (many) shipments
reports (1) ──→ (many) perfectrx_inventory
```

Every data row belongs to a single `report` (one CSV upload = one report).

---

## Table 1: `reports`

Tracks every uploaded CSV file.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | Auto-increment |
| `report_date` | `date` | Extracted from filename (e.g., 01/20/2026) |
| `filename` | `varchar(255)` | Original uploaded filename |
| `uploaded_at` | `timestamp` | Defaults to `now()` |

---

## Table 2: `lots_pending_release`

Lots that have completed production but not yet cleared QA.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `report_id` | `integer` FK → reports | |
| `sku` | `varchar(100)` | Drug name + strength + volume |
| `lot` | `varchar(50)` | e.g., `PRORX01072026@4` |
| `bud` | `date` | Beyond-Use Date (expiration) |
| `quantity` | `integer` | Number of vials |
| `date_inspection` | `date` | Visual/physical inspection date |
| `date_aql` | `date` | Acceptable Quality Level sampling date |
| `date_label` | `date` | Labeling date |
| `date_testing_return` | `date` | Lab results return date |
| `date_final_plate_check` | `date` | Sterility plate check date |

---

## Table 3: `released_inventory`

Lots that have passed QA and are available to ship.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `report_id` | `integer` FK → reports | |
| `sku` | `varchar(100)` | |
| `lot` | `text` | Can be multiple lots (comma-separated) |
| `bud` | `date` | |
| `quantity_available` | `integer` | Vials available |

---

## Table 4: `lots_in_quarantine`

Lots held due to quality issues.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `report_id` | `integer` FK → reports | |
| `sku` | `varchar(100)` | |
| `lot` | `varchar(50)` | |
| `quantity` | `integer` | |
| `reason` | `text` | e.g., Low Phenol Potency, Crimping Issues |
| `solution` | `text` | nullable — e.g., Recrimp, Re-inspect |
| `expected_update` | `text` | nullable — expected resolution date |

---

## Table 5: `skus_on_schedule`

Upcoming production batches planned for fill.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `report_id` | `integer` FK → reports | |
| `sku` | `varchar(100)` | |
| `quantity` | `integer` | Vials to be filled |
| `scheduled_date` | `date` | Planned fill date |

---

## Table 6: `shipments`

Shipments sent to PerfectRx.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `report_id` | `integer` FK → reports | |
| `sku` | `varchar(100)` | |
| `lot` | `varchar(50)` | |
| `bud` | `date` | |
| `ship_to_perfect_date` | `date` | Requested ship date |
| `ship_quantity` | `integer` | Requested quantity |
| `ready_to_ship` | `boolean` | Yes/No |
| `shipped_quantity` | `integer` | Actual shipped |
| `ship_date` | `date` | Actual date shipped |
| `tracking` | `text` | Tracking number(s) |

---

## Table 7: `perfectrx_inventory`

Current inventory levels at the PerfectRx distributor.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `report_id` | `integer` FK → reports | |
| `sku` | `varchar(100)` | |
| `quantity` | `integer` | Current stock |
| `in_transit` | `integer` | nullable — vials being shipped |
| `run_rate_30d` | `integer` | 30-day demand average |
| `days_supply` | `real` | nullable — `quantity / (run_rate_30d / 30)` |

---

## Calculated / Derived Fields (computed in app, not stored)

| Field | Formula | Used In |
|-------|---------|---------|
| **Supply Status** | `< 7d` = Critical, `7-14d` = Low, `14-30d` = OK, `30+d` = Healthy | KPI cards, supply gauge |
| **QA Lead Time** | `date_final_plate_check - date_testing_return` | Pipeline analytics |
| **Quarantine Age** | `report_date - earliest known quarantine date` | Quarantine table |
| **Ship Accuracy %** | `shipped_quantity / ship_quantity × 100` | Shipment analytics |
| **Total Pipeline** | Sum of pending + scheduled + quarantine quantities | KPI cards |

---

## CSV → Table Mapping

The "At a Glance" CSV contains **multiple tables in a single file**, some side-by-side in the same rows:

| CSV Section | Row Range | DB Table |
|-------------|-----------|----------|
| "Lots Pending Release" (left) | ~Row 1–23 | `lots_pending_release` |
| "Total Vials Pending Release" (right) | ~Row 1–25 | *Aggregated from `lots_pending_release`* |
| "Released Inventory" (left) | ~Row 26–50 | `released_inventory` |
| "Lots in Quarantine" (right) | ~Row 29–42 | `lots_in_quarantine` |
| "Skus on Schedule" (left) | ~Row 53–70 | `skus_on_schedule` |
| "Total Vials on Schedule" (right) | ~Row 53–80 | *Aggregated from `skus_on_schedule`* |
| "Ship/Shipped to Perfect" | ~Row 83–123 | `shipments` |
| "PerfectRx Inventory" | ~Row 126–158 | `perfectrx_inventory` |

> [!IMPORTANT]
> The CSV parser must detect table headers (like "Lots Pending Release", "Released Inventory") to split the data. Tables in the "right" columns (cols K-L) run **alongside** left-side tables in the same rows.
