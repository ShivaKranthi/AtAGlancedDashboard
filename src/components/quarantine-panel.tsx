"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { Tip } from "@/components/tip";

interface QuarantineItem {
    sku: string;
    lot: string;
    quantity: number | null;
    reason: string | null;
    solution: string | null;
}

export function QuarantinePanel({ data }: { data: QuarantineItem[] }) {
    const totalVials = data.reduce((sum, d) => sum + (d.quantity ?? 0), 0);

    const reasonCounts: Record<string, number> = {};
    data.forEach((d) => {
        const reason = d.reason || "Unknown";
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);

    const skuCounts: Record<string, number> = {};
    data.forEach((d) => {
        skuCounts[d.sku] = (skuCounts[d.sku] || 0) + 1;
    });
    const topSkus = Object.entries(skuCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const dotColors = [
        "bg-red-500",
        "bg-orange-400",
        "bg-purple-500",
        "bg-blue-400",
        "bg-pink-400",
        "bg-yellow-400",
        "bg-emerald-400",
        "bg-teal-400",
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <TriangleAlert className="h-4 w-4 text-amber-400" />
                        <Tip
                            icon
                            tip="Lots that failed quality checks (e.g. low potency, crimping issues, out-of-spec API) and are held until resolved. These cannot be shipped. Track reasons to identify systemic production issues."
                        >
                            Quarantine Analysis
                        </Tip>
                    </CardTitle>
                    <Badge variant="destructive" className="text-xs">
                        {data.length} Lots · {formatNumber(totalVials)} Vials
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Reason breakdown */}
                <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Reasons
                    </p>
                    <div className="space-y-2.5">
                        {sortedReasons.map(([reason, count], i) => (
                            <div key={reason} className="flex items-center gap-3">
                                <div
                                    className={`h-2.5 w-2.5 shrink-0 rounded-sm ${dotColors[i % dotColors.length]}`}
                                />
                                <span className="flex-1 truncate text-xs text-muted-foreground">
                                    {reason}
                                </span>
                                <span className="text-xs font-bold">
                                    {count} lot{count > 1 ? "s" : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Most affected SKUs */}
                <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Most Affected SKUs
                    </p>
                    <div className="space-y-3">
                        {topSkus.map(([sku, count]) => {
                            const maxCount = topSkus[0][1];
                            const barWidth = (count / maxCount) * 100;
                            return (
                                <div key={sku}>
                                    <div className="mb-1 flex justify-between">
                                        <span className="text-xs text-muted-foreground">{sku}</span>
                                        <span className="text-xs font-bold">
                                            {count} lot{count > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className="h-full rounded-full bg-linear-to-r from-red-500 to-orange-400"
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
