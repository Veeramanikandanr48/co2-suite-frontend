"use client";

import { useState } from "react";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Utils
import { cn } from "@/lib/utils";

// Variables
import { DATE_OPTIONS } from "@/lib/variables";

// Icons
import { CalendarIcon } from "lucide-react";


type DatePickerFormFieldProps = {
    name: string;
    label?: string;
    className?: string;
};

const DatePickerFormField = ({ name, label, className }: DatePickerFormFieldProps) => {
    const { control } = useFormContext();

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between gap-5 items-center text-sm">
                            <div>
                                <FormLabel>{label}:</FormLabel>
                            </div>
                            <div>
                                <Popover
                                    open={isPopoverOpen}
                                    onOpenChange={setIsPopoverOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[13rem]",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    new Date(
                                                        field.value
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        DATE_OPTIONS
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className={cn("w-auto p-0 bg-input-bg", className)}>
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            defaultMonth={field.value}
                                            selected={new Date(field.value)}
                                            onSelect={(e: Date | undefined) => {
                                                if (e) {
                                                    field.onChange(e);
                                                    setIsPopoverOpen(false);
                                                }
                                            }}
                                            disabled={(date: Date) =>
                                                date < new Date("1900-01-01")
                                            }
                                            startMonth={new Date(1960, 0)}
                                            endMonth={
                                                new Date(new Date().getFullYear() + 30, 11)
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </div>
                        </div>
                    </FormItem>
                )}
            />
    );
};

export default DatePickerFormField;
