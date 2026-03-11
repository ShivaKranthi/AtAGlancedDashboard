import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
    PackageCheck,
    Clock,
    CalendarClock,
    Truck,
    ShieldAlert,
    Activity,
    TriangleAlert,
    Flame,
    CircleAlert,
    ArrowLeft,
    BookOpen,
} from "lucide-react";

export const metadata = {
    title: "ProRx Analytics — Business Guide",
    description: "Complete guide to understanding the ProRx Analytics dashboard metrics, colors, and terminology.",
};

const statusColors = [
    { label: "Critical (< 7 days)", color: "bg-red-500", textColor: "text-red-400", meaning: "Immediate action needed — this SKU will stock out within a week at current demand. Prioritize production and shipment." },
    { label: "Low (7–14 days)", color: "bg-orange-400", textColor: "text-orange-400", meaning: "Reorder soon — stock is running low. Schedule production or expedite pending lots through QC." },
    { label: "OK (14–30 days)", color: "bg-yellow-400", textColor: "text-yellow-400", meaning: "Monitor — adequate stock for now, but plan ahead for replenishment." },
    { label: "Healthy (30+ days)", color: "bg-emerald-400", textColor: "text-emerald-400", meaning: "Well-stocked — no immediate action needed. Focus resources elsewhere." },
];

const kpiGuide = [
    { Icon: PackageCheck, label: "Released Inventory", color: "text-blue-400 bg-blue-400/10", description: "Total vials that have passed all 5 quality control stages and are sitting in the warehouse ready to be packed and shipped to PerfectRx. This is your 'shippable' inventory.", accentClass: "from-blue-500 to-cyan-400" },
    { Icon: Clock, label: "Pending Release", color: "text-cyan-400 bg-cyan-400/10", description: "Lots currently going through the QC pipeline. They've been manufactured but are waiting on inspection, AQL, labeling, sterility testing, or final plate checks. These will become 'Released' once all stages pass.", accentClass: "from-cyan-400 to-emerald-400" },
    { Icon: CalendarClock, label: "On Schedule", color: "text-purple-400 bg-purple-400/10", description: "SKUs that have confirmed production dates coming up. This is your manufacturing forecast — the products that will enter the Pending Release pipeline next.", accentClass: "from-purple-500 to-pink-400" },
    { Icon: Truck, label: "Shipped to PerfectRx", color: "text-orange-400 bg-orange-400/10", description: "Total vials shipped from your facility to PerfectRx for fulfillment and distribution. Includes tracking numbers so you can verify delivery.", accentClass: "from-orange-400 to-yellow-400" },
    { Icon: ShieldAlert, label: "In Quarantine", color: "text-red-400 bg-red-400/10", description: "Lots that failed quality checks and are locked. They cannot ship until the issue is resolved. High numbers here indicate production quality problems that need attention.", accentClass: "from-red-500 to-orange-400" },
];

const qcStages = [
    { stage: "Inspection", description: "Physical examination of vials — checking fill volume, vial integrity, particulate matter, and visual appearance." },
    { stage: "AQL (Acceptable Quality Level)", description: "Statistical sampling of the lot. A subset of vials is tested; if defects are below the threshold, the lot passes." },
    { stage: "Labeling", description: "Labels are applied and verified for accuracy — drug name, strength, lot number, BUD, NDC, and storage conditions." },
    { stage: "Sterility Testing", description: "Lab tests for microbial contamination and potency verification. Results typically take 7–14 days." },
    { stage: "Final Plate Check", description: "Last microbial growth check on culture plates. Confirms sterility before the lot is cleared to ship." },
];

