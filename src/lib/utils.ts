import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with commas: 12901 → "12,901" */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

/** Classify supply level from days of supply */
export function getSupplyStatus(days: number | null | undefined) {
  if (days == null || isNaN(days) || !isFinite(days))
    return { label: "Unknown", color: "text-muted-foreground", level: "unknown" as const };
  if (days < 7)
    return { label: "Critical", color: "text-red-400", level: "critical" as const };
  if (days < 14)
    return { label: "Low", color: "text-orange-400", level: "low" as const };
  if (days < 30)
    return { label: "OK", color: "text-yellow-400", level: "ok" as const };
  return { label: "Healthy", color: "text-emerald-400", level: "healthy" as const };
}
