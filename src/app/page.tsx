import { getLatestReport, getKpiSummary, getReportData } from "@/lib/queries";
import { KpiStrip } from "@/components/kpi-strip";
import { SupplyGauge } from "@/components/supply-gauge";
import { QuarantinePanel } from "@/components/quarantine-panel";
import { formatNumber, getSupplyStatus } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  Upload,
  Flame,
  Clock,
  CircleAlert,
  Truck,
  PackageCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Tip } from "@/components/tip";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let report;
  try {
    report = await getLatestReport();
  } catch {
    report = null;
  }

  if (!report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
          <Upload className="h-10 w-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Reports Yet</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Upload your first &quot;At a Glance&quot; CSV report to see your
            analytics dashboard.
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1"
        >
          Upload Your First Report
        </Link>
      </div>
    );
  }

  const [kpi, data] = await Promise.all([
    getKpiSummary(report.id),
    getReportData(report.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Report header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Report: {report.reportDate} · {report.filename}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/guide"
            className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-1 hover:text-foreground"
          >
            <BookOpen className="h-3.5 w-3.5" /> Business Guide
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1"
          >
            <Upload className="h-3.5 w-3.5" /> Upload New
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <KpiStrip data={kpi} />

      {/* Supply gauge + Quarantine — side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SupplyGauge data={data.perfectrx} />
        <QuarantinePanel data={data.quarantine} />
      </div>

      {/* ── Top SKUs by Demand ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-orange-400" />
              <Tip
                icon
                tip="SKUs ranked by 30-day run rate at PerfectRx — the rate at which the product sells. Use this to prioritize production and shipments for high-demand items."
              >
                Top SKUs by 30-Day Demand (PerfectRx)
              </Tip>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">
                  <Tip icon tip="Average units sold per 30 days at PerfectRx. Higher run rate = higher demand product.">
                    Run Rate
                  </Tip>
                </TableHead>
                <TableHead className="text-right">
                  <Tip icon tip="Current stock at PerfectRx warehouse. Compare with run rate to gauge urgency.">
                    Stock
                  </Tip>
                </TableHead>
                <TableHead className="text-right">
                  <Tip icon tip="Units currently being shipped to PerfectRx (not yet received).">
                    In Transit
                  </Tip>
                </TableHead>
                <TableHead className="text-right">
                  <Tip icon tip="Days of supply = (Stock + In Transit) ÷ Daily Run Rate. Red = urgent reorder, Green = healthy.">
                    Supply Status
                  </Tip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.perfectrx
                .filter((d) => (d.runRate30d ?? 0) > 0)
                .sort((a, b) => (b.runRate30d ?? 0) - (a.runRate30d ?? 0))
                .slice(0, 10)
                .map((item) => {
                  const status = getSupplyStatus(item.daysSupply);
                  return (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.runRate30d)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.inTransit ? formatNumber(item.inTransit) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            status.level === "critical"
                              ? "destructive"
                              : status.level === "low"
                                ? "outline"
                                : "secondary"
                          }
                          className={
                            status.level === "critical"
                              ? ""
                              : status.level === "low"
                                ? "border-orange-400/40 text-orange-400"
                                : status.level === "ok"
                                  ? "text-yellow-400"
                                  : "text-emerald-400"
                          }
                        >
                          {status.level === "critical" && (
                            <AlertTriangle className="mr-1 inline h-3 w-3" />
                          )}
                          {item.daysSupply !== null && isFinite(item.daysSupply)
                            ? `${item.daysSupply.toFixed(1)} days`
                            : "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Lots Pending Release ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-400" />
              <Tip
                icon
                tip="Manufactured lots currently in the quality control pipeline. Each lot goes through 5 QC stages: Inspection → AQL (sampling) → Labeling → Sterility Testing → Final Plate Check. Once all pass, the lot is 'Released'."
              >
                Lots Pending Release
              </Tip>
            </CardTitle>
            <Badge variant="outline" className="border-orange-400/40 text-orange-400">
              {data.pending.length} Lots
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>
                    <Tip icon tip="Unique batch identifier (e.g. PRORX01152026@1). Tracks this specific production run through QC.">Lot</Tip>
                  </TableHead>
                  <TableHead>
                    <Tip icon tip="Beyond-Use Date — expiration date for this compounded product. After this date, the product cannot be dispensed.">BUD</Tip>
                  </TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>
                    <Tip icon tip="Date the lot was physically inspected for defects (vial integrity, fill volume, appearance).">Inspection</Tip>
                  </TableHead>
                  <TableHead>
                    <Tip icon tip="Acceptable Quality Level — date samples were pulled for statistical quality sampling.">AQL</Tip>
                  </TableHead>
                  <TableHead>
                    <Tip icon tip="Date labels were applied and verified for accuracy (drug name, strength, lot, BUD).">Label</Tip>
                  </TableHead>
                  <TableHead>
                    <Tip icon tip="Date sterility/potency test results returned from the lab.">Testing</Tip>
                  </TableHead>
                  <TableHead>
                    <Tip icon tip="Final microbial plate check — confirms no contamination. Last step before release.">Plate Check</Tip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pending.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {lot.sku}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{lot.lot}</TableCell>
                    <TableCell className="whitespace-nowrap">{lot.bud ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatNumber(lot.quantity)}</TableCell>
                    <TableCell>{lot.dateInspection ?? "—"}</TableCell>
                    <TableCell>{lot.dateAql ?? "—"}</TableCell>
                    <TableCell>{lot.dateLabel ?? "—"}</TableCell>
                    <TableCell>{lot.dateTestingReturn ?? "—"}</TableCell>
                    <TableCell>{lot.dateFinalPlateCheck ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Quarantine Table ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CircleAlert className="h-4 w-4 text-red-400" />
              <Tip
                icon
                tip="Lots held due to quality failures. Each lot lists the failure reason and proposed solution. Resolve these to recover blocked inventory."
              >
                Lots in Quarantine
              </Tip>
            </CardTitle>
            <Badge variant="destructive">{data.quarantine.length} Lots</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>
                  <Tip icon tip="Why this lot failed QC — e.g. Low Phenol Potency, Crimping Issues, High AQS, etc.">Reason</Tip>
                </TableHead>
                <TableHead>
                  <Tip icon tip="Proposed corrective action — e.g. Recrimp, Inspect and recrimp, Retest, etc.">Solution</Tip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.quarantine.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {lot.sku}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{lot.lot}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(lot.quantity)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs">
                      {lot.reason || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-400">
                    {lot.solution || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Shipments ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-blue-400" />
              <Tip
                icon
                tip="Shipments sent from the compounding facility to PerfectRx for fulfillment. Compare 'Requested' vs 'Shipped' to see if orders are fully filled."
              >
                Shipments to PerfectRx
              </Tip>
            </CardTitle>
            <Badge variant="outline" className="border-blue-400/40 text-blue-400">
              {data.shipped.length} Shipments
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead className="text-right">
                    <Tip icon tip="Number of vials requested by PerfectRx for this SKU/lot.">Requested</Tip>
                  </TableHead>
                  <TableHead className="text-right">
                    <Tip icon tip="Actual number of vials shipped. May differ from requested if stock was short.">Shipped</Tip>
                  </TableHead>
                  <TableHead>Ship Date</TableHead>
                  <TableHead>
                    <Tip icon tip="Carrier tracking number(s) for this shipment.">Tracking</Tip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.shipped.slice(0, 20).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {s.sku}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.lot ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(s.shipQuantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(s.shippedQuantity)}
                    </TableCell>
                    <TableCell>{s.shipDate ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-xs">
                      {s.tracking || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Released Inventory ── */}
      <Card className="mb-10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PackageCheck className="h-4 w-4 text-emerald-400" />
              <Tip
                icon
                tip="Lots that passed all QC checks and are ready to ship. This is your available inventory for fulfilling PerfectRx orders."
              >
                Released Inventory (Available to Ship)
              </Tip>
            </CardTitle>
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-400">
              {formatNumber(kpi.totalReleased)} Vials
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Lot(s)</TableHead>
                <TableHead>
                  <Tip icon tip="Beyond-Use Date — the product must be shipped and used before this date.">BUD</Tip>
                </TableHead>
                <TableHead className="text-right">
                  <Tip icon tip="Number of vials available for immediate shipment.">Available Qty</Tip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.released
                .filter((r) => (r.quantityAvailable ?? 0) > 0)
                .sort((a, b) => (b.quantityAvailable ?? 0) - (a.quantityAvailable ?? 0))
                .map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.sku}</TableCell>
                    <TableCell className="font-mono text-xs">{r.lot ?? "—"}</TableCell>
                    <TableCell>{r.bud ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(r.quantityAvailable)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
