"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TipProps {
    children: React.ReactNode;
    tip: string;
    /** Show inline (i) icon instead of wrapping children */
    icon?: boolean;
}

/** Quick tooltip wrapper — works inside TooltipProvider */
export function Tip({ children, tip, icon }: TipProps) {
    if (icon) {
        return (
            <span className="inline-flex items-center gap-1.5">
                {children}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground transition-colors hover:text-primary" />
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        className="max-w-xs text-xs leading-relaxed"
                    >
                        {tip}
                    </TooltipContent>
                </Tooltip>
            </span>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
                side="top"
                className="max-w-xs text-xs leading-relaxed"
            >
                {tip}
            </TooltipContent>
        </Tooltip>
    );
}
