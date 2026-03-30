"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Upload, TrendingUp, BookOpen, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScopeSelector } from "./scope-selector";

const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/upload", label: "Upload CSV", icon: Upload },
    { href: "/trends", label: "Trends", icon: TrendingUp },
    { href: "/guide", label: "Guide", icon: BookOpen },
];

export function Navbar({ availableDates = [] }: { availableDates?: string[] }) {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-4 py-3 md:h-16 md:flex-nowrap md:px-6 md:py-0">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center gap-2 md:gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 md:h-10 md:w-10">
                        Rx
                    </div>
                    <div className="leading-tight">
                        <h1 className="text-base font-bold tracking-tight md:text-lg">ProRx Analytics</h1>
                        <span className="hidden text-[9px] font-medium uppercase tracking-[2px] text-muted-foreground sm:block md:text-[10px]">
                            Compounding Dashboard
                        </span>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="order-3 flex w-full items-center justify-between gap-1 overflow-x-auto pb-1 md:order-2 md:w-auto md:justify-start md:pb-0 scrollbar-hide">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:px-4",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="hidden lg:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Scope Selector - Only show on Dashboard and Trends */}
                <div className="order-2 flex items-center gap-2 md:order-3">
                    {(pathname === "/" || pathname.startsWith("/trends")) && (
                        <Suspense fallback={
                            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4 animate-pulse text-indigo-400" />
                                Loading...
                            </div>
                        }>
                            <ScopeSelector availableDates={availableDates} />
                        </Suspense>
                    )}
                </div>
            </div>
        </header>
    );
}
