import { NextRequest, NextResponse } from "next/server";
import { parseAtAGlanceCsv, ParsedReport } from "@/lib/csv-parser";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
    reports,
    lotsPendingRelease,
    releasedInventory,
    lotsInQuarantine,
    skusOnSchedule,
    shipments,
    perfectrxInventory,
} from "@/db/schema";
import * as XLSX from "xlsx";

/** Helper: delete a report and all its child data */
export async function deleteReportById(reportId: number) {
    // Delete children first (in case cascade isn't set in DB)
    await Promise.all([
        db.delete(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, reportId)),
        db.delete(releasedInventory).where(eq(releasedInventory.reportId, reportId)),
        db.delete(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, reportId)),
        db.delete(skusOnSchedule).where(eq(skusOnSchedule.reportId, reportId)),
        db.delete(shipments).where(eq(shipments.reportId, reportId)),
        db.delete(perfectrxInventory).where(eq(perfectrxInventory.reportId, reportId)),
    ]);
    // Then delete the parent
    await db.delete(reports).where(eq(reports.id, reportId));
}

/** Insert a parsed report into the database, returns reportId and counts. */
async function insertParsedReport(
    parsed: ParsedReport,
    reportDate: string,
    filename: string
): Promise<{ reportId: number; counts: Record<string, number> }> {
    // Delete existing report for same date (with children)
    const existing = await db
        .select({ id: reports.id })
        .from(reports)
        .where(eq(reports.reportDate, reportDate));

    for (const r of existing) {
        await deleteReportById(r.id);
    }

    // Insert new report
    const [report] = await db
        .insert(reports)
        .values({ reportDate, filename })
        .returning();

    const reportId = report.id;

    // Insert child data
    if (parsed.pendingRelease.length > 0) {
        await db.insert(lotsPendingRelease).values(
            parsed.pendingRelease.map((lot) => ({
                reportId,
                sku: lot.sku,
                lot: lot.lot,
                bud: lot.bud,
                quantity: lot.quantity,
                dateInspection: lot.dateInspection,
                dateAql: lot.dateAql,
                dateLabel: lot.dateLabel,
                dateTestingReturn: lot.dateTestingReturn,
                dateFinalPlateCheck: lot.dateFinalPlateCheck,
            }))
        );
    }

    if (parsed.releasedInventory.length > 0) {
        await db.insert(releasedInventory).values(
            parsed.releasedInventory.map((item) => ({
                reportId,
                sku: item.sku,
                lot: item.lot,
                bud: item.bud,
                quantityAvailable: item.quantityAvailable,
            }))
        );
    }

    if (parsed.quarantine.length > 0) {
        await db.insert(lotsInQuarantine).values(
            parsed.quarantine.map((lot) => ({
                reportId,
                sku: lot.sku,
                lot: lot.lot,
                quantity: lot.quantity,
                reason: lot.reason,
                solution: lot.solution,
                expectedUpdate: lot.expectedUpdate,
            }))
        );
    }

    if (parsed.scheduled.length > 0) {
        await db.insert(skusOnSchedule).values(
            parsed.scheduled.map((item) => ({
                reportId,
                sku: item.sku,
                quantity: item.quantity,
                scheduledDate: item.scheduledDate,
            }))
        );
    }

    if (parsed.shipments.length > 0) {
        await db.insert(shipments).values(
            parsed.shipments.map((s) => ({
                reportId,
                sku: s.sku,
                lot: s.lot,
                bud: s.bud,
                shipToPerfectDate: s.shipToPerfectDate,
                shipQuantity: s.shipQuantity,
                readyToShip: s.readyToShip,
                shippedQuantity: s.shippedQuantity,
                shipDate: s.shipDate,
                tracking: s.tracking,
            }))
        );
    }

    if (parsed.perfectrxInventory.length > 0) {
        await db.insert(perfectrxInventory).values(
            parsed.perfectrxInventory.map((item) => ({
                reportId,
                sku: item.sku,
                quantity: item.quantity,
                inTransit: item.inTransit,
                runRate30d: item.runRate30d,
                daysSupply: item.daysSupply,
            }))
        );
    }

    return {
        reportId,
        counts: {
            pendingRelease: parsed.pendingRelease.length,
            releasedInventory: parsed.releasedInventory.length,
            quarantine: parsed.quarantine.length,
            scheduled: parsed.scheduled.length,
            shipments: parsed.shipments.length,
            perfectrxInventory: parsed.perfectrxInventory.length,
        },
    };
}

