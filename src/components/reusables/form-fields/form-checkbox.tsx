"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

type FormCheckboxProps = {
    name: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    position?: "top" | "bottom" | "left" | "right";
};

const FormCheckbox = ({
    name,
    label,
    disabled = false,
    className = "",
    position = "top",
}: FormCheckboxProps) => {
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-1">
                    <div className={cn(
                        "flex items-center",
                        position === "left" ? "flex-row-reverse gap-4" :
                        position === "right" ? "flex-row gap-4" :
                        position === "top" ? "flex-col gap-2" :
                        "flex-col-reverse gap-2",
                        position === "left" || position === "right" ? "w-full" : ""
                    )}>
                        {label && (
                            <FormLabel
                                htmlFor={name}
                                className={cn(
                                    "cursor-pointer text-sm font-medium leading-none",
                                    (position === "left" || position === "right") && "flex-shrink-0"
                                )}
                            >
                                {label}
                            </FormLabel>
                        )}
                        <div className={cn(
                            "min-h-[20px]",
                            (position === "left" || position === "right") && "flex-1"
                        )}>
                            <FormControl>
                                <div className="flex items-center">
                                    <CheckboxPrimitive.Root
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={disabled}
                                        className={cn(
                                            "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                            "data-[state=checked]:border-0",
                                            "data-[state=unchecked]:border-0",
                                            "data-[state=unchecked]:bg-white",
                                            className
                                        )}
                                        id={name}
                                    >
                                        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                                            <Check className="h-4 w-4" />
                                        </CheckboxPrimitive.Indicator>
                                    </CheckboxPrimitive.Root>
                                </div>
                            </FormControl>
                        </div>
                    </div>
                    <div className="min-h-[16px]">
                        <FormMessage className="text-xs text-destructive" />
                    </div>
                </FormItem>
            )}
        />
    );
};

export default FormCheckbox; 