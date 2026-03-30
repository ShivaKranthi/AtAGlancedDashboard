"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Search } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export interface ColumnDef<T> {
    header: string;
    accessor: (row: T) => React.ReactNode;
    className?: string;
}

interface DrilldownModalProps<T> {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    icon: React.ReactNode;
    data: T[];
    columns: ColumnDef<T>[];
    totalVials: number;
    totalLots: number;
    skuExtractor: (row: T) => string;
    lotExtractor: (row: T) => string;
}

export function DrilldownModal<T>({
    isOpen,
    onOpenChange,
    title,
    description,
    icon,
    data,
    columns,
    totalVials,
    totalLots,
    skuExtractor,
    lotExtractor,
}: DrilldownModalProps<T>) {
    const [skuFilter, setSkuFilter] = React.useState("");
    const [lotFilter, setLotFilter] = React.useState("");

    // Reset filters when the modal opens
    React.useEffect(() => {
        if (isOpen) {
            setSkuFilter("");
            setLotFilter("");
        }
    }, [isOpen]);

    const filteredData = React.useMemo(() => {
        return data.filter((item) => {
            const sku = skuExtractor(item)?.toLowerCase() || "";
            const lot = lotExtractor(item)?.toLowerCase() || "";
            return (
                sku.includes(skuFilter.toLowerCase()) &&
                lot.includes(lotFilter.toLowerCase())
            );
        });
    }, [data, skuFilter, lotFilter, skuExtractor, lotExtractor]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-[90vw] md:w-[900px] bg-[#0a0e1a] border-slate-800 p-0 text-slate-100 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                {/* Header */}
                <div className="bg-[#111827]/80 backdrop-blur-md border-b border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
                    <button 
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white pr-10">
                            {icon}
                            {title}
                        </DialogTitle>
                        <p className="text-sm text-slate-400 mt-1">{description}</p>
                    </div>
                    <div className="flex items-center gap-6 pr-10">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Vials</p>
                            <p className="text-xl font-black text-white">{formatNumber(totalVials)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Lots</p>
                            <p className="text-xl font-black text-white">{formatNumber(totalLots)}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-800 bg-[#0f1522] flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by SKU..."
                            value={skuFilter}
                            onChange={(e) => setSkuFilter(e.target.value)}
                            className="w-full bg-[#1a2333] border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-purple-400 transition-colors"
                        />
                    </div>
                    <div className="relative max-w-[200px]">
                        <input
                            type="text"
                            placeholder="Filter by Lot..."
                            value={lotFilter}
                            onChange={(e) => setLotFilter(e.target.value)}
                            className="w-full bg-[#1a2333] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-purple-400 transition-colors"
                        />
                    </div>
                </div>

                {/* Table Region */}
                <div className="flex-1 overflow-y-auto max-h-[500px] bg-[#0a0e1a] custom-scrollbar">
                    {filteredData.length > 0 ? (
                        <table className="w-full text-sm text-left align-middle border-collapse">
                            <thead className="text-xs bg-[#141b2d] text-slate-400 uppercase tracking-wider sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                <tr>
                                    {columns.map((col, i) => (
                                        <th key={i} className={`px-5 py-4 font-semibold ${col.className || ""}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 transition-colors">
                                {filteredData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-800/30 transition-colors group">
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className={`px-5 py-3.5 ${col.className || ""}`}>
                                                {col.accessor(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-10 opacity-50">
                            <p className="text-sm text-slate-400">No matching items found.</p>
                            <button onClick={() => { setSkuFilter(""); setLotFilter(""); }} className="mt-2 text-xs text-purple-400 hover:underline">Clear filters</button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
