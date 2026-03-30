import { getTrendData, getAvailableDates } from "@/lib/queries";
import { DateScope, getScopeStartEnd } from "@/lib/date-utils";
import { TrendCharts } from "@/components/trends/trend-charts";
import { AlertTriangle, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrendsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const availableDates = await getAvailableDates();
    if (availableDates.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <p className="text-muted-foreground text-sm">Upload a report to see trends.</p>
            </div>
        );
    }

    const scope = (searchParams?.scope as DateScope) || "day";
    const dateStr = (searchParams?.date as string) || availableDates[0];
    const { start, end } = getScopeStartEnd(dateStr, scope);

    if (scope === "day") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Trends require multiple dates</h2>
                    <p className="max-w-md text-muted-foreground mt-2 text-sm">
                        You have selected the &quot;Day&quot; snapshot view. To view historical trends and charts, please switch your scope to &quot;Week&quot; or &quot;Month&quot;.
                    </p>
                </div>
            </div>
        );
    }

    const data = await getTrendData(start, end);

    if (data.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <p className="text-muted-foreground text-sm">No trend data points found for the selected {scope}.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Trends & Intelligence</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {start} to {end} · {data.length} data points
                    </p>
                </div>
            </div>

            <TrendCharts data={data} scope={scope} />
        </div>
    );
}
