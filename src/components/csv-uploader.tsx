"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface UploadResult {
    success: boolean;
    reportId: number;
    reportDate: string;
    counts: Record<string, number>;
}

export function CsvUploader() {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpload = useCallback(
        async (file: File) => {
            if (!file.name.endsWith(".csv")) {
                setError("Please upload a .csv file");
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
                setTimeout(() => router.push("/"), 2000);
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
                            accept=".csv"
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
                                    <p className="font-medium">Drop your At-a-Glance CSV here</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        or click to browse
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    <span>Supports: At a Glance Report - MM_DD_YYYY.csv</span>
                                </div>
                            </>
                        )}
                    </label>
                </CardContent>
            </Card>

            {/* Success */}
            {result && (
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
