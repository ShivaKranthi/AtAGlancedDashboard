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

import { ScheduledCalendarModal, type ScheduledItem } from "./scheduled-calendar-modal";
import { DrilldownModal } from "./drilldown-modal";
import * as React from "react";

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
                "Total vials shipped to PerfectRx for the full week containing the selected report date. Calculated from the Ship Date column across all uploaded report sheets — duplicates are removed automatically.",
            sub: (d) => `${d.shipmentsCount} shipments this week`,
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

export function KpiStrip({ 
  data, 
  scheduledData = [],
  pendingData = [],
  releasedData = [],
  shippedData = [],
  quarantineData = []
}: { 
    data: KpiData; 
    scheduledData?: ScheduledItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingData?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    releasedData?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippedData?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quarantineData?: any[];
}) {
    type ModalType = "none" | "scheduled" | "released" | "pending" | "shipped" | "quarantine";
    const [activeModal, setActiveModal] = React.useState<ModalType>("none");

    return (
        <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {kpiConfig.map((kpi) => {
                    const Icon = kpi.Icon;
                    
                    const CardComponent = (
                        <Card 
                          className="group relative overflow-hidden transition-all cursor-pointer border-slate-800 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-1"
                          onClick={() => {
                              if (kpi.key === "totalScheduled") setActiveModal("scheduled");
                              else if (kpi.key === "totalReleased") setActiveModal("released");
                              else if (kpi.key === "totalPending") setActiveModal("pending");
                              else if (kpi.key === "totalShipped") setActiveModal("shipped");
                              else if (kpi.key === "totalQuarantine") setActiveModal("quarantine");
                          }}
                        >
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
                    );

                    return (
                        <Tip key={kpi.key} tip={kpi.tooltip}>
                            {CardComponent}
                        </Tip>
                    );
                })}
            </div>

            <ScheduledCalendarModal 
                isOpen={activeModal === "scheduled"} 
                onOpenChange={(v) => !v && setActiveModal("none")} 
                data={scheduledData} 
            />

            <DrilldownModal
                isOpen={activeModal === "released"}
                onOpenChange={(v) => !v && setActiveModal("none")}
                title="Released Inventory"
                description="Products that have passed QC and are available to ship."
                icon={<PackageCheck className="w-5 h-5 text-blue-400" />}
                data={releasedData}
                totalVials={data.totalReleased}
                totalLots={releasedData.length}
                skuExtractor={(row) => row.sku}
                lotExtractor={(row) => row.lot}
                columns={[
                    { header: "SKU", accessor: (row) => <span className="font-medium text-white">{row.sku}</span> },
                    { header: "Lot(s)", accessor: (row) => <span className="font-mono text-xs">{row.lot || "—"}</span> },
                    { header: "BUD", accessor: (row) => row.bud || "—" },
                    { header: "Available Qty", accessor: (row) => <span className="font-semibold text-emerald-400">{formatNumber(row.quantityAvailable)}</span>, className: "text-right" }
                ]}
            />

            <DrilldownModal
                isOpen={activeModal === "pending"}
                onOpenChange={(v) => !v && setActiveModal("none")}
                title="Pending Release"
                description="Lots currently going through quality control pipeline."
                icon={<Clock className="w-5 h-5 text-cyan-400" />}
                data={pendingData}
                totalVials={data.totalPending}
                totalLots={data.lotsPending}
                skuExtractor={(row) => row.sku}
                lotExtractor={(row) => row.lot}
                columns={[
                    { header: "SKU", accessor: (row) => <span className="font-medium text-white">{row.sku}</span> },
                    { header: "Lot", accessor: (row) => <span className="font-mono text-xs">{row.lot || "—"}</span> },
                    { header: "BUD", accessor: (row) => row.bud || "—" },
                    { header: "Quantity", accessor: (row) => formatNumber(row.quantity), className: "text-right" },
                    { header: "Inspection", accessor: (row) => row.dateInspection || "—" },
                    { header: "AQL", accessor: (row) => row.dateAql || "—" },
                    { header: "Testing", accessor: (row) => row.dateTestingReturn || "—" },
                    { header: "Plate Check", accessor: (row) => row.dateFinalPlateCheck || "—" }
                ]}
            />

            <DrilldownModal
                isOpen={activeModal === "shipped"}
                onOpenChange={(v) => !v && setActiveModal("none")}
                title="Shipped to PerfectRx"
                description="Shipments fulfilling PerfectRx orders."
                icon={<Truck className="w-5 h-5 text-orange-400" />}
                data={shippedData}
                totalVials={data.totalShipped}
                totalLots={data.shipmentsCount}
                skuExtractor={(row) => row.sku}
                lotExtractor={(row) => row.lot || row.tracking}
                columns={[
                    { header: "SKU", accessor: (row) => <span className="font-medium text-white">{row.sku}</span> },
                    { header: "Lot", accessor: (row) => <span className="font-mono text-xs">{row.lot || "—"}</span> },
                    { header: "Requested", accessor: (row) => formatNumber(row.shipQuantity), className: "text-right" },
                    { header: "Shipped", accessor: (row) => <span className="font-semibold text-orange-400">{formatNumber(row.shippedQuantity)}</span>, className: "text-right" },
                    { header: "Ship Date", accessor: (row) => row.shipDate || "—" },
                    { header: "Tracking", accessor: (row) => <span className="font-mono text-[10px] text-slate-400">{row.tracking || "—"}</span> }
                ]}
            />

            <DrilldownModal
                isOpen={activeModal === "quarantine"}
                onOpenChange={(v) => !v && setActiveModal("none")}
                title="In Quarantine"
                description="Lots flagged with quality issues and blocked from distribution."
                icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
                data={quarantineData}
                totalVials={data.totalQuarantine}
                totalLots={data.lotsInQuarantine}
                skuExtractor={(row) => row.sku}
                lotExtractor={(row) => row.lot}
                columns={[
                    { header: "SKU", accessor: (row) => <span className="font-medium text-white">{row.sku}</span> },
                    { header: "Lot", accessor: (row) => <span className="font-mono text-xs">{row.lot || "—"}</span> },
                    { header: "Quantity", accessor: (row) => <span className="font-semibold text-white">{formatNumber(row.quantity)}</span>, className: "text-right" },
                    { header: "Reason", accessor: (row) => <div className="inline-flex px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">{row.reason || "Unknown"}</div> },
                    { header: "Solution", accessor: (row) => <span className="text-emerald-400 text-sm">{row.solution || "—"}</span> }
                ]}
            />
        </>
    );
}
