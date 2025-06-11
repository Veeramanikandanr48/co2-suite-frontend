import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Close, WarningAlert } from "~/components/svg"
import { DeleteDialogProps } from "~/types"
import userTable from "@/components/test-ids/user-table.test-id"

export function DeleteDialog({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure you want to delete ?",
  message = "This will permanently delete the item and all associated configurations.",
  confirmLabel = "Continue",
  cancelLabel = "Cancel"
}: Readonly<DeleteDialogProps>) {
  return (
    <Dialog open={open}>
      <DialogTitle></DialogTitle>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-3xs" />
      <DialogContent className="sm:max-w-[503px] p-4 rounded-sm">
        <div className="flex justify-end items-end">
            <button onClick={onCancel} className="focus:outline-none" data-testid={userTable.cancelButton}>
              <Close className="h-6 w-6" stroke="black"/>
            </button>
        </div>
        <DialogTitle className="justify-center text-base font-medium -mt-2 text-modal-heading leading-tight gap-[6px]" 
        >
          <WarningAlert/>
          {title}
        </DialogTitle>
        <DialogDescription className="text-center font-normal text-modal-content break-words text-base leading-tight"
          dangerouslySetInnerHTML={{ __html: message }}
          data-testid={userTable.deleteDescription}
        />
        <p className="text-center font-normal text-modal-content text-md leading-tight">Do you still want to continue?</p>

        <DialogFooter className="flex justify-center m-4 gap-4 sm:justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-[130px] h-[38px] font-bold rounded-sm text-sm text-header-secondary bg-light-100 border-[1px] border-header-secondary"
            data-testid={userTable.cancelButton}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className="w-[130px] h-[38px] font-bold rounded-sm text-sm text-primary-500 bg-light-100 border-[1px] border-primary-500"
            data-testid={userTable.confirmDelete}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 