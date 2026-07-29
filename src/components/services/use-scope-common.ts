'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { showSuccessToast, showErrorToast } from '@/components/reusables/toast-variant';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';

export function useScopeCommon(category: string, setAdditionalFilter: (f: any) => void) {
  const { user } = useAuth();
  const canEdit = !user || user.roleId === MasterRole.SUPER_ADMIN || user.roleId === MasterRole.ADMIN;

  const [dbFacilities, setDbFacilities] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFacilityHeader, setSelectedFacilityHeader] = useState('All Facilities');
  const [filterFacility, setFilterFacility] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchFacilities = useCallback(async () => {
    try {
      const response = await apiService.get<any[]>(API_LIST.FACILITIES);
      const data = (response as any)?.data ?? response;
      setDbFacilities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleFilterUpdate = useCallback((updates: { year?: string; facility?: string; status?: string }) => {
    const yr = updates.year !== undefined ? updates.year : selectedYear;
    const fac = updates.facility !== undefined ? updates.facility : (filterFacility || (selectedFacilityHeader !== 'All Facilities' ? selectedFacilityHeader : ''));
    const stat = updates.status !== undefined ? updates.status : filterStatus;

    if (updates.year !== undefined) setSelectedYear(updates.year);
    if (updates.facility !== undefined) {
      setFilterFacility(updates.facility);
      setSelectedFacilityHeader(updates.facility || 'All Facilities');
    }
    if (updates.status !== undefined) setFilterStatus(updates.status);

    setAdditionalFilter({
      category,
      facility: fac && fac !== 'All Facilities' ? fac : undefined,
      status: stat && stat !== 'All Statuses' ? stat : undefined,
      year: yr && yr !== 'All Years' ? yr : undefined,
    });
  }, [category, filterFacility, filterStatus, selectedFacilityHeader, selectedYear, setAdditionalFilter]);

  const handleCopyItem = async (item: any, refetch: () => void) => {
    if (!canEdit) {
      showErrorToast('Only Admin and Super Admin can duplicate entries.');
      return;
    }

    try {
      const payload = {
        serviceCode: 'CARBON',
        category: item.category || category,
        name: item.name ? `${item.name} (Copy)` : 'Copy Entry',
        amount: Number(item.amount) || 0,
        unit: item.unit || 'kg',
        ef: Number(item.ef) || 0,
        efSource: item.efSource || 'IPCC-AR6',
        formula: item.formula,
        dateFrom: item.dateFrom || item.from || '01.01.2026',
        dateTo: item.dateTo || item.to || '31.12.2026',
        facility: item.facility || 'Central HQ',
        approvalStatus: item.approvalStatus || item.status || 'Approved',
        comment: item.comment ? `${item.comment} (Duplicated)` : 'Duplicated entry',
        documentPath: item.documentPath,
      };

      await apiService.post(API_LIST.INVENTORY_ENTRIES, payload);
      showSuccessToast('Inventory entry duplicated successfully!');
      refetch();
    } catch {
      showErrorToast('Failed to duplicate inventory record.');
    }
  };

  const handleDeleteItem = async (id: number, refetch: () => void) => {
    if (!canEdit) {
      showErrorToast('Only Admin and Super Admin can delete inventory entries.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await apiService.delete(API_LIST.INVENTORY_ENTRIES, id);
      showSuccessToast('Inventory entry deleted successfully!');
      refetch();
    } catch {
      showErrorToast('Failed to delete inventory record.');
    }
  };

  return {
    canEdit,
    dbFacilities,
    selectedYear,
    setSelectedYear,
    selectedFacilityHeader,
    setSelectedFacilityHeader,
    filterFacility,
    filterStatus,
    handleFilterUpdate,
    handleCopyItem,
    handleDeleteItem,
  };
}
