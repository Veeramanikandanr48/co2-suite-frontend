"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "~/lib/utils";
import React from "react";
import { DropdownOption } from "@/types";

type FormDropdownProps = {
    name: string;
    label?: string;
    placeholder?: string;
    options: DropdownOption[];
    disabled?: boolean;
    vertical?: boolean;
    className?: string;
    search?: boolean;
    labelClassName?: string;
};

const FormDropdown = ({
    name,
    label,
    placeholder = "Select an option",
    options,
    disabled = false,
    vertical = false,
    className = "",
    search = false,
    labelClassName = "",
}: FormDropdownProps) => {
    const { control } = useFormContext();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsOpen(true);
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const currentValue = field.value === undefined || field.value === null 
                    ? "" 
                    : String(field.value);

                return (
                    <FormItem className="space-y-1">
                        <div className={cn(
                            "flex items-start",
                            vertical ? (
                                "flex-col gap-2"
                            ) : (
                                "flex-row gap-4"
                            ),
                            !vertical && "w-full text-sm"
                        )}>
                            {label && (
                                <FormLabel className={cn(`flex-1`, labelClassName)}>
                                    {label}
                                </FormLabel>
                            )}
                            <div className={cn(
                                !vertical ? "flex-1" : "",
                                "min-h-[40px]"
                            )}>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => {
                                            const selectedOption = options.find(opt => opt.id === Number(value));
                                            field.onChange(selectedOption?.id);
                                        }}
                                        value={currentValue}
                                        disabled={disabled}
                                        open={isOpen}
                                        onOpenChange={setIsOpen}
                                    >
                                        <SelectTrigger className={cn(
                                            "w-full data-[placeholder]:italic",
                                            className
                                        )}>
                                            <SelectValue placeholder={placeholder} />
                                        </SelectTrigger>
                                        <SelectContent className={cn(
                                            "border-0 max-h-[200px]",
                                            className
                                        )}>
                                            {search && (
                                                <div className={cn(
                                                    "sticky top-0 z-10 bg-white px-2 py-1",
                                                    className
                                                )}>
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchQuery}
                                                        onChange={handleSearchChange}
                                                        className={cn(
                                                            "w-full rounded-md border border-input-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                            className
                                                        )}
                                                    />
                                                </div>
                                            )}
                                            {filteredOptions.length === 0 ? (
                                                <div className="px-2 py-1 text-sm text-gray-500">No results found</div>
                                            ) : (
                                                filteredOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.id}
                                                        value={String(option.id)}
                                                        className={cn(
                                                            "cursor-pointer !border-none",
                                                            className
                                                        )}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <div className="min-h-[16px]">
                            <FormMessage className="text-xs text-destructive" />
                        </div>
                    </FormItem>
                );
            }}
        />
    );
};

export default FormDropdown; 