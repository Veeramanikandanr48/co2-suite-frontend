'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { useFetchList } from '@/hooks/use-fetch-list';
import SearchBar from '@/components/shared/search-bar';
import { ReusableTable } from '@/components/shared/table/reusable-table';
import {
  Building2,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from '@/components/shared/toast-variant';
import {
  OnboardOrganizationSchema,
} from '@/lib/schemas/schemas';
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
import { OrgOnboardDialog } from '@/features/organizations/components/dialogs/org-onboard-dialog';

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [onboardForm, setOnboardForm] = useState<OnboardOrganizationPayload>(INITIAL_ONBOARD_FORM);

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
          <Badge variant="outline" className="border-border bg-background-inner font-mono text-[11px] font-normal">
            {row.original.code}
          </Badge>
        ),
      },
      {
        header: 'Contact Email',
        accessorKey: 'contactEmail',
        size: 240,
        cell: ({ row }) => (
          <span className="text-header-secondary text-xs">{row.original.contactEmail}</span>
        ),
      },
      {
        header: 'Domain',
        accessorKey: 'emailDomain',
        size: 180,
        cell: ({ row }) =>
          row.original.emailDomain ? (
            <span className="text-header-secondary text-xs">{row.original.emailDomain}</span>
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
            <span className="status-badge-positive">Active</span>
          ) : (
            <span className="status-badge-negative">Inactive</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#0B132B] text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Organizations</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage onboarded tenant organizations and provision organization administrator accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button
              onClick={() => setIsOnboardOpen(true)}
              className="bg-[#0B132B] hover:bg-black text-white font-bold shadow-xs gap-2 rounded-xl text-xs px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              Onboard Organization
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar: SearchBar & Record Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-background p-3 rounded-xl border border-border shadow-2xs">
        <SearchBar
          placeholder="Search by name, code, or email..."
          onSearch={setSearch}
          className="w-full sm:w-80 border-border h-9"
        />

        <div className="flex items-center gap-2 text-xs text-header-secondary self-end sm:self-center">
          <span>Total Records:</span>
          <Badge variant="secondary" className="font-semibold bg-background-inner text-header-primary">
            {totalCount}
          </Badge>
        </div>
      </div>

      {/* Main Reusable Table */}
      <div className="bg-background rounded-xl border border-border shadow-2xs overflow-hidden">
        <ReusableTable<TableOrganization>
          data={tableData}
          columns={columns}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          handleLoadMore={loadMore}
          onRowClick={(id: string | number) => router.push(`/organizations/${id}`)}
          tableHeight="calc(100vh - 350px)"
        />
      </div>

      {/* Onboard Organization Modal Dialog */}
      <OrgOnboardDialog
        isOnboardOpen={isOnboardOpen}
        setIsOnboardOpen={setIsOnboardOpen}
        onboardForm={onboardForm}
        setOnboardForm={setOnboardForm}
        isSubmitting={isSubmitting}
        onOnboardSubmit={handleOnboardSubmit}
      />

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
