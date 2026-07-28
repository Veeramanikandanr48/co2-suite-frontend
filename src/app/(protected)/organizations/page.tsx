'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { useFetchList } from '@/hooks/use-fetchlist';
import SearchBar from '@/components/reusables/search-bar';
import { ReusableTable } from '@/components/reusables/reusable-table';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Mail,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  showErrorToast,
  showSuccessToast,
} from '@/components/reusables/toast-variant';
import {
  OnboardOrganizationSchema,
  EditOrganizationSchema,
} from '@/lib/schemas';
import {
  Organization,
  TableOrganization,
  OnboardOrganizationPayload,
  EditOrganizationPayload,
} from '@/types/organizations';
import {
  INITIAL_ONBOARD_FORM,
  INITIAL_EDIT_FORM,
} from '@/components/constants/organization';

export default function OrganizationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN;

  useEffect(() => {
    if (user && user.roleId !== MasterRole.SUPER_ADMIN) {
      router.replace(`/organizations/${user.organizationId || 1}`);
    }
  }, [user, router]);

  // Use custom hook for paginated fetch & search
  const {
    list,
    totalCount,
    isLoadingMore,
    hasMore,
    setSearch,
    loadMore,
    refetch,
  } = useFetchList<Organization>(API_LIST.ORGANIZATION_FILTER);

  // Map data to TableOrganization format (id as string)
  const tableData: TableOrganization[] = useMemo(() => {
    return (list || []).map((org) => ({
      ...org,
      id: String(org.id),
      rawId: org.id,
    }));
  }, [list]);

  // Modals state
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [onboardForm, setOnboardForm] = useState<OnboardOrganizationPayload>(INITIAL_ONBOARD_FORM);
  const [editForm, setEditForm] = useState<EditOrganizationPayload>(INITIAL_EDIT_FORM);

  // Handle Onboard Submission
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = OnboardOrganizationSchema.safeParse(onboardForm);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation error';
      showErrorToast(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.post(API_LIST.ORGANIZATION_ONBOARD, onboardForm);
      showSuccessToast('Organization onboarded successfully!');
      setIsOnboardOpen(false);
      setOnboardForm(INITIAL_ONBOARD_FORM);
      refetch();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || 'Onboarding failed';
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (org: Organization | TableOrganization) => {
    const rawId = 'rawId' in org ? org.rawId : Number(org.id);
    setSelectedOrg({
      ...org,
      id: rawId,
    });
    setEditForm({
      name: org.name,
      code: org.code,
      contactEmail: org.contactEmail,
      emailDomain: org.emailDomain || '',
      isActive: org.isActive,
    });
    setIsEditOpen(true);
  };

  // Handle Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    const validation = EditOrganizationSchema.safeParse(editForm);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation error';
      showErrorToast(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.put(API_LIST.ORGANIZATIONS, selectedOrg.id, editForm);
      showSuccessToast('Organization updated successfully!');
      setIsEditOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Update failed';
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (org: Organization | TableOrganization) => {
    const rawId = 'rawId' in org ? org.rawId : Number(org.id);
    setSelectedOrg({
      ...org,
      id: rawId,
    });
    setIsDeleteOpen(true);
  };

  // Handle Delete/Deactivate Submission
  const handleDeleteSubmit = async () => {
    if (!selectedOrg) return;

    try {
      setIsSubmitting(true);
      await apiService.delete(API_LIST.ORGANIZATIONS, selectedOrg.id);
      showSuccessToast('Organization deactivated successfully!');
      setIsDeleteOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Deactivation failed';
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define Table Columns using TanStack ColumnDef
  const columns: ColumnDef<TableOrganization>[] = useMemo(
    () => [
      {
        header: 'Organization',
        accessorKey: 'name',
        size: 260,
        cell: ({ row }) => (
          <div className="font-medium text-gray-900 text-xs">
            {row.original.name}
          </div>
        ),
      },
      {
        header: 'Code',
        accessorKey: 'code',
        size: 130,
        cell: ({ row }) => (
          <Badge variant="outline" className="border-gray-200 bg-gray-50 font-mono text-[11px] font-normal">
            {row.original.code}
          </Badge>
        ),
      },
      {
        header: 'Contact Email',
        accessorKey: 'contactEmail',
        size: 240,
        cell: ({ row }) => (
          <span className="text-gray-700 text-xs">{row.original.contactEmail}</span>
        ),
      },
      {
        header: 'Domain',
        accessorKey: 'emailDomain',
        size: 180,
        cell: ({ row }) =>
          row.original.emailDomain ? (
            <span className="text-gray-700 text-xs">{row.original.emailDomain}</span>
          ) : (
            <span className="text-gray-400 font-mono">-</span>
          ),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        size: 130,
        cell: ({ row }) =>
          row.original.isActive ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
              Inactive
            </span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organizations</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage onboarded tenant organizations and provision organization administrator accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button
              onClick={() => setIsOnboardOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs gap-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Onboard Organization
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar: SearchBar & Record Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
        <SearchBar
          placeholder="Search by name, code, or email..."
          onSearch={setSearch}
          className="w-full sm:w-80 border-gray-200 h-9"
        />

        <div className="flex items-center gap-2 text-xs text-gray-500 self-end sm:self-center">
          <span>Total Records:</span>
          <Badge variant="secondary" className="font-semibold bg-gray-100 text-gray-800">
            {totalCount}
          </Badge>
        </div>
      </div>

      {/* Main Reusable Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
        <ReusableTable<TableOrganization>
          data={tableData}
          columns={columns}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          handleLoadMore={loadMore}
          onRowClick={(id) => router.push(`/organizations/${id}`)}
          tableHeight="calc(100vh - 350px)"
        />
      </div>

      {/* Onboard Organization Modal Dialog */}
      <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              <DialogTitle className="text-lg font-bold">Onboard New Organization</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              Create organization records and provision initial Organization Administrator credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOnboardSubmit} className="space-y-4 py-2 text-xs">
            {/* Organization Profile Section */}
            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-3">
              <div className="font-semibold text-gray-800 flex items-center gap-1.5 border-b border-gray-200/60 pb-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Organization Profile
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Organization Name *</Label>
                  <Input
                    placeholder="Acme Corporation"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    required
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Organization Code *</Label>
                  <Input
                    placeholder="ACME"
                    value={onboardForm.code}
                    onChange={(e) => setOnboardForm({ ...onboardForm, code: e.target.value.toUpperCase() })}
                    required
                    className="h-8 text-xs uppercase bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Contact Email *</Label>
                  <Input
                    type="email"
                    placeholder="contact@acme.com"
                    value={onboardForm.contactEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, contactEmail: e.target.value })}
                    required
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Email Domain (Optional)</Label>
                  <Input
                    placeholder="acme.com"
                    value={onboardForm.emailDomain}
                    onChange={(e) => setOnboardForm({ ...onboardForm, emailDomain: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Admin Credentials Section */}
            <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
              <div className="font-semibold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200/60 pb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Initial Organization Administrator
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Admin Username *</Label>
                  <Input
                    placeholder="acme_admin"
                    value={onboardForm.adminUserName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminUserName: e.target.value })}
                    required
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Admin Email *</Label>
                  <Input
                    type="email"
                    placeholder="admin@acme.com"
                    value={onboardForm.adminEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                    required
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Admin Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={onboardForm.adminPassword}
                  onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                  required
                  className="h-8 text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">First Name</Label>
                  <Input
                    placeholder="Acme"
                    value={onboardForm.adminFirstName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminFirstName: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Last Name</Label>
                  <Input
                    placeholder="Admin"
                    value={onboardForm.adminLastName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, adminLastName: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOnboardOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Onboarding...
                  </>
                ) : (
                  'Complete Onboarding'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete / Deactivate Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">Deactivate Organization</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500 mt-2">
              Are you sure you want to deactivate <span className="font-semibold text-gray-800">{selectedOrg?.name}</span>? Users associated with this organization will be unable to access services.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSubmit}
              disabled={isSubmitting}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Deactivating...' : 'Confirm Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
