'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { useFetchList } from '@/hooks/use-fetch-list';
import SearchBar from '@/components/shared/search-bar';
import { ReusableTable } from '@/components/shared/table/reusable-table';
import { PageHeader } from '@/components/shared';
import { Building2, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { showErrorToast, showSuccessToast } from '@/components/shared/toast-variant';
import { OnboardOrganizationSchema } from '@/lib/schemas/schemas';
import { Organization, TableOrganization, OnboardOrganizationPayload } from '@/types/organizations';
import { INITIAL_ONBOARD_FORM } from '@/components/constants/organization';
import { OrgOnboardDialog } from '@/features/organizations/components/dialogs/org-onboard-dialog';

export default function OrganizationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN;

  const {
    list, totalCount, isLoadingMore, hasMore, setSearch, loadMore, refetch,
  } = useFetchList<Organization>(API_LIST.ORGANIZATION_FILTER);

  const tableData: TableOrganization[] = useMemo(() =>
    (list || []).map((org) => ({ ...org, id: String(org.id), rawId: org.id })),
  [list]);

  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardForm, setOnboardForm] = useState<OnboardOrganizationPayload>(INITIAL_ONBOARD_FORM);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = OnboardOrganizationSchema.safeParse(onboardForm);
    if (!validation.success) {
      showErrorToast(validation.error.issues[0]?.message || 'Validation error');
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

  const handleDeleteSubmit = async () => {
    if (!selectedOrg) return;
    try {
      setIsSubmitting(true);
      await apiService.post(`${API_LIST.ORGANIZATIONS}/${selectedOrg.id}/deactivate`);
      showSuccessToast('Organization deactivated successfully!');
      setIsDeleteOpen(false);
      refetch();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Deactivation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<TableOrganization>[] = useMemo(() => [
    {
      header: 'Organization',
      accessorKey: 'name',
      size: 260,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      header: 'Code',
      accessorKey: 'code',
      size: 130,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs font-normal">{row.original.code}</Badge>
      ),
    },
    {
      header: 'Contact',
      accessorKey: 'contactEmail',
      size: 240,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.contactEmail}</span>
      ),
    },
    {
      header: 'Domain',
      accessorKey: 'emailDomain',
      size: 180,
      cell: ({ row }) => (
        row.original.emailDomain
          ? <span className="text-sm text-muted-foreground">{row.original.emailDomain}</span>
          : <span className="text-sm text-muted-foreground/50">—</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      size: 130,
      cell: ({ row }) => (
        row.original.isActive
          ? <span className="status-badge-positive">Active</span>
          : <span className="status-badge-negative">Inactive</span>
      ),
    },
  ], []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="page-container"
    >
      <PageHeader
        icon={Building2}
        title="Organizations"
        description="Manage onboarded tenant organizations and provision organization administrator accounts."
        action={isSuperAdmin ? (
          <Button onClick={() => setIsOnboardOpen(true)}>
            <Plus className="w-4 h-4" />
            Onboard Organization
          </Button>
        ) : undefined}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 shadow-xs mb-4">
        <SearchBar placeholder="Search by name, code, or email..." onSearch={setSearch} className="w-full sm:w-80" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <span>Total:</span>
          <Badge variant="secondary" className="font-semibold">{totalCount}</Badge>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
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

      <OrgOnboardDialog
        isOnboardOpen={isOnboardOpen}
        setIsOnboardOpen={setIsOnboardOpen}
        onboardForm={onboardForm}
        setOnboardForm={setOnboardForm}
        isSubmitting={isSubmitting}
        onOnboardSubmit={handleOnboardSubmit}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle>Deactivate Organization</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to deactivate <span className="font-semibold text-foreground">{selectedOrg?.name}</span>? Users will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Deactivating...' : 'Confirm Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
