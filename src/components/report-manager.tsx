"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
    FileText,
    Trash2,
    RefreshCw,
    CalendarDays,
    Database,
    Loader2,
    AlertTriangle,
    Check,
    X,
} from "lucide-react";

interface Report {
    id: number;
    reportDate: string;
    filename: string;
    uploadedAt: string;
    counts: {
        pending: number;
        released: number;
        quarantine: number;
        scheduled: number;
        shipped: number;
        perfectrx: number;
    };
}

export function ReportManager() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
    const [deletingSelected, setDeletingSelected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/upload");
            if (!res.ok) throw new Error("Failed to fetch reports");
            const data = await res.json();
            setReports(data);
            setSelectedIds(new Set());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDelete = async (id: number) => {
        setDeleting(id);
        setConfirmId(null);
        setError(null);
        try {
            const res = await fetch(`/api/upload/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Delete failed");
            }
            setReports((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteSelected = async () => {
        setDeletingSelected(true);
        setConfirmDeleteSelected(false);
        setError(null);
        let successCount = 0;
        try {
            for (const id of Array.from(selectedIds)) {
                const res = await fetch(`/api/upload/${id}`, { method: "DELETE" });
                if (!res.ok) {
                    throw new Error(`Failed to delete report ${id}`);
                }
                successCount++;
            }
            setReports((prev) => prev.filter((r) => !selectedIds.has(r.id)));
            setSelectedIds(new Set());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete selected failed");
            // If partial deletion occurs, update table
            if (successCount > 0) fetchReports();
        } finally {
            setDeletingSelected(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(reports.map(r => r.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedIds);
        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        setSelectedIds(next);
    };

    const totalRows = (r: Report) =>
        r.counts.pending + r.counts.released + r.counts.quarantine +
        r.counts.scheduled + r.counts.shipped + r.counts.perfectrx;

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading reports…</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Database className="h-4 w-4 text-blue-400" />
                        Uploaded Reports
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            confirmDeleteSelected ? (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleDeleteSelected}
                                        disabled={deletingSelected}
                                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-white bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {deletingSelected ? <Loader2 className="h-3 w-3 animate-spin"/> : <Check className="h-3 w-3" />} Confirm Delete ({selectedIds.size})
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteSelected(false)}
                                        disabled={deletingSelected}
                                        className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
                                    >
                                        <X className="h-3 w-3" /> Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmDeleteSelected(true)}
                                    className="flex items-center gap-1 rounded border border-red-500/30 px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3 w-3" /> Delete Selected ({selectedIds.size})
                                </button>
                            )
                        )}
                        <Badge variant="secondary" className="text-xs">
                            {reports.length} report{reports.length !== 1 ? "s" : ""}
                        </Badge>
                        <button
                            onClick={fetchReports}
                            className="flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {reports.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No reports uploaded yet. Upload your first CSV above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40px]">
                                        <input
                                            type="checkbox"
                                            checked={reports.length > 0 && selectedIds.size === reports.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </TableHead>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Report Date</TableHead>
                                    <TableHead>Filename</TableHead>
                                    <TableHead className="text-right">Rows</TableHead>
                                    <TableHead>Breakdown</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="w-28 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(r.id)}
                                                onChange={(e) => handleSelectRow(r.id, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {r.id}
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                                                <span className="font-medium">{r.reportDate}</span>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="max-w-[200px] truncate text-xs">
                                                    {r.filename}
                                                </span>
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {totalRows(r).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {r.counts.pending > 0 && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {r.counts.pending} pending
                                                    </Badge>
                                                )}
                                                {r.counts.released > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] text-emerald-400">
                                                        {r.counts.released} released
                                                    </Badge>
                                                )}
                                                {r.counts.quarantine > 0 && (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        {r.counts.quarantine} quarantine
                                                    </Badge>
                                                )}
                                                {r.counts.shipped > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] text-blue-400">
                                                        {r.counts.shipped} shipped
                                                    </Badge>
                                                )}
                                                {r.counts.perfectrx > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] text-cyan-400">
                                                        {r.counts.perfectrx} inventory
                                                    </Badge>
                                                )}
                                                {r.counts.scheduled > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] text-purple-400">
                                                        {r.counts.scheduled} scheduled
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {new Date(r.uploadedAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {confirmId === r.id ? (
                                                /* Inline confirmation: ✓ confirm / ✗ cancel */
                                                <span className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(r.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white transition-colors hover:bg-red-700"
                                                        title="Confirm delete"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(null)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent"
                                                        title="Cancel"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ) : deleting === r.id ? (
                                                <Loader2 className="ml-auto h-4 w-4 animate-spin text-red-400" />
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmId(r.id)}
                                                    className="ml-auto flex h-8 items-center gap-1.5 rounded-md border border-red-500/30 px-3 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                                                    title="Delete this report"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
