import { CsvUploader } from "@/components/csv-uploader";
import { ReportManager } from "@/components/report-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileSpreadsheet, CheckCircle2, Info } from "lucide-react";

export const metadata = {
    title: "ProRx Analytics — Upload & Manage Reports",
    description: "Upload, view, and manage your At a Glance CSV reports.",
};

export default function UploadPage() {
    return (
        <div className="mx-auto max-w-5xl py-12">
            <div className="mb-10 text-center">
                <h1 className="bg-linear-to-r from-white to-indigo-300 bg-clip-text text-3xl font-bold text-transparent">
                    Upload & Manage Reports
                </h1>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                    Upload your daily &quot;At a Glance&quot; CSV reports. Re-uploading a
                    report for the same date will replace the old data.
                </p>
            </div>

            <CsvUploader />

            {/* Instructions for basic users */}
            <div className="mt-10 grid gap-4 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-3 flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                            <h3 className="font-semibold">Supported Format</h3>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Upload the <strong>&quot;At a Glance Report&quot;</strong> CSV exported from the compounding system.</p>
                            <p>Expected filename: <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">At a Glance Report - MM_DD_YYYY.csv</code></p>
                            <p>The report date is automatically extracted from the filename.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <h3 className="font-semibold">What Gets Parsed</h3>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><span className="text-blue-400">•</span> Lots Pending Release (QC pipeline)</li>
                            <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Released Inventory (ready to ship)</li>
                            <li className="flex items-start gap-2"><span className="text-red-400">•</span> Lots in Quarantine (failed QC)</li>
                            <li className="flex items-start gap-2"><span className="text-purple-400">•</span> SKUs On Schedule (production plan)</li>
                            <li className="flex items-start gap-2"><span className="text-orange-400">•</span> Shipments to PerfectRx (sent product)</li>
                            <li className="flex items-start gap-2"><span className="text-cyan-400">•</span> PerfectRx Inventory (stock + demand)</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardContent className="flex items-start gap-3 pt-6">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <div className="text-sm text-muted-foreground">
                        <p><strong>Tip:</strong> You can upload multiple reports from different days. The dashboard always shows the most recent report. Use the Trends page to compare across reports.</p>
                        <p className="mt-1">If a report for the same date already exists, the new upload will automatically replace the old data.</p>
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-10" />

            {/* Report management table */}
            <ReportManager />
        </div>
    );
}
