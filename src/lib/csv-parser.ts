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

// ─── Low-level helpers ────────────────────────────────────────────────

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

    if (dateStr) {
        const parsed = new Date(dateStr + "T00:00:00Z");
        if (isNaN(parsed.getTime())) return null;
        const parts = dateStr.split("-").map(Number);
        if (parts[1] < 1 || parts[1] > 12 || parts[2] < 1 || parts[2] > 31) return null;
        return dateStr;
    }

    return null;
}

// ─── Column-map helpers ───────────────────────────────────────────────

/**
 * Normalise a raw header cell value to a canonical field name.
 * Returns the canonical key, or the lowercased raw value if unknown.
 */
function normalizeHeader(raw: string): string {
    const lc = raw.toLowerCase().trim();

    // ── SKU / product name ──
    if (lc === "sku" || lc === "skus" || lc === "skus " || lc === "name" || lc === "product") return "sku";

    // ── Lot / batch ──
    if (lc === "lot" || lc === "lot #" || lc === "lot#" || lc === "lot number" || lc === "batch") return "lot";

    // ── BUD / beyond-use date ──
    if (lc === "bud" || lc === "beyond use date" || lc === "expiry date" || lc === "expiry" || lc === "expires") return "bud";

    // ── Quantity (many variants!) ──
    if (lc === "qty" || lc === "qnty" || lc === "quantity" || lc === "vials" || lc === "units" || lc === "count" || lc === "#") return "qty";
    if (lc === "qnty available" || lc === "qty available" || lc === "quantity available" || lc === "available") return "quantityAvailable";

    // ── Reason / notes ──
    if (lc === "reason" || lc === "notes" || lc === "note" || lc === "failure reason" || lc === "fail reason" || lc === "issue") return "reason";

    // ── Solution ──
    if (lc === "solution" || lc === "remediation" || lc === "resolution" || lc === "action") return "solution";

    // ── Expected update ──
    if (lc === "expected update" || lc === "expected resolution" || lc === "resolution date" || lc === "est. resolution" || lc === "target date") return "expectedUpdate";

    // ── Dates — pending release pipeline ──
    if (lc === "date of inspection" || lc === "date inspection" || lc === "inspection date" || lc === "inspection") return "dateInspection";
    if (lc === "aql date" || lc === "date aql" || lc === "aql") return "dateAql";
    if (lc === "label date" || lc === "date label" || lc === "label") return "dateLabel";
    if (lc === "testing return" || lc === "testing return date" || lc === "date testing return") return "dateTestingReturn";
    if (lc === "final plate check" || lc === "final plate" || lc === "date final plate check") return "dateFinalPlateCheck";

    // ── Scheduled ──
    if (lc === "date" || lc === "scheduled date" || lc === "schedule date") return "scheduledDate";

    // ── Shipment columns ──
    if (lc === "ship to perfect date" || lc === "ship to perfect") return "shipToPerfectDate";
    if (lc === "ship qnty" || lc === "ship qty" || lc === "ship quantity") return "shipQuantity";
    if (lc === "ready to ship") return "readyToShip";
    if (lc === "shipped qnty" || lc === "shipped qty" || lc === "shipped quantity") return "shippedQuantity";
    if (lc === "ship date" || lc === "shipped") return "shipDate";
    if (lc === "tracking" || lc === "tracking #" || lc === "tracking number") return "tracking";

    // ── PerfectRx inventory ──
    if (lc === "in transit" || lc === "intransit") return "inTransit";
    if (lc === "30 day run rate" || lc === "30d run rate" || lc === "run rate") return "runRate30d";
    if (lc === "days supply" || lc === "days of supply") return "daysSupply";

    return lc;
}

/** Turn a raw header row (starting at `startCol`) into a canonical→colIndex map. */
function buildColMap(row: string[], startCol: number): Record<string, number> {
    const map: Record<string, number> = {};
    for (let c = startCol; c < row.length; c++) {
        const raw = clean(row[c]);
        if (!raw) continue;
        const canonical = normalizeHeader(raw);
        if (!(canonical in map)) {
            map[canonical] = c;
        }
    }
    return map;
}

/** Get a cell value by canonical field name, falling back to "" if not mapped. */
function cell(row: string[], colMap: Record<string, number>, field: string): string {
    const idx = colMap[field];
    if (idx === undefined) return "";
    return clean(row[idx] ?? "");
}

// ─── Section title detection ──────────────────────────────────────────

