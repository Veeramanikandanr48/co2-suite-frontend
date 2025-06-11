"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ShadCn
import { Button, ButtonProps } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { Loader2 } from "lucide-react";
import { baseButtonTestIds } from "../test-ids/common.ids";

type BaseButtonProps = {
    className?: string;
    tooltipLabel?: string;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    loadingText?: string;
    children?: React.ReactNode;
} & ButtonProps;

const BaseButton = ({
    className,
    tooltipLabel,
    type = "button",
    loading,
    loadingText = "Loading",
    children,
    ...props
}: BaseButtonProps) => {
    const withoutTooltip = (
        <>
            {!loading ? (
                <Button 
                    data-testid={baseButtonTestIds.button}
                    className={cn("flex gap-2 font-bold rounded-sm h-[38px] text-sm px-8 py-[7px]", className)} 
                    type={type} 
                    {...props}
                >
                    {children}
                </Button>
            ) : (
                <Button 
                    data-testid={baseButtonTestIds.button}
                    disabled 
                    className={cn("flex gap-2 font-bold rounded-sm h-[38px] text-sm px-8 py-[7px]", className)}
                >
                    <Loader2 data-testid={baseButtonTestIds.loadingSpinner} className="mr-2 h-4 w-4 animate-spin" />
                    <span data-testid={baseButtonTestIds.loadingText}>{loadingText}</span>
                </Button>
            )}
        </>
    );

    if (!tooltipLabel) return withoutTooltip;
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {!loading ? (
                        <Button 
                            data-testid={baseButtonTestIds.button}
                            className={cn("flex gap-2", className)} 
                            type={type} 
                            {...props}
                        >
                            {children}
                        </Button>
                    ) : (
                        <Button 
                            data-testid={baseButtonTestIds.button}
                            type={type} 
                            {...props} 
                            disabled 
                            className={cn("flex gap-2", className)}
                        >
                            <Loader2 data-testid={baseButtonTestIds.loadingSpinner} className="mr-2 h-4 w-4 animate-spin" />
                            <span data-testid={baseButtonTestIds.loadingText}>{loadingText}</span>
                        </Button>
                    )}
                </TooltipTrigger>
                <TooltipContent data-testid={baseButtonTestIds.tooltip}>
                    <p>{tooltipLabel}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default BaseButton;
