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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Permission, MasterModule } from "@/types/roles-permissions";
import { KeyRound, Loader2 } from "lucide-react";

const createPermissionSchema = z.object({
  moduleId: z.number().min(1, "Module is required"),
  resource: z.string().min(2, "Resource is required (e.g. users, emissions, reports)"),
  action: z.string().min(2, "Action is required (e.g. read, create, update, delete)"),
  scope: z.enum(["any", "own"]).default("any"),
  description: z.string().optional(),
});

type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;

interface CreatePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: MasterModule[];
  onPermissionCreated: (permission: Permission) => void;
}

export const CreatePermissionDialog: React.FC<CreatePermissionDialogProps> = ({
  open,
  onOpenChange,
  modules,
  onPermissionCreated,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      moduleId: modules[0]?.moduleId || 1,
      resource: "",
      action: "read",
      scope: "any" as "any" | "own",
      description: "",
    },
  });

  const onSubmit = async (values: CreatePermissionFormValues) => {
    try {
      setSubmitting(true);
      const res = await apiService.post<Permission>(API_LIST.CREATE_PERMISSION, {
        moduleId: Number(values.moduleId),
        resource: values.resource.trim().toLowerCase(),
        action: values.action.trim().toLowerCase(),
        scope: values.scope,
        description: values.description?.trim() || undefined,
      });

      const newPerm = (res as any)?.data ?? res;
      showSuccessToast(`Permission "${values.action} ${values.resource}" created!`);
      onPermissionCreated(newPerm);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create permission";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-purple-500/20 bg-neutral-900 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-400">
            <KeyRound className="w-6 h-6 text-purple-400" />
            Create Master Permission
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Add a new permission rule definition to the system permission registry.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300 font-medium">
                    Module <span className="text-rose-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(val) => field.onChange(parseInt(val, 10))}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue placeholder="Select Module..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                      {modules.length === 0 ? (
                        <SelectItem value="1">Default Module (#1)</SelectItem>
                      ) : (
                        modules.map((m) => (
                          <SelectItem key={m.moduleId} value={m.moduleId.toString()}>
                            {m.moduleName} ({m.moduleKey})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 font-medium">
                      Resource <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. emissions"
                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                        className="bg-neutral-800 border-neutral-700 text-white focus:border-purple-500"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 font-medium">
                      Action <span className="text-rose-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                          <SelectValue placeholder="Select Action..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                        <SelectItem value="read">read</SelectItem>
                        <SelectItem value="create">create</SelectItem>
                        <SelectItem value="update">update</SelectItem>
                        <SelectItem value="delete">delete</SelectItem>
                        <SelectItem value="approve">approve</SelectItem>
                        <SelectItem value="manage">manage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300 font-medium">Scope</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue placeholder="Select Scope..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                      <SelectItem value="any">any (Global / Tenant scope)</SelectItem>
                      <SelectItem value="own">own (Resource creator / Owner scope)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      rows={2}
                      placeholder="e.g. Allows user to read GHG emissions reports"
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-purple-500 resize-none"
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
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Permission
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
