import React from "react";
import { cn } from "@/lib/utils";
import { SubheadingProps } from "~/types";

function Subheading({ children }: Readonly<SubheadingProps>) {
    return <div className="text-lg font-semibold text-header-primary leading-[28px]">{children}</div>
}

function SubheadingDivider({ children, className, 'data-testid': testId }: Readonly<SubheadingProps>) {
    return <div className={cn("border-b border-neutral-100 pb-2", className)} data-testid={testId}><Subheading>{children}</Subheading></div>
}

export {
    Subheading,
    SubheadingDivider
}