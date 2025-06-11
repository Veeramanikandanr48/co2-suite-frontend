"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import BaseButton from "../base-button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import type { ResourceData } from "@/types/resource"
import Plus from "@/components/svg/plus"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadResourceSchema } from "@/lib/schemas"
import { FormField, FormItem } from "@/components/ui/form"
import { UploadResourceType } from "@/types/form"
import FormInput from "../reusables/form-fields/form-input"
import FormFile from "../reusables/form-fields/form-file"
import { EAdditionalFieldError, UploadType } from "~/enums/base-enum"
import { REGEX } from "@/lib/variables"
import siteResource from "@/components/test-ids/site-resource.ids"
import { UnSavedDialog } from "../reusables/dialogs/unsaved.dialog"

interface UploadFileModalProps {
  onClose: () => void
  onUpload: (resource: ResourceData & { file?: File }) => Promise<EAdditionalFieldError | undefined>
}

export default function UploadFileModal({ onClose, onUpload }: Readonly<UploadFileModalProps>) {
  const methods = useForm<UploadResourceType>({
    resolver: zodResolver(UploadResourceSchema),
    mode: "onBlur",
    defaultValues: { name: "", description: "", tags: [], attachments: undefined },
  })

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState,
    trigger,
  } = methods

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showMaxTagError] = useState(false);
  const [showDuplicateTagError, setShowDuplicateTagError] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const attachments: File[] | undefined = watch("attachments");
  const nameValue = watch("name");

  useEffect(() => {
    if (attachments?.length > 0 && attachments[0]?.name) {
      const fileNameWithoutExtension = attachments[0].name.split('.').slice(0, -1).join('.');
      setValue("name", fileNameWithoutExtension, { shouldValidate: true });
    }
  }, [attachments, setValue]);

  useEffect(() => {
    setValue("tags", selectedTags);
    trigger("tags");
  }, [selectedTags, setValue, trigger]);

  const handleSubmitForm = async (data: UploadResourceType) => {
    if (!data.name || selectedTags.length === 0 || !attachments) {
      alert("Please fill in all required fields")
      return
    }
    const newResource: ResourceData & { file?: File } = {
      id: "",
      resourceName: data.name,
      description: data.description ?? "",
      tags: selectedTags,
      attachmentKey: data.attachments[0].name,
      fileType: data.attachments[0].type,
      file: data.attachments[0],
      displayName: data.attachments[0].name
    }
    const result: EAdditionalFieldError | undefined = await onUpload(newResource)
    if (result === EAdditionalFieldError.ADDITIONALCONTEXT) {
      setValue('contextFileName', nameValue);
      trigger();
    } else {
      onClose()
    }
  }

  const isAddButtonEnabled = () => {
    if (showDuplicateTagError || showMaxTagError) return false;
    return (
      selectedTags.length > 0 &&
      attachments &&
      attachments.length > 0 &&
      nameValue?.trim()
    );
  }

  const hasFormErrors = Object.keys(formState.errors).length > 0;

  const handleRemoveTag = (tag: string) => {
    const updatedTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(updatedTags);
  };
  

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Always allow backspace to remove last tag
    if (e.key === 'Backspace' && tagInput === '' && selectedTags.length > 0) {
      const updatedTags = [...selectedTags];
      updatedTags.pop();
      setSelectedTags(updatedTags);
      return;
    }

    // For non-max tags case, handle normal input
    if (!REGEX.stringOnly.test(e.key)) {
      e.preventDefault();
    }
    handleTagInput(e);
  };
  

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent typing if at max tags
    if (selectedTags.length >= 5) {
      e.preventDefault();
      return;
    }

    const value = e.target.value;
    setTagInput(value);
  
    const isDuplicate = selectedTags.some(
      (tag) => tag.toLowerCase() === value.trim().toLowerCase()
    );
  
    // Clear duplicate error if value is no longer a duplicate
    if (showDuplicateTagError && !isDuplicate) {
      setShowDuplicateTagError(false);
    }
  };
  

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
  
      if (!newTag) return;
  
      const isDuplicate = selectedTags.some(
        (tag) => tag.toLowerCase() === newTag.toLowerCase()
      );
  
      if (isDuplicate) {
        setShowDuplicateTagError(true);
      } else {
        setSelectedTags((prev) => [...prev, newTag]);
        setTagInput('');
        setShowDuplicateTagError(false);
      }
    }
  };
  

  // Add this new function to check for unsaved changes
  const hasUnsavedChanges = () => {
    const formValues = methods.getValues();
    return (
      formValues.name?.trim() !== "" ||
      formValues.description?.trim() !== "" ||
      selectedTags.length > 0 ||
      attachments?.length > 0
    );
  };

  // Modify the onClose handler to check for unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowSaveDialog(true);
    } else {
      onClose();
    }
  };

  // Update the handleDontSave function
  const handleDontSave = () => {
    setShowSaveDialog(false);
    onClose();
  };

  return (
    <FormProvider {...methods}>
      <Dialog open={true}>
        <DialogOverlay className="bg-black/50" />
        <DialogContent className="p-0 max-w-[533px]" data-testid={siteResource.uploadModal}>
          <form onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col">
            {/* Modal Header */}
            <DialogHeader className="px-6 pt-3 relative bg-white rounded-t-lg w-[533px] h-[44px]">
              <DialogTitle className="text-base font-bold text-header-secondary">
                Upload File
              </DialogTitle>
              <DialogClose className="absolute top-2 right-4 text-neutral-700">
                <X className="h-6 w-6 cursor-pointer" onClick={handleClose} />
              </DialogClose>
            </DialogHeader>

            {/* Modal Content */}
            <div className="px-6 py-2 space-y-[30px] flex flex-col items-center bg-light-200 flex-grow w-[533px]">

            <div className="w-[407px]">
                <FormFile
                  name="attachments"
                  label="Attachment"
                  placeholder="Add an Attachment"
                  uploadType={UploadType.ATTACHMENT}
                  customStyles={{
                    container: "w-full h-full absolute inset-0",
                    label: "border rounded-md px-3 py-2 min-h-[44px] w-full bg-white",
                  }}
                  hideRemoveButton={true}
                />
              </div>

              <div className="w-[407px]">
                <FormInput
                  name="name"
                  label="Name"
                  placeholder="add a name"
                  className="h-[44px] w-full text-sm font-medium text-input-label bg-white border-input-border rounded-lg placeholder:italic"
                  labelClassName="text-sm font-semibold text-input-label"
                  vertical
                  data-testid={siteResource.resourceNameInput}
                />
              </div>
              <div className="w-[407px]">
                <FormInput
                  name="description"
                  label="Description"
                  placeholder="add a description..."
                  className="h-[44px] w-full text-sm font-normal bg-white border-input-border rounded-lg placeholder:italic"
                  labelClassName="text-sm font-semibold text-input-label"
                  vertical
                />
              </div>

              {/* Tags */}
              <div className="w-[407px]">
                <FormField
                  control={control}
                  name="tags"
                  render={() => (
                    <FormItem className="w-full">
                      <span className="block text-sm font-semibold text-input-label mb-2">Tags</span>
                      <div className="relative w-full">
                        {/* Error message top-right */}
                        {showDuplicateTagError && (
                          <span className="absolute right-2 -top-4 text-xs text-negative-700 font-light italic">
                            Duplicate tags
                          </span>
                        )}
                        <div
                          className={`flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 min-h-[44px] w-full bg-white border ${showDuplicateTagError ? 'border-negative-700' : 'border-input-border'}`}
                        >
                       {selectedTags.map((tag: string, index: number) => (
                 <Badge
                key={tag + index}
                variant="secondary"
                className="flex items-center gap-1 bg-[#F1F3F6] text-gray-700 font-medium px-2 py-0.5 rounded-lg text-xs h-6 max-w-[120px] min-w-[40px] whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0"
                 >
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[90px]">
                  {tag.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 rounded"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="w-3.5 h-3.5 " />
                </button>
              </Badge>
            ))}

            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder={selectedTags.length === 0 ? "add a tag..." : ""}
              className="flex-1 min-w-10 outline-none bg-transparent text-sm font-normal placeholder:italic uppercase placeholder:normal-case"
              style={{ textTransform: 'uppercase' }}
              maxLength={25}
              readOnly={selectedTags.length >= 5}
            />
          </div>

          <p className="text-[10px] mt-1 text-gray-500">
            You can add a maximum of 5 unique tags.
          </p>
        </div>
      </FormItem>
    )}
  />
</div>

            </div>

            {/* Footer */}
            <DialogFooter className="flex items-center justify-center gap-12 px-28 py-6 mt-auto bg-white rounded-b-xl w-[533px] h-[72px]">
              <BaseButton
                type="button"
                variant="outline"
                className="w-[130px] h-[38px] border-primary-500 text-sm font-bold rounded-sm hover:bg-white hover:text-primary-500 cursor-pointer"
                onClick={handleClose}
              >
                <X className="h-4 w-4 cursor-pointer" /> Cancel
              </BaseButton>
              <BaseButton
                type="submit"
                className="w-[130px] h-[38px] bg-primary-500 hover:primary-500 text-white font-medium rounded-sm flex items-center justify-center cursor-pointer disabled:bg-button-disabled disabled:text-button-text"
                disabled={hasFormErrors || !isAddButtonEnabled()}
              >
                <Plus className="h-[16px] w-[16px] " stroke={hasFormErrors || !isAddButtonEnabled() ? "var(--neutral-700)" : "var(--light-100)"} />

                Add
              </BaseButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnSavedDialog
        open={showSaveDialog}
        title="Unsaved Changes"
        message="You will lose all your changes if you proceed."
        onConfirm={handleDontSave}
        onCancel={() => setShowSaveDialog(false)}
      />
    </FormProvider>
  );
}
