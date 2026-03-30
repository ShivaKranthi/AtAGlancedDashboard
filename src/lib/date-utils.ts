import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, differenceInDays } from "date-fns";

export type DateScope = "day" | "week" | "month";

export function getScopeStartEnd(dateStr: string, scope: DateScope): { start: string; end: string } {
    const d = parseISO(dateStr);
    
    if (scope === "day") {
        return { start: dateStr, end: dateStr };
    }
    
    if (scope === "week") {
        const s = startOfWeek(d, { weekStartsOn: 1 }); // Monday
        const e = endOfWeek(d, { weekStartsOn: 1 });
        return { start: format(s, "yyyy-MM-dd"), end: format(e, "yyyy-MM-dd") };
    }
    
    // month
    const s = startOfMonth(d);
    const e = endOfMonth(d);
    return { start: format(s, "yyyy-MM-dd"), end: format(e, "yyyy-MM-dd") };
}

export function formatScopeLabel(dateStr: string, scope: DateScope): string {
    const d = parseISO(dateStr);
    
    if (scope === "day") {
        return format(d, "MMMM d, yyyy");
    }
    
    if (scope === "week") {
        const s = startOfWeek(d, { weekStartsOn: 1 });
        const e = endOfWeek(d, { weekStartsOn: 1 });
        return `${format(s, "MMMM d")} – ${format(e, "MMMM d, yyyy")}`;
    }
    
    return format(d, "MMMM yyyy");
}

export function generateDateSequence(start: string, end: string): string[] {
    const s = parseISO(start);
    const e = parseISO(end);
    const days = differenceInDays(e, s);
    const seq = [];
    for (let i = 0; i <= days; i++) {
        seq.push(format(addDays(s, i), "yyyy-MM-dd"));
    }
    return seq;
}
