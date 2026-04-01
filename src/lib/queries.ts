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
import { desc, eq, between, asc } from "drizzle-orm";

// ─── Get latest report ────────────────────────────────────────────

export async function getLatestReport() {
    const [report] = await db
        .select()
        .from(reports)
        .orderBy(desc(reports.reportDate))
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
    
    const [report] = await db.select().from(reports).where(eq(reports.id, reportId));
    const targetDate = report?.reportDate;

    const allShippedGlobally = await db.select().from(shipments);
    const uniqueGlobalShipmentsMap = new Map();
    for (const s of allShippedGlobally) {
        if (!s.shipDate) continue;
        const id = s.tracking ? s.tracking : `${s.sku}|${s.lot ?? "nolot"}|${s.shipDate}`;
        if (!uniqueGlobalShipmentsMap.has(id) || s.reportId > uniqueGlobalShipmentsMap.get(id).reportId) {
            uniqueGlobalShipmentsMap.set(id, s);
        }
    }
    const globalValidShipments = Array.from(uniqueGlobalShipmentsMap.values());

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
    // Filter global shipment calculation by exact report date
    const filteredShipments = globalValidShipments.filter((s) => s.shipDate === targetDate);
    const totalShipped = filteredShipments.reduce((sum, r) => sum + (r.shippedQuantity ?? 0), 0);
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
        shipmentsCount: filteredShipments.length, // count of deduplicated, date-matched shipments
    };
}

// ─── Get all available report dates ───────────────────────────────
export async function getAvailableDates() {
    const dates = await db
        .select({ date: reports.reportDate })
        .from(reports)
        .groupBy(reports.reportDate)
        .orderBy(desc(reports.reportDate));
    return dates.map(d => d.date);
}

// ─── Get Aggregated Report Data ───────────────────────────────────
export async function getAggregatedReportData(startDate: string, endDate: string) {
    const reportReps = await db
        .select()
        .from(reports)
        .where(between(reports.reportDate, startDate, endDate))
        .orderBy(desc(reports.reportDate));

    if (reportReps.length === 0) return null;

    // Use latest snapshot for inventory statuses and datasets
    const latestReportId = reportReps[0].id; // 0 is latest because desc

    const [
        pending,
        released,
        quarantine,
        perfectrx,
        scheduled,
        allShippedGlobally,
    ] = await Promise.all([
        db.select().from(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, latestReportId)),
        db.select().from(releasedInventory).where(eq(releasedInventory.reportId, latestReportId)),
        db.select().from(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, latestReportId)),
        db.select().from(perfectrxInventory).where(eq(perfectrxInventory.reportId, latestReportId)),
        db.select().from(skusOnSchedule).where(eq(skusOnSchedule.reportId, latestReportId)),
        db.select().from(shipments), // Fetch ALL shipments globally to avoid missing delayed entries
    ]);

    // Deduplicate globally across all reports
    const uniqueGlobalShipmentsMap = new Map();
    for (const s of allShippedGlobally) {
        if (!s.shipDate) continue;
        const id = s.tracking ? s.tracking : `${s.sku}|${s.lot ?? "nolot"}|${s.shipDate}`;
        if (!uniqueGlobalShipmentsMap.has(id) || s.reportId > uniqueGlobalShipmentsMap.get(id).reportId) {
            uniqueGlobalShipmentsMap.set(id, s);
        }
    }

    // Filter deduplicated shipments to only include ones that shipped within the [startDate, endDate] range
    const shipped = Array.from(uniqueGlobalShipmentsMap.values()).filter(s => {
        return s.shipDate! >= startDate && s.shipDate! <= endDate;
    });

    return { 
        pending, 
        released, 
        quarantine, 
        perfectrx, 
        scheduled, 
        shipped,
        reportCount: reportReps.length,
        latestReportDate: reportReps[0].reportDate
    };
}

