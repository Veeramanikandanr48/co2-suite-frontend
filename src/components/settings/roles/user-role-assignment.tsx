"use client";

import React, { useState, useEffect } from "react";
import { Role } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserPlus, Trash2, Search, Loader2, ShieldCheck, Mail } from "lucide-react";

interface User {
  userId: number;
  emailId?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

interface UserRoleAssignmentProps {
  roles: Role[];
}

export const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({ roles }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userRolesMap, setUserRolesMap] = useState<Record<number, Role[]>>({});

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      const res = await apiService.get<User[]>(API_LIST.GET_ALL_USERS);
      const userList = (res as any)?.data ?? res ?? [];
      const safeUsers: User[] = Array.isArray(userList) ? userList : [];
      setUsers(safeUsers);

      // Fetch user roles for each user
      const rolesMap: Record<number, Role[]> = {};
      for (const u of safeUsers) {
        try {
          const userRolesRes = await apiService.get<Role[]>(`${API_LIST.GET_USER_ROLES}/${u.userId}/roles`);
          const userRoles = (userRolesRes as any)?.data ?? userRolesRes;
          rolesMap[u.userId] = Array.isArray(userRoles) ? userRoles : [];
        } catch {
          rolesMap[u.userId] = [];
        }
      }
      setUserRolesMap(rolesMap);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      showErrorToast("Failed to fetch organizational users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      showErrorToast("Please select both a user and a role");
      return;
    }

    try {
      setAssigning(true);
      const uId = parseInt(selectedUserId, 10);
      const rId = parseInt(selectedRoleId, 10);

      await apiService.post(API_LIST.ASSIGN_ROLE, {
        userId: uId,
        roleId: rId,
        isPrimary: false,
      });

      const assignedRole = roles.find((r) => r.roleId === rId);
      const targetUser = users.find((u) => u.userId === uId);

      showSuccessToast(
        `Assigned "${assignedRole?.roleName || "Role"}" to ${targetUser?.emailId || `User #${uId}`}`
      );

      // Refresh list
      fetchUsersAndRoles();
      setSelectedUserId("");
      setSelectedRoleId("");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to assign role";
      showErrorToast(msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (userId: number, roleId: number, roleName: string) => {
    try {
      await apiService.delete(`${API_LIST.GET_ROLES}/${roleId}/users/${userId}`);
      showSuccessToast(`Removed role "${roleName}" from user`);
      fetchUsersAndRoles();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to remove role from user";
      showErrorToast(msg);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.emailId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Assignment Card Header */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Assign Role to User</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-1 block">Select User</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                {users.map((u) => (
                  <SelectItem key={u.userId} value={u.userId.toString()}>
                    {u.emailId || u.userName || `User #${u.userId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-1 block">Select Role</label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
                {roles.map((r) => {
                  const rId = r.roleId || (r as any).id;
                  return (
                    <SelectItem key={rId} value={rId.toString()}>
                      {r.roleName} ({r.roleKey})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAssignRole}
            disabled={assigning || !selectedUserId || !selectedRoleId}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 h-10 shadow-lg shadow-emerald-950/20"
          >
            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Assign Role
          </Button>
        </div>
      </div>

      {/* Users & Roles List */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            User Role Bindings ({users.length} Users)
          </h4>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user email or name..."
              className="pl-9 h-9 text-xs bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-cyan-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8 text-neutral-500 dark:text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
            Loading user role assignments...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">No users found matching query</div>
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-100 dark:bg-neutral-800/80">
                <TableRow className="border-neutral-200 dark:border-neutral-700 hover:bg-transparent">
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">User</TableHead>
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">Assigned Roles</TableHead>
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const assignedRoles = userRolesMap[user.userId] || [];
                  return (
                    <TableRow key={user.userId} className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <TableCell className="font-medium text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <div>
                            <div>{user.emailId || user.userName || `User #${user.userId}`}</div>
                            {(user.firstName || user.lastName) && (
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                {user.firstName} {user.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {assignedRoles.length === 0 ? (
                            <span className="text-xs text-neutral-400 italic">No roles assigned</span>
                          ) : (
                            assignedRoles.map((r) => {
                              const rId = r.roleId || (r as any).id;
                              return (
                                <Badge
                                  key={rId}
                                  className="bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 py-1 px-2"
                                >
                                  {r.roleName}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRole(user.userId, rId, r.roleName)}
                                    className="text-neutral-400 hover:text-rose-500 transition-colors ml-1"
                                    title="Unassign role"
                                  >
                                    &times;
                                  </button>
                                </Badge>
                              );
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {assignedRoles.map((r) => {
                          const rId = r.roleId || (r as any).id;
                          return (
                            <Button
                              key={rId}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRole(user.userId, rId, r.roleName)}
                              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-8 text-xs gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove {r.roleShortName || r.roleKey}
                            </Button>
                          );
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
