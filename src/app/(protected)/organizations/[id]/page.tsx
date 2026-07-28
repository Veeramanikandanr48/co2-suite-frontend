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
import { ServiceCard } from '@/components/services/service-card';
import { INITIAL_EDIT_FORM } from '@/components/constants/organization';
import { useFetchList } from '@/hooks/use-fetchlist';
import { ReusableTable } from '@/components/reusables/reusable-table';
import SearchBar from '@/components/reusables/search-bar';
import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import {
  ArrowLeft,
  Building2,
  Save,
  Trash2,
  Loader2,
  Mail,
  Globe,
  Edit2,
  X,
  Users,
  AlertTriangle,
  UserPlus,
  Shield,
  User,
  Phone,
  MapPin,
  FileText,
  Clock,
  Hash,
  CalendarDays,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  ExternalLink,
  MoreHorizontal,
  Activity,
  BarChart3,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  showErrorToast,
  showSuccessToast,
} from '@/components/reusables/toast-variant';

interface OrgUser {
  id: number;
  userName: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  roleId: number;
  isActive: boolean;
  createdOn?: string;
}

interface TableOrgUser extends Omit<OrgUser, 'id'> {
  id: string;
  rawId: number;
}

const AddMemberSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().optional(),
  userName: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.number().min(2, 'Please select a valid role'),
});