// ─── Get KPI summary for aggregated data ──────────────────────────
export async function getAggregatedKpiSummary(data: NonNullable<Awaited<ReturnType<typeof getAggregatedReportData>>>) {
    const totalReleased = data.released.reduce((sum, r) => sum + (r.quantityAvailable ?? 0), 0);
    const totalPending = data.pending.reduce((sum, r) => sum + (r.quantity ?? 0), 0);
    const totalScheduled = data.scheduled.reduce((sum, r) => sum + (r.quantity ?? 0), 0);
    const totalShipped = data.shipped.reduce((sum, r) => sum + (r.shippedQuantity ?? 0), 0);
    const totalQuarantine = data.quarantine.reduce((sum, r) => sum + (r.quantity ?? 0), 0);

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
        shipmentsCount: data.shipped.length, // filtered correctly now
    };
}

// ─── Get Trend Data for Charts ────────────────────────────────────
export async function getTrendData(startDate: string, endDate: string) {
    const reportReps = await db
        .select()
        .from(reports)
        .where(between(reports.reportDate, startDate, endDate))
        .orderBy(asc(reports.reportDate));

    if (reportReps.length === 0) return [];

    const allShippedGlobally = await db.select().from(shipments);
    const uniqueGlobalShipmentsMap = new Map();
    for (const s of allShippedGlobally) {
        if (!s.shipDate) continue;
        const id = s.tracking ? s.tracking : `${s.sku}|${s.lot ?? "nolot"}|${s.shipDate}`;
        if (!uniqueGlobalShipmentsMap.has(id) || s.reportId > uniqueGlobalShipmentsMap.get(id).reportId) {
            uniqueGlobalShipmentsMap.set(id, s);
        }
    }
    const globalValidShipments = Array.from(uniqueGlobalShipmentsMap.values());

    const trendData = [];
    for (const r of reportReps) {
        // Can make this more efficient by fetching all and grouping, but sequential is okay since SQLite/PG is fast locally and it's a small scale.
        const pending = await db.select({ quantity: lotsPendingRelease.quantity }).from(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, r.id));
        const released = await db.select({ quantityAvailable: releasedInventory.quantityAvailable }).from(releasedInventory).where(eq(releasedInventory.reportId, r.id));
        const quarantine = await db.select({ quantity: lotsInQuarantine.quantity }).from(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, r.id));
        const perfectrx = await db.select({ daysSupply: perfectrxInventory.daysSupply, runRate30d: perfectrxInventory.runRate30d }).from(perfectrxInventory).where(eq(perfectrxInventory.reportId, r.id));

        const totalPending = pending.reduce((sum, p) => sum + (p.quantity ?? 0), 0);
        const totalReleased = released.reduce((sum, rel) => sum + (rel.quantityAvailable ?? 0), 0);
        const totalQuarantine = quarantine.reduce((sum, q) => sum + (q.quantity ?? 0), 0);
        
        // Match shipments to exactly this report's date to avoid cumulative trend lines!
        const totalShipped = globalValidShipments
            .filter((s) => s.shipDate === r.reportDate)
            .reduce((sum, s) => sum + (s.shippedQuantity ?? 0), 0);
        
        const totalVials = totalPending + totalReleased + totalQuarantine;
        
        let avgDaysSupply = 0;
        const validSupply = perfectrx.filter(p => p.daysSupply !== null && p.daysSupply > 0 && p.daysSupply !== Infinity && (p.runRate30d ?? 0) > 0);
        if (validSupply.length > 0) {
            avgDaysSupply = validSupply.reduce((sum, p) => sum + (p.daysSupply ?? 0), 0) / validSupply.length;
        }

        trendData.push({
            date: r.reportDate,
            totalVials,
            totalPending,
            totalReleased,
            totalQuarantine,
            totalShipped,
            avgDaysSupply: Math.round(avgDaysSupply * 10) / 10
        });
    }

    return trendData;
}
