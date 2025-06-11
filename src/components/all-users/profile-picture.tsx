import { PiCloudArrowUp, PiTrash } from 'react-icons/pi';
import FormFile from '../reusables/form-fields/form-file';
import { UploadType } from '@/enums/base-enum';
import { useRef, useState, useEffect } from 'react';
import { DeleteDialog } from '../reusables/dialogs/delete';

interface ProfilePictureProps {
    imageUrl?: string | { type: 'Buffer'; data: number[] } | null | File;
    name?: string;
    disabled?: boolean;
    onFileChange?: () => void;
    onRemove?: (isRemoving: boolean) => void; 
    isEditing?: boolean; // Add the missing isEditing prop
}

export const ProfilePicture = ({
    name = 'profilePicture',
    disabled = false,
    onFileChange,
    onRemove,
    isEditing, // Accept the prop
    imageUrl,
}: ProfilePictureProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formFileKey, setFormFileKey] = useState(0);

    useEffect(() => {
        if (!imageUrl && formFileKey === 0) {
            setFormFileKey(prevKey => prevKey + 1);
        } else if (imageUrl && formFileKey > 0) {
            setFormFileKey(0);
        }
    }, [imageUrl, formFileKey]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled || !isEditing) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && fileInputRef.current) {
            const file = files[0];
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;

            const changeEvent = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(changeEvent);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleReplaceClick = () => {
        if (disabled || !isEditing) return;
        fileInputRef.current?.click();
    };

    const handleRemoveClick = () => {
        if (disabled || !isEditing) return;
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (onRemove) onRemove(true); // Pass true to indicate removal
        setShowDeleteDialog(false);
    };

    return (
        <div className="flex flex-col gap-2 justify-center items-center mr-5 mb-5">
            <div
                className="w-[158px] h-[158px] m-[0.1px] border-[0.57px] border-input-border rounded-lg overflow-hidden relative"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <FormFile
                    key={formFileKey}
                    name={name}
                    uploadType={UploadType.PROFILE_PICTURE}
                    disabled={disabled}
                    onFileChange={onFileChange}
                    fileInputRef={fileInputRef}
                    customStyles={{
                        container: 'w-full h-full absolute inset-0',
                        label: 'w-full h-full flex items-center justify-center',
                        placeholder: (
                            <div className="text-center">
                                <div className="text-xs text-gray-400 flex items-center gap-2 pb-2">
                                    <PiCloudArrowUp className="w-[22.93px] h-[22.93px] stroke-input-border" />
                                    Drop file to upload
                                </div>
                                <div className="text-xs text-input-border pl-8">
                                    or <span className="text-primary-100 underline">browse</span>
                                </div>
                            </div>
                        ),
                    }}
                    hideRemoveButton={true}
                />

                {!disabled && isEditing && imageUrl && (
                    <div
                        className="absolute inset-0 bg-transparent z-10"
                        onClick={(e) => { e.stopPropagation(); }}
                        aria-hidden="true"
                    ></div>
                )}

                {!disabled && isEditing && imageUrl && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-around gap-6 bg-light-300 py-0.5 rounded-b-md select-none z-20">
                        <button
                            type="button"
                            onClick={handleRemoveClick}
                            disabled={disabled}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                            aria-label="Remove profile picture"
                        >
                            <PiTrash className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleReplaceClick}
                            disabled={disabled}
                            className="text-xs text-primary-100 italic cursor-pointer"
                        >
                            Replace
                        </button>
                    </div>
                )}
            </div>
            <div className="text-xs font-normal text-input-label">Profile Picture</div>

            <DeleteDialog
                open={showDeleteDialog}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteDialog(false)}
                title="Delete Profile Picture"
                message="Are you sure you want to delete your profile picture? <br/>This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </div>
    );
};
