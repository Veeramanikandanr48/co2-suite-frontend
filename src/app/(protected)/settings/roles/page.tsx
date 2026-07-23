"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Role, Permission, MasterModule } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { ReusableTable } from "@/components/reusables/reusable-table";
import { CreatePermissionDialog } from "@/components/settings/roles/create-permission-dialog";
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
  Shield,
  ShieldPlus,
  Edit3,
  Trash2,
  KeyRound,
  Search,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface RoleTableItem extends Role {
  id: string;
}

export default function RolesSettingsPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [_permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, _setModules] = useState<MasterModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Delete Dialog state
  const [deleteRoleOpen, setDeleteRoleOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<boolean>(false);

  // Create Permission Dialog state
  const [createPermOpen, setCreatePermOpen] = useState<boolean>(false);

  // Fetch initial roles & permissions
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        apiService.get<Role[]>(API_LIST.GET_ROLES),
        apiService.get<Permission[]>(API_LIST.GET_PERMISSIONS),
      ]);

      const rawRoles = (rolesRes as unknown as { data?: Role[] })?.data ?? (rolesRes as unknown as Role[]) ?? [];
      const safeRoles: Role[] = Array.isArray(rawRoles) ? rawRoles : [];

      const rawPerms = (permsRes as unknown as { data?: Permission[] })?.data ?? (permsRes as unknown as Permission[]) ?? [];
      const safePerms: Permission[] = Array.isArray(rawPerms) ? rawPerms : [];

      setRoles(safeRoles);
      setPermissions(safePerms);
    } catch (error: unknown) {
      console.error("Failed to load roles and permissions:", error);
      showErrorToast("Error loading roles table");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setDeleteRoleOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    const roleId = roleToDelete.roleId || (roleToDelete as unknown as { id: number }).id;
    try {
      setDeletingRole(true);
      await apiService.delete(`${API_LIST.DELETE_ROLE}/${roleId}`);
      showSuccessToast(`Role "${roleToDelete.roleName}" deleted successfully!`);
      setRoles((prev) => prev.filter((r) => (r.roleId || (r as unknown as { id: number }).id) !== roleId));
      setDeleteRoleOpen(false);
      setRoleToDelete(null);
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to delete role";
      showErrorToast(msg);
    } finally {
      setDeletingRole(false);
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        r.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roleKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.roleShortName && r.roleShortName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [roles, searchQuery]);

  const tableData: RoleTableItem[] = useMemo(() => {
    return filteredRoles.map((r) => ({
      ...r,
      id: String(r.roleId || (r as any).id),
    }));
  }, [filteredRoles]);

  const columns: ColumnDef<RoleTableItem>[] = useMemo(
    () => [
      {
        accessorKey: "roleName",
        header: "Role & Key",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                  {role.roleName}
                </span>
                <span className="ml-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  ({role.roleKey})
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "roleShortName",
        header: "Short Name",
        cell: ({ row }) => {
          const shortName = row.original.roleShortName;
          return shortName ? (
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {shortName}
            </span>
          ) : (
            <span className="text-neutral-400 dark:text-neutral-600">—</span>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const desc = row.original.description;
          return (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-xs">
              {desc || <span className="text-neutral-400 italic">No description</span>}
            </p>
          );
        },
      },
      {
        accessorKey: "permissionCount",
        header: "Permissions",
        cell: ({ row }) => {
          const count = row.original.permissionCount;
          return (
            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
              {count !== undefined ? `${count} permissions` : "Configured"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/settings/roles/${role.id}`)}
                className="h-7 w-7 p-0 text-neutral-500 hover:text-cyan-600 dark:text-neutral-400 dark:hover:text-cyan-400"
                title="Edit Role & Permissions"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => confirmDeleteRole(role)}
                className="h-7 w-7 p-0 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400"
                title="Delete Role"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router]
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 gap-3">
      {/* Page Header Bar - Fixed */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage system roles and permissions across application modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreatePermOpen(true)}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-500" />
            Create Permission
          </Button>

          <Button
            onClick={() => router.push("/settings/roles/create")}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 h-8 text-xs px-3"
          >
            <ShieldPlus className="w-3.5 h-3.5" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar - Fixed */}
      <div className="shrink-0 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter roles..."
            className="pl-8 h-8 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          className="h-8 text-xs text-neutral-500 gap-1"
          title="Refresh Roles Table"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Table Area - Flex 1 Fixed Height Container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <p className="text-xs text-neutral-500">Loading roles...</p>
          </div>
        ) : (
          <ReusableTable
            data={tableData}
            columns={columns}
            isLoadingMore={false}
            handleLoadMore={() => {}}
            onRowClick={(id) => router.push(`/settings/roles/${id}`)}
            tableHeight="100%"
          />
        )}
      </div>

      {/* Create Permission Modal */}
      <CreatePermissionDialog
        open={createPermOpen}
        onOpenChange={setCreatePermOpen}
        modules={modules}
        onPermissionCreated={(newPerm) => {
          setPermissions((prev) => [...prev, newPerm]);
        }}
      />

      {/* Delete Role Confirmation Dialog */}
      <Dialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500 text-base">
              <AlertTriangle className="w-4 h-4" />
              Delete Role
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Are you sure you want to delete role{" "}
              <strong className="text-neutral-900 dark:text-white">{roleToDelete?.roleName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deletingRole}
              onClick={handleDeleteRole}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium"
            >
              {deletingRole && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
