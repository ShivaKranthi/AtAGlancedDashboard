import Papa from "papaparse";

// ─── Types ───────────────────────────────────────────────────────────

export interface PendingReleaseLot {
    sku: string;
    lot: string;
    bud: string | null;
    quantity: number | null;
    dateInspection: string | null;
    dateAql: string | null;
    dateLabel: string | null;
    dateTestingReturn: string | null;
    dateFinalPlateCheck: string | null;
}

export interface ReleasedInventoryItem {
    sku: string;
    lot: string | null;
    bud: string | null;
    quantityAvailable: number | null;
}

export interface QuarantineLot {
    sku: string;
    lot: string;
    quantity: number | null;
    reason: string | null;
    solution: string | null;
    expectedUpdate: string | null;
}

export interface ScheduledSku {
    sku: string;
    quantity: number | null;
    scheduledDate: string | null;
}

export interface Shipment {
    sku: string;
    lot: string | null;
    bud: string | null;
    shipToPerfectDate: string | null;
    shipQuantity: number | null;
    readyToShip: boolean;
    shippedQuantity: number | null;
    shipDate: string | null;
    tracking: string | null;
}

export interface PerfectrxInventoryItem {
    sku: string;
    quantity: number | null;
    inTransit: number | null;
    runRate30d: number | null;
    daysSupply: number | null;
}

