import { NextRequest, NextResponse } from "next/server";
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

/** DELETE /api/upload/[id] — Delete a report and all its data */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const reportId = parseInt(id, 10);
        if (isNaN(reportId)) {
            return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
        }

        // Check report exists
        const [existing] = await db
            .select()
            .from(reports)
            .where(eq(reports.id, reportId));

        if (!existing) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // Delete children first (sequential to avoid pool exhaustion)
        await db.delete(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, reportId));
        await db.delete(releasedInventory).where(eq(releasedInventory.reportId, reportId));
        await db.delete(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, reportId));
        await db.delete(skusOnSchedule).where(eq(skusOnSchedule.reportId, reportId));
        await db.delete(shipments).where(eq(shipments.reportId, reportId));
        await db.delete(perfectrxInventory).where(eq(perfectrxInventory.reportId, reportId));

        // Delete parent
        await db.delete(reports).where(eq(reports.id, reportId));

        return NextResponse.json({
            success: true,
            deleted: {
                id: reportId,
                reportDate: existing.reportDate,
                filename: existing.filename,
            },
        });
    } catch (error) {
        console.error("Delete report error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Delete failed" },
            { status: 500 }
        );
    }
}

/** GET /api/upload/[id] — Get a specific report with summary counts */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const reportId = parseInt(id, 10);
        if (isNaN(reportId)) {
            return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
        }

        const [report] = await db
            .select()
            .from(reports)
            .where(eq(reports.id, reportId));

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const [pending, released, quarantine, scheduled, shipped, perfectrx] =
            await Promise.all([
                db.select().from(lotsPendingRelease).where(eq(lotsPendingRelease.reportId, reportId)),
                db.select().from(releasedInventory).where(eq(releasedInventory.reportId, reportId)),
                db.select().from(lotsInQuarantine).where(eq(lotsInQuarantine.reportId, reportId)),
                db.select().from(skusOnSchedule).where(eq(skusOnSchedule.reportId, reportId)),
                db.select().from(shipments).where(eq(shipments.reportId, reportId)),
                db.select().from(perfectrxInventory).where(eq(perfectrxInventory.reportId, reportId)),
            ]);

        return NextResponse.json({
            ...report,
            counts: {
                pending: pending.length,
                released: released.length,
                quarantine: quarantine.length,
                scheduled: scheduled.length,
                shipped: shipped.length,
                perfectrx: perfectrx.length,
            },
        });
    } catch (error) {
        console.error("Get report error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get report" },
            { status: 500 }
        );
    }
}
