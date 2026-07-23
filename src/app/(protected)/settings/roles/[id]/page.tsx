"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Permission, Role } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { PermissionMatrixSelector } from "@/components/settings/roles/permission-matrix-selector";
import { RoleUsersTab } from "@/components/settings/roles/role-users-tab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowLeft, Save, Loader2, Users, Edit3, Shield } from "lucide-react";

const editRoleSchema = z.object({
  roleName: z.string().min(2, "Role Name is required"),
  roleShortName: z.string().optional(),
  description: z.string().optional(),
});

type EditRoleFormValues = z.infer<typeof editRoleSchema>;

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editInfoDialogOpen, setEditInfoDialogOpen] = useState<boolean>(false);

  const form = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      roleName: "",
      roleShortName: "",
      description: "",
    },
  });

  const fetchData = useCallback(async () => {
    if (!roleId) return;
    try {
      setLoading(true);

      const [rolesRes, permsRes, rolePermsRes] = await Promise.all([
        apiService.get<Role[]>(API_LIST.GET_ROLES),
        apiService.get<Permission[]>(API_LIST.GET_PERMISSIONS),
        apiService.get<Permission[]>(`${API_LIST.GET_ROLE_PERMISSIONS}/${roleId}/permissions`),
      ]);

      // 1. Find Target Role
      const rawRoles = (rolesRes as any)?.data ?? rolesRes ?? [];
      const rolesList: Role[] = Array.isArray(rawRoles) ? rawRoles : [];
      const matchedRole = rolesList.find(
        (r) => String(r.roleId) === String(roleId) || String((r as any).id) === String(roleId)
      );

      if (matchedRole) {
        setRole(matchedRole);
        form.reset({
          roleName: matchedRole.roleName || "",
          roleShortName: matchedRole.roleShortName || "",
          description: matchedRole.description || "",
        });
      }

      // 2. Load All Master Permissions
      const rawAllPerms = (permsRes as any)?.data ?? permsRes ?? [];
      const safeAllPerms: Permission[] = Array.isArray(rawAllPerms) ? rawAllPerms : [];
      setAllPermissions(safeAllPerms);

      // 3. Load Role's Assigned Permissions
      const rawRolePerms = (rolePermsRes as any)?.data ?? rolePermsRes ?? [];
      const safeRolePerms: Permission[] = Array.isArray(rawRolePerms)
        ? rawRolePerms
        : (rawRolePerms as any)?.permissions || [];
      const assignedIds = new Set(safeRolePerms.map((p) => p.permissionId || (p as any).id!));
      setSelectedPermissionIds(assignedIds);
    } catch (error: any) {
      console.error("Failed to load role edit data:", error);
      showErrorToast("Failed to fetch role and permissions details");
    } finally {
      setLoading(false);
    }
  }, [roleId, form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (values: EditRoleFormValues) => {
    if (!roleId) return;
    try {
      setSubmitting(true);

      // Step 1: Update Role Details
      await apiService.put<Role>(API_LIST.UPDATE_ROLE, roleId, {
        roleName: values.roleName.trim(),
        roleShortName: values.roleShortName?.trim() || undefined,
        description: values.description?.trim() || undefined,
      });

      // Step 2: Update Assigned Permissions
      const permIdsArray = Array.from(selectedPermissionIds);
      await apiService.put(`${API_LIST.ASSIGN_PERMISSIONS_TO_ROLE}/${roleId}`, {
        permissionIds: permIdsArray,
      });

      showSuccessToast(`Role "${values.roleName}" updated successfully!`);
      router.push("/settings/roles");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to update role";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-2">
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading role details...</p>
      </div>
    );
  }

  const currentRoleName = form.watch("roleName") || role?.roleName || "—";
  const currentRoleShortName = form.watch("roleShortName") || role?.roleShortName;
  const currentDescription = form.watch("description") || role?.description;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 text-neutral-900 dark:text-neutral-100">
      {/* Compact Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <button
            onClick={() => router.push("/settings/roles")}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 mb-1 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Roles</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Edit Role: {currentRoleName}
            </h1>
            <Badge variant="outline" className="font-mono text-[11px] border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {role?.roleKey || "—"}
            </Badge>
            {currentRoleShortName && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                {currentRoleShortName}
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditInfoDialogOpen(true)}
              className="h-6 px-1.5 text-xs text-neutral-500 hover:text-cyan-600 dark:hover:text-cyan-400 gap-1 cursor-pointer"
              title="Edit role name & description"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Edit Info</span>
            </Button>
          </div>

          {currentDescription && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-2xl truncate">
              {currentDescription}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings/roles")}
            className="h-8 text-xs font-medium border-neutral-300 dark:border-neutral-700 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={submitting}
            onClick={form.handleSubmit(onSubmit)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-4 shadow-xs cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content Area with Clean Tabs */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 space-y-3">
            <Tabs defaultValue="permissions" className="flex-1 flex flex-col min-h-0">
              <div className="shrink-0 pb-1">
                <TabsList>
                  <TabsTrigger value="permissions" className="gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Permissions Matrix ({selectedPermissionIds.size})
                  </TabsTrigger>
                  <TabsTrigger value="users" className="gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Assigned Personnel ({role?.userCount ?? 0})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="permissions" className="flex-1 min-h-0 overflow-auto pt-2 pr-1">
                <PermissionMatrixSelector
                  allPermissions={allPermissions}
                  selectedPermissionIds={selectedPermissionIds}
                  onSelectionChange={setSelectedPermissionIds}
                  loading={false}
                />
              </TabsContent>

              <TabsContent value="users" className="flex-1 min-h-0 overflow-auto pt-2 pr-1">
                {role && <RoleUsersTab role={role} />}
              </TabsContent>
            </Tabs>

            {/* Edit Role Information Dialog Modal */}
            <Dialog open={editInfoDialogOpen} onOpenChange={setEditInfoDialogOpen}>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                    <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Edit Role Information
                  </DialogTitle>
                  <DialogDescription className="text-xs text-neutral-500">
                    Modify display parameters for role <strong className="font-mono">{role?.roleKey}</strong>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="roleName"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-semibold text-neutral-900 dark:text-white">
                          Role Name <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Carbon Compliance Manager"
                            className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-xs h-8 focus:border-emerald-500"
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
                        <FormLabel className="text-xs font-semibold text-neutral-900 dark:text-white">
                          Short Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Carbon Mgr"
                            className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-xs h-8 focus:border-emerald-500"
                          />
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-semibold text-neutral-900 dark:text-white">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Describe the scope of this role..."
                            className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-xs resize-none focus:border-emerald-500"
                          />
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditInfoDialogOpen(false)}
                    className="h-8 text-xs font-medium cursor-pointer"
                  >
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      </div>
    </div>
  );
}
