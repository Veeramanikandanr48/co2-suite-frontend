"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Role } from "@/types/roles-permissions";
import { Edit3, Loader2 } from "lucide-react";
import { EditRoleSchema } from "@/lib/schemas";

type EditRoleFormValues = z.infer<typeof EditRoleSchema>;

interface EditRoleDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdated: (updatedRole: Role) => void;
}

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  role,
  open,
  onOpenChange,
  onRoleUpdated,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(EditRoleSchema),
    defaultValues: {
      roleName: role?.roleName || "",
      roleShortName: role?.roleShortName || "",
      description: role?.description || "",
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        roleName: role.roleName || "",
        roleShortName: role.roleShortName || "",
        description: role.description || "",
      });
    }
  }, [role, form]);

  const onSubmit = async (values: EditRoleFormValues) => {
    if (!role) return;
    const targetRoleId = role.roleId || (role as unknown as { id: number }).id;
    try {
      setSubmitting(true);
      await apiService.put<Role>(API_LIST.UPDATE_ROLE, targetRoleId, {
        roleName: values.roleName.trim(),
        roleShortName: values.roleShortName?.trim() || undefined,
        description: values.description?.trim() || undefined,
      });

      showSuccessToast(`Role "${values.roleName}" updated!`);
      onRoleUpdated({ ...role, ...values });
      onOpenChange(false);
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to update role";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-cyan-500/20 bg-neutral-900 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-cyan-400">
            <Edit3 className="w-6 h-6 text-cyan-400" />
            Edit Role — {role?.roleKey}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Modify the role details. Note: The Role Key ({role?.roleKey}) is immutable.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-mono">Role Key (Immutable)</label>
              <div className="mt-1 px-3 py-2 rounded-md bg-neutral-800/80 border border-neutral-700 text-neutral-300 font-mono text-sm">
                {role?.roleKey}
              </div>
            </div>

            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300 font-medium">
                    Role Display Name <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Compliance Officer"
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-cyan-500"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleShortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300 font-medium">Role Short Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Compliance"
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-cyan-500"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300 font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the responsibilities..."
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-cyan-500 resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
