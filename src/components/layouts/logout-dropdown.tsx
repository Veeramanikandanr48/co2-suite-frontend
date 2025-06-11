"use client"

import * as React from "react"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { WarningAlert } from "../svg";

type LogoutDialogProps = {
  onLogout: () => void;
};

export function LogoutDialog({ onLogout }: Readonly<LogoutDialogProps>) {
  return (
    <DialogContent
      className="p-0 w-[503px] rounded-sm"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <div className="flex flex-col h-full p-4">
        {/* Close Icon */}
        <div className="flex justify-end">
          <DialogClose asChild>
            <button
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-[24px] h-[24px] text-button-close" />
            </button>
          </DialogClose>
        </div>

        {/* Header */}
        <DialogHeader className="flex justify-center">
          <DialogTitle className="mb-2 text-center text-base font-medium text-black justify-center gap-[6px]">
            <WarningAlert />
            Confirm Logout
          </DialogTitle>
        </DialogHeader>

        {/* Description */}
        <DialogDescription className="text-center font-normal text-modal-content text-base leading-tight px-10"
          dangerouslySetInnerHTML={{ __html: "This action will log you out as an administrator." }}
        />
        <p className="text-center text-base text-modal-content font-normal mt-[10px]">Do you still want to continue?</p>

        {/* Footer */}
        <div className="flex justify-center gap-5 mt-8 mb-2">
          <DialogClose asChild>
            <button className="w-[130px] h-[38px] border border-header-secondary text-header-secondary py-2 rounded-sm font-medium transition">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={onLogout}
            className="w-[130px] h-[38px] border border-primary-500 text-primary-500 py-2 rounded-sm font-medium bg-white transition"
          >
            Continue
          </button>
        </div>
      </div>
    </DialogContent>
  )
}