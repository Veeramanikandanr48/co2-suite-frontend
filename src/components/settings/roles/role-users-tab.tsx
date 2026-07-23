"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Role } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";

interface User {
  userId: number;
  emailId?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

interface RoleUsersTabProps {
  role: Role;
}

export const RoleUsersTab: React.FC<RoleUsersTabProps> = ({ role }) => {
  const roleId = role.roleId || (role as any).id;
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!roleId) return;
    try {
      setLoading(true);
      const [allUsersRes, roleUsersRes] = await Promise.all([
        apiService.get<User[]>(API_LIST.GET_ALL_USERS),
        apiService.get<User[]>(`${API_LIST.GET_ROLES}/${roleId}/users`),
      ]);

      const rawAllUsers = (allUsersRes as any)?.data ?? allUsersRes ?? [];
      const userList: User[] = Array.isArray(rawAllUsers) ? rawAllUsers : [];
      setAllUsers(userList);

      const rawRoleUsers = (roleUsersRes as any)?.data ?? roleUsersRes ?? [];
      const assignedList: User[] = Array.isArray(rawRoleUsers) ? rawRoleUsers : [];
      setAssignedUsers(assignedList);
    } catch (error: any) {
      console.error("Failed to load users for role:", error);
      showErrorToast("Failed to fetch assigned users");
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    try {
      setAssigning(true);
      const uId = parseInt(selectedUserId, 10);
      await apiService.post(API_LIST.ASSIGN_ROLE, {
        userId: uId,
        roleId: Number(roleId),
        isPrimary: false,
      });

      const targetUser = allUsers.find((u) => u.userId === uId);
      showSuccessToast(`Role "${role.roleName}" assigned to ${targetUser?.emailId || `User #${uId}`}`);
      setSelectedUserId("");
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to assign role to user";
      showErrorToast(msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveUser = async (userId: number, emailId?: string) => {
    try {
      await apiService.delete(`${API_LIST.GET_ROLES}/${roleId}/users/${userId}`);
      showSuccessToast(`Removed role "${role.roleName}" from ${emailId || `User #${userId}`}`);
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to unassign user";
      showErrorToast(msg);
    }
  };

  const unassignedUsers = allUsers.filter(
    (u) => !assignedUsers.some((au) => au.userId === u.userId)
  );

  const filteredAssignedUsers = assignedUsers.filter(
    (u) =>
      u.emailId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 w-full">
      {/* Assign User Control Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md flex items-center gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
              <SelectValue placeholder="Select user to assign..." />
            </SelectTrigger>
            <SelectContent>
              {unassignedUsers.length === 0 ? (
                <div className="p-2 text-xs text-neutral-500 text-center">All users assigned</div>
              ) : (
                unassignedUsers.map((u) => (
                  <SelectItem key={u.userId} value={u.userId.toString()} className="text-xs">
                    {u.emailId || u.userName || `User #${u.userId}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleAssignUser}
            disabled={assigning || !selectedUserId}
            size="sm"
            className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer shrink-0"
          >
            {assigning && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Assign User
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assigned users..."
            className="pl-8 h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center p-8 text-neutral-500 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          Loading assigned users...
        </div>
      ) : filteredAssignedUsers.length === 0 ? (
        <div className="text-center py-8 text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          No users assigned to this role.
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
          <Table>
            <TableHeader className="bg-neutral-50 dark:bg-neutral-900">
              <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
                <TableHead className="text-xs font-semibold py-2.5 text-neutral-800 dark:text-neutral-200">User Email / Name</TableHead>
                <TableHead className="text-xs font-semibold py-2.5 text-neutral-800 dark:text-neutral-200">Role Key</TableHead>
                <TableHead className="text-xs font-semibold py-2.5 text-neutral-800 dark:text-neutral-200 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredAssignedUsers.map((u) => (
                <TableRow key={u.userId} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                  <TableCell className="py-2.5 text-xs font-medium text-neutral-900 dark:text-white">
                    {u.emailId || u.userName || `User #${u.userId}`}
                    {(u.firstName || u.lastName) && (
                      <span className="text-neutral-500 font-normal ml-2">
                        ({u.firstName ?? ""} {u.lastName ?? ""})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs">
                    <Badge variant="outline" className="font-mono text-[10px] border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {role.roleKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(u.userId, u.emailId)}
                      className="h-7 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
