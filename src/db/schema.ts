import {
    pgTable,
    serial,
    varchar,
    integer,
    date,
    timestamp,
    text,
    boolean,
    real,
} from "drizzle-orm/pg-core";

// ─── Table 1: Reports ────────────────────────────────────────────────
export const reports = pgTable("reports", {
    id: serial("id").primaryKey(),
    reportDate: date("report_date").notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ─── Table 2: Lots Pending Release ───────────────────────────────────
export const lotsPendingRelease = pgTable("lots_pending_release", {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
        .references(() => reports.id, { onDelete: "cascade" })
        .notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    lot: varchar("lot", { length: 50 }).notNull(),
    bud: date("bud"),
    quantity: integer("quantity"),
    dateInspection: date("date_inspection"),
    dateAql: date("date_aql"),
    dateLabel: date("date_label"),
    dateTestingReturn: date("date_testing_return"),
    dateFinalPlateCheck: date("date_final_plate_check"),
});

// ─── Table 3: Released Inventory ─────────────────────────────────────
export const releasedInventory = pgTable("released_inventory", {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
        .references(() => reports.id, { onDelete: "cascade" })
        .notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    lot: text("lot"),
    bud: date("bud"),
    quantityAvailable: integer("quantity_available"),
});

// ─── Table 4: Lots in Quarantine ─────────────────────────────────────
export const lotsInQuarantine = pgTable("lots_in_quarantine", {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
        .references(() => reports.id, { onDelete: "cascade" })
        .notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    lot: varchar("lot", { length: 50 }).notNull(),
    quantity: integer("quantity"),
    reason: text("reason"),
    solution: text("solution"),
    expectedUpdate: text("expected_update"),
});

// ─── Table 5: SKUs on Schedule ───────────────────────────────────────
export const skusOnSchedule = pgTable("skus_on_schedule", {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
        .references(() => reports.id, { onDelete: "cascade" })
        .notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    quantity: integer("quantity"),
    scheduledDate: date("scheduled_date"),
});

// ─── Table 6: Shipments ──────────────────────────────────────────────
export const shipments = pgTable("shipments", {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
        .references(() => reports.id, { onDelete: "cascade" })
        .notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    lot: varchar("lot", { length: 50 }),
    bud: date("bud"),
    shipToPerfectDate: date("ship_to_perfect_date"),
    shipQuantity: integer("ship_quantity"),
    readyToShip: boolean("ready_to_ship"),
    shippedQuantity: integer("shipped_quantity"),
    shipDate: date("ship_date"),
    tracking: text("tracking"),
});

// ─── Table 7: PerfectRx Inventory ────────────────────────────────────
export const perfectrxInventory = pgTable("perfectrx_inventory", {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
        .references(() => reports.id, { onDelete: "cascade" })
        .notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    quantity: integer("quantity"),
    inTransit: integer("in_transit"),
    runRate30d: integer("run_rate_30d"),
    daysSupply: real("days_supply"),
});