/** Well-known section title strings (prefix-matched, case-insensitive). */
const SECTION_TITLES: [string, string][] = [
    ["lots pending release", "pending"],
    ["released inventory", "released"],
    ["lots in quarantine", "quarantine"],
    ["skus on schedule", "scheduled"],
    ["ship/shipped to perfect", "shipped"],
    ["perfectrx inventory", "perfectrx"],
];

function matchSectionTitle(cellVal: string): string | null {
    const lv = cellVal.toLowerCase().trim();
    for (const [prefix, name] of SECTION_TITLES) {
        if (lv.startsWith(prefix)) return name;
    }
    return null;
}

// ─── Section anchor ───────────────────────────────────────────────────

interface SectionAnchor {
    titleRow: number;
    startCol: number;
    headerRow: number;
    dataStart: number;
    colMap: Record<string, number>;
}

/**
 * Scan every cell in every row. When a section title is found, the NEXT row
 * that contains at least one recognised header keyword (in the same column
 * range) is the header row.
 */
function discoverSections(rows: string[][]): Record<string, SectionAnchor> {
    const anchors: Record<string, SectionAnchor> = {};

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
            const raw = clean(row[c]);
            if (!raw) continue;
            const section = matchSectionTitle(raw);
            if (!section || anchors[section]) continue; // already found this section

            // Look for the header row: the next row that contains recognisable
            // header keywords starting at column `c` or later.
            let headerRow = -1;
            for (let hr = r + 1; hr < Math.min(r + 5, rows.length); hr++) {
                const hrow = rows[hr];
                if (!hrow) continue;
                // Check if any cell from `c` onwards is a recognisable header
                let hasKnown = false;
                for (let hc = c; hc < hrow.length; hc++) {
                    const hv = clean(hrow[hc]);
                    if (!hv) continue;
                    const norm = normalizeHeader(hv);
                    if (norm === "sku" || norm === "lot" || norm === "qty" ||
                        norm === "quantityAvailable" || norm === "reason" ||
                        norm === "bud" || norm === "shipQuantity" ||
                        norm === "inTransit" || norm === "daysSupply" ||
                        norm === "scheduledDate" || norm === "tracking") {
                        hasKnown = true;
                        break;
                    }
                }
                if (hasKnown) {
                    headerRow = hr;
                    break;
                }
            }

            if (headerRow === -1) continue; // couldn't find a header row

            const colMap = buildColMap(rows[headerRow], c);
            anchors[section] = {
                titleRow: r,
                startCol: c,
                headerRow,
                dataStart: headerRow + 1,
                colMap,
            };
        }
    }

    return anchors;
}

// ─── Boundary detection ───────────────────────────────────────────────

/**
 * Returns true if `row` contains a section title in the range [0..maxCol].
 * This is used to stop data extraction when we hit the next section.
 */
function rowHasSectionTitle(row: string[], maxCol: number): boolean {
    for (let c = 0; c <= Math.min(maxCol, row.length - 1); c++) {
        const raw = clean(row[c]);
        if (raw && matchSectionTitle(raw)) return true;
    }
    return false;
}

/** Returns true if all cells in [startCol..endCol] are empty. */
function isRangeEmpty(row: string[], startCol: number, endCol: number): boolean {
    for (let c = startCol; c <= Math.min(endCol, row.length - 1); c++) {
        if (clean(row[c] ?? "") !== "") return false;
    }
    return true;
}

// ─── Per-section data extractors ──────────────────────────────────────

function extractPending(rows: string[][], anchor: SectionAnchor): PendingReleaseLot[] {
    const result: PendingReleaseLot[] = [];
    const { dataStart, colMap, startCol } = anchor;
    // Determine rightmost mapped column for boundary checks
    const maxCol = Math.max(startCol, ...Object.values(colMap));

    for (let r = dataStart; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;

        // Stop at blank left-side rows (section ended)
        if (isRangeEmpty(row, startCol, maxCol)) continue;

        // Stop at next section title in the left-column range
        if (rowHasSectionTitle(row, startCol)) break;

        const sku = cell(row, colMap, "sku");
        const lot = cell(row, colMap, "lot");

        if (!sku || !lot || !lot.toUpperCase().startsWith("PRORX")) continue;

        result.push({
            sku,
            lot,
            bud: parseDateStr(cell(row, colMap, "bud")),
            quantity: parseNum(cell(row, colMap, "qty")),
            dateInspection: parseDateStr(cell(row, colMap, "dateInspection")),
            dateAql: parseDateStr(cell(row, colMap, "dateAql")),
            dateLabel: parseDateStr(cell(row, colMap, "dateLabel")),
            dateTestingReturn: parseDateStr(cell(row, colMap, "dateTestingReturn")),
            dateFinalPlateCheck: parseDateStr(cell(row, colMap, "dateFinalPlateCheck")),
        });
    }

    return result;
}