const INITIAL_ADD_MEMBER_FORM = {
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

function getMonogramColors(name: string): { bg: string; text: string; ring: string } {
  const palettes = [
    { bg: 'bg-[#1454CC]', text: 'text-white', ring: 'ring-[#1454CC]/20' },
    { bg: 'bg-[#059669]', text: 'text-white', ring: 'ring-[#059669]/20' },
    { bg: 'bg-[#7C3AED]', text: 'text-white', ring: 'ring-[#7C3AED]/20' },
    { bg: 'bg-[#0284C7]', text: 'text-white', ring: 'ring-[#0284C7]/20' },
    { bg: 'bg-[#D97706]', text: 'text-white', ring: 'ring-[#D97706]/20' },
    { bg: 'bg-[#DC2626]', text: 'text-white', ring: 'ring-[#DC2626]/20' },
    { bg: 'bg-[#0891B2]', text: 'text-white', ring: 'ring-[#0891B2]/20' },
    { bg: 'bg-[#4F46E5]', text: 'text-white', ring: 'ring-[#4F46E5]/20' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
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

function formatDateFull(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoField({
  label,
  value,
  mono = false,
  icon,
}: {
  label: string;
  value?: string | null | number;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  const display =
    value === null || value === undefined || value === '' ? '—' : String(value);
  const isEmpty = display === '—';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className="opacity-50 shrink-0">{icon}</span>}
        {label}
      </span>
      <span
        className={`text-sm ${
          isEmpty ? 'text-[#ACB6BF] italic' : 'text-neutral-700 font-medium'
        } ${mono ? 'font-mono tracking-tight' : ''}`}
      >
        {display}
      </span>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sublabel,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  trend?: { direction: 'up' | 'down'; label: string };
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative bg-white rounded-xl border border-[#E6E8EB] px-5 py-4 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-[#F0F2F5] text-neutral-500 group-hover:bg-[#1454CC]/10 group-hover:text-[#1454CC] transition-colors">
            {icon}
          </div>
          {trend && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              trend.direction === 'up'
                ? 'bg-[#EDFCF3] text-[#18B169]'
                : 'bg-[#FFDED8] text-[#CC4529]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${trend.direction === 'up' ? 'bg-[#18B169]' : 'bg-[#CC4529]'}`} />
              {trend.label}
            </span>
          )}
        </div>
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-lg font-bold text-neutral-800 truncate">{value}</p>
        {sublabel && (
          <p className="text-[11px] text-neutral-400 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E6E8EB] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E6E8EB] bg-[#F8F9FA]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white border border-[#E6E8EB] text-neutral-500">
            {icon}
          </div>
          <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{title}</h4>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
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
  const [addMemberForm,    setAddMemberForm]    = useState(INITIAL_ADD_MEMBER_FORM);

  // Services tab state
  const [allServices,       setAllServices]       = useState<Service[]>([]);
  const [orgServices,       setOrgServices]       = useState<OrganizationService[]>([]);
  const [servicesLoading,   setServicesLoading]   = useState(false);
  const [assigningServiceId, setAssigningServiceId] = useState<number | null>(null);
  const [removingServiceId,  setRemovingServiceId]  = useState<number | null>(null);

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
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#1454CC]/10 border border-[#1454CC]/20 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#1454CC]/40" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow border border-[#E6E8EB]">
            <Loader2 className="w-4 h-4 text-[#1454CC] animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-neutral-700">Loading Organization</p>
          <p className="text-sm text-neutral-400 mt-1">Please wait while we fetch the details…</p>
        </div>
      </div>
    );
  }

  if (!orgDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
          <Building2 className="w-10 h-10 text-neutral-300" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-neutral-700">Organization not found</p>
          <p className="text-sm text-neutral-400 mt-1.5 max-w-sm">
            This organization doesn&apos;t exist or may have been removed from the system.
          </p>
        </div>
        <Button
          onClick={() => router.push(isSuperAdmin ? '/organizations' : '/dashboard')}
          variant="outline"
          className="gap-2 h-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const monogram       = getOrgMonogram(orgDetails.name);
  const monogramColors = getMonogramColors(orgDetails.name);

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA]">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <Tabs
          defaultValue="overview"
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="shrink-0 bg-white border-b border-[#E6E8EB]">
            <div className="px-6 pt-4 pb-0">
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
                  <button
                    onClick={() => router.push('/organizations')}
                    className="hover:text-[#1454CC] transition-colors font-semibold flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Organizations
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-neutral-600 font-semibold truncate max-w-[240px]">
                    {orgDetails.name}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-5 min-w-0">
                  {isSuperAdmin && (
                    <Button
                      onClick={() => router.push('/organizations')}
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 text-neutral-400 hover:text-neutral-700 rounded-xl shrink-0 hidden sm:flex border-[#E6E8EB]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl ${monogramColors.bg} ${monogramColors.text} flex items-center justify-center text-lg font-bold shadow-lg ring-4 ${monogramColors.ring} shrink-0 select-none`}
                  >
                    {monogram}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-neutral-700 tracking-tight leading-none">
                        {orgDetails.name}
                      </h1>
                      {orgDetails.isActive ? (
                        <Badge variant="active">Active</Badge>
                      ) : (
                        <Badge variant="inactive">Inactive</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-neutral-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-neutral-300" />
                        <span className="font-mono font-semibold text-neutral-500">{orgDetails.code}</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <span>
                        ID <span className="font-mono font-semibold text-neutral-500">#{orgDetails.id}</span>
                      </span>
                      {orgDetails.industry && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="text-neutral-500 font-medium">{orgDetails.industry}</span>
                        </>
                      )}
                      {orgDetails.timezone && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-300" />
                            {orgDetails.timezone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-9 text-sm gap-1.5 px-4 border-[#E6E8EB]"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="h-9 text-sm bg-[#1454CC] hover:bg-[#1454CC]/90 text-white font-semibold gap-1.5 px-4 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      {isSuperAdmin && orgDetails.isActive && (
                        <Button
                          onClick={() => setIsDeleteOpen(true)}
                          variant="outline"
                          className="h-9 text-sm border-[#FFDED8] text-[#CC4529] hover:bg-[#FFDED8] hover:border-[#CC4529]/30 gap-1.5 px-4"
                        >
                          <Trash2 className="w-4 h-4" />
                          Deactivate
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="h-9 text-sm bg-[#1454CC] hover:bg-[#1454CC]/90 text-white font-semibold gap-1.5 px-4 shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Organization
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pb-5">
                {canEdit && (
                  <KpiCard
                    icon={<Users className="w-4 h-4" />}
                    label="Total Members"
                    value={String(userTotalCount)}
                    sublabel="Active accounts"
                  />
                )}
                <KpiCard
                  icon={<Mail className="w-4 h-4" />}
                  label="Contact Email"
                  value={orgDetails.contactEmail || '—'}
                  sublabel="Primary contact"
                />
                <KpiCard
                  icon={<Globe className="w-4 h-4" />}
                  label="Email Domain"
                  value={orgDetails.emailDomain || '—'}
                  sublabel="Corporate domain"
                />
                <KpiCard
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Onboarded"
                  value={formatDate(orgDetails.createdOn)}
                  sublabel={orgDetails.createdOn ? `Since ${new Date(orgDetails.createdOn).getFullYear()}` : ''}
                />
              </div>

              <TabsList className="bg-transparent border-0 p-0 h-auto gap-0 rounded-none">
                <TabsTrigger
                  value="overview"
                  className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-none text-neutral-400 bg-transparent border-0 shadow-none hover:text-[#1454CC] data-[state=active]:text-[#1454CC] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t-full after:bg-[#1454CC] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  Overview & Profile
                </TabsTrigger>
                {canEdit && (
                  <TabsTrigger
                    value="members"
                    className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-none text-neutral-400 bg-transparent border-0 shadow-none hover:text-[#1454CC] data-[state=active]:text-[#1454CC] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t-full after:bg-[#1454CC] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Members
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#F0F2F5] text-neutral-500 text-[11px] font-bold">
                      {userTotalCount}
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="services"
                  onClick={() => { if (orgServices.length === 0 && allServices.length === 0) fetchOrgServices(); }}
                  className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-none text-neutral-400 bg-transparent border-0 shadow-none hover:text-[#1454CC] data-[state=active]:text-[#1454CC] data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t-full after:bg-[#1454CC] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Services
                  {subscribedServiceIds.size > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#1454CC]/10 text-[#1454CC] text-[11px] font-bold">
                      {subscribedServiceIds.size}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent
            value="overview"
            className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar"
          >
            <div className="p-6 max-w-6xl">
              {!isEditing ? (
                <div className="space-y-5">
                  <SectionCard
                    icon={<Building2 className="w-4 h-4" />}
                    title="General Profile"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-7">
                      <InfoField
                        label="Organization Name"
                        value={orgDetails.name}
                        icon={<Building2 className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="Organization Code"
                        value={orgDetails.code}
                        mono
                        icon={<Hash className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="Contact Email"
                        value={orgDetails.contactEmail}
                        icon={<Mail className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="Email Domain"
                        value={orgDetails.emailDomain}
                        mono
                        icon={<Globe className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="Contact Phone"
                        value={orgDetails.phone}
                        icon={<Phone className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="Official Website"
                        value={orgDetails.website}
                        icon={<Globe className="w-3.5 h-3.5" />}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<MapPin className="w-4 h-4" />}
                    title="Headquarters & Location"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-7">
                      <div className="col-span-2">
                        <InfoField
                          label="Street Address"
                          value={orgDetails.address}
                          icon={<MapPin className="w-3.5 h-3.5" />}
                        />
                      </div>
                      <InfoField label="City" value={orgDetails.city} icon={<MapPin className="w-3.5 h-3.5" />} />
                      <InfoField label="State / Province" value={orgDetails.state} />
                      <InfoField label="Country" value={orgDetails.country} />
                      <InfoField label="Postal / ZIP Code" value={orgDetails.postalCode} mono />
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<FileText className="w-4 h-4" />}
                    title="Compliance & System"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-7">
                      <InfoField
                        label="Tax / VAT ID"
                        value={orgDetails.taxId}
                        mono
                        icon={<FileText className="w-3.5 h-3.5" />}
                      />
                      <InfoField label="Primary Industry" value={orgDetails.industry} />
                      <InfoField
                        label="Timezone"
                        value={orgDetails.timezone || 'UTC'}
                        icon={<Clock className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="System ID"
                        value={`#${orgDetails.id}`}
                        mono
                        icon={<Hash className="w-3.5 h-3.5" />}
                      />
                      <InfoField
                        label="Onboarded On"
                        value={formatDateFull(orgDetails.createdOn)}
                        icon={<CalendarDays className="w-3.5 h-3.5" />}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 opacity-50" />
                          Account Status
                        </span>
                        {orgDetails.isActive ? (
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#18B169] mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#CC4529] mt-0.5">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </SectionCard>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  <SectionCard
                    icon={<Building2 className="w-4 h-4" />}
                    title="General Profile"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Organization Name *
                        </Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Organization Code *
                        </Label>
                        <Input
                          value={editForm.code}
                          onChange={(e) =>
                            setEditForm({ ...editForm, code: e.target.value.toUpperCase() })
                          }
                          required
                          className="h-10 text-sm font-mono uppercase border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="ACME"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Contact Email *
                        </Label>
                        <Input
                          type="email"
                          value={editForm.contactEmail}
                          onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                          required
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="contact@acme.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Email Domain
                        </Label>
                        <Input
                          value={editForm.emailDomain || ''}
                          onChange={(e) => setEditForm({ ...editForm, emailDomain: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="acme.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Contact Phone
                        </Label>
                        <Input
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Official Website
                        </Label>
                        <Input
                          value={editForm.website || ''}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="https://acme.com"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<MapPin className="w-4 h-4" />}
                    title="Address & Location"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Street Address
                        </Label>
                        <Input
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="123 Main Street, Suite 400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          City
                        </Label>
                        <Input
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="San Francisco"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          State / Province
                        </Label>
                        <Input
                          value={editForm.state || ''}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="California"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Country
                        </Label>
                        <Input
                          value={editForm.country || ''}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="United States"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Postal Code
                        </Label>
                        <Input
                          value={editForm.postalCode || ''}
                          onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                          className="h-10 text-sm font-mono border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="94105"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={<FileText className="w-4 h-4" />}
                    title="Compliance & System"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Tax / VAT ID
                        </Label>
                        <Input
                          value={editForm.taxId || ''}
                          onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                          className="h-10 text-sm font-mono border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="US-123456789"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Industry
                        </Label>
                        <Input
                          value={editForm.industry || ''}
                          onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="Technology"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Timezone
                        </Label>
                        <Input
                          value={editForm.timezone || ''}
                          onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                          className="h-10 text-sm border-[#D9E5F2] focus-visible:ring-[#1454CC]/20"
                          placeholder="UTC"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mt-6 pt-6 border-t border-[#E6E8EB]">
                      <Checkbox
                        id="isActive"
                        checked={editForm.isActive}
                        onCheckedChange={(checked) =>
                          setEditForm({ ...editForm, isActive: Boolean(checked) })
                        }
                        className="mt-0.5 data-[state=checked]:bg-[#1454CC] data-[state=checked]:border-[#1454CC]"
                      />
                      <div>
                        <Label
                          htmlFor="isActive"
                          className="text-sm font-semibold text-neutral-700 cursor-pointer"
                        >
                          Organization Active
                        </Label>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Uncheck to suspend the organization and revoke all user access
                        </p>
                      </div>
                    </div>
                  </SectionCard>

                  <div className="flex items-center justify-end gap-3 py-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-10 text-sm gap-1.5 px-5 border-[#E6E8EB]"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 text-sm bg-[#1454CC] hover:bg-[#1454CC]/90 text-white font-semibold gap-1.5 px-5 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </TabsContent>

          {canEdit && (
          <TabsContent
            value="members"
            className="flex-1 min-h-0 flex flex-col outline-none"
          >
            <div className="flex-1 flex flex-col min-h-0 p-6 pt-5">
              <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-[#E6E8EB] shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-[#E6E8EB] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#1454CC]/10 text-[#1454CC] shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-700">Organization Members</h3>
                      <p className="text-xs text-neutral-400">
                        {userTotalCount} {userTotalCount === 1 ? 'user' : 'users'} in this workspace
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SearchBar
                      placeholder="Search by name or email…"
                      onSearch={setUserSearch}
                      className="w-full sm:w-64 h-9 text-sm border-[#D9E5F2]"
                    />
                    {canEdit && (
                      <Button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="h-9 text-sm bg-[#1454CC] hover:bg-[#1454CC]/90 text-white font-semibold gap-1.5 px-4 shrink-0 shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <ReusableTable<TableOrgUser>
                    data={userTableData}
                    columns={userColumns}
                    isLoadingMore={userIsLoadingMore}
                    hasMore={userHasMore}
                    handleLoadMore={userLoadMore}
                    tableHeight="100%"
                    rowHeight="h-14"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          )}

          {/* ─── Services Tab ──────────────────────────────────────────── */}
          <TabsContent
            value="services"
            className="flex-1 min-h-0 overflow-y-auto outline-none scrollBar"
          >
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-700">CageSuite Services</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isSuperAdmin
                      ? 'Assign or remove modules for this organization'
                      : 'Modules subscribed to this organization'}
                  </p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={fetchOrgServices}
                    disabled={servicesLoading}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 px-3 py-2 rounded-lg border border-[#E6E8EB] bg-white hover:shadow-sm transition-all disabled:opacity-50"
                  >
                    {servicesLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LayoutGrid className="w-3.5 h-3.5" />
                    )}
                    Refresh
                  </button>
                )}
              </div>

              {/* Loading */}
              {servicesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-[#1454CC] animate-spin" />
                </div>
              ) : isSuperAdmin ? (
                /* Super Admin: show all master services with assign/remove */
                allServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
                      <LayoutGrid className="w-7 h-7 text-neutral-300" />
                    </div>
                    <p className="text-sm text-neutral-500 font-medium">No services available</p>
                    <p className="text-xs text-neutral-400">Services will appear after the backend seeds them.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {allServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isSubscribed={subscribedServiceIds.has(service.id)}
                        showControls
                        isAssigning={assigningServiceId === service.id}
                        isRemoving={removingServiceId === service.id}
                        onAssign={handleAssignService}
                        onRemove={handleRemoveService}
                      />
                    ))}
                  </div>
                )
              ) : (
                /* Org Admin / User: read-only subscribed services */
                orgServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
                      <LayoutGrid className="w-7 h-7 text-neutral-300" />
                    </div>
                    <p className="text-sm text-neutral-500 font-medium">No services subscribed</p>
                    <p className="text-xs text-neutral-400">Contact your Super Admin to enable modules.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {orgServices.map((os) => (
                      <ServiceCard
                        key={os.id}
                        service={os.service}
                        isSubscribed
                        showControls={false}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#E6E8EB]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1454CC]/10 text-[#1454CC] shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-neutral-700">
                  Add Member
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-400 mt-0.5">
                  Provision a new user account for{' '}
                  <span className="font-semibold text-neutral-600">{orgDetails.name}</span>.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddMemberSubmit} className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  First Name *
                </Label>
                <Input
                  placeholder="John"
                  value={addMemberForm.firstName}
                  onChange={(e) =>
                    setAddMemberForm({ ...addMemberForm, firstName: e.target.value })
                  }
                  required
                  className="h-10 text-sm border-[#D9E5F2]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Last Name
                </Label>
                <Input
                  placeholder="Doe"
                  value={addMemberForm.lastName}
                  onChange={(e) =>
                    setAddMemberForm({ ...addMemberForm, lastName: e.target.value })
                  }
                  className="h-10 text-sm border-[#D9E5F2]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Username *
              </Label>
              <Input
                placeholder="johndoe"
                value={addMemberForm.userName}
                onChange={(e) =>
                  setAddMemberForm({ ...addMemberForm, userName: e.target.value })
                }
                required
                className="h-10 text-sm font-mono border-[#D9E5F2]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Email Address *
              </Label>
              <Input
                type="email"
                placeholder="john@acme.com"
                value={addMemberForm.email}
                onChange={(e) =>
                  setAddMemberForm({ ...addMemberForm, email: e.target.value })
                }
                required
                className="h-10 text-sm border-[#D9E5F2]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Password *
              </Label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                value={addMemberForm.password}
                onChange={(e) =>
                  setAddMemberForm({ ...addMemberForm, password: e.target.value })
                }
                required
                className="h-10 text-sm border-[#D9E5F2]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Assigned Role *
              </Label>
              <Select
                value={String(addMemberForm.roleId)}
                onValueChange={(val) =>
                  setAddMemberForm({ ...addMemberForm, roleId: Number(val) })
                }
              >
                <SelectTrigger className="h-10 text-sm border-[#D9E5F2]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(MasterRole.ADMIN)}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Organization Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={String(MasterRole.USER)}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      <span className="font-medium">Member User</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2 border-t border-[#E6E8EB] -mx-6 px-6 pb-6 mb-0">
              <div className="flex items-center justify-end gap-3 w-full pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="h-10 text-sm border-[#E6E8EB]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingMember}
                  className="h-10 text-sm bg-[#1454CC] hover:bg-[#1454CC]/90 text-white font-semibold gap-1.5"
                >
                  {isAddingMember ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#E6E8EB]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FFDED8] text-[#CC4529] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-neutral-700">
                  Deactivate Organization
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-400 mt-0.5">
                  This action will suspend all user access immediately.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="p-4 bg-[#FFDED8]/30 rounded-xl border border-[#FFDED8]">
              <p className="text-sm text-[#A83821] leading-relaxed">
                You are about to deactivate{' '}
                <span className="font-bold">{orgDetails.name}</span>. All{' '}
                <span className="font-bold">{userTotalCount}</span> users associated with this
                organization will immediately lose access to the platform.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6E8EB] bg-[#F8F9FA]">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="h-10 text-sm border-[#E6E8EB]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeactivate}
              disabled={isSubmitting}
              className="h-10 text-sm bg-[#CC4529] hover:bg-[#CC4529]/90 text-white font-semibold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deactivating…
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Confirm Deactivate
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
