import { db } from "@/db";
import {
    reports,
    lotsPendingRelease,
    releasedInventory,
    lotsInQuarantine,
    skusOnSchedule,
    shipments,
    perfectrxInventory,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

// ─── Get latest report ────────────────────────────────────────────

export async function getLatestReport() {
    const [report] = await db
        .select()
        .from(reports)
        .orderBy(desc(reports.uploadedAt))
        .limit(1);
    return report ?? null;
}

// ─── Get all reports (for selector) ───────────────────────────────

export async function getAllReports() {
    return db
        .select()
        .from(reports)
        .orderBy(desc(reports.uploadedAt));
}

// ─── Get report data by ID ────────────────────────────────────────

export async function getReportData(reportId: number) {
    const [
        pending,
        released,
        quarantine,
        scheduled,
        shipped,
        perfectrx,
    ] = await Promise.all([
        db.select().from(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, reportId)),
        db.select().from(releasedInventory).where(eq(releasedInventory.reportId, reportId)),
        db.select().from(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, reportId)),
        db.select().from(skusOnSchedule).where(eq(skusOnSchedule.reportId, reportId)),
        db.select().from(shipments).where(eq(shipments.reportId, reportId)),
        db.select().from(perfectrxInventory).where(eq(perfectrxInventory.reportId, reportId)),
    ]);

    return { pending, released, quarantine, scheduled, shipped, perfectrx };
}

// ─── Get KPI summary for a report ─────────────────────────────────

export async function getKpiSummary(reportId: number) {
    const data = await getReportData(reportId);

    const totalReleased = data.released.reduce(
        (sum, r) => sum + (r.quantityAvailable ?? 0),
        0
    );
    const totalPending = data.pending.reduce(
        (sum, r) => sum + (r.quantity ?? 0),
        0
    );
    const totalScheduled = data.scheduled.reduce(
        (sum, r) => sum + (r.quantity ?? 0),
        0
    );
    const totalShipped = data.shipped.reduce(
        (sum, r) => sum + (r.shippedQuantity ?? 0),
        0
    );
    const totalQuarantine = data.quarantine.reduce(
        (sum, r) => sum + (r.quantity ?? 0),
        0
    );

    // Count critical SKUs (days supply < 7)
    const criticalSkus = data.perfectrx.filter(
        (p) => p.daysSupply !== null && p.daysSupply < 7 && (p.runRate30d ?? 0) > 0
    ).length;

    return {
        totalReleased,
        totalPending,
        totalScheduled,
        totalShipped,
        totalQuarantine,
        criticalSkus,
        lotsInQuarantine: data.quarantine.length,
        lotsPending: data.pending.length,
        shipmentsCount: data.shipped.length,
    };
}
