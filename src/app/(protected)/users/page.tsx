"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserListItem, UserListResponse } from "@/types/user-management";
import { Role } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { UserResetPasswordDialog, UserDeleteDialog, UserDisable2FADialog } from "@/components/users/user-dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  KeyRound,
  Trash2,
  Loader2,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [_allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal dialog states
  const [resetPassDialogOpen, setResetPassDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [disable2FADialogOpen, setDisable2FADialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Fetch all users & roles
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        apiService.get<UserListResponse>(`${API_LIST.GET_ALL_USERS}?limit=100&status=${statusFilter}`),
        apiService.get<Role[]>(API_LIST.GET_ROLES),
      ]);

      const rawUsers = (usersRes as unknown as { data?: UserListResponse })?.data ?? (usersRes as unknown as UserListResponse);
      const userList: UserListItem[] = Array.isArray((rawUsers as unknown as { items?: UserListItem[] })?.items)
        ? (rawUsers as unknown as { items: UserListItem[] }).items
        : Array.isArray(rawUsers)
        ? (rawUsers as unknown as UserListItem[])
        : [];
      setUsers(userList);

      const rawRoles = (rolesRes as unknown as { data?: Role[] })?.data ?? (rolesRes as unknown as Role[]) ?? [];
      const safeRoles: Role[] = Array.isArray(rawRoles) ? rawRoles : [];
      setAllRoles(safeRoles);
    } catch (error: unknown) {
      console.error("Failed to load user management data:", error);
      showErrorToast("Failed to fetch users list");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle Active Status
  const handleToggleStatus = async (user: UserListItem) => {
    try {
      await apiService.put(`${API_LIST.TOGGLE_USER_STATUS}/${user.userId}/toggle-status`, {});
      showSuccessToast(`User "${user.userName || user.emailId}" status updated!`);
      fetchData();
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to update user status";
      showErrorToast(msg);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u.emailId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;
  const verifiedCount = users.filter((u) => u.isVerified).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 text-neutral-900 dark:text-neutral-100">
      {/* Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              User Management
            </h1>
            <Badge variant="outline" className="font-mono text-[11px] border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {users.length} Users
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage system user accounts, credentials, security policies, and role assignments.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => router.push("/users/create")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5 shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New User</span>
        </Button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{users.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Active Users</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Inactive Users</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{inactiveCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <UserX className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Verified Accounts</p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{verifiedCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Table Workspace */}
      <div className="flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
        {/* Controls Strip */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email..."
              className="pl-8 h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 min-h-0 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-auto bg-white dark:bg-neutral-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-neutral-500 gap-2">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span>Loading users list...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500">
              No matching user accounts found.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50 dark:bg-neutral-900 sticky top-0 z-10">
                <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">User Details</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Assigned Roles</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Status</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Security / 2FA</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredUsers.map((u) => {
                  const initials = u.userName
                    ? u.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : u.emailId.slice(0, 2).toUpperCase();

                  return (
                    <TableRow key={u.userId} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-semibold text-xs text-neutral-700 dark:text-neutral-300 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                              {u.userName || "—"}
                            </p>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              {u.emailId}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <Badge
                                key={r.roleId}
                                variant={r.isPrimary ? "default" : "outline"}
                                className={`text-[10px] font-mono ${
                                  r.isPrimary
                                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                                }`}
                              >
                                {r.roleKey}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          {u.isActive ? (
                            <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
                              Inactive
                            </Badge>
                          )}
                          {u.isVerified ? (
                            <span title="Email Verified"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></span>
                          ) : (
                            <span title="Pending Verification"><XCircle className="w-3.5 h-3.5 text-amber-500" /></span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5">
                        {u.isTwoFactorAuthenticationEnabled ? (
                          <Badge variant="outline" className="text-[10px] font-mono border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10">
                            2FA Enabled
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-400">Standard Auth</span>
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer">
                              <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-neutral-500">Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/users/${u.userId}/edit`)} className="cursor-pointer gap-2 text-xs">
                              <Edit className="w-3.5 h-3.5 text-cyan-600" /> Edit Details
                            </DropdownMenuItem>
                            {u.isTwoFactorAuthenticationEnabled && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDisable2FADialogOpen(true);
                                }}
                                className="cursor-pointer gap-2 text-xs text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                              >
                                <ShieldOff className="w-3.5 h-3.5" /> Disable 2FA
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleToggleStatus(u)} className="cursor-pointer gap-2 text-xs">
                              {u.isActive ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                              {u.isActive ? "Deactivate User" : "Activate User"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(u);
                                setResetPassDialogOpen(true);
                              }}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(u);
                                setDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer gap-2 text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal 1: Reset Password Dialog */}
      <UserResetPasswordDialog
        user={selectedUser}
        open={resetPassDialogOpen}
        onOpenChange={setResetPassDialogOpen}
      />

      {/* Modal 2: Confirm Delete Dialog */}
      <UserDeleteDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onUserDeleted={fetchData}
      />

      {/* Modal 3: Admin Disable 2FA Dialog */}
      <UserDisable2FADialog
        user={selectedUser}
        open={disable2FADialogOpen}
        onOpenChange={setDisable2FADialogOpen}
        on2FADisabled={fetchData}
      />
    </div>
  );
}
