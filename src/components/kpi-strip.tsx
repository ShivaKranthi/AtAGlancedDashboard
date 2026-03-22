"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { Tip } from "@/components/tip";
import {
    PackageCheck,
    Clock,
    CalendarClock,
    Truck,
    ShieldAlert,
    type LucideIcon,
} from "lucide-react";

interface KpiData {
    totalReleased: number;
    totalPending: number;
    totalScheduled: number;
    totalShipped: number;
    totalQuarantine: number;
    lotsPending: number;
    lotsInQuarantine: number;
    shipmentsCount: number;
    criticalSkus: number;
}

const kpiConfig: {
    key: keyof KpiData;
    label: string;
    tooltip: string;
    sub: (d: KpiData) => string;
    accent: string;
    valueColor: string;
    iconColor: string;
    Icon: LucideIcon;
}[] = [
        {
            key: "totalReleased",
            label: "Released Inventory",
            tooltip:
                "Vials that have passed QC (inspection, AQL, labeling, testing, plate check) and are available for shipment to PerfectRx. Higher = more product ready to fulfill orders.",
            sub: () => "Available to ship",
            accent: "from-blue-500 to-cyan-400",
            valueColor: "text-blue-400",
            iconColor: "text-blue-400 bg-blue-400/10",
            Icon: PackageCheck,
        },
        {
            key: "totalPending",
            label: "Pending Release",
            tooltip:
                "Lots currently going through quality control — inspection, AQL sampling, labeling, sterility testing, and final plate checks. These are manufactured but not yet cleared to ship.",
            sub: (d) => `${d.lotsPending} lots in pipeline`,
            accent: "from-cyan-400 to-emerald-400",
            valueColor: "text-cyan-400",
            iconColor: "text-cyan-400 bg-cyan-400/10",
            Icon: Clock,
        },
        {
            key: "totalScheduled",
            label: "On Schedule",
            tooltip:
                "SKUs scheduled for upcoming compounding production runs. This represents the planned manufacturing pipeline — product that will be produced and enter the pending release queue.",
            sub: () => "Upcoming production",
            accent: "from-purple-500 to-pink-400",
            valueColor: "text-purple-400",
            iconColor: "text-purple-400 bg-purple-400/10",
            Icon: CalendarClock,
        },
        {
            key: "totalShipped",
            label: "Shipped to PerfectRx",
            tooltip:
                "Total vials that have been shipped from the compounding facility to PerfectRx for fulfillment and distribution. Includes requested and actual shipped quantities with tracking numbers.",
            sub: (d) => `${d.shipmentsCount} shipments`,
            accent: "from-orange-400 to-yellow-400",
            valueColor: "text-orange-400",
            iconColor: "text-orange-400 bg-orange-400/10",
            Icon: Truck,
        },
        {
            key: "totalQuarantine",
            label: "In Quarantine",
            tooltip:
                "Lots that failed quality checks and are held in quarantine. Common reasons include low phenol potency, crimping issues, or out-of-spec API. These cannot ship until resolved — watch for high numbers.",
            sub: (d) => `${d.lotsInQuarantine} lots blocked`,
            accent: "from-red-500 to-orange-400",
            valueColor: "text-red-400",
            iconColor: "text-red-400 bg-red-400/10",
            Icon: ShieldAlert,
        },
    ];

export function KpiStrip({ data }: { data: KpiData }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {kpiConfig.map((kpi) => {
                const Icon = kpi.Icon;
                return (
                    <Tip key={kpi.key} tip={kpi.tooltip}>
                        <Card className="group relative cursor-help overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30">
                            <div
                                className={`absolute inset-x-0 top-0 h-[3px] bg-linear-to-r ${kpi.accent}`}
                            />
                            <CardContent className="pt-5">
                                <div className="mb-3 flex items-center gap-2.5">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconColor}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                                        {kpi.label}
                                    </p>
                                </div>
                                <p
                                    className={`text-3xl font-extrabold tracking-tight ${kpi.valueColor}`}
                                >
                                    {formatNumber(data[kpi.key])}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {kpi.sub(data)}
                                </p>
                            </CardContent>
                        </Card>
                    </Tip>
                );
            })}
        </div>
    );
}
