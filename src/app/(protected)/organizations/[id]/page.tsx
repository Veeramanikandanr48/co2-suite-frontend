"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserResetPasswordDialog, UserDeleteDialog, UserDisable2FADialog } from "@/components/users/user-dialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  ArrowLeft,
  Users,
  UserPlus,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Database,
  Layers,
  Globe,
  Leaf,
  FileText,
  Factory,
  MoreHorizontal,
  X,
  RefreshCw,
  Check,
  FileCode,
  HardDrive,
  Edit,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Activity,
  Server,
  Key,
  Search,
} from "lucide-react";
import type { UserListItem, UserListResponse } from "@/types/user-management";

interface SubscriptionItem {
  moduleKey: string;
  name: string;
  category: string;
  status: string;
  licenseKey: string;
}

interface OrganizationDetail {
  id: string;
  name: string;
  tenantCode: string;
  slug: string;
  schemaName: string;
  databaseServer?: string;
  databaseName?: string;
  region?: string;
  contactEmail?: string;
  contactPhone?: string;
  subscriptionPlan: string;
  status: string;
  migrationVersion: number;
  createdAt: string;
  updatedAt?: string;
  userCount?: number;
  users?: UserListItem[];
  subscriptions?: SubscriptionItem[];
  health?: {
    migrationStatus: string;
    storageUsedMB: number;
  };
  settings?: Record<string, any>;
  provisionLogs?: any[];
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;

  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [orgUsers, setOrgUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "subscriptions">("overview");

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [submittingUser, setSubmittingUser] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  // User Actions Modal States
  const [resetPassDialogOpen, setResetPassDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [disable2FADialogOpen, setDisable2FADialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // User Search Filter
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");

  // Fetch Organization & Users Data
  const fetchOrgDetails = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await apiService.get<any>(`/organizations/${orgId}`);
      const data = (res as unknown as { data?: OrganizationDetail })?.data ?? (res as unknown as OrganizationDetail);
      setOrg(data);

      // Fetch users for this org
      fetchOrgUsers();
    } catch (error: unknown) {
      console.error("Failed to load organization details:", error);
      showErrorToast("Failed to fetch organization details");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const fetchOrgUsers = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoadingUsers(true);
      const usersRes = await apiService.get<UserListResponse>(`/users?organizationId=${orgId}&limit=100`);
      const rawUsers = (usersRes as unknown as { data?: UserListResponse })?.data ?? (usersRes as unknown as UserListResponse);
      const userList: UserListItem[] = Array.isArray((rawUsers as unknown as { items?: UserListItem[] })?.items)
        ? (rawUsers as unknown as { items: UserListItem[] }).items
        : Array.isArray(rawUsers)
        ? (rawUsers as unknown as UserListItem[])
        : [];
      setOrgUsers(userList);
    } catch (error: unknown) {
      console.error("Failed to load organization users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrgDetails();
  }, [fetchOrgDetails]);

  // Handle Adding New Org User
  const handleAddOrgUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    try {
      setSubmittingUser(true);
      await apiService.post("/users", {
        userName: newUserData.userName.trim(),
        email: newUserData.email.trim(),
        password: newUserData.password,
        organizationId: org.id,
        isActive: true,
        isVerified: true,
      });
      showSuccessToast(`User "${newUserData.userName}" added to ${org.name}!`);
      setNewUserData({ userName: "", email: "", password: "" });
      setIsAddUserOpen(false);
      fetchOrgUsers();
      fetchOrgDetails();
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to add user";
      showErrorToast(msg);
    } finally {
      setSubmittingUser(false);
    }
  };

  // User status toggle
  const handleToggleUserStatus = async (user: UserListItem) => {
    try {
      await apiService.put(`${API_LIST.TOGGLE_USER_STATUS}/${user.userId}/toggle-status`, {});
      showSuccessToast(`User "${user.userName || user.emailId}" status updated!`);
      fetchOrgUsers();
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      showErrorToast(errObj?.response?.data?.message || "Failed to update user status");
    }
  };

  const filteredUsers = orgUsers.filter(
    (u) =>
      u.emailId?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.userName?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const getModuleIcon = (key: string) => {
    switch (key) {
      case "carbon":
        return <Leaf className="w-3.5 h-3.5 text-emerald-500" />;
      case "esg":
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case "supply_chain":
        return <Factory className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-12 text-neutral-500 gap-3">
        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
        <span className="text-xs font-medium">Loading organization details page...</span>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-12 text-neutral-500 gap-3">
        <Building2 className="w-8 h-8 text-neutral-400" />
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Organization Not Found</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/organizations")} className="h-8 text-xs gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Organizations
        </Button>
      </div>
    );
  }

  const initials = org.name
    ? org.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "ORG";

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 text-neutral-900 dark:text-neutral-100">
      {/* Top Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/organizations")}
            className="h-8 w-8 p-0 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  {org.name}
                </h1>
                <Badge variant="outline" className="font-mono text-[11px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                  {org.tenantCode}
                </Badge>
                <Badge variant="outline" className="font-mono text-[11px] border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold gap-1">
                  <Database className="w-3 h-3 text-teal-500" />
                  {org.schemaName}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${
                    org.subscriptionPlan === "ENTERPRISE"
                      ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10"
                      : "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                  }`}
                >
                  {org.subscriptionPlan}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Isolated Tenant Schema Overview, Subscription Licenses, Health Metrics, and Member Accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchOrgDetails}
            className="h-8 text-xs px-2.5 cursor-pointer gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Org User</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Isolated Schema</p>
            <p className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">{org.schemaName}</p>
          </div>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Database className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Organization Members</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{orgUsers.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Granted Apps</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              {org.subscriptions?.length || 0} Modules
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Provisioning Health</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Version v{org.migrationVersion}</span>
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "overview"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tenant Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Organization Users ({orgUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "subscriptions"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Granted Subscriptions ({org.subscriptions?.length || 0})</span>
        </button>
      </div>

      {/* Main Tab Contents */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {/* Organization Metadata Card */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Organization Core Identity
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Organization Name</p>
                  <p className="font-semibold text-neutral-900 dark:text-white mt-0.5">{org.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Immutable Tenant Code</p>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{org.tenantCode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Domain Slug</p>
                  <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">{org.slug}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">PostgreSQL Schema</p>
                  <p className="font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">{org.schemaName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Contact Email</p>
                  <p className="text-neutral-700 dark:text-neutral-300 mt-0.5">{org.contactEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Contact Phone</p>
                  <p className="text-neutral-700 dark:text-neutral-300 mt-0.5">{org.contactPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Subscription Tier</p>
                  <p className="font-semibold text-purple-600 dark:text-purple-400 mt-0.5">{org.subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Tenant Status</p>
                  <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 mt-0.5">
                    {org.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Infrastructure & Database Specs Card */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Database & Multi-Tenant Specs
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Database Server</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-0.5">{org.databaseServer || "localhost"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Database Name</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-0.5">{org.databaseName || "co2_suite_db"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Primary Region</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-0.5">{org.region || "us-east-1"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Migration Engine</p>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Version v{org.migrationVersion}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Onboarded Date</p>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">Total User Accounts</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{orgUsers.length} Users</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4 pb-4">
            {/* User Search & Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search organization users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="h-8 text-xs pl-8 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddUserOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User to {org.name}</span>
              </Button>
            </div>

            {/* Users Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center p-12 text-xs text-neutral-500 gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                  <span>Loading organization users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  No organization users found matching query. Click "Add User" to onboard members into this tenant.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-neutral-50 dark:bg-neutral-900">
                    <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
                      <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">User Identity</TableHead>
                      <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Email Address</TableHead>
                      <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Account Status</TableHead>
                      <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Verification</TableHead>
                      <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Created On</TableHead>
                      <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {filteredUsers.map((u) => (
                      <TableRow key={u.userId} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                              {(u.userName || u.emailId)[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                              {u.userName || "Unnamed User"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                          {u.emailId}
                        </TableCell>

                        <TableCell className="py-2.5">
                          {u.isActive ? (
                            <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5">
                          {u.isVerified ? (
                            <Badge variant="outline" className="text-[10px] font-semibold border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                              Pending
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5 text-xs text-neutral-500">
                          {u.createdOn ? new Date(u.createdOn).toLocaleDateString() : "N/A"}
                        </TableCell>

                        <TableCell className="py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs w-48">
                              <DropdownMenuLabel>User Options</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(u)}
                                className="gap-2 cursor-pointer"
                              >
                                {u.isActive ? <UserX className="w-3.5 h-3.5 text-rose-500" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                <span>{u.isActive ? "Deactivate Account" : "Activate Account"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setResetPassDialogOpen(true);
                                }}
                                className="gap-2 cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                <span>Reset Password</span>
                              </DropdownMenuItem>
                              {u.isTwoFactorAuthenticationEnabled && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setDisable2FADialogOpen(true);
                                  }}
                                  className="gap-2 cursor-pointer text-amber-600"
                                >
                                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Disable 2FA</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDeleteDialogOpen(true);
                                }}
                                className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete User Account</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}

        {activeTab === "subscriptions" && (
          <div className="space-y-4 pb-4">
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Application Licensing & Module Subscriptions
                </h3>
              </div>

              {org.subscriptions && org.subscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {org.subscriptions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {getModuleIcon(sub.moduleKey)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white capitalize">
                            {sub.name || sub.moduleKey}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                            License Key: {sub.licenseKey || `LIC-${org.tenantCode}-${sub.moduleKey.toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                        {sub.status || "ACTIVE"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-4 text-center">No subscriptions granted to this organization.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                  Add User to {org.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOrgUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Jane Smith"
                  value={newUserData.userName}
                  onChange={(e) => setNewUserData({ ...newUserData, userName: e.target.value })}
                  className="h-8 text-xs bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="jane@company.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="h-8 text-xs bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password *</label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="h-8 text-xs bg-white dark:bg-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddUserOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingUser}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5"
                >
                  {submittingUser ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Add User</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Reusable Action Dialogs */}
      {selectedUser && (
        <>
          <UserResetPasswordDialog
            open={resetPassDialogOpen}
            onOpenChange={setResetPassDialogOpen}
            user={selectedUser}
          />

          <UserDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            user={selectedUser}
            onUserDeleted={fetchOrgUsers}
          />

          <UserDisable2FADialog
            open={disable2FADialogOpen}
            onOpenChange={setDisable2FADialogOpen}
            user={selectedUser}
            on2FADisabled={fetchOrgUsers}
          />
        </>
      )}
    </div>
  );
}
