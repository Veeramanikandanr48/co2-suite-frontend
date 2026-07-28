'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { EditOrganizationSchema } from '@/lib/schemas';
import {
  Organization,
  EditOrganizationPayload,
} from '@/types/organizations';
import { Service, OrganizationService, AssignServicesPayload } from '@/types/services';
import { INITIAL_EDIT_FORM } from '@/components/constants/organization';
import { useFetchList } from '@/hooks/use-fetchlist';
import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import {
  Building2,
  Loader2,
  Mail,
  Users,
  Shield,
  User,
  CalendarDays,
  LayoutGrid,
  MapPin,
  ArrowLeft,
  FileText,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  showErrorToast,
  showSuccessToast,
} from '@/components/reusables/toast-variant';

// Modularized Organization Components
import { OrgHeader } from '@/components/organizations/org-header';
import { OrgOverviewTab } from '@/components/organizations/org-overview-tab';
import { OrgMembersTab, OrgUser, TableOrgUser } from '@/components/organizations/org-members-tab';
import { OrgServicesTab } from '@/components/organizations/org-services-tab';
import { OrgFacilitiesTab, FacilityItem } from '@/components/organizations/org-facilities-tab';
import { OrgDialogs, AddMemberFormState, FacilityFormState } from '@/components/organizations/org-dialogs';

const AddMemberSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().optional(),
  userName: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.number().min(2, 'Please select a valid role'),
});

const INITIAL_ADD_MEMBER_FORM: AddMemberFormState = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
  roleId: MasterRole.USER,
};

function getOrgMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColors(name: string): { bg: string; text: string } {
  const palettes = [
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Badge({ variant, children }: { variant: 'active' | 'inactive'; children: React.ReactNode }) {
  const styles = {
    active: 'bg-[#EDFCF3] text-[#18B169] border-[#D3F8E0]',
    inactive: 'bg-[#FFDED8] text-[#CC4529] border-[#FFDED8]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant === 'active' ? 'bg-[#18B169]' : 'bg-[#CC4529]'}`} />
      {children}
    </span>
  );
}

function RoleBadge({ roleId }: { roleId: number }) {
  if (roleId === MasterRole.SUPER_ADMIN)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
        <Shield className="w-3 h-3" />
        Super Admin
      </span>
    );
  if (roleId === MasterRole.ADMIN)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Shield className="w-3 h-3" />
        Org Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F0F2F5] text-neutral-500 border border-[#E6E8EB]">
      <User className="w-3 h-3" />
      Member
    </span>
  );
}

export default function OrganizationDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN;
  const isAdmin      = user?.roleId === MasterRole.ADMIN;
  const canEdit      = isSuperAdmin || isAdmin;

  const [loading,          setLoading]          = useState(true);
  const [isEditing,        setIsEditing]        = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [isDeleteOpen,     setIsDeleteOpen]     = useState(false);
  const [isAddMemberOpen,  setIsAddMemberOpen]  = useState(false);
  const [isAddingMember,   setIsAddingMember]   = useState(false);
  const [orgDetails,       setOrgDetails]       = useState<Organization | null>(null);
  const [editForm,         setEditForm]         = useState<EditOrganizationPayload>(INITIAL_EDIT_FORM);
  const [addMemberForm,    setAddMemberForm]    = useState<AddMemberFormState>(INITIAL_ADD_MEMBER_FORM);

  // Services tab state
  const [allServices,       setAllServices]       = useState<Service[]>([]);
  const [orgServices,       setOrgServices]       = useState<OrganizationService[]>([]);
  const [servicesLoading,   setServicesLoading]   = useState(false);
  const [assigningServiceId, setAssigningServiceId] = useState<number | null>(null);
  const [removingServiceId,  setRemovingServiceId]  = useState<number | null>(null);

  // Facilities tab state
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityItem | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<FacilityItem | null>(null);
  const [isSavingFacility, setIsSavingFacility] = useState(false);

  const [facilityForm, setFacilityForm] = useState<FacilityFormState>({
    name: '',
    address: '',
    countryCode: 'UK',
    postCode: '',
    unLocode: '',
    latitude: '',
    longitude: '',
  });

  const fetchOrgFacilities = useCallback(async () => {
    if (!orgId) return;
    try {
      setFacilitiesLoading(true);
      const res = await apiService.get<any[]>('facilities', { orgId });
      const data = (res as unknown as { data?: any[] })?.data ?? (res as unknown as any[]);
      setFacilities(Array.isArray(data) ? data : []);
    } catch {
      // silently ignore
    } finally {
      setFacilitiesLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrgFacilities();
  }, [fetchOrgFacilities]);

  const filteredFacilities = useMemo(() => {
    if (!facilitySearch.trim()) return facilities;
    const q = facilitySearch.toLowerCase().trim();
    return facilities.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.unLocode || '').toLowerCase().includes(q) ||
        (f.address || '').toLowerCase().includes(q) ||
        (f.postCode || '').toLowerCase().includes(q),
    );
  }, [facilities, facilitySearch]);

  const handleOpenAddFacility = () => {
    setEditingFacility(null);
    setFacilityForm({
      name: '',
      address: '',
      countryCode: 'UK',
      postCode: '',
      unLocode: '',
      latitude: '',
      longitude: '',
    });
    setIsAddFacilityOpen(true);
  };

  const handleOpenEditFacility = (fac: FacilityItem) => {
    setEditingFacility(fac);
    setFacilityForm({
      name: fac.name || '',
      address: fac.address || '',
      countryCode: fac.countryCode || 'UK',
      postCode: fac.postCode || '',
      unLocode: fac.unLocode || '',
      latitude: fac.latitude !== undefined ? String(fac.latitude) : '',
      longitude: fac.longitude !== undefined ? String(fac.longitude) : '',
    });
    setIsAddFacilityOpen(true);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name.trim()) {
      showErrorToast('Facility site name is required');
      return;
    }
    try {
      setIsSavingFacility(true);
      const payload = {
        organizationId: Number(orgId),
        name: facilityForm.name.trim(),
        address: facilityForm.address.trim() || undefined,
        countryCode: facilityForm.countryCode.trim() || undefined,
        postCode: facilityForm.postCode.trim() || undefined,
        unLocode: facilityForm.unLocode.trim() || undefined,
        latitude: facilityForm.latitude ? Number(facilityForm.latitude) : undefined,
        longitude: facilityForm.longitude ? Number(facilityForm.longitude) : undefined,
      };

      if (editingFacility) {
        await apiService.put('facilities', editingFacility.id, payload);
        showSuccessToast(`Facility "${facilityForm.name}" updated successfully`);
      } else {
        await apiService.post('facilities', payload);
        showSuccessToast(`Facility "${facilityForm.name}" created successfully`);
      }

      setIsAddFacilityOpen(false);
      fetchOrgFacilities();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Failed to save facility');
    } finally {
      setIsSavingFacility(false);
    }
  };

  const handleDeleteFacilityConfirm = async () => {
    if (!deletingFacility) return;
    try {
      setIsSavingFacility(true);
      await apiService.delete('facilities', deletingFacility.id);
      showSuccessToast(`Facility "${deletingFacility.name}" deleted successfully`);
      setDeletingFacility(null);
      fetchOrgFacilities();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Failed to delete facility');
    } finally {
      setIsSavingFacility(false);
    }
  };

  const subscribedServiceIds = useMemo(
    () => new Set(orgServices.map((os) => os.serviceId)),
    [orgServices],
  );

  const fetchOrgServices = useCallback(async () => {
    if (!orgId) return;
    try {
      setServicesLoading(true);
      if (isSuperAdmin) {
        const [allRes, orgRes] = await Promise.all([
          apiService.get<Service[]>('services'),
          apiService.get<OrganizationService[]>(`organizations/${orgId}/services`),
        ]);
        const allData = (allRes as unknown as { data?: Service[] })?.data ?? (allRes as unknown as Service[]);
        const orgData = (orgRes as unknown as { data?: OrganizationService[] })?.data ?? (orgRes as unknown as OrganizationService[]);
        setAllServices(Array.isArray(allData) ? allData : []);
        setOrgServices(Array.isArray(orgData) ? orgData : []);
      } else {
        const orgRes = await apiService.get<OrganizationService[]>(`organizations/${orgId}/services`);
        const orgData = (orgRes as unknown as { data?: OrganizationService[] })?.data ?? (orgRes as unknown as OrganizationService[]);
        setOrgServices(Array.isArray(orgData) ? orgData : []);
      }
    } catch {
      // silently ignore — services tab is non-critical
    } finally {
      setServicesLoading(false);
    }
  }, [orgId, isSuperAdmin]);

  const handleAssignService = useCallback(async (service: Service) => {
    setAssigningServiceId(service.id);
    try {
      const payload: AssignServicesPayload = { serviceIds: [service.id] };
      await apiService.post(`organizations/${orgId}/services`, payload);
      showSuccessToast(`"${service.name}" assigned successfully`);
      fetchOrgServices();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message ?? 'Failed to assign service');
    } finally {
      setAssigningServiceId(null);
    }
  }, [orgId, fetchOrgServices]);

  const handleRemoveService = useCallback(async (service: Service) => {
    setRemovingServiceId(service.id);
    try {
      await apiService.delete(`organizations/${orgId}/services/${service.id}`);
      showSuccessToast(`"${service.name}" removed successfully`);
      fetchOrgServices();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message ?? 'Failed to remove service');
    } finally {
      setRemovingServiceId(null);
    }
  }, [orgId, fetchOrgServices]);

  const usersFilterEndpoint = useMemo(
    () => (canEdit ? `organizations/${orgId}/users/filter` : ''),
    [canEdit, orgId],
  );

  const {
    list: userList,
    totalCount: userTotalCount,
    isLoadingMore: userIsLoadingMore,
    hasMore: userHasMore,
    setSearch: setUserSearch,
    loadMore: userLoadMore,
    refetch: userRefetch,
  } = useFetchList<OrgUser>(usersFilterEndpoint);

  useEffect(() => {
    if (user && !isSuperAdmin && user.organizationId && String(user.organizationId) !== orgId) {
      showErrorToast('You can only access your assigned organization.');
      router.replace(`/organizations/${user.organizationId}`);
    }
  }, [user, isSuperAdmin, orgId, router]);

  const populateEditForm = useCallback((orgData: Organization) => {
    setEditForm({
      name:         orgData.name          || '',
      code:         orgData.code          || '',
      contactEmail: orgData.contactEmail  || '',
      emailDomain:  orgData.emailDomain   || '',
      phone:        orgData.phone         || '',
      website:      orgData.website       || '',
      address:      orgData.address       || '',
      city:         orgData.city          || '',
      state:        orgData.state         || '',
      country:      orgData.country       || '',
      postalCode:   orgData.postalCode    || '',
      taxId:        orgData.taxId         || '',
      industry:     orgData.industry      || '',
      timezone:     orgData.timezone      || 'UTC',
      isActive:     orgData.isActive      ?? true,
    });
  }, []);

  const fetchOrganizationDetails = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const response = await apiService.get<Organization>(`${API_LIST.ORGANIZATIONS}/${orgId}`);
      const orgData =
        (response as unknown as { data?: Organization })?.data ||
        (response as unknown as Organization);
      if (orgData) {
        setOrgDetails(orgData);
        populateEditForm(orgData);
      }
    } catch (err: unknown) {
      showErrorToast(
        (err as { message?: string })?.message || 'Failed to load organization details',
      );
    } finally {
      setLoading(false);
    }
  }, [orgId, populateEditForm]);

  useEffect(() => {
    fetchOrganizationDetails();
  }, [fetchOrganizationDetails]);

  const handleCancelEdit = () => {
    if (orgDetails) populateEditForm(orgDetails);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = EditOrganizationSchema.safeParse(editForm);
    if (!validation.success) {
      showErrorToast(validation.error.issues[0]?.message || 'Validation error');
      return;
    }
    try {
      setIsSubmitting(true);
      await apiService.put(API_LIST.ORGANIZATIONS, orgId, editForm);
      showSuccessToast('Organization updated successfully!');
      setIsEditing(false);
      fetchOrganizationDetails();
    } catch (err: unknown) {
      showErrorToast(
        (err as { message?: string })?.message || 'Failed to update organization',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = AddMemberSchema.safeParse(addMemberForm);
    if (!validation.success) {
      showErrorToast(validation.error.issues[0]?.message || 'Validation error');
      return;
    }
    try {
      setIsAddingMember(true);
      await apiService.post(`organizations/${orgId}/users`, addMemberForm);
      showSuccessToast('Member added to organization successfully!');
      setIsAddMemberOpen(false);
      setAddMemberForm(INITIAL_ADD_MEMBER_FORM);
      userRefetch();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setIsSubmitting(true);
      await apiService.delete(API_LIST.ORGANIZATIONS, orgId);
      showSuccessToast('Organization deactivated successfully!');
      setIsDeleteOpen(false);
      router.push('/organizations');
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Deactivation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userTableData: TableOrgUser[] = useMemo(
    () => userList.map((u) => ({ ...u, id: String(u.id), rawId: u.id })),
    [userList],
  );

  const userColumns: ColumnDef<TableOrgUser>[] = useMemo(
    () => [
      {
        header: 'Member',
        accessorKey: 'firstName',
        size: 260,
        cell: ({ row }) => {
          const fullName = `${row.original.firstName} ${row.original.lastName || ''}`.trim();
          const colors   = getAvatarColors(fullName);
          const initials = getOrgMonogram(fullName);
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center text-xs font-bold shrink-0 select-none`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-700 truncate">{fullName}</p>
                <p className="text-[11px] text-neutral-400 font-mono truncate">
                  @{row.original.userName}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 240,
        cell: ({ row }) => (
          <span className="text-sm text-neutral-500 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            <span className="truncate">{row.original.email}</span>
          </span>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'roleId',
        size: 160,
        cell: ({ row }) => <RoleBadge roleId={row.original.roleId} />,
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        size: 110,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="active">Active</Badge>
          ) : (
            <Badge variant="inactive">Inactive</Badge>
          ),
      },
      {
        header: 'Joined',
        accessorKey: 'createdOn',
        size: 150,
        cell: ({ row }) => (
          <span className="text-sm text-neutral-400 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            {formatDate(row.original.createdOn)}
          </span>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-5 bg-[#F8F9FA]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#1454CC]/10 border border-[#1454CC]/20 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#1454CC]/40" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-xs border border-[#E6E8EB]">
            <Loader2 className="w-4 h-4 text-[#1454CC] animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-neutral-700">Loading Organization</p>
          <p className="text-xs text-neutral-400 mt-1">Please wait while we fetch the details…</p>
        </div>
      </div>
    );
  }

  if (!orgDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6 bg-[#F8F9FA]">
        <div className="w-20 h-20 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
          <Building2 className="w-10 h-10 text-neutral-300" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-neutral-800">Organization not found</p>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm">
            This organization doesn&apos;t exist or may have been removed from the system.
          </p>
        </div>
        <Button
          onClick={() => router.push(isSuperAdmin ? '/organizations' : '/dashboard')}
          variant="outline"
          className="gap-2 h-10 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA]">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">

          {/* Hero Header & KPI summary */}
          <OrgHeader
            orgDetails={orgDetails}
            userTotalCount={userTotalCount}
            isSuperAdmin={isSuperAdmin}
            canEdit={canEdit}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onEditToggle={() => setIsEditing(true)}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            onDeactivateOpen={() => setIsDeleteOpen(true)}
            onBack={() => router.push('/organizations')}
          />

          {/* Tab Selection Navigation Bar */}
          <div className="shrink-0 bg-white border-b border-[#E2E8F0] px-8">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-1 rounded-none">
              <TabsTrigger
                value="overview"
                className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Overview
              </TabsTrigger>
              {canEdit && (
                <TabsTrigger
                  value="members"
                  className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Members
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#4355F5] text-[11px] font-bold">
                    {userTotalCount}
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="services"
                onClick={() => { if (orgServices.length === 0 && allServices.length === 0) fetchOrgServices(); }}
                className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Services
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#4355F5] text-[11px] font-bold">
                  {subscribedServiceIds.size}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="facilities"
                onClick={fetchOrgFacilities}
                className="relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-none text-[#64748B] bg-transparent border-0 shadow-none hover:text-[#4355F5] data-[state=active]:text-[#4355F5] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#4355F5] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                Facility Sites
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#4355F5] text-[11px] font-bold">
                  {facilities.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ─── Overview Tab Content ─────────────────────────────────── */}
          <TabsContent
            value="overview"
            className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar"
          >
            <OrgOverviewTab
              orgDetails={orgDetails}
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleSave}
              onCancelEdit={handleCancelEdit}
            />
          </TabsContent>

          {/* ─── Members Tab Content ──────────────────────────────────── */}
          {canEdit && (
            <TabsContent
              value="members"
              className="flex-1 min-h-0 flex flex-col outline-none"
            >
              <OrgMembersTab
                userTableData={userTableData}
                userColumns={userColumns}
                userTotalCount={userTotalCount}
                userIsLoadingMore={userIsLoadingMore}
                userHasMore={userHasMore}
                setUserSearch={setUserSearch}
                userLoadMore={userLoadMore}
                canEdit={canEdit}
                onAddMemberOpen={() => setIsAddMemberOpen(true)}
              />
            </TabsContent>
          )}

          {/* ─── Services Tab Content ─────────────────────────────────── */}
          <TabsContent
            value="services"
            className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar"
          >
            <OrgServicesTab
              allServices={allServices}
              orgServices={orgServices}
              subscribedServiceIds={subscribedServiceIds}
              servicesLoading={servicesLoading}
              isSuperAdmin={isSuperAdmin}
              assigningServiceId={assigningServiceId}
              removingServiceId={removingServiceId}
              onRefresh={fetchOrgServices}
              onAssignService={handleAssignService}
              onRemoveService={handleRemoveService}
            />
          </TabsContent>

          {/* ─── Facility Sites Tab Content ───────────────────────────── */}
          <TabsContent
            value="facilities"
            className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar"
          >
            <OrgFacilitiesTab
              facilities={facilities}
              filteredFacilities={filteredFacilities}
              facilitiesLoading={facilitiesLoading}
              facilitySearch={facilitySearch}
              setFacilitySearch={setFacilitySearch}
              canEdit={canEdit}
              orgName={orgDetails.name}
              onOpenAddFacility={handleOpenAddFacility}
              onOpenEditFacility={handleOpenEditFacility}
              onDeleteFacilityConfirmOpen={(fac) => setDeletingFacility(fac)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Organization & Facility Dialog Modals */}
      <OrgDialogs
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        isSubmitting={isSubmitting}
        onDeactivate={handleDeactivate}
        orgName={orgDetails.name}

        isAddMemberOpen={isAddMemberOpen}
        setIsAddMemberOpen={setIsAddMemberOpen}
        isAddingMember={isAddingMember}
        addMemberForm={addMemberForm}
        setAddMemberForm={setAddMemberForm}
        onAddMemberSubmit={handleAddMemberSubmit}

        isAddFacilityOpen={isAddFacilityOpen}
        setIsAddFacilityOpen={setIsAddFacilityOpen}
        editingFacility={editingFacility}
        facilityForm={facilityForm}
        setFacilityForm={setFacilityForm}
        isSavingFacility={isSavingFacility}
        onSaveFacility={handleSaveFacility}

        deletingFacility={deletingFacility}
        setDeletingFacility={setDeletingFacility}
        onDeleteFacilityConfirm={handleDeleteFacilityConfirm}
      />
    </div>
  );
}
