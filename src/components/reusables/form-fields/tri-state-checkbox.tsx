"use client"

import { useRef, useEffect } from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ESelectedStatus } from "~/enums/workflow-customization-enum"


interface TriStateCheckboxProps {
    state: ESelectedStatus
    onChange: (e: React.ChangeEvent<HTMLInputElement>, newState: ESelectedStatus) => void
    className?: string
    "data-testid"?: string
}

export default function TriStateCheckbox(
  { state, onChange, className, 'data-testid': dataTestId }: Readonly<TriStateCheckboxProps>) {    
        const checkboxRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = state === ESelectedStatus.INTERMEDIATE
            checkboxRef.current.checked = state === ESelectedStatus.SELECTED
        }
    }, [state])

    return (
        <div className={cn("flex items-center", className)}>
            <input
                ref={checkboxRef}
                type="checkbox"
                className="peer absolute h-5 w-5 cursor-pointer opacity-0"
                checked={state === ESelectedStatus.SELECTED}
                onChange={(e) => {
                    e.stopPropagation();
                    onChange(e, e.target.checked ? ESelectedStatus.SELECTED : ESelectedStatus.UNSELECTED);
                }}
                aria-checked={state === ESelectedStatus.SELECTED ? "mixed" : state === ESelectedStatus.UNSELECTED}
                data-testid={dataTestId}
            />
            <div
                className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-xs border border-neutral-400 transition-colors",
                    state === ESelectedStatus.SELECTED || state === ESelectedStatus.INTERMEDIATE ? "border-transparent bg-primary-500" : "bg-white",
                )}
            >
                {state === ESelectedStatus.SELECTED && <Check className="h-3.5 w-3.5 text-white" />}
                {state === ESelectedStatus.INTERMEDIATE && <Minus className="h-3.5 w-3.5 text-white" />}
            </div>
        </div>
    )
}