const terminology = [
    { term: "SKU", full: "Stock Keeping Unit", explanation: "A unique product identifier — e.g. 'Tirzepatide 72mg/4mL'. Each different drug/strength/size is a separate SKU." },
    { term: "Lot", full: "Lot Number", explanation: "A unique batch identifier — e.g. 'PRORX01152026@1'. Tracks a specific production run through QC, shipping, and recalls." },
    { term: "BUD", full: "Beyond-Use Date", explanation: "The expiration date for compounded products. After this date, the product cannot be dispensed to patients. Typically 6–12 months from compounding." },
    { term: "Run Rate", full: "30-Day Run Rate", explanation: "Average units sold per 30 days at PerfectRx. Used to calculate days of supply and prioritize restocking. Higher = higher demand." },
    { term: "Days of Supply", full: "Days of Supply", explanation: "How many days the current stock (+ in transit) will last at the current run rate. Formula: (Stock + In Transit) ÷ (Run Rate ÷ 30)." },
    { term: "AQL", full: "Acceptable Quality Level", explanation: "A statistical sampling method to determine if a production lot meets quality standards without inspecting every unit." },
    { term: "NDC", full: "National Drug Code", explanation: "A unique identifier for each drug product in the US, used for tracking, billing, and regulatory compliance." },
    { term: "API", full: "Active Pharmaceutical Ingredient", explanation: "The core therapeutic compound in a medication. 'Out of spec API' means the active ingredient didn't meet purity/potency requirements." },
    { term: "PerfectRx", full: "PerfectRx (Distributor)", explanation: "The third-party fulfillment partner that receives finished product and ships to end customers (clinics, pharmacies, patients)." },
];

export default function GuidePage() {
    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <Link
                    href="/"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Business Guide</h1>
                        <p className="text-sm text-muted-foreground">
                            Everything you need to understand the ProRx Analytics dashboard
                        </p>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards Explained ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">KPI Cards — What They Mean</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        The 5 cards at the top of the dashboard give you an instant snapshot of operations.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {kpiGuide.map((kpi) => {
                        const Icon = kpi.Icon;
                        return (
                            <div key={kpi.label} className="flex gap-4 rounded-xl border p-4">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{kpi.label}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{kpi.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* ── Color Legend ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-blue-400" />
                        Supply Status Colors
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Colors in the &quot;Days of Supply&quot; gauge and demand table badges indicate urgency level.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {statusColors.map((s) => (
                        <div key={s.label} className="flex items-start gap-4">
                            <div className={`mt-1 h-4 w-4 shrink-0 rounded ${s.color}`} />
                            <div>
                                <h4 className={`font-semibold ${s.textColor}`}>{s.label}</h4>
                                <p className="text-sm text-muted-foreground">{s.meaning}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* ── QC Pipeline ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-orange-400" />
                        Quality Control Pipeline (5 Stages)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Every manufactured lot must pass through these 5 stages before it can be shipped.
                        The &quot;Lots Pending Release&quot; table shows which stage each lot has completed.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-0">
                        {qcStages.map((stage, i) => (
                            <div key={stage.stage}>
                                <div className="flex items-start gap-4 py-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{stage.stage}</h4>
                                        <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
                                    </div>
                                </div>
                                {i < qcStages.length - 1 && <Separator />}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── Quarantine Reasons ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TriangleAlert className="h-5 w-5 text-amber-400" />
                        Common Quarantine Reasons
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        When a lot fails QC, it&apos;s moved to quarantine with one of these reasons.
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { reason: "Low Phenol Potency", meaning: "The preservative (phenol) level is below specification. The product may not remain sterile for its full shelf life." },
                        { reason: "Crimping Issues", meaning: "The aluminum cap crimp on the vial is defective — potential seal integrity problem. May be fixable by recrimping." },
                        { reason: "Out of Spec API / Preservative", meaning: "The active ingredient or preservative didn't meet concentration requirements during potency testing." },
                        { reason: "High AQS", meaning: "The Acceptable Quality Score was above threshold — too many defects found during statistical sampling." },
                        { reason: "Plate Hits", meaning: "Microbial contamination detected on the sterility testing growth plates. The lot cannot be released." },
                        { reason: "Above AQL", meaning: "Failed the AQL sampling check — defect rate exceeded the acceptable quality limit." },
                    ].map((item) => (
                        <div key={item.reason} className="rounded-lg border p-4">
                            <Badge variant="destructive" className="mb-2 text-xs">{item.reason}</Badge>
                            <p className="text-sm text-muted-foreground">{item.meaning}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* ── Terminology Glossary ── */}
            <Card className="mb-10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CircleAlert className="h-5 w-5 text-blue-400" />
                        Terminology Glossary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {terminology.map((t) => (
                            <div key={t.term} className="rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs font-bold">{t.term}</Badge>
                                    <span className="text-xs text-muted-foreground">{t.full}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{t.explanation}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
