"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseISO, format } from "date-fns";

interface TrendDataPoint {
    date: string;
    totalVials: number;
    totalPending: number;
    totalReleased: number;
    totalQuarantine: number;
    totalShipped: number;
    avgDaysSupply: number;
}

export function TrendCharts({ data, scope }: { data: TrendDataPoint[], scope: string }) {
    
    // Formatting helper for X axis
    const formatXAxis = (tickItem: string) => {
        try {
            return format(parseISO(tickItem), scope === "month" ? "MMM d" : "EEE, MMM d");
        } catch {
            return tickItem;
        }
    };

    // Calculate percent growth WoW or MoM (first vs last)
    const first = data[0];
    const last = data[data.length - 1];
    
    const getChange = (key: keyof TrendDataPoint) => {
        if (!first || !last || (first[key] as number) === 0) return { val: 0, text: "-" };
        const change = (((last[key] as number) - (first[key] as number)) / (first[key] as number)) * 100;
        return {
            val: change,
            text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
        };
    };

    const vialsChange = getChange('totalVials');
    const shippedChange = getChange('totalShipped');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Metrics cards comparing first date to last date in range */}
               <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Vials End of Period</CardDescription>
                        <CardTitle className="text-2xl">{last?.totalVials.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className={`text-xs font-semibold ${vialsChange.val > 0 ? "text-emerald-400" : vialsChange.val < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {vialsChange.text}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">vs period start</span>
                    </CardContent>
               </Card>
               <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Shipments End of Period</CardDescription>
                        <CardTitle className="text-2xl">{last?.totalShipped.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className={`text-xs font-semibold ${shippedChange.val > 0 ? "text-emerald-400" : shippedChange.val < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {shippedChange.text}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">vs period start</span>
                    </CardContent>
               </Card>
               <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg Days Supply</CardDescription>
                        <CardTitle className="text-2xl">{last?.avgDaysSupply.toFixed(1)} days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-xs text-muted-foreground">Across all PerfectRx SKUs</span>
                    </CardContent>
               </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Inventory Pipeline Over Time</CardTitle>
                        <CardDescription>Released vs Pending vs Quarantine</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}}
                                    itemStyle={{fontSize: '12px'}}
                                />
                                <Legend wrapperStyle={{fontSize: '12px'}} />
                                <Area type="monotone" dataKey="totalReleased" name="Released" stackId="1" stroke="#34d399" fill="url(#colorReleased)" />
                                <Area type="monotone" dataKey="totalPending" name="Pending QC" stackId="1" stroke="#fbbf24" fill="url(#colorPending)" />
                                <Area type="monotone" dataKey="totalQuarantine" name="Quarantine" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Shipments Volume</CardTitle>
                        <CardDescription>Daily outgoing vials</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}}
                                    cursor={{fill: '#222'}}
                                />
                                <Bar dataKey="totalShipped" name="Shipped Vials" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm">Days of Supply Health (PerfectRx)</CardTitle>
                        <CardDescription>Average days of inventory across all SKUs</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}} />
                                <Line type="monotone" dataKey="avgDaysSupply" name="Avg Days Supply" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