function extractReleased(rows: string[][], anchor: SectionAnchor): ReleasedInventoryItem[] {
    const result: ReleasedInventoryItem[] = [];
    const { dataStart, colMap, startCol } = anchor;
    const maxCol = Math.max(startCol + 3, ...Object.values(colMap).filter(c => c < 6));

    for (let r = dataStart; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;

        // Stop at next left-side section title
        if (rowHasSectionTitle(row, startCol)) break;

        const sku = cell(row, colMap, "sku");
        if (!sku) continue;

        // Use quantityAvailable if mapped, else fall back to qty
        const qtyStr = cell(row, colMap, "quantityAvailable") || cell(row, colMap, "qty");

        result.push({
            sku,
            lot: cell(row, colMap, "lot") || null,
            bud: parseDateStr(cell(row, colMap, "bud")),
            quantityAvailable: parseNum(qtyStr),
        });
    }

    return result;
}

function extractQuarantine(rows: string[][], anchor: SectionAnchor): QuarantineLot[] {
    const result: QuarantineLot[] = [];
    const { dataStart, colMap, startCol } = anchor;

    for (let r = dataStart; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;

        const sku = cell(row, colMap, "sku");
        const lot = cell(row, colMap, "lot");

        if (!sku || !lot) continue;
        // Skip if the lot doesn't look like a valid lot pattern
        if (!lot.toUpperCase().startsWith("PRORX")) continue;

        let qtyRaw = cell(row, colMap, "qty");
        let reasonRaw = cell(row, colMap, "reason");
        let solutionRaw = cell(row, colMap, "solution");
        let expectedRaw = cell(row, colMap, "expectedUpdate");

        // ─── Edge-case guards: column-shift detection ─────────────

        // Guard A: qty is empty but reason is purely numeric → qty bled into reason
        if (!qtyRaw && reasonRaw && /^[\d,]+$/.test(reasonRaw.trim())) {
            qtyRaw = reasonRaw;
            reasonRaw = solutionRaw;
            solutionRaw = expectedRaw;
            expectedRaw = "";
        }

        // Guard B: Both qty and reason are numeric → double-qty, shift remainder
        if (qtyRaw && reasonRaw && /^[\d,]+$/.test(qtyRaw) && /^[\d,]+$/.test(reasonRaw)) {
            reasonRaw = solutionRaw;
            solutionRaw = expectedRaw;
            expectedRaw = "";
        }

        // Guard C: reason is numeric but qty is non-numeric text → swapped
        if (
            reasonRaw && /^[\d,]+$/.test(reasonRaw) &&
            qtyRaw && isNaN(Number(qtyRaw.replace(/,/g, "")))
        ) {
            const tmp = qtyRaw;
            qtyRaw = reasonRaw;
            reasonRaw = tmp;
        }

        result.push({
            sku,
            lot,
            quantity: parseNum(qtyRaw),
            reason: reasonRaw || null,
            solution: solutionRaw || null,
            expectedUpdate: expectedRaw || null,
        });
    }

    return result;
}

function extractScheduled(rows: string[][], anchor: SectionAnchor): ScheduledSku[] {
    const result: ScheduledSku[] = [];
    const { dataStart, colMap, startCol } = anchor;

    for (let r = dataStart; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        if (rowHasSectionTitle(row, startCol)) break;

        const sku = cell(row, colMap, "sku");
        if (!sku) continue;

        result.push({
            sku,
            quantity: parseNum(cell(row, colMap, "qty")),
            scheduledDate: parseDateStr(cell(row, colMap, "scheduledDate")),
        });
    }

    return result;
}

function extractShipments(rows: string[][], anchor: SectionAnchor): Shipment[] {
    const result: Shipment[] = [];
    const { dataStart, colMap, startCol } = anchor;

    for (let r = dataStart; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        if (rowHasSectionTitle(row, startCol)) break;

        const sku = cell(row, colMap, "sku");
        if (!sku) continue;

        const readyStr = cell(row, colMap, "readyToShip").toLowerCase();

        result.push({
            sku,
            lot: cell(row, colMap, "lot") || null,
            bud: parseDateStr(cell(row, colMap, "bud")),
            shipToPerfectDate: parseDateStr(cell(row, colMap, "shipToPerfectDate")),
            shipQuantity: parseNum(cell(row, colMap, "shipQuantity")),
            readyToShip: readyStr === "yes" || readyStr === "true" || readyStr === "1",
            shippedQuantity: parseNum(cell(row, colMap, "shippedQuantity")),
            shipDate: parseDateStr(cell(row, colMap, "shipDate")),
            tracking: cell(row, colMap, "tracking") || null,
        });
    }

    return result;
}

