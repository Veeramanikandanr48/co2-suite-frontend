"use client";

import React, { useState, useMemo } from "react";
import { Permission } from "@/types/roles-permissions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Shield } from "lucide-react";

interface PermissionMatrixSelectorProps {
  allPermissions: Permission[];
  selectedPermissionIds: Set<number>;
  onSelectionChange: (updatedIds: Set<number>) => void;
  loading?: boolean;
}

/** Helper to format raw module keys into readable names */
function formatModuleName(key?: string): string {
  if (!key) return "";
  return key
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const PermissionMatrixSelector: React.FC<PermissionMatrixSelectorProps> = ({
  allPermissions,
  selectedPermissionIds,
  onSelectionChange,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all distinct permission actions
  const uniqueActions = useMemo(() => {
    const actionsSet = new Set<string>();
    const preferredOrder = ["read", "create", "update", "delete", "download", "approve", "manage"];

    allPermissions.forEach((p) => {
      if (p.action) {
        actionsSet.add(p.action.toLowerCase().trim());
      }
    });

    const actionList = Array.from(actionsSet);
    actionList.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return actionList;
  }, [allPermissions]);

  // Group permissions by Module Name
  const groupedModules = useMemo(() => {
    const map = new Map<string, Permission[]>();

    allPermissions.forEach((perm) => {
      const rawModuleName =
        perm.module?.moduleName ||
        perm.moduleName ||
        (perm.module?.moduleKey ? formatModuleName(perm.module.moduleKey) : undefined) ||
        (perm.moduleKey ? formatModuleName(perm.moduleKey) : undefined);

      const moduleName = rawModuleName || `Module #${perm.moduleId}`;

      if (!map.has(moduleName)) {
        map.set(moduleName, []);
      }
      map.get(moduleName)!.push(perm);
    });

    return map;
  }, [allPermissions]);

  // Filter modules by search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return groupedModules;
    const query = searchQuery.toLowerCase();
    const result = new Map<string, Permission[]>();

    groupedModules.forEach((perms, moduleName) => {
      const matchingPerms = perms.filter(
        (p) =>
          p.resource.toLowerCase().includes(query) ||
          p.action.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          moduleName.toLowerCase().includes(query)
      );

      if (matchingPerms.length > 0) {
        result.set(moduleName, matchingPerms);
      }
    });

    return result;
  }, [groupedModules, searchQuery]);

  const togglePermission = (permId: number) => {
    const next = new Set(selectedPermissionIds);
    if (next.has(permId)) {
      next.delete(permId);
    } else {
      next.add(permId);
    }
    onSelectionChange(next);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading permissions matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Module Permissions Matrix</h3>
          <span className="text-xs text-neutral-500 font-mono">
            {selectedPermissionIds.size} / {allPermissions.length} granted
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module or action..."
            className="pl-8 h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          />
        </div>
      </div>

      {/* Matrix Table */}
      {filteredModules.size === 0 ? (
        <div className="text-center py-8 text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          No matching modules or permissions found.
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto bg-white dark:bg-neutral-900">
          <Table>
            <TableHeader className="bg-neutral-50 dark:bg-neutral-900">
              <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
                <TableHead className="font-bold text-xs py-2.5 text-neutral-800 dark:text-neutral-200 w-1/4">Module Name</TableHead>
                {uniqueActions.map((action) => (
                  <TableHead key={action} className="text-center uppercase text-[11px] font-bold py-2.5 tracking-wider text-neutral-800 dark:text-neutral-200">
                    {action}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {Array.from(filteredModules.entries()).map(([moduleName, perms]) => {
                const assignedCount = perms.filter((p) =>
                  selectedPermissionIds.has(p.permissionId || p.id!)
                ).length;

                return (
                  <TableRow key={moduleName} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    {/* Module Header */}
                    <TableCell className="font-semibold text-xs py-3 text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{moduleName}</span>
                        <span className="text-[11px] text-neutral-500 font-mono font-normal">
                          ({assignedCount}/{perms.length})
                        </span>
                      </div>
                    </TableCell>

                    {/* Action Cells */}
                    {uniqueActions.map((action) => {
                      const actionPerms = perms.filter(
                        (p) => p.action.toLowerCase().trim() === action
                      );

                      if (actionPerms.length === 0) {
                        return (
                          <TableCell key={action} className="text-center text-neutral-300 dark:text-neutral-700 text-xs py-2">
                            —
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={action} className="text-center py-2 align-middle">
                          <div className="flex flex-col items-center justify-center gap-2">
                            {actionPerms.map((p) => {
                              const pId = p.permissionId || p.id!;
                              const isChecked = selectedPermissionIds.has(pId);
                              return (
                                <div
                                  key={pId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePermission(pId);
                                  }}
                                  className="flex flex-col items-center justify-center cursor-pointer select-none p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                  title={p.description || `${p.action} ${p.resource} ${p.scope ? `(scope: ${p.scope})` : ""}`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(pId)}
                                    className="border-neutral-300 dark:border-neutral-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                  />
                                  {p.scope && p.scope !== "any" && (
                                    <Badge variant="outline" className="text-[8px] px-1 py-0 uppercase font-mono text-amber-600 dark:text-amber-400 border-amber-500/30 mt-0.5 leading-tight">
                                      {p.scope}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
