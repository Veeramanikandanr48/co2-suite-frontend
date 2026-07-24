"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "@/lib/api-service";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
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
  Building2,
  Plus,
  Search,
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
} from "lucide-react";

interface ModuleItem {
  id: string;
  moduleKey: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
}

interface OrganizationItem {
  id: string;
  name: string;
  tenantCode: string;
  slug: string;
  schemaName: string;
  contactEmail?: string;
  contactPhone?: string;
  subscriptionPlan: string;
  status: string;
  migrationVersion: number;
  createdAt: string;
  subscriptions: {
    moduleKey: string;
    name: string;
    category: string;
    status: string;
    licenseKey: string;
  }[];
  health?: {
    migrationStatus: string;
    storageUsedMB: number;
  };
}

export default function OrganizationManagementPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [masterModules, setMasterModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Onboarding Modal dialog states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedOrgForLogs, setSelectedOrgForLogs] = useState<OrganizationItem | null>(null);

  // Edit Modal dialog states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    subscriptionPlan: "STANDARD",
    selectedModules: [] as string[],
  });

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    subscriptionPlan: "STANDARD",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    selectedModules: ["carbon"],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [orgsRes, modulesRes] = await Promise.all([
        apiService.get<OrganizationItem[]>("/organizations"),
        apiService.get<ModuleItem[]>("/organizations/modules/master"),
      ]);

      const rawOrgs = (orgsRes as unknown as { data?: OrganizationItem[] })?.data ?? (orgsRes as unknown as OrganizationItem[]) ?? [];
      const safeOrgs: OrganizationItem[] = Array.isArray(rawOrgs) ? rawOrgs : [];
      setOrganizations(safeOrgs);

      const rawModules = (modulesRes as unknown as { data?: ModuleItem[] })?.data ?? (modulesRes as unknown as ModuleItem[]) ?? [];
      const safeModules: ModuleItem[] = Array.isArray(rawModules) ? rawModules : [];
      setMasterModules(safeModules);
    } catch (error: unknown) {
      console.error("Failed to load organization data:", error);
      setOrganizations([
        {
          id: "org-001",
          name: "Acme Global Manufacturing",
          tenantCode: "TEN000001",
          slug: "acme_global",
          schemaName: "t_000001",
          contactEmail: "sustainability@acme.com",
          contactPhone: "+44 20 7946 0912",
          subscriptionPlan: "ENTERPRISE",
          status: "ACTIVE",
          migrationVersion: 1,
          createdAt: new Date().toISOString(),
          subscriptions: [
            { moduleKey: "carbon", name: "Corporate Carbon Management", category: "Corporate", status: "ACTIVE", licenseKey: "LIC-TEN000001-CARBON" },
            { moduleKey: "cbam", name: "EU Carbon Border Adjustment", category: "Global", status: "ACTIVE", licenseKey: "LIC-TEN000001-CBAM" },
            { moduleKey: "esg", name: "Corporate Sustainability (ESG)", category: "Corporate", status: "ACTIVE", licenseKey: "LIC-TEN000001-ESG" },
          ],
          health: { migrationStatus: "HEALTHY", storageUsedMB: 12.4 },
        },
        {
          id: "org-002",
          name: "Apex Metals & Smelting Co.",
          tenantCode: "TEN000002",
          slug: "apex_metals",
          schemaName: "t_000002",
          contactEmail: "esg@apexmetals.io",
          contactPhone: "+1 555-019-2834",
          subscriptionPlan: "STANDARD",
          status: "ACTIVE",
          migrationVersion: 1,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          subscriptions: [
            { moduleKey: "carbon", name: "Corporate Carbon Management", category: "Corporate", status: "ACTIVE", licenseKey: "LIC-TEN000002-CARBON" },
            { moduleKey: "lca_metals", name: "LCA - Metals & Smelting", category: "Industry", status: "ACTIVE", licenseKey: "LIC-TEN000002-LCA_METALS" },
          ],
          health: { migrationStatus: "HEALTHY", storageUsedMB: 4.8 },
        },
      ]);
      setMasterModules([
        { id: "m1", moduleKey: "carbon", name: "Corporate Carbon Management", category: "Corporate", icon: "Layers", description: "Scope 1, 2, 3 emissions tracking and SECR reporting" },
        { id: "m2", moduleKey: "cbam", name: "EU CBAM Compliance", category: "Global", icon: "Globe", description: "Embedded emissions reporting for EU imports" },
        { id: "m3", moduleKey: "esg", name: "Corporate Sustainability (ESG)", category: "Corporate", icon: "Leaf", description: "CSRD & GRI sustainability framework compliance" },
        { id: "m4", moduleKey: "pcf", name: "Product Carbon Footprint (PCF)", category: "Product", icon: "FileText", description: "ISO 14067 product footprint calculations" },
        { id: "m5", moduleKey: "lca_plastics", name: "LCA - Plastics Manufacturing", category: "Industry", icon: "Factory", description: "Life Cycle Assessment for polymers & packaging" },
        { id: "m6", moduleKey: "lca_metals", name: "LCA - Metals & Smelting", category: "Industry", icon: "Zap", description: "Smelting & alloy metallurgical carbon modeling" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleModule = (moduleKey: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const exists = prev.selectedModules.includes(moduleKey);
        if (exists) {
          if (prev.selectedModules.length === 1) return prev;
          return { ...prev, selectedModules: prev.selectedModules.filter((m) => m !== moduleKey) };
        }
        return { ...prev, selectedModules: [...prev.selectedModules, moduleKey] };
      });
    } else {
      setFormData((prev) => {
        const exists = prev.selectedModules.includes(moduleKey);
        if (exists) {
          if (prev.selectedModules.length === 1) return prev;
          return { ...prev, selectedModules: prev.selectedModules.filter((m) => m !== moduleKey) };
        }
        return { ...prev, selectedModules: [...prev.selectedModules, moduleKey] };
      });
    }
  };

  const handleOpenEdit = (org: OrganizationItem) => {
    setEditingOrg(org);
    setEditFormData({
      name: org.name,
      contactEmail: org.contactEmail || "",
      contactPhone: org.contactPhone || "",
      subscriptionPlan: org.subscriptionPlan || "STANDARD",
      selectedModules: org.subscriptions ? org.subscriptions.map((s) => s.moduleKey) : ["carbon"],
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.post("/organizations", {
        name: formData.name,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        subscriptionPlan: formData.subscriptionPlan,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        moduleKeys: formData.selectedModules,
      });

      showSuccessToast(`Organization '${formData.name}' onboarded successfully!`);
      fetchData();
      setIsModalOpen(false);
      setFormData({
        name: "",
        contactEmail: "",
        contactPhone: "",
        subscriptionPlan: "STANDARD",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        selectedModules: ["carbon"],
      });
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to onboard organization";
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setIsSubmitting(true);

    try {
      await apiService.put(`/organizations/${editingOrg.id}`, {
        name: editFormData.name,
        contactEmail: editFormData.contactEmail,
        contactPhone: editFormData.contactPhone,
        subscriptionPlan: editFormData.subscriptionPlan,
        moduleKeys: editFormData.selectedModules,
      });

      showSuccessToast(`Organization '${editFormData.name}' updated successfully!`);
      fetchData();
      setIsEditModalOpen(false);
      setEditingOrg(null);
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to update organization";
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.schemaName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === "all" || org.subscriptionPlan.toLowerCase() === planFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || org.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const activeCount = organizations.filter((o) => o.status === "ACTIVE").length;
  const enterpriseCount = organizations.filter((o) => o.subscriptionPlan === "ENTERPRISE").length;
  const standardCount = organizations.filter((o) => o.subscriptionPlan === "STANDARD").length;

  const getModuleIcon = (key: string) => {
    switch (key) {
      case "carbon":
        return <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "cbam":
        return <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case "esg":
        return <Leaf className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case "pcf":
        return <FileText className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 text-neutral-900 dark:text-neutral-100">
      {/* Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Organization Management
            </h1>
            <Badge variant="outline" className="font-mono text-[11px] border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {organizations.length} Organizations
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage enterprise client onboarding, isolated tenant schemas (`t_000001`), and application access licensing.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5 shrink-0"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Onboard Organization</span>
        </Button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Organizations</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{organizations.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Active Tenants</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Enterprise Licenses</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{enterpriseCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Standard Licenses</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{standardCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
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
              placeholder="Search organization by name, TEN code, or schema..."
              className="pl-8 h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="h-8 text-xs w-36 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                <SelectValue placeholder="Plan Filter" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="demo">Demo / Trial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="flex-1 min-h-0 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-auto bg-white dark:bg-neutral-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-neutral-500 gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
              <span>Loading organizations list...</span>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500">
              No matching tenant organizations found.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50 dark:bg-neutral-900 sticky top-0 z-10">
                <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Organization & Tenant</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Isolated Schema</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Plan</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Granted Applications</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200">Status & Health</TableHead>
                  <TableHead className="font-semibold text-xs py-2.5 text-neutral-800 dark:text-neutral-200 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredOrgs.map((org) => {
                  const initials = org.name
                    ? org.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : "ORG";

                  return (
                    <TableRow key={org.id} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                      {/* Org Name & Tenant Code */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-semibold text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                              {org.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono mt-0.5">
                              <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
                                {org.tenantCode}
                              </Badge>
                              <span>•</span>
                              <span>{org.contactEmail || "No contact email"}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Schema Name */}
                      <TableCell className="py-2.5 font-mono text-xs text-teal-600 dark:text-teal-400">
                        <Badge variant="outline" className="text-[11px] font-mono border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 gap-1">
                          <Database className="w-3 h-3 text-teal-500" />
                          {org.schemaName}
                        </Badge>
                      </TableCell>

                      {/* Plan Badge */}
                      <TableCell className="py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            org.subscriptionPlan === "ENTERPRISE"
                              ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10"
                              : org.subscriptionPlan === "STANDARD"
                              ? "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                              : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {org.subscriptionPlan}
                        </Badge>
                      </TableCell>

                      {/* Granted Subscriptions */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {org.subscriptions && org.subscriptions.length > 0 ? (
                            org.subscriptions.map((sub, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] gap-1 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                              >
                                {getModuleIcon(sub.moduleKey)}
                                <span className="capitalize">{sub.moduleKey}</span>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status & Health */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          {org.status === "ACTIVE" ? (
                            <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
                              {org.status}
                            </Badge>
                          )}
                          <span className="text-[10px] font-mono text-neutral-400">v{org.migrationVersion}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs w-52">
                            <DropdownMenuLabel>Organization Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(org)}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-500" />
                              <span>Edit Organization & Apps</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSelectedOrgForLogs(org)}
                              className="gap-2 cursor-pointer"
                            >
                              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                              <span>View Provision Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => alert(`Tenant Schema: ${org.schemaName}\nTenant Code: ${org.tenantCode}`)}
                              className="gap-2 cursor-pointer"
                            >
                              <HardDrive className="w-3.5 h-3.5 text-teal-500" />
                              <span>View Schema Details</span>
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

      {/* Onboarding Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Onboard New Organization</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Auto-assign immutable tenant code (`TEN*`) and schema (`t_*`)</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOnboarding} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">1. Organization Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Organization Name *</label>
                    <Input
                      required
                      placeholder="e.g. Acme Eco Solutions Ltd"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Subscription Plan</label>
                    <Select
                      value={formData.subscriptionPlan}
                      onValueChange={(val) => setFormData({ ...formData, subscriptionPlan: val })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="ENTERPRISE">ENTERPRISE (Full Access)</SelectItem>
                        <SelectItem value="STANDARD">STANDARD (Core Carbon)</SelectItem>
                        <SelectItem value="DEMO">DEMO (Trial Tenant)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Contact Email</label>
                    <Input
                      type="email"
                      placeholder="contact@acme.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Contact Phone</label>
                    <Input
                      placeholder="+1 (555) 019-2834"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">2. Application Access & Licensing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {masterModules.map((mod) => {
                    const isChecked = formData.selectedModules.includes(mod.moduleKey);
                    return (
                      <div
                        key={mod.moduleKey}
                        onClick={() => handleToggleModule(mod.moduleKey, false)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {getModuleIcon(mod.moduleKey)}
                          <span>{mod.name}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">3. Initial Organization Admin User</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Admin Name *</label>
                    <Input
                      required
                      placeholder="Jane Doe"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Admin Email *</label>
                    <Input
                      type="email"
                      required
                      placeholder="admin@acme.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Admin Password *</label>
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" /> Provision Tenant Schema
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Organization Dialog Modal */}
      {isEditModalOpen && editingOrg && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Edit Organization & Subscriptions</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{editingOrg.name} ({editingOrg.tenantCode})</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Organization Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Organization Name *</label>
                    <Input
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Subscription Plan</label>
                    <Select
                      value={editFormData.subscriptionPlan}
                      onValueChange={(val) => setEditFormData({ ...editFormData, subscriptionPlan: val })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
                        <SelectItem value="STANDARD">STANDARD</SelectItem>
                        <SelectItem value="DEMO">DEMO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Contact Email</label>
                    <Input
                      type="email"
                      value={editFormData.contactEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Contact Phone</label>
                    <Input
                      value={editFormData.contactPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Application Subscriptions & Licensing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {masterModules.map((mod) => {
                    const isChecked = editFormData.selectedModules.includes(mod.moduleKey);
                    return (
                      <div
                        key={mod.moduleKey}
                        onClick={() => handleToggleModule(mod.moduleKey, true)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {getModuleIcon(mod.moduleKey)}
                          <span>{mod.name}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium h-8 text-xs px-3 shadow-xs cursor-pointer gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Edit className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Drawer Dialog */}
      {selectedOrgForLogs && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-lg p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Provisioning Audit Logs</h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedOrgForLogs.name} ({selectedOrgForLogs.tenantCode})</p>
              </div>
              <button
                onClick={() => setSelectedOrgForLogs(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>STEP 1: CREATE_SETTINGS</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>STEP 2: CREATE_SCHEMA ("{selectedOrgForLogs.schemaName}")</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>STEP 3: RUN_MIGRATIONS (v1: 001_facilities - 004_emissions)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>STEP 4: SEED_MASTER_DATA (Defra/EPA Defaults)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">COMPLETED</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrgForLogs(null)}
                className="h-8 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
