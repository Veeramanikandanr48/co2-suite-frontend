"use client";

// RHF
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

// ShadCn
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea, TextareaProps } from "@/components/ui/textarea";

type FormTextareaProps = {
    name: string;
    label?: string;
    labelHelper?: string;
    placeholder?: string;
    className?: string;
    labelClassName?: string;
} & TextareaProps;

const FormTextarea = ({
    name,
    label,
    labelHelper,
    placeholder,
    className,
    labelClassName,
    ...props
}: FormTextareaProps) => {
    const { control } = useFormContext();
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel className={cn(`flex-1`, labelClassName)}>{`${label}`}</FormLabel>}
                    {labelHelper && (
                        <span className="text-xs"> {labelHelper}</span>
                    )}
                    <div className="flex justify-between gap-5 items-center text-sm">
                        <div>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder={placeholder}
                                    className={cn("w-[15rem] h-0 text-sm leading-[28px] font-medium text-text-primary border-[1px] border-input-border rounded-[9px] px-[15px] py-[5px] bg-input-bg placeholder:italic placeholder:text-input-placeholder", className)}
                                    {...props}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </div>
                </FormItem>
            )}
        />
    );
};

export default FormTextarea;
