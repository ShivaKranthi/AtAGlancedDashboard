"use client";

import { useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseISO, format, isWithinInterval } from "date-fns";
import { Truck, Package, Hash, CalendarDays, ExternalLink } from "lucide-react";

interface TrendDataPoint {
    date: string;
    totalVials: number;
    totalPending: number;
    totalReleased: number;
    totalQuarantine: number;
    totalShipped: number;
    avgDaysSupply: number;
}

interface ShipmentRecord {
    id: number;
    reportId: number;
    sku: string;
    lot: string | null;
    bud: string | null;
    shipToPerfectDate: string | null;
    shipQuantity: number | null;
    readyToShip: boolean | null;
    shippedQuantity: number | null;
    shipDate: string | null;
    tracking: string | null;
}

interface Props {
    data: TrendDataPoint[];
    scope: string;
    shipmentDetails: ShipmentRecord[];
}

// ── Custom tooltip for the shipments bar chart ──────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShipmentTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    let dateLabel = label;
    try { dateLabel = format(parseISO(label), "EEE, MMM d, yyyy"); } catch { /* noop */ }
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
            <p className="text-xs text-slate-400 mb-1">{dateLabel}</p>
            <p className="text-base font-bold text-indigo-400">
                {payload[0].value?.toLocaleString()} vials shipped
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Click bar to see details →</p>
        </div>
    );
};

