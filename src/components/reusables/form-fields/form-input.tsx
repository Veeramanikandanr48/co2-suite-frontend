"use client";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "~/lib/utils";

type FormInputProps = {
    className?: string;
    name: string;
    label?: string;
    labelHelper?: string;
    placeholder?: string;
    vertical?: boolean;
    labelClassName?: string;
} & InputProps;

const FormInput = ({
    className,
    name,
    label,
    labelHelper,
    placeholder,
    vertical = false,
    labelClassName,
    ...props
}: FormInputProps) => {
    const { control } = useFormContext();

    const verticalInput = (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel className={cn(labelClassName)}>{`${label}`}</FormLabel>}

                    {labelHelper && (
                        <span className="text-xs"> {labelHelper}</span>
                    )}

                    <FormControl>
                        <Input
                            {...field}
                            placeholder={placeholder}
                            className={cn("w-[13rem] h-[38px] text-sm leading-[28px] font-medium text-text-primary border-[1px] border-input-border rounded-[9px] px-[15px] py-[5px] bg-input-bg placeholder:italic placeholder:text-input-placeholder focus:outline-none focus:ring-0 focus:border-input-border", className)}
                            {...props}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const horizontalInput = (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex w-full gap-5 items-center text-sm">
                        {label && <FormLabel className={cn(`flex-1`, labelClassName)}>{`${label}:`}</FormLabel>}
                        {labelHelper && (
                            <span className="text-xs"> {labelHelper}</span>
                        )}

                        <div className="flex-1">
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={placeholder}
                                    className={cn("w-[13rem] h-[38px] text-sm leading-[28px] font-medium text-text-primary border-[1px] border-input-border rounded-[9px] px-[15px] py-[5px] bg-input-bg placeholder:italic placeholder:text-input-placeholder focus:outline-none focus:ring-0 focus:border-input-border", className)}
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
    return vertical ? verticalInput : horizontalInput;
};

export default FormInput;
