"use client";

import React, { useState } from "react";
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
import { ShieldPlus, Loader2 } from "lucide-react";

const createRoleSchema = z.object({
  roleKey: z
    .string()
    .min(2, "Role Key must be at least 2 characters")
    .regex(/^[A-Z0-9_]+$/, "Role Key must be uppercase letters, numbers, and underscores only"),
  roleName: z.string().min(2, "Role Name is required"),
  roleShortName: z.string().optional(),
  description: z.string().optional(),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated: (role: Role) => void;
}

export const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  open,
  onOpenChange,
  onRoleCreated,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleKey: "",
      roleName: "",
      roleShortName: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateRoleFormValues) => {
    try {
      setSubmitting(true);
      const res = await apiService.post<Role>(API_LIST.CREATE_ROLE, {
        roleKey: values.roleKey.trim().toUpperCase(),
        roleName: values.roleName.trim(),
        roleShortName: values.roleShortName?.trim() || undefined,
        description: values.description?.trim() || undefined,
      });

      const newRole = (res as any)?.data ?? res;
      showSuccessToast(`Role "${values.roleName}" created successfully!`);
      onRoleCreated(newRole);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create role";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-neutral-200 dark:border-emerald-500/20 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Create New Role
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            Define a new security role for access control and permission binding.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="roleKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300 font-medium">
                    Role Key <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. COMPLIANCE_OFFICER"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="bg-neutral-800 border-neutral-700 text-white font-mono tracking-wider focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />

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
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-emerald-500"
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
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-emerald-500"
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
                      placeholder="Describe the responsibilities and permissions associated with this role..."
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-emerald-500 resize-none"
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
