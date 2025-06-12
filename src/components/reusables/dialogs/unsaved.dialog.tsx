import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import { WarningDialogProps } from "~/types";
import dialogIds from "@/components/test-ids/dialog-ids";
import { WarningAlert } from "@/components/svg";

export function UnSavedDialog({
  title,
  message,
  open,
  onConfirm,
  onCancel,
}: Readonly<WarningDialogProps>) {
  return (
    <Dialog open={open}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-3xs" />
      <DialogContent className="sm:max-w-[503px] rounded-sm p-2 z-50"
       >
        <DialogHeader className="items-end">
          <DialogTitle></DialogTitle>
            <X
              className="h-6 w-6 stroke-neutral-500 hover:stroke-neutral-700 "
              onClick={onCancel} 
              data-testid={dialogIds.cancelWarningButton}
            />
        </DialogHeader>
        <div className="flex justify-center items-center gap-[6px] h-5 -mt-2">
          <WarningAlert />
          <p className="text-center font-medium text-modal-heading !text-base">{title}</p>
        </div>
        <DialogDescription className="text-center font-normal text-modal-content text-base leading-tight px-10"
          dangerouslySetInnerHTML={{ __html: message }} 
        />
        <p className="text-center text-base text-modal-content font-normal">Do you still want to continue?</p>
        
          <DialogFooter className="flex justify-center my-4 mb-7 gap-5 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-[130px] h-[38px] rounded-sm font-bold text-sm text-header-secondary bg-white border-[1px] border-header-secondary"
            data-testid={dialogIds.cancelWarningButton}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-[130px] h-[38px] rounded-sm font-bold text-sm text-primary bg-white border-[1px] border-primary"
            data-testid={dialogIds.confirmWarningButton}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 