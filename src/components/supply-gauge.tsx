"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupplyStatus, formatNumber } from "@/lib/utils";
import { Activity } from "lucide-react";
import { Tip } from "@/components/tip";

interface InventoryItem {
    sku: string;
    quantity: number | null;
    inTransit: number | null;
    runRate30d: number | null;
    daysSupply: number | null;
    pendingRelease?: number;
}

export function SupplyGauge({ data }: { data: InventoryItem[] }) {
    const sortedData = data
        .filter((item) => (item.runRate30d ?? 0) > 0)
        .sort((a, b) => (a.daysSupply ?? 999) - (b.daysSupply ?? 999))
        .slice(0, 12);

    const criticalCount = sortedData.filter(
        (item) => item.daysSupply !== null && item.daysSupply < 7
    ).length;

    const maxDays = Math.max(
        ...sortedData.map((d) => d.daysSupply ?? 0).filter((d) => isFinite(d)),
        30
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <Tip
                            icon
                            tip="How many days of stock PerfectRx has for each SKU based on their 30-day run rate. Red = less than 7 days (reorder urgently). Orange = 7–14 days (reorder soon). Yellow = 14–30 days (monitor). Green = 30+ days (healthy)."
                        >
                            Days of Supply at PerfectRx
                        </Tip>
                    </CardTitle>
                    {criticalCount > 0 && (
                        <Tip tip="SKUs with fewer than 7 days of supply. These need immediate attention — production or shipments should be prioritized to avoid stockouts.">
                            <Badge variant="destructive" className="cursor-help text-xs">
                                {criticalCount} Critical
                            </Badge>
                        </Tip>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {sortedData.map((item) => {
                    const status = getSupplyStatus(item.daysSupply);
                    const barWidth = Math.min(
                        ((item.daysSupply ?? 0) / maxDays) * 100,
                        100
                    );
                    const barColor =
                        status.level === "critical"
                            ? "bg-red-500"
                            : status.level === "low"
                                ? "bg-orange-400"
                                : status.level === "ok"
                                    ? "bg-yellow-400"
                                    : "bg-emerald-400";

                    return (
                        <Tip
                            key={item.sku}
                            tip={`${item.sku}: ${item.quantity ?? 0} units in stock, ${item.inTransit ?? 0} in transit. 30-day run rate: ${item.runRate30d ?? 0}/day. Status: ${status.label}. ${(item.pendingRelease ?? 0) > 0 ? `Includes ${formatNumber(item.pendingRelease)} vials pending release.` : 'No pending release inventory.'}`}
                        >
                            <div className="flex cursor-help items-center gap-3">
                                <span className="w-44 shrink-0 truncate text-xs text-muted-foreground">
                                    {item.sku}
                                </span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                                <div className="flex w-36 items-center justify-end gap-1.5 whitespace-nowrap text-right">
                                    <span
                                        className={`w-12 text-right text-xs font-bold ${status.color}`}
                                    >
                                        {item.daysSupply !== null && isFinite(item.daysSupply)
                                            ? `${item.daysSupply.toFixed(1)}d`
                                            : "—"}
                                    </span>
                                    <span className={`text-[10px] font-medium ${(item.pendingRelease ?? 0) > 0 ? "text-indigo-400" : "text-slate-500 opacity-50"}`}>
                                        | {(item.pendingRelease ?? 0) > 0 ? `${formatNumber(item.pendingRelease)} pending` : "No pending"}
                                    </span>
                                </div>
                            </div>
                        </Tip>
                    );
                })}
            </CardContent>
        </Card>
    );
}
