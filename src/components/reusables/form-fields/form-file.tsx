"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { BaseButton } from "@/components";
import { ImageMinus, Image as ImageIcon, FileIcon, X } from "lucide-react";
import { FILE_UPLOAD_CONFIG } from "@/lib/variables";
import { UploadType } from "@/enums/base-enum";
import { PiLinkSimple } from "react-icons/pi";
import { showWarningToast } from "~/components/toast-variant";
type FormFileProps = {
    name: string;
    label?: string;
    placeholder?: string;
    uploadType: UploadType;
    disabled?: boolean;
    onFileChange?: (file: File) => void;
    hideRemoveButton?: boolean;
    fileInputRef?: React.RefObject<HTMLInputElement | null>;
    customStyles?: {
        container?: string;
        label?: string;
        placeholder?: React.ReactNode;
    };
};

const FormFile = ({ 
    name, 
    label, 
    placeholder, 
    uploadType, 
    disabled = false,
    onFileChange,
    hideRemoveButton = false,
    fileInputRef,
    customStyles,
}: FormFileProps) => {
    const { control, setValue, getValues } = useFormContext();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [displayFileName, setDisplayFileName] = useState<string>("");
    const [lastValidFile, setLastValidFile] = useState<File | null>(null);
    const internalFileInputRef = useRef<HTMLInputElement | null>(null);
    const config = FILE_UPLOAD_CONFIG[uploadType];
    const isMultiple = config.maxFiles > 1;

    // Use the external ref if provided, otherwise use internal ref
    const actualFileInputRef = fileInputRef || internalFileInputRef;

    useEffect(() => { 
        const value = getValues(name);
        if (Array.isArray(value)) {
            setPreviewUrls(value.map(file => URL.createObjectURL(file)));
            setDisplayFileName(value[0]?.name ?? "");
        } else if (value && value.type === 'Buffer') {
            const bufferData = Buffer.from(value.data);
            const blob = new Blob([bufferData], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            setPreviewUrls([url]);
            setDisplayFileName("");
        } else if (value instanceof Buffer) {
            const blob = new Blob([value], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            setPreviewUrls([url]);
            setDisplayFileName("");
        } else if (value instanceof File) {
            setDisplayFileName(value.name || "");
            setPreviewUrls([URL.createObjectURL(value)]);
            setLastValidFile(value);
        }
    }, [getValues, name]);

    const validateFile = async (file: File): Promise<boolean> => {
        const fileSizeInMB = file.size / (1024 * 1024);
        const maxSizeInMB = config.maxSize / (1024 * 1024);
    
        if (fileSizeInMB > maxSizeInMB) {
            showWarningToast(`File is too large. Maximum size is ${Math.floor(maxSizeInMB)}MB.`);
            return false;
        }
    
        const fileType = file.type.toLowerCase();
        const isTypeSupported = config.supportedTypes.some(
            (type) =>
                type.toLowerCase() === fileType ||
                (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "")))
        );
    
        if (!isTypeSupported) {
            showWarningToast(
                `File type not supported. Supported types: ${config.supportedTypes.map(type => type.split('/')[1]).join(", ")}`
            );
            return false;
        }
    
        return true;
    };
    
      

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const files = Array.from(e.target.files || []);

        // If no files selected (cancelled), restore last valid file
        if (files.length === 0 && lastValidFile) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(lastValidFile);
            if (actualFileInputRef.current) {
                actualFileInputRef.current.files = dataTransfer.files;
            }
            setValue(name, lastValidFile);
            setPreviewUrls([URL.createObjectURL(lastValidFile)]);
            setDisplayFileName(lastValidFile.name || "");
            return;
        }

        // Check if number of files exceeds limit
        if (files.length > config.maxFiles) {
            if (actualFileInputRef.current) {
                actualFileInputRef.current.value = "";
            }
            return;
        }

        // Validate each file
        const validFiles: File[] = [];
        const newPreviewUrls: string[] = [];

        for (const file of files) {
            const isValid = await validateFile(file);
            if (!isValid) {
                if (actualFileInputRef.current) {
                    actualFileInputRef.current.value = "";
                }
                return;
            }
            validFiles.push(file);
            setLastValidFile(file);

            // Create preview URL only for images
            if (file.type.startsWith('image/')) {
                newPreviewUrls.push(URL.createObjectURL(file));
            }
        }

        // Update state with valid files
        if (isMultiple) {
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
            setValue(name, validFiles);
            setDisplayFileName(validFiles[0]?.name || "");
        } else {
            setPreviewUrls(newPreviewUrls);
            setValue(name, validFiles[0]);
            setDisplayFileName(validFiles[0]?.name || "");
            onFileChange?.(validFiles[0]);
        }
    };

    const removeFile = (index?: number) => {
        if (disabled) return;

        if (isMultiple && typeof index === 'number') {
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
            const currentValue = control._formValues[name];
            if (Array.isArray(currentValue)) {
                const newValue = currentValue.filter((_, i) => i !== index);
                setValue(name, newValue);
                setDisplayFileName(newValue[0]?.name ?? "");
            }
        } else {
            setPreviewUrls([]);
            setValue(name, null);
            setDisplayFileName("");
            if (actualFileInputRef.current) {
                actualFileInputRef.current.value = "";
            }
        }
    };

    return (
        <>
            <FormField
                control={control}
                name={name}
                render={() => (
                    <FormItem>
                        {uploadType === UploadType.ATTACHMENT ? (
                            <div className="relative">
                                <div className="mb-2">
                                    <Label className="block text-sm font-semibold mb-2 text-input-label" htmlFor={name}>
                                        {label}
                                    </Label>
                                </div>
                                {displayFileName ? (
                                    <div className="flex items-center border rounded-lg px-4 py-3 h-[44px] w-[407px] bg-white">
                                        <PiLinkSimple className="h-[20px] w-[20px] text-blue-600 mr-2" />
                                        <span className="text-blue-600 font-medium text-sm truncate max-w-[300px] border-b border-blue-600">
                                            {displayFileName}
                                            {isMultiple && previewUrls.length > 1 ? ` (+${previewUrls.length - 1} more)` : ""}
                                        </span>
                                        <button
                                            type="button"
                                            className="ml-auto text-var(--neutral-950) "
                                            onClick={() => removeFile()}
                                            aria-label="Remove file"
                                            disabled={disabled}
                                        >
                                            <X className="h-4 w-4 cursor-pointer" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative h-[44px] w-[407px]">
                                        <input
                                            ref={actualFileInputRef}
                                            type="file"
                                            id={name}
                                            data-testid={`${name}-input`}
                                            className="absolute inset-0 opacity-0 cursor-pointer bg-white"
                                            multiple={isMultiple}
                                            accept={config.supportedTypes.join(",")}
                                            onChange={handleFileChange}
                                            disabled={disabled}
                                            aria-label={label}
                                        />
                                          <button
                                            type="button"
                                            className={`flex items-center h-full border rounded-lg px-4 py-3 text-sm bg-white cursor-pointer border-input-border w-full ${
                                                displayFileName 
                                                    ? 'text-blue-600 underline decoration-1 underline-offset-4 text-left' 
                                                    : 'text-input-label justify-center'
                                            }`}
                                            onClick={() => actualFileInputRef.current?.click()}
                                          >
                                            <PiLinkSimple className={`h-5 w-5 mr-2 ${displayFileName ? 'text-blue-600' : ''}`} stroke={displayFileName ? 'currentColor' : 'black'} />
                                            {displayFileName || placeholder || "Add an Attachment"}
                                          </button>
                                    </div>
                                )}
                                <FormMessage />
                            </div>
                        ) : (
                            <>
                                {label && <Label htmlFor={name}>{label}:</Label>}
                                <div className={`flex flex-wrap gap-4 ${customStyles?.container || ''}`}>
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative" onClick={() => {
                                            if (!isMultiple) {
                                                actualFileInputRef.current?.click();
                                            }
                                        }}>
                                            <Image
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                width={160}
                                                height={112}
                                                style={{ objectFit: "contain", height: "100%", width: "100%" }}
                                                unoptimized
                                            />
                                            {!hideRemoveButton && (
                                                <BaseButton
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-1 right-1"
                                                    onClick={() => removeFile(index)}
                                                    disabled={disabled}
                                                >
                                                    <ImageMinus className="h-4 w-4" />
                                                </BaseButton>
                                            )}
                                        </div>
                                    ))}
                                    {
                                        <Label
                                            htmlFor={name}
                                            className={`flex justify-center items-center h-[7rem] w-[10rem] cursor-pointer rounded-md dark:bg-slate-800 border ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${customStyles?.label || ''} ${(!isMultiple && previewUrls?.length > 0) && 'hidden'}`}
                                        >
                                            {customStyles?.placeholder || (
                                                <div className="flex flex-col items-center">
                                                    {uploadType === UploadType.PROFILE_PICTURE ? <ImageIcon /> : <FileIcon />}
                                                    <p>{placeholder}</p>
                                                </div>
                                            )}
                                            <FormControl>
                                                <input
                                                    ref={actualFileInputRef}
                                                    type="file"
                                                    accept={config.supportedTypes.join(',')}
                                                    id={name}
                                                    data-testid={`${name}-input`}
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    multiple={isMultiple}
                                                    disabled={disabled}
                                                    aria-label={label}
                                                />
                                            </FormControl>
                                        </Label>
                                    }
                                </div>
                                <FormMessage />
                            </>
                        )}
                    </FormItem>
                )}
            />
            {previewUrls.length > 0 && !isMultiple && !hideRemoveButton && uploadType !== UploadType.ATTACHMENT && (
                <div className="mt-2">
                    <BaseButton variant="destructive" onClick={() => removeFile()} disabled={disabled}>
                        <ImageMinus />
                        Remove file
                    </BaseButton>
                </div>
            )}
        </>
    );
};

export default FormFile;