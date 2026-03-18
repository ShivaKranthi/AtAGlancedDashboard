"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface SingleResult {
    success: boolean;
    format: "csv";
    reportId: number;
    reportDate: string;
    counts: Record<string, number>;
}

interface BatchResult {
    success: boolean;
    format: "xlsx";
    sheetsProcessed: number;
    sheetsSkipped: number;
    reports: {
        sheetName: string;
        reportDate: string;
        reportId: number;
        counts: Record<string, number>;
    }[];
    errors?: { sheetName: string; error: string }[];
}

type UploadResult = SingleResult | BatchResult;

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export function CsvUploader() {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpload = useCallback(
        async (file: File) => {
            const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
            if (!ACCEPTED_EXTENSIONS.includes(ext)) {
                setError("Please upload a .csv or .xlsx file");
                return;
            }
            setIsUploading(true);
            setError(null);
            setResult(null);

            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Upload failed");
                setResult(data);
                // Redirect after a delay — longer for batch so user can see results
                const delay = data.format === "xlsx" ? 4000 : 2000;
                setTimeout(() => router.push("/"), delay);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
                setIsUploading(false);
            }
        },
        [router]
    );

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
        },
        [handleUpload]
    );

    const onFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
        },
        [handleUpload]
    );

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Drop zone */}
            <Card
                className={`relative cursor-pointer transition-all duration-300 ${isDragging
                        ? "scale-[1.02] border-primary shadow-lg shadow-primary/20"
                        : "hover:border-primary/40 hover:shadow-md"
                    }`}
            >
                <CardContent className="p-0">
                    <label
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className="flex h-64 cursor-pointer flex-col items-center justify-center gap-4"
                    >
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={onFileSelect}
                            className="sr-only"
                            disabled={isUploading}
                        />

                        {isUploading ? (
                            <>
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-muted-foreground">Parsing & uploading…</p>
                            </>
                        ) : (
                            <>
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">Drop your At-a-Glance report here</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        or click to browse
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> CSV
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileSpreadsheet className="h-3 w-3" /> XLSX (multi-sheet batch)
                                    </span>
                                </div>
                            </>
                        )}
                    </label>
                </CardContent>
            </Card>

            {/* Success — Single CSV */}
            {result && result.format === "csv" && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-emerald-400">
                                Upload Successful!
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            <div className="rounded-lg bg-card p-3">
                                <span className="text-xs text-muted-foreground">Report Date</span>
                                <p className="mt-1 font-semibold">{result.reportDate}</p>
                            </div>
                            {Object.entries(result.counts).map(([key, val]) => (
                                <div key={key} className="rounded-lg bg-card p-3">
                                    <span className="text-xs text-muted-foreground">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <p className="mt-1 font-semibold">{val} rows</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">Redirecting…</p>
                    </CardContent>
                </Card>
            )}

            {/* Success — XLSX batch */}
            {result && result.format === "xlsx" && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-emerald-400">
                                Batch Upload Complete!
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            <div className="rounded-lg bg-card p-3">
                                <span className="text-xs text-muted-foreground">Reports Imported</span>
                                <p className="mt-1 text-2xl font-bold">{result.sheetsProcessed}</p>
                            </div>
                            <div className="rounded-lg bg-card p-3">
                                <span className="text-xs text-muted-foreground">Sheets Skipped</span>
                                <p className="mt-1 text-2xl font-bold">{result.sheetsSkipped}</p>
                            </div>
                            {result.reports.length > 0 && (
                                <div className="rounded-lg bg-card p-3">
                                    <span className="text-xs text-muted-foreground">Date Range</span>
                                    <p className="mt-1 font-semibold text-sm">
                                        {result.reports[0].reportDate} → {result.reports[result.reports.length - 1].reportDate}
                                    </p>
                                </div>
                            )}
                        </div>
                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm">
                                <p className="font-medium text-destructive">{result.errors.length} sheet(s) had errors:</p>
                                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                                    {result.errors.slice(0, 5).map((e) => (
                                        <li key={e.sheetName}>{e.sheetName}: {e.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="mt-4 text-sm text-muted-foreground">Redirecting to dashboard…</p>
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
