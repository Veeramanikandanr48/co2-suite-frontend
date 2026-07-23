"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Role } from "@/types/roles-permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, ChevronDown } from "lucide-react";

interface UserRoleFormValues {
  roleId: string;
  additionalRoleIds?: (string | number)[];
  [key: string]: unknown;
}

interface UserRoleSelectorProps<T extends UserRoleFormValues> {
  form: UseFormReturn<T>;
  allRoles: Role[];
  loadingRoles: boolean;
}

export function UserRoleSelector<T extends UserRoleFormValues>({
  form,
  allRoles,
  loadingRoles,
}: UserRoleSelectorProps<T>) {
  const selectedPrimaryId = form.watch("roleId" as never) as unknown as string;
  const additionalRoleIds = (form.watch("additionalRoleIds" as never) || []) as unknown as (string | number)[];

  const secondaryRolesOptions = allRoles.filter(
    (r) => r.roleId.toString() !== selectedPrimaryId
  );

  const stringRoleIds = (additionalRoleIds || []).map((id) => String(id));

  const selectedSecondaryRoles = allRoles.filter((r) =>
    stringRoleIds.includes(r.roleId.toString())
  );

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800">
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
          Role & Access Assignment
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Role Selector */}
        <FormField
          control={form.control}
          name={"roleId" as never}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Primary System Role *
              </FormLabel>
              <FormControl>
                <Select
                  disabled={loadingRoles}
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    const currentSecondary = (form.getValues("additionalRoleIds" as never) || []) as unknown as (string | number)[];
                    if (currentSecondary.map(String).includes(val)) {
                      form.setValue(
                        "additionalRoleIds" as never,
                        currentSecondary.filter((id) => String(id) !== val) as never
                      );
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                    <SelectValue placeholder="Select primary role..." />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {allRoles.map((r) => (
                      <SelectItem key={r.roleId} value={r.roleId.toString()}>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="font-semibold">{r.roleName}</span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            ({r.roleKey})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-rose-500 text-[11px]" />
            </FormItem>
          )}
        />

        {/* Secondary Roles Multi-Select Dropdown */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
            Additional Secondary Roles
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loadingRoles}
                className="w-full h-9 justify-between text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 px-3 font-normal"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {selectedSecondaryRoles.length === 0 ? (
                    <span className="text-neutral-400">Select additional roles...</span>
                  ) : (
                    <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
                      {selectedSecondaryRoles.map((r) => (
                        <Badge
                          key={r.roleId}
                          variant="secondary"
                          className="text-[10px] font-mono px-1.5 py-0 h-5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                        >
                          {r.roleName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 text-xs">
              <DropdownMenuLabel className="text-[11px] font-semibold text-neutral-500">
                Secondary Roles
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {secondaryRolesOptions.length === 0 ? (
                <div className="p-2 text-[11px] text-neutral-400 text-center">
                  No secondary roles available
                </div>
              ) : (
                secondaryRolesOptions.map((r) => {
                  const roleIdStr = r.roleId.toString();
                  const isChecked = stringRoleIds.includes(roleIdStr);

                  return (
                    <DropdownMenuCheckboxItem
                      key={r.roleId}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...additionalRoleIds, roleIdStr]
                          : additionalRoleIds.filter((id) => String(id) !== roleIdStr);
                        form.setValue("additionalRoleIds" as never, next as never);
                      }}
                      className="cursor-pointer text-xs"
                    >
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {r.roleName}
                      </span>
                      <span className="ml-1.5 text-[10px] font-mono text-neutral-400">
                        ({r.roleKey})
                      </span>
                    </DropdownMenuCheckboxItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