/**
 * Extract report date from a sheet name in MMDDYYYY format.
 * Returns "YYYY-MM-DD" string or null if not parseable.
 */
function dateFromSheetName(name: string): string | null {
    // Sheet names like "03172026" → "2026-03-17"
    const m = name.trim().match(/^(\d{2})(\d{2})(\d{4})$/);
    if (m) {
        const [, month, day, year] = m;
        return `${year}-${month}-${day}`;
    }
    return null;
}

/** POST — Upload a CSV or XLSX report */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const filename = file.name;
        const isXlsx =
            filename.endsWith(".xlsx") ||
            filename.endsWith(".xls") ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel";

        if (isXlsx) {
            // ── XLSX: Each sheet is a separate daily report ──────────────
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });

            const results: {
                sheetName: string;
                reportDate: string;
                reportId: number;
                counts: Record<string, number>;
            }[] = [];
            const errors: { sheetName: string; error: string }[] = [];

            for (const sheetName of workbook.SheetNames) {
                // Skip obviously non-date sheets
                const reportDate = dateFromSheetName(sheetName);
                if (!reportDate) {
                    // Try fallback: might be named like "Sheet24"
                    continue;
                }

                try {
                    const sheet = workbook.Sheets[sheetName];
                    const csvText = XLSX.utils.sheet_to_csv(sheet);
                    const parsed = parseAtAGlanceCsv(csvText);

                    // Only insert if we parsed at least some data
                    const totalRows =
                        parsed.pendingRelease.length +
                        parsed.releasedInventory.length +
                        parsed.quarantine.length +
                        parsed.scheduled.length +
                        parsed.shipments.length +
                        parsed.perfectrxInventory.length;

                    if (totalRows === 0) {
                        errors.push({ sheetName, error: "No data parsed from sheet" });
                        continue;
                    }

                    const { reportId, counts } = await insertParsedReport(
                        parsed,
                        reportDate,
                        `${filename} [${sheetName}]`
                    );

                    results.push({ sheetName, reportDate, reportId, counts });
                } catch (err) {
                    errors.push({
                        sheetName,
                        error: err instanceof Error ? err.message : "Unknown error",
                    });
                }
            }

            return NextResponse.json({
                success: true,
                format: "xlsx",
                sheetsProcessed: results.length,
                sheetsSkipped: workbook.SheetNames.length - results.length,
                reports: results,
                errors: errors.length > 0 ? errors : undefined,
            });
        } else {
            // ── CSV: Single report (original flow) ────────────────────────
            let reportDate = new Date().toISOString().slice(0, 10);

            const dateMatch = filename.match(/(\d{2})_(\d{2})_(\d{4})/);
            if (dateMatch) {
                const [, month, day, year] = dateMatch;
                reportDate = `${year}-${month}-${day}`;
            }

            const csvText = await file.text();
            const parsed = parseAtAGlanceCsv(csvText);

            const { reportId, counts } = await insertParsedReport(
                parsed,
                reportDate,
                filename
            );

            return NextResponse.json({
                success: true,
                format: "csv",
                reportId,
                reportDate,
                counts,
            });
        }
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}

/** GET — List all uploaded reports */
export async function GET() {
    try {
        const allReports = await db
            .select()
            .from(reports)
            .orderBy(reports.reportDate);

        // Enrich each report with row counts sequentially (avoids pool exhaustion)
        const enriched = [];
        for (const r of allReports) {
            const pending = await db.select({ id: lotsPendingRelease.id }).from(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, r.id));
            const released = await db.select({ id: releasedInventory.id }).from(releasedInventory).where(eq(releasedInventory.reportId, r.id));
            const quarantine = await db.select({ id: lotsInQuarantine.id }).from(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, r.id));
            const scheduled = await db.select({ id: skusOnSchedule.id }).from(skusOnSchedule).where(eq(skusOnSchedule.reportId, r.id));
            const shipped = await db.select({ id: shipments.id }).from(shipments).where(eq(shipments.reportId, r.id));
            const perfectrx = await db.select({ id: perfectrxInventory.id }).from(perfectrxInventory).where(eq(perfectrxInventory.reportId, r.id));

            enriched.push({
                ...r,
                counts: {
                    pending: pending.length,
                    released: released.length,
                    quarantine: quarantine.length,
                    scheduled: scheduled.length,
                    shipped: shipped.length,
                    perfectrx: perfectrx.length,
                },
            });
        }

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("List reports error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to list reports" },
            { status: 500 }
        );
    }
}
