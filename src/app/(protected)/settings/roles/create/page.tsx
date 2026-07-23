"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Permission, Role } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { PermissionMatrixSelector } from "@/components/settings/roles/permission-matrix-selector";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const createRoleSchema = z.object({
  roleKey: z
    .string()
    .min(2, "Role Key must be at least 2 characters")
    .regex(/^[A-Z0-9_]+$/, "Role Key must be UPPERCASE (e.g. CARBON_MANAGER)"),
  roleName: z.string().min(2, "Role Name is required"),
  roleShortName: z.string().optional(),
  description: z.string().optional(),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export default function CreateRolePage() {
  const router = useRouter();
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [loadingPerms, setLoadingPerms] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleKey: "",
      roleName: "",
      roleShortName: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPerms(true);
        const res = await apiService.get<Permission[]>(API_LIST.GET_PERMISSIONS);
        const rawData = (res as any)?.data ?? res ?? [];
        const safePerms: Permission[] = Array.isArray(rawData) ? rawData : [];
        setAllPermissions(safePerms);
      } catch (error: any) {
        console.error("Failed to fetch permissions:", error);
        showErrorToast("Error loading permissions catalog");
      } finally {
        setLoadingPerms(false);
      }
    };

    fetchPermissions();
  }, []);

  const onSubmit = async (values: CreateRoleFormValues) => {
    try {
      setSubmitting(true);

      // Step 1: Create Role
      const createRes = await apiService.post<Role>(API_LIST.CREATE_ROLE, {
        roleKey: values.roleKey.trim(),
        roleName: values.roleName.trim(),
        roleShortName: values.roleShortName?.trim() || undefined,
        description: values.description?.trim() || undefined,
      });

      const newRoleData = (createRes as any)?.data ?? createRes;
      const createdRoleId = newRoleData?.roleId || newRoleData?.id;

      // Step 2: Assign Selected Permissions
      if (createdRoleId && selectedPermissionIds.size > 0) {
        const permIdsArray = Array.from(selectedPermissionIds);
        await apiService.put(`${API_LIST.ASSIGN_PERMISSIONS_TO_ROLE}/${createdRoleId}`, {
          permissionIds: permIdsArray,
        });
      }

      showSuccessToast(`Role "${values.roleName}" created successfully!`);
      router.push("/settings/roles");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create role";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 text-foreground">
      {/* Header Bar - Fixed */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <button
            onClick={() => router.push("/settings/roles")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1.5 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Roles</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create New Role</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define role parameters and assign module permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings/roles")}
            className="h-8 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={submitting}
            onClick={form.handleSubmit(onSubmit)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 h-8 text-xs px-4 shadow-sm"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save & Create
          </Button>
        </div>
      </div>

      {/* Main Form Body - Scrollable inside container */}
      <div className="flex-1 min-h-0 overflow-auto pr-1 space-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
            {/* Role Details Card */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-bold text-foreground text-sm tracking-tight">Role Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set the role key identifier, display name, and scope description.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="roleKey"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Role Key <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. CARBON_MANAGER"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                          className="bg-background border-border font-mono text-xs uppercase h-8 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-500 text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Role Name <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Carbon Compliance Manager"
                          className="bg-background border-border text-xs h-8 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-500 text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleShortName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Short Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Carbon Mgr"
                          className="bg-background border-border text-xs h-8 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-500 text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder="Describe the scope of this role..."
                        className="bg-background border-border text-xs resize-none focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Permission Selector */}
            <div className="pt-1">
              <PermissionMatrixSelector
                allPermissions={allPermissions}
                selectedPermissionIds={selectedPermissionIds}
                onSelectionChange={setSelectedPermissionIds}
                loading={loadingPerms}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
