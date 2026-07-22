// Components

// Icons
import FormInput from "./form-input";
import BaseButton from "../base-button";
import { cn } from "~/lib/utils";
import { Trash2 } from "lucide-react";

type FormCustomInputProps = {
    index: number;
    location: string;
    removeField: (index: number) => void;
    keyClassName?: string;
    valueClassName?: string;
};

const FormCustomInput = ({
    index,
    location,
    removeField,
    keyClassName,
    valueClassName,
}: FormCustomInputProps) => {
    const nameKey = `${location}[${index}].key`;
    const nameValue = `${location}[${index}].value`;
    return (
        <div className="flex items-center gap-2">
            <FormInput
                name={nameKey}
                placeholder="Name"
                className={cn("w-[10rem]", keyClassName)}
            />

            <FormInput
                name={nameValue}
                placeholder="Value"
                className={cn("w-[10rem]", valueClassName)}
            />
            <BaseButton
                size="icon"
                variant="destructive"
                onClick={() => removeField(index)}
            >
                <Trash2 />
            </BaseButton>
        </div>
    );
};

export default FormCustomInput;
