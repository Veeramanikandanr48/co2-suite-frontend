"use client";

import React, { useState, useEffect } from "react";
import { LOGIN_TEST_IDS } from "~/components/test-ids/login-ids";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Mail, X } from "lucide-react";

const RESEND_COUNTDOWN_TIME = 30;

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}) => {
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_TIME);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isResendDisabled]);

  if (!isOpen) return null;

  const handleResendClick = () => {
    setIsResendDisabled(true);
    setCountdown(RESEND_COUNTDOWN_TIME);
  };

  const handleClose = () => {
    setIsResendDisabled(true);
    setCountdown(RESEND_COUNTDOWN_TIME);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent
        data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_MODAL}
        className="bg-white border border-slate-200 text-slate-900 p-8 rounded-2xl shadow-2xl max-w-md w-full sm:rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <button
          data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_ICON}
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Mail className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Password Reset Requested</h2>
            <p className="text-sm text-slate-500">
              We&apos;ve dispatched a secure recovery link to
            </p>
            <p className="text-sm font-semibold text-emerald-600 break-all">{email || "your registered email"}</p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
            <span>Didn&apos;t receive the link?</span>
            <button
              data-testid={LOGIN_TEST_IDS.RESEND_LINK_BUTTON}
              onClick={!isResendDisabled ? handleResendClick : undefined}
              disabled={isResendDisabled}
              className={`font-semibold transition-colors ${
                isResendDisabled
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-emerald-600 hover:text-emerald-700 cursor-pointer"
              }`}
              tabIndex={isResendDisabled ? -1 : 0}
              aria-disabled={isResendDisabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isResendDisabled) handleResendClick();
                }
              }}
            >
              {isResendDisabled ? `Resend in ${countdown}s` : "Resend email"}
            </button>
          </div>

          <Button
            data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_BUTTON}
            onClick={handleClose}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Return to Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
