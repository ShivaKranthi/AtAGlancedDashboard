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
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30">
                        Rx
                    </div>
                    <div className="leading-tight">
                        <h1 className="text-lg font-bold tracking-tight">ProRx Analytics</h1>
                        <span className="text-[10px] font-medium uppercase tracking-[2px] text-muted-foreground">
                            Compounding Dashboard
                        </span>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden md:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Scope Selector - Only show on Dashboard and Trends */}
                <div className="flex items-center gap-2">
                    {(pathname === "/" || pathname.startsWith("/trends")) && (
                        <Suspense fallback={
                            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm text-muted-foreground">
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
