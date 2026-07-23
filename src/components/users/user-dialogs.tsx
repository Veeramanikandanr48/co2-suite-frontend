"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResetPasswordSchema } from "@/lib/schemas";
import { UserListItem } from "@/types/user-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { KeyRound, Trash2, Loader2, Eye, EyeOff, ShieldOff } from "lucide-react";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { extractErrorMessage } from "@/lib/api-utils";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

interface ResetPasswordDialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetPassForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!user) return;
    try {
      setSubmitting(true);
      await apiService.post(`${API_LIST.RESET_USER_PASSWORD}/${user.userId}/reset-password`, {
        newPassword: values.newPassword,
      });

      showSuccessToast(`Password reset for ${user.emailId}`);
      resetPassForm.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to reset password";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Reset User Password
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Set a new password for <strong className="font-mono">{user?.emailId}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...resetPassForm}>
          <form onSubmit={resetPassForm.handleSubmit(handleResetPassword)} className="space-y-3 py-2">
            <FormField
              control={resetPassForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">New Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showResetPass ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-8 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPass(!showResetPass)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        {showResetPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-500 text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={resetPassForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Confirm New Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showResetConfirmPass ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-8 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPass(!showResetConfirmPass)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        {showResetConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-500 text-[11px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface UserDeleteDialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted: () => void;
}

export const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserDeleted,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDeleteUser = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      await apiService.delete(`${API_LIST.DELETE_USER}/${user.userId}`);
      showSuccessToast(`User "${user.emailId}" deleted`);
      onOpenChange(false);
      onUserDeleted();
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to delete user";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
            <Trash2 className="w-4 h-4" />
            Delete User Account
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Are you sure you want to deactivate and remove account <strong className="font-mono">{user?.emailId}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={submitting} onClick={handleDeleteUser} className="bg-rose-600 hover:bg-rose-500 text-white h-8 text-xs">
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface Disable2FADialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  on2FADisabled: () => void;
}

export const UserDisable2FADialog: React.FC<Disable2FADialogProps> = ({
  user,
  open,
  onOpenChange,
  on2FADisabled,
}) => {
  const [adminTotpCode, setAdminTotpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmitting(true);
      await apiService.post(`${API_LIST.GET_ALL_USERS}/${user.userId}/disable-2fa`, {
        adminTotpCode: adminTotpCode.trim(),
      });
      showSuccessToast(`2FA disabled for user "${user.emailId}"`);
      setAdminTotpCode("");
      onOpenChange(false);
      on2FADisabled();
    } catch (error: unknown) {
      showErrorToast(extractErrorMessage(error, "Failed to disable 2FA for user"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600">
            <ShieldOff className="w-4 h-4" />
            Disable User 2FA
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Disabling Two-Factor Authentication for <strong className="font-mono text-neutral-900 dark:text-white">{user?.emailId}</strong>.
            For security authorization, please enter your Super Admin 6-digit TOTP verification code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDisable2FA} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Super Admin 2FA Code *
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={adminTotpCode}
              onChange={(e) => setAdminTotpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="h-10 text-center font-mono text-lg font-bold tracking-[0.4em] bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
            />
            <p className="text-[11px] text-neutral-400">
              Enter the 6-digit code from your Super Admin authenticator app to authorize.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-500 text-white h-8 text-xs font-semibold gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Disable User 2FA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