export function TrendCharts({ data, scope, shipmentDetails }: Props) {
    const [selectedBar, setSelectedBar] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Formatting helper for X axis
    const formatXAxis = (tickItem: string) => {
        try {
            return format(parseISO(tickItem), scope === "month" ? "MMM d" : "EEE, MMM d");
        } catch {
            return tickItem;
        }
    };

    // Calculate percent growth WoW or MoM (first vs last)
    const first = data[0];
    const last = data[data.length - 1];
    
    const getChange = (key: keyof TrendDataPoint) => {
        if (!first || !last || (first[key] as number) === 0) return { val: 0, text: "-" };
        const change = (((last[key] as number) - (first[key] as number)) / (first[key] as number)) * 100;
        return {
            val: change,
            text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
        };
    };

    const vialsChange = getChange('totalVials');
    const shippedChange = getChange('totalShipped');

    // ── Drill-down: get shipments matching a clicked bar date ──────────────
    const getShipmentsForBar = useCallback((barDate: string): ShipmentRecord[] => {
        if (!barDate) return [];
        // For all scopes we match by exact shipDate (each trend point = 1 report date)
        return shipmentDetails.filter(s => s.shipDate === barDate);
    }, [shipmentDetails]);

    const selectedShipments = selectedBar ? getShipmentsForBar(selectedBar) : [];

    const selectedDateLabel = selectedBar
        ? (() => { try { return format(parseISO(selectedBar), "EEEE, MMMM d, yyyy"); } catch { return selectedBar; } })()
        : "";

    const totalSelectedVials = selectedShipments.reduce((s, r) => s + (r.shippedQuantity ?? 0), 0);

    // ── Bar click handler ──────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBarClick = useCallback((entry: any) => {
        if (!entry?.activePayload?.[0]) return;
        const date = entry.activePayload[0].payload.date as string;
        setSelectedBar(date);
        setModalOpen(true);
    }, []);

    return (
        <div className="space-y-6">
            {/* ── Summary metric cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Vials End of Period</CardDescription>
                        <CardTitle className="text-2xl">{last?.totalVials.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className={`text-xs font-semibold ${vialsChange.val > 0 ? "text-emerald-400" : vialsChange.val < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {vialsChange.text}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">vs period start</span>
                    </CardContent>
               </Card>
               <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Shipments End of Period</CardDescription>
                        <CardTitle className="text-2xl">{last?.totalShipped.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className={`text-xs font-semibold ${shippedChange.val > 0 ? "text-emerald-400" : shippedChange.val < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {shippedChange.text}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">vs period start</span>
                    </CardContent>
               </Card>
               <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg Days Supply</CardDescription>
                        <CardTitle className="text-2xl">{last?.avgDaysSupply.toFixed(1)} days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-xs text-muted-foreground">Across all PerfectRx SKUs</span>
                    </CardContent>
               </Card>
            </div>

            {/* ── Charts ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory pipeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Inventory Pipeline Over Time</CardTitle>
                        <CardDescription>Released vs Pending vs Quarantine</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}}
                                    itemStyle={{fontSize: '12px'}}
                                />
                                <Legend wrapperStyle={{fontSize: '12px'}} />
                                <Area type="monotone" dataKey="totalReleased" name="Released" stackId="1" stroke="#34d399" fill="url(#colorReleased)" />
                                <Area type="monotone" dataKey="totalPending" name="Pending QC" stackId="1" stroke="#fbbf24" fill="url(#colorPending)" />
                                <Area type="monotone" dataKey="totalQuarantine" name="Quarantine" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* ── Shipments Volume — INTERACTIVE ──────────────────────── */}
                <Card className={selectedBar ? "ring-1 ring-indigo-500/40" : ""}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-indigo-400" />
                                    Shipments Volume
                                </CardTitle>
                                <CardDescription>
                                    {scope === "day" ? "Daily" : scope === "week" ? "Daily within week" : "Daily within month"} outgoing vials ·{" "}
                                    <span className="text-indigo-400 font-medium">Click any bar to drill down</span>
                                </CardDescription>
                            </div>
                            {selectedBar && (
                                <button
                                    onClick={() => { setSelectedBar(null); setModalOpen(false); }}
                                    className="text-[10px] text-slate-400 hover:text-white border border-slate-700 rounded px-2 py-1 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                onClick={handleBarClick}
                                style={{ cursor: "pointer" }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    content={<ShipmentTooltip />}
                                    cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                                />
                                <Bar dataKey="totalShipped" name="Shipped Vials" radius={[4, 4, 0, 0]}>
                                    {data.map((entry) => (
                                        <Cell
                                            key={entry.date}
                                            fill={selectedBar === entry.date ? "#818cf8" : "#6366f1"}
                                            opacity={selectedBar && selectedBar !== entry.date ? 0.45 : 1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                {/* Days of Supply */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm">Days of Supply Health (PerfectRx)</CardTitle>
                        <CardDescription>Average days of inventory across all SKUs</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}} />
                                <Line type="monotone" dataKey="avgDaysSupply" name="Avg Days Supply" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* ── Shipment Drill-Down Modal ─────────────────────────────────── */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 p-0 overflow-hidden">
                    {/* Header */}
                    <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 bg-linear-to-r from-indigo-500/10 to-transparent">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
                                    <Truck className="h-4 w-4 text-indigo-400" />
                                </div>
                                Shipments — {selectedDateLabel}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5" />
                                    {selectedShipments.length} shipment{selectedShipments.length !== 1 ? "s" : ""}
                                </span>
                                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                                    <Truck className="h-3.5 w-3.5" />
                                    {totalSelectedVials.toLocaleString()} vials shipped
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Table */}
                    <ScrollArea className="max-h-[60vh]">
                        <div className="px-6 py-4">
                            {selectedShipments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                                    <Package className="h-10 w-10 opacity-30" />
                                    <p className="text-sm">No shipments found for this date.</p>
                                    <p className="text-xs">The ship date may not match any recorded shipments for {selectedDateLabel}.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-800 hover:bg-transparent">
                                            <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Ship Date</span>
                                            </TableHead>
                                            <TableHead className="text-slate-400 text-xs uppercase tracking-wider">Drug / SKU</TableHead>
                                            <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> Lot / Batch</span>
                                            </TableHead>
                                            <TableHead className="text-slate-400 text-xs uppercase tracking-wider text-right">Requested</TableHead>
                                            <TableHead className="text-slate-400 text-xs uppercase tracking-wider text-right">Shipped Qty</TableHead>
                                            <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Tracking</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedShipments
                                            .sort((a, b) => (b.shippedQuantity ?? 0) - (a.shippedQuantity ?? 0))
                                            .map((s) => (
                                                <TableRow key={s.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                    <TableCell className="text-slate-300 text-sm">
                                                        {s.shipDate
                                                            ? (() => { try { return format(parseISO(s.shipDate), "MMM d, yyyy"); } catch { return s.shipDate; } })()
                                                            : <span className="text-slate-600">—</span>
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-white text-sm">{s.sku}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-xs text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded">
                                                            {s.lot ?? <span className="text-slate-600">—</span>}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-slate-400 text-sm">
                                                        {s.shipQuantity?.toLocaleString() ?? "—"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 font-semibold tabular-nums"
                                                            variant="outline"
                                                        >
                                                            {s.shippedQuantity?.toLocaleString() ?? "—"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {s.tracking
                                                            ? <span className="font-mono text-[10px] text-slate-400 truncate block max-w-[160px]">{s.tracking}</span>
                                                            : <span className="text-slate-600 text-sm">—</span>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer totals bar */}
                    {selectedShipments.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                            <span>{selectedShipments.length} record{selectedShipments.length !== 1 ? "s" : ""} · deduplicated across all report sheets</span>
                            <span className="text-indigo-300 font-semibold">
                                Total: {totalSelectedVials.toLocaleString()} vials
                            </span>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