export interface ParsedReport {
    pendingRelease: PendingReleaseLot[];
    releasedInventory: ReleasedInventoryItem[];
    quarantine: QuarantineLot[];
    scheduled: ScheduledSku[];
    shipments: Shipment[];
    perfectrxInventory: PerfectrxInventoryItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────

function clean(val: string | undefined | null): string {
    if (!val) return "";
    return val.trim().replace(/\r/g, "");
}

function parseNum(val: string | undefined | null): number | null {
    if (!val) return null;
    const cleaned = val.trim().replace(/,/g, "").replace(/"/g, "");
    if (cleaned === "" || cleaned === "#DIV/0!" || cleaned === "#N/A") return null;
    const n = Number(cleaned);
    return isNaN(n) ? null : n;
}

function parseFloat_(val: string | undefined | null): number | null {
    if (!val) return null;
    const cleaned = val.trim().replace(/,/g, "").replace(/"/g, "");
    if (cleaned === "" || cleaned === "#DIV/0!" || cleaned === "#N/A" || !isFinite(Number(cleaned)))
        return null;
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
}

function parseDateStr(val: string | undefined | null): string | null {
    if (!val) return null;
    const v = val.trim();
    if (v === "") return null;

    let dateStr: string | null = null;

    // Format: MM/DD/YYYY
    const slashMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        const [, m, d, y] = slashMatch;
        dateStr = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Format: DD-Mon-YYYY (e.g. 19-Jan-2026)
    if (!dateStr) {
        const dashMonMatch = v.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
        if (dashMonMatch) {
            const [, d, mon, y] = dashMonMatch;
            const months: Record<string, string> = {
                Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
                Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
            };
            const m = months[mon];
            if (m) dateStr = `${y}-${m}-${d.padStart(2, "0")}`;
        }
    }

    // Validate the date string is actually valid
    if (dateStr) {
        const parsed = new Date(dateStr + "T00:00:00Z");
        if (isNaN(parsed.getTime())) return null;
        // Check month/day are in valid range
        const parts = dateStr.split("-").map(Number);
        if (parts[1] < 1 || parts[1] > 12 || parts[2] < 1 || parts[2] > 31) return null;
        return dateStr;
    }

    return null;
}

// ─── Main Parser ─────────────────────────────────────────────────────

export function parseAtAGlanceCsv(csvText: string): ParsedReport {
    const result = Papa.parse<string[]>(csvText, {
        header: false,
        skipEmptyLines: false,
    });

    const rows = result.data;
    const report: ParsedReport = {
        pendingRelease: [],
        releasedInventory: [],
        quarantine: [],
        scheduled: [],
        shipments: [],
        perfectrxInventory: [],
    };

    let currentSection = "";

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const cell0 = clean(row[0]);
        const cell6 = clean(row[6] ?? "");

        // ─── Detect section headers ──────────────────────────────
        if (cell0.startsWith("Lots Pending Release")) {
            currentSection = "pending";
            continue;
        }
        if (cell0.startsWith("Released Inventory")) {
            currentSection = "released";
            continue;
        }
        if (cell0.startsWith("Skus on Schedule")) {
            currentSection = "scheduled";
            continue;
        }
        if (cell0.startsWith("Ship/Shipped to Perfect")) {
            currentSection = "shipped";
            continue;
        }
        if (cell0.startsWith("PerfectRx Inventory")) {
            currentSection = "perfectrx";
            continue;
        }

        // Skip header rows (contain "Skus", "SKU", "Name")
        if (
            cell0 === "Skus" ||
            cell0 === "SKU" ||
            cell0 === "Name" ||
            cell0 === "Skus "
        ) {
            // Also check for quarantine header in the right columns
            if (cell6 === "Lots in Quarantine" || clean(row[6] ?? "") === "Lots in Quarantine") {
                // quarantine section starts here in right cols
            }
            continue;
        }

        // ─── Parse Quarantine (right side, cols 6-11) ────────────
        // Quarantine rows appear alongside Released Inventory rows
        const qSku = clean(row[6] ?? "");
        const qLot = clean(row[7] ?? "");
        const qQty = parseNum(row[8] ?? "");
        const qReason = clean(row[9] ?? "");

        if (
            currentSection === "released" &&
            qSku &&
            qSku !== "Skus" &&
            qSku !== "Lots in Quarantine" &&
            qLot &&
            qLot.startsWith("PRORX")
        ) {
            report.quarantine.push({
                sku: qSku,
                lot: qLot,
                quantity: qQty,
                reason: qReason || null,
                solution: clean(row[10] ?? "") || null,
                expectedUpdate: clean(row[11] ?? "") || null,
            });
        }

        // ─── Parse each section (left side) ──────────────────────
        if (cell0 === "" || cell0 === ",") continue;

        switch (currentSection) {
            case "pending": {
                const sku = cell0;
                const lot = clean(row[1] ?? "");
                if (!lot || !lot.startsWith("PRORX")) continue;
                report.pendingRelease.push({
                    sku,
                    lot,
                    bud: parseDateStr(row[2] ?? ""),
                    quantity: parseNum(row[3] ?? ""),
                    dateInspection: parseDateStr(row[4] ?? ""),
                    dateAql: parseDateStr(row[5] ?? ""),
                    dateLabel: parseDateStr(row[6] ?? ""),
                    dateTestingReturn: parseDateStr(row[7] ?? ""),
                    dateFinalPlateCheck: parseDateStr(row[8] ?? ""),
                });
                break;
            }

            case "released": {
                const sku = cell0;
                if (!sku) continue;
                report.releasedInventory.push({
                    sku,
                    lot: clean(row[1] ?? "") || null,
                    bud: parseDateStr(row[2] ?? ""),
                    quantityAvailable: parseNum(row[3] ?? ""),
                });
                break;
            }

            case "scheduled": {
                const sku = cell0;
                if (!sku) continue;
                report.scheduled.push({
                    sku,
                    quantity: parseNum(row[1] ?? ""),
                    scheduledDate: parseDateStr(row[2] ?? ""),
                });
                break;
            }

            case "shipped": {
                const sku = cell0;
                if (!sku) continue;
                report.shipments.push({
                    sku,
                    lot: clean(row[1] ?? "") || null,
                    bud: parseDateStr(row[2] ?? ""),
                    shipToPerfectDate: parseDateStr(row[3] ?? ""),
                    shipQuantity: parseNum(row[4] ?? ""),
                    readyToShip: clean(row[5] ?? "").toLowerCase() === "yes",
                    shippedQuantity: parseNum(row[6] ?? ""),
                    shipDate: parseDateStr(row[7] ?? ""),
                    tracking: clean(row[8] ?? "") || null,
                });
                break;
            }

            case "perfectrx": {
                const sku = cell0;
                if (!sku) continue;
                report.perfectrxInventory.push({
                    sku,
                    quantity: parseNum(row[1] ?? ""),
                    inTransit: parseNum(row[2] ?? ""),
                    runRate30d: parseNum(row[3] ?? ""),
                    daysSupply: parseFloat_(row[4] ?? ""),
                });
                break;
            }
        }
    }

    return report;
}
