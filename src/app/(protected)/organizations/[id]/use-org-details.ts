'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { Organization, EditOrganizationPayload } from '@/types/organizations';
import { Service, OrganizationService, AssignServicesPayload } from '@/types/services';
import { INITIAL_EDIT_FORM } from '@/components/constants/organization';
import { AddMemberFormState } from '@/features/organizations/components/dialogs/org-dialogs';
import { INITIAL_ADD_MEMBER_FORM, AddMemberSchema } from './org-detail-utils';
import { EditOrganizationSchema } from '@/lib/schemas/schemas';
import { showErrorToast, showSuccessToast } from '@/components/shared/toast-variant';
import { useOrgFacilities } from './use-org-facilities';

export function useOrgDetails(orgId: string, isSuperAdmin: boolean) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [orgDetails, setOrgDetails] = useState<Organization | null>(null);
  const [editForm, setEditForm] = useState<EditOrganizationPayload>(INITIAL_EDIT_FORM);
  const [addMemberForm, setAddMemberForm] = useState<AddMemberFormState>(INITIAL_ADD_MEMBER_FORM);

  // Services state
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [orgServices, setOrgServices] = useState<OrganizationService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [assigningServiceId, setAssigningServiceId] = useState<number | null>(null);
  const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);

  // Facilities state from hook
  const {
    facilities,
    filteredFacilities,
    facilitiesLoading,
    facilitySearch,
    setFacilitySearch,
    isAddFacilityOpen,
    setIsAddFacilityOpen,
    editingFacility,
    deletingFacility,
    setDeletingFacility,
    isSavingFacility,
    facilityForm,
    setFacilityForm,
    fetchOrgFacilities,
    handleOpenAddFacility,
    handleOpenEditFacility,
    handleSaveFacility,
    handleDeleteFacilityConfirm,
  } = useOrgFacilities(orgId);

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
      // ignore
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
      await apiService.post(`organizations/${orgId}/services/${service.id}/deactivate`);
      showSuccessToast(`"${service.name}" removed successfully`);
      fetchOrgServices();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message ?? 'Failed to remove service');
    } finally {
      setRemovingServiceId(null);
    }
  }, [orgId, fetchOrgServices]);

  const populateEditForm = useCallback((orgData: Organization) => {
    setEditForm({
      name: orgData.name || '',
      code: orgData.code || '',
      contactEmail: orgData.contactEmail || '',
      emailDomain: orgData.emailDomain || '',
      phone: orgData.phone || '',
      website: orgData.website || '',
      address: orgData.address || '',
      city: orgData.city || '',
      state: orgData.state || '',
      country: orgData.country || '',
      postalCode: orgData.postalCode || '',
      taxId: orgData.taxId || '',
      industry: orgData.industry || '',
      timezone: orgData.timezone || 'UTC',
      isActive: orgData.isActive ?? true,
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
      showErrorToast((err as { message?: string })?.message || 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  }, [orgId, populateEditForm]);

  useEffect(() => {
    fetchOrganizationDetails();
    fetchOrgFacilities();
  }, [fetchOrganizationDetails, fetchOrgFacilities]);

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
      showErrorToast((err as { message?: string })?.message || 'Failed to update organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent, userRefetch: () => void) => {
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
      await apiService.post(`${API_LIST.ORGANIZATIONS}/${orgId}/deactivate`);
      showSuccessToast('Organization deactivated successfully!');
      setIsDeleteOpen(false);
      router.push('/organizations');
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Deactivation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    loading,
    orgDetails,
    isEditing,
    setIsEditing,
    isSubmitting,
    isDeleteOpen,
    setIsDeleteOpen,
    isAddMemberOpen,
    setIsAddMemberOpen,
    isAddingMember,
    editForm,
    setEditForm,
    addMemberForm,
    setAddMemberForm,
    allServices,
    orgServices,
    subscribedServiceIds,
    servicesLoading,
    assigningServiceId,
    removingServiceId,
    fetchOrgServices,
    handleAssignService,
    handleRemoveService,
    facilities,
    filteredFacilities,
    facilitiesLoading,
    facilitySearch,
    setFacilitySearch,
    isAddFacilityOpen,
    setIsAddFacilityOpen,
    editingFacility,
    deletingFacility,
    setDeletingFacility,
    isSavingFacility,
    facilityForm,
    setFacilityForm,
    fetchOrgFacilities,
    handleOpenAddFacility,
    handleOpenEditFacility,
    handleSaveFacility,
    handleDeleteFacilityConfirm,
    handleCancelEdit,
    handleSave,
    handleAddMemberSubmit,
    handleDeactivate,
  };
}