function extractPerfectrxInventory(rows: string[][], anchor: SectionAnchor): PerfectrxInventoryItem[] {
    const result: PerfectrxInventoryItem[] = [];
    const { dataStart, colMap, startCol } = anchor;

    // Some CSV variants have full headers: SKU, Quantity, In Transit, 30 Day Run Rate, Days Supply
    // Others only label SKU and Days Supply, leaving the middle columns blank.
    //
    // When colMap is incomplete, detect the layout by looking at the Days Supply
    // anchor column and the SKU column to infer positions.
    const skuCol = colMap["sku"] ?? startCol;
    const daysCol = colMap["daysSupply"];
    const hasQty = "qty" in colMap || "quantityAvailable" in colMap;
    const hasInTransit = "inTransit" in colMap;
    const hasRunRate = "runRate30d" in colMap;

    // Positional fallback indices (relative to skuCol):
    //   Variant A (Jan CSV): SKU, Quantity, InTransit, RunRate, DaysSupply  (daysCol = skuCol+4)
    //   Variant B (Mar CSV): SKU, Quantity, Delta, InTransit, RunRate, DaysSupply  (daysCol = skuCol+5)
    let qtyIdx = colMap["qty"] ?? colMap["quantityAvailable"] ?? -1;
    let inTransitIdx = colMap["inTransit"] ?? -1;
    let runRateIdx = colMap["runRate30d"] ?? -1;
    let daysIdx = daysCol ?? -1;

    if (daysIdx >= 0 && (!hasQty || !hasInTransit || !hasRunRate)) {
        const gap = daysIdx - skuCol;
        if (gap === 5) {
            // Variant B: SKU(+0), Qty(+1), Delta(+2), InTransit(+3?), RunRate(+4), Days(+5)
            // But from actual CSV data: col+1=qty, col+2=change, col+3=inTransit, col+4=runRate
            if (qtyIdx < 0) qtyIdx = skuCol + 1;
            if (inTransitIdx < 0) inTransitIdx = skuCol + 3;
            if (runRateIdx < 0) runRateIdx = skuCol + 4;
        } else if (gap === 4) {
            // Variant A: SKU(+0), Qty(+1), InTransit(+2), RunRate(+3), Days(+4)
            if (qtyIdx < 0) qtyIdx = skuCol + 1;
            if (inTransitIdx < 0) inTransitIdx = skuCol + 2;
            if (runRateIdx < 0) runRateIdx = skuCol + 3;
        } else {
            // Unknown layout — try qty = +1 and leave others unfilled
            if (qtyIdx < 0) qtyIdx = skuCol + 1;
        }
    } else if (!hasQty) {
        // No daysSupply and no qty headers at all — last resort positional
        qtyIdx = skuCol + 1;
    }

    for (let r = dataStart; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        if (rowHasSectionTitle(row, startCol)) break;

        const sku = clean(row[skuCol] ?? "");
        if (!sku) continue;

        result.push({
            sku,
            quantity: parseNum(row[qtyIdx] ?? ""),
            inTransit: inTransitIdx >= 0 ? parseNum(row[inTransitIdx] ?? "") : null,
            runRate30d: runRateIdx >= 0 ? parseNum(row[runRateIdx] ?? "") : null,
            daysSupply: daysIdx >= 0 ? parseFloat_(row[daysIdx] ?? "") : null,
        });
    }

    return result;
}

// ─── Main entry point ─────────────────────────────────────────────────

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

    // Phase 1 — discover all sections dynamically
    const anchors = discoverSections(rows);



    // Phase 2 — extract data from each detected section

    if (anchors["pending"]) {
        report.pendingRelease = extractPending(rows, anchors["pending"]);
    }

    if (anchors["released"]) {
        report.releasedInventory = extractReleased(rows, anchors["released"]);
    }

    if (anchors["quarantine"]) {
        report.quarantine = extractQuarantine(rows, anchors["quarantine"]);
    }

    if (anchors["scheduled"]) {
        report.scheduled = extractScheduled(rows, anchors["scheduled"]);
    }

    if (anchors["shipped"]) {
        report.shipments = extractShipments(rows, anchors["shipped"]);
    }

    if (anchors["perfectrx"]) {
        report.perfectrxInventory = extractPerfectrxInventory(rows, anchors["perfectrx"]);
    }


    return report;
}
