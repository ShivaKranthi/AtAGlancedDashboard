"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays, Filter } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { DateScope, getScopeStartEnd, formatScopeLabel } from "@/lib/date-utils";

interface ScopeSelectorProps {
    availableDates: string[]; // "YYYY-MM-DD"
}

export function ScopeSelector({ availableDates }: ScopeSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Current active from URL
    const activeScope = (searchParams.get("scope") as DateScope) || null;
    const activeDate = searchParams.get("date") || null;

    // Local state for modal
    const [open, setOpen] = useState(false);
    const [tempScope, setTempScope] = useState<DateScope>("day");
    const [tempDate, setTempDate] = useState<string>("");

    useEffect(() => {
        if (open) {
            setTempScope((activeScope as DateScope) || "day");
            setTempDate(activeDate || (availableDates.length > 0 ? availableDates[0] : ""));
        }
    }, [open, activeScope, activeDate, availableDates]);

    const handleApply = () => {
        if (!tempDate) return;
        const { start, end } = getScopeStartEnd(tempDate, tempScope);
        
        const params = new URLSearchParams(searchParams.toString());
        params.set("scope", tempScope);
        params.set("date", tempDate);
        params.set("start", start);
        params.set("end", end);
        
        router.push(`${pathname}?${params.toString()}`);
        setOpen(false);
    };

    if (availableDates.length === 0) return null;

    // Display string in navbar
    const buttonLabel = activeScope && activeDate 
        ? formatScopeLabel(activeDate, activeScope)
        : "Select Option";

    const scopePrefix = activeScope === "day" ? "Report: " 
                        : activeScope === "week" ? "Week: " 
                        : activeScope === "month" ? "Month: " : "";

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 md:gap-2 rounded-lg border bg-card px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-foreground transition-colors hover:bg-accent shadow-sm shadow-black/20"
            >
                <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-400" />
                <span className="font-semibold text-muted-foreground hidden lg:inline">{scopePrefix}</span>
                <span className="font-bold truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{buttonLabel}</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-indigo-500"/>
                            Select View Scope
                        </DialogTitle>
                        <DialogDescription>
                            Choose how you want to aggregate dashboard and trend data.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground/80">1. Timeframe</label>
                            <div className="flex rounded-md border border-white/10 p-1 bg-black/40">
                                {["day", "week", "month"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setTempScope(s as DateScope)}
                                        className={`flex-1 rounded-sm py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                                            tempScope === s 
                                            ? "bg-indigo-500/20 text-indigo-400 shadow-sm"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground/80">2. Select Reference Date</label>
                            <select 
                                value={tempDate} 
                                onChange={(e) => setTempDate(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>Select a date</option>
                                {availableDates.map(d => (
                                    <option key={d} value={d}>
                                        {formatScopeLabel(d, tempScope)} (using {format(parseISO(d), "MMM d")})
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-muted-foreground">
                                {tempScope === "week" && "Aggregates data for the week containing this date."}
                                {tempScope === "month" && "Aggregates data for the month containing this date."}
                                {tempScope === "day" && "Shows snapshot data for this specific day."}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleApply} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            Apply & Load Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
