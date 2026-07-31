'use client';

import { useState, useCallback, useMemo } from 'react';
import { apiService } from '@/lib/api/api-service';
import { FacilityItem } from '@/features/organizations/components/tabs/org-facilities-tab';
import { FacilityFormState } from '@/features/organizations/components/dialogs/org-dialogs';
import { showErrorToast, showSuccessToast } from '@/components/shared/toast-variant';

export function useOrgFacilities(orgId: string) {
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
      // ignore
    } finally {
      setFacilitiesLoading(false);
    }
  }, [orgId]);

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
      await apiService.post(`facilities/${deletingFacility.id}/deactivate`);
      showSuccessToast(`Facility "${deletingFacility.name}" deleted successfully`);
      setDeletingFacility(null);
      fetchOrgFacilities();
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message || 'Failed to delete facility');
    } finally {
      setIsSavingFacility(false);
    }
  };

  return {
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
  };
}
