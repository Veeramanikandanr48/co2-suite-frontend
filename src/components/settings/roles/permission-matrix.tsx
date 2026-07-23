"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Role, Permission } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search,
  CheckSquare,
  Square,
  Save,
  Loader2,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface PermissionMatrixProps {
  role: Role;
  allPermissions: Permission[];
  onPermissionsUpdated?: () => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  role,
  allPermissions,
  onPermissionsUpdated,
}) => {
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const targetRoleId = role.roleId || (role as any).id;

  // Fetch current role permissions
  const fetchRolePermissions = async () => {
    if (!targetRoleId) return;
    try {
      setLoading(true);
      const res = await apiService.get<Permission[]>(`${API_LIST.GET_ROLE_PERMISSIONS}/${targetRoleId}/permissions`);
      const rawData = (res as any)?.data ?? res;
      const permList: Permission[] = Array.isArray(rawData) ? rawData : rawData?.permissions || [];
      const ids = new Set(permList.map((p) => p.permissionId || (p as any).id));
      setAssignedPermissionIds(ids);
    } catch (error: any) {
      console.error("Failed to load role permissions:", error);
      showErrorToast("Failed to fetch permissions assigned to this role");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchRolePermissions();
    }
  }, [targetRoleId]);

  // Group permissions by Module & Resource
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, Map<string, Permission[]>>();

    allPermissions.forEach((perm) => {
      const moduleName = perm.moduleName || perm.moduleKey || `Module #${perm.moduleId}`;
      const resource = perm.resource;

      if (!map.has(moduleName)) {
        map.set(moduleName, new Map());
      }
      const resourceMap = map.get(moduleName)!;

      if (!resourceMap.has(resource)) {
        resourceMap.set(resource, []);
      }
      resourceMap.get(resource)!.push(perm);
    });

    return map;
  }, [allPermissions]);

  // Filter grouped permissions by search query
  const filteredGroupedPermissions = useMemo(() => {
    if (!searchQuery.trim()) return groupedPermissions;
    const query = searchQuery.toLowerCase();
    const result = new Map<string, Map<string, Permission[]>>();

    groupedPermissions.forEach((resourceMap, moduleName) => {
      const matchedResourceMap = new Map<string, Permission[]>();

      resourceMap.forEach((perms, resource) => {
        const matchingPerms = perms.filter(
          (p) =>
            p.resource.toLowerCase().includes(query) ||
            p.action.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            moduleName.toLowerCase().includes(query)
        );

        if (matchingPerms.length > 0) {
          matchedResourceMap.set(resource, matchingPerms);
        }
      });

      if (matchedResourceMap.size > 0) {
        result.set(moduleName, matchedResourceMap);
      }
    });

    return result;
  }, [groupedPermissions, searchQuery]);

  const togglePermission = (permId: number) => {
    setAssignedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleModulePermissions = (perms: Permission[], selectAll: boolean) => {
    setAssignedPermissionIds((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => {
        const id = p.permissionId || p.id;
        if (id) {
          if (selectAll) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const ids = Array.from(assignedPermissionIds);
      await apiService.put(`${API_LIST.ASSIGN_PERMISSIONS_TO_ROLE}/${targetRoleId}`, {
        permissionIds: ids,
      });

      showSuccessToast(`Updated ${ids.length} permissions for role "${role.roleName}"`);
      if (onPermissionsUpdated) onPermissionsUpdated();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to update role permissions";
      showErrorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "read":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "update":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "delete":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-neutral-400">Loading role permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 shadow-xs backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{role.roleName}</h3>
            <Badge className="bg-neutral-200 dark:bg-neutral-700 text-emerald-800 dark:text-emerald-300 font-mono text-xs">
              {role.roleKey}
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {assignedPermissionIds.size} of {allPermissions.length} permissions assigned
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search permissions..."
              className="pl-9 h-9 text-xs bg-neutral-100 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-emerald-500"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRolePermissions}
            className="h-9 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Refresh permissions"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 shadow-lg shadow-emerald-900/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Matrix
          </Button>
        </div>
      </div>

      {/* Permission Modules Accordions */}
      {filteredGroupedPermissions.size === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/40">
          <Layers className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">No permissions matching search</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Try clearing your search query filter</p>
        </div>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={Array.from(filteredGroupedPermissions.keys())}
          className="space-y-4"
        >
          {Array.from(filteredGroupedPermissions.entries()).map(([moduleName, resourceMap]) => {
            const allModulePerms = Array.from(resourceMap.values()).flat();
            const assignedModuleCount = allModulePerms.filter((p) =>
              assignedPermissionIds.has(p.permissionId || (p as any).id)
            ).length;
            const isAllSelected =
              allModulePerms.length > 0 && assignedModuleCount === allModulePerms.length;

            return (
              <AccordionItem
                key={moduleName}
                value={moduleName}
                className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900/70 overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900/90">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-3 text-left">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-neutral-900 dark:text-white text-base">{moduleName}</span>
                      <Badge className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 text-xs">
                        {assignedModuleCount} / {allModulePerms.length} Active
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <div className="flex items-center gap-2 mr-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModulePermissions(allModulePerms, !isAllSelected);
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 h-8 gap-1.5"
                    >
                      {isAllSelected ? (
                        <>
                          <Square className="w-3.5 h-3.5" /> Clear Module
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" /> Select Module
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <AccordionContent className="p-4 pt-4 space-y-4">
                  {Array.from(resourceMap.entries()).map(([resource, perms]) => (
                    <div
                      key={resource}
                      className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                          Resource: {resource}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
                        {perms.map((perm) => {
                          const pId = perm.permissionId || (perm as any).id;
                          const isChecked = assignedPermissionIds.has(pId);
                          return (
                            <label
                              key={pId}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/60 text-neutral-900 dark:text-white font-medium"
                                  : "bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => togglePermission(pId)}
                                className="mt-0.5 border-neutral-400 dark:border-neutral-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-[10px] px-1.5 py-0 uppercase tracking-wider ${getActionColor(perm.action)}`}>
                                    {perm.action}
                                  </Badge>
                                  {perm.scope && (
                                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500">
                                      scope: {perm.scope}
                                    </span>
                                  )}
                                </div>
                                {perm.description && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate" title={perm.description}>
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
