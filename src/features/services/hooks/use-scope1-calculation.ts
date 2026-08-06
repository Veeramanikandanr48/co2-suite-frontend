'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { showSuccessToast, showErrorToast } from '@/components/shared/toast-variant';
import { shouldSkipActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { EditModalItem } from '@/features/services/components/shared/edit-inventory-modal';
import { useFetchList } from '@/hooks/use-fetch-list';
import { DBEmissionFactor, InventoryItem, Scope1CategoryType } from '@/types/inventory';
import { useScopeCommon } from './use-scope-common';
import { useScope1FormState } from './use-scope1-form-state';
import { useMasterData } from '@/hooks/use-master-data';

export type { DBEmissionFactor, InventoryItem };

export function useScope1Calculation(category: Scope1CategoryType) {
  const [editingItem, setEditingItem] = useState<EditModalItem | null>(null);
  const [activityNotRelevant, setActivityNotRelevant] = useState(false);
  const [showNotRelevantModal, setShowNotRelevantModal] = useState(false);

  const [dbEmissionFactors, setDbEmissionFactors] = useState<DBEmissionFactor[]>([]);
  const [loadingEF, setLoadingEF] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: masterFuelItems } = useMasterData('FUEL_TYPE');
  const { data: masterGasItems } = useMasterData('GAS_TYPE');

  const {
    list,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    searchInput,
    setSearch,
    setSorting,
    setAdditionalFilter,
    loadMore,
    refetch,
  } = useFetchList<InventoryItem>(API_LIST.INVENTORY_ENTRIES_FILTER, {
    additionalFilter: { category },
    limit: 10,
  });

  const {
    canEdit,
    dbFacilities,
    selectedYear,
    setSelectedYear,
    selectedFacilityHeader,
    setSelectedFacilityHeader,
    filterFacility,
    filterStatus,
    handleFilterUpdate,
    handleCopyItem: commonCopy,
    handleDeleteItem: commonDelete,
  } = useScopeCommon(category, setAdditionalFilter);

  const formState = useScope1FormState();

  const handleActivityNotRelevantChange = (checked: boolean) => {
    if (!checked) {
      setActivityNotRelevant(false);
      return;
    }
    if (shouldSkipActivityNotRelevantModal()) {
      setActivityNotRelevant(true);
      return;
    }
    setShowNotRelevantModal(true);
  };

  const fetchEmissionFactors = useCallback(async () => {
    try {
      setLoadingEF(true);
      const [efResponse, signatureResponse] = await Promise.allSettled([
        apiService.get<DBEmissionFactor[]>(`${API_LIST.EMISSION_FACTORS}?category=${encodeURIComponent(category)}`),
        apiService.getFactorSignature('1', encodeURIComponent(category)),
      ]);

      if (efResponse.status === 'fulfilled') {
        const data = (efResponse.value as any)?.data ?? efResponse.value;
        const listData = Array.isArray(data) ? data : [];
        setDbEmissionFactors(listData);

        if (listData.length > 0) {
          formState.setEfSource(listData[0].source);
          formState.setFactorVersion(listData[0].version || 'AR6');
          formState.setFuelOrGasType(listData[0].fuelOrGasType);
        }
      }
    } catch (error) {
      console.error('Failed to fetch emission factors:', error);
    } finally {
      setLoadingEF(false);
    }
  }, [category]);

  useEffect(() => {
    fetchEmissionFactors();
  }, [fetchEmissionFactors]);

  const availableEfSources = useMemo(() => {
    const sources = new Set<string>();
    dbEmissionFactors.forEach((item) => sources.add(item.source));
    return Array.from(sources);
  }, [dbEmissionFactors]);

  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    dbEmissionFactors
      .filter((item) => !formState.efSource || item.source === formState.efSource)
      .forEach((item) => versions.add(item.version));
    return Array.from(versions);
  }, [dbEmissionFactors, formState.efSource]);

  const availableFuelOrGasTypes = useMemo(() => {
    const types = new Set<string>();
    dbEmissionFactors
      .filter((item) => (!formState.efSource || item.source === formState.efSource) && (!formState.factorVersion || item.version === formState.factorVersion))
      .forEach((item) => types.add(item.fuelOrGasType));

    // Merge dynamic master items from Master Data Management
    if (masterFuelItems && Array.isArray(masterFuelItems)) {
      masterFuelItems.forEach((m) => {
        if (m.name) types.add(m.name);
      });
    }
    if (masterGasItems && Array.isArray(masterGasItems)) {
      masterGasItems.forEach((m) => {
        if (m.name) types.add(m.name);
      });
    }

    return Array.from(types);
  }, [dbEmissionFactors, formState.efSource, formState.factorVersion, masterFuelItems, masterGasItems]);

  const currentMatchingEF = useMemo(() => {
    return dbEmissionFactors.find(
      (item) =>
        (!formState.efSource || item.source === formState.efSource) &&
        (!formState.factorVersion || item.version === formState.factorVersion) &&
        (!formState.fuelOrGasType || item.fuelOrGasType === formState.fuelOrGasType),
    );
  }, [dbEmissionFactors, formState.efSource, formState.factorVersion, formState.fuelOrGasType]);

  const totalEmissionVal = list
    .reduce((sum, item) => sum + (parseFloat(String(item.emission)) || 0), 0)
    .toFixed(1);

  const handleSaveToDatabase = async () => {
    if (!canEdit) {
      showErrorToast('Only Admin and Super Admin can add or edit inventory entries.');
      return;
    }

    if (category === 'Fugitive Emissions') {
      if (formState.fugitiveType === 'leakage' && !formState.leakagePercent) {
        showErrorToast('Please enter a leakage percentage before saving.');
        return;
      }
      if (formState.fugitiveType === 'filling' && !formState.amount) {
        showErrorToast('Please enter an amount before saving.');
        return;
      }
    } else if (category === 'Process Emissions') {
      if (!formState.inventoryName) {
        showErrorToast('Please enter an inventory name before saving.');
        return;
      }
      if (!formState.amount) {
        showErrorToast('Please enter an emission amount before saving.');
        return;
      }
    } else {
      if (!formState.amount) {
        showErrorToast('Please enter an amount before saving.');
        return;
      }
    }

    try {
      setSaving(true);
      const efValue = currentMatchingEF?.factor ?? 1.938;
      const unitVal =
        currentMatchingEF?.unit ??
        (category === 'Fugitive Emissions'
          ? formState.fugitiveType === 'leakage'
            ? '%'
            : 'kg'
          : category === 'Process Emissions'
          ? 'kgCO2'
          : 'L');

      const nameVal =
        category === 'Process Emissions'
          ? formState.inventoryName || 'Custom Process'
          : formState.fuelOrGasType || (category === 'Fugitive Emissions' ? 'HFC-134a' : 'Natural Gas');

      const defaultFacilityName = dbFacilities[0]?.name || 'Manchester Facility';

      let uploadedDocPath: string | undefined = undefined;
      if (formState.proofFile) {
        try {
          const formData = new FormData();
          formData.append('file', formState.proofFile);
          const uploadRes = await apiService.post<any>(API_LIST.UPLOAD_INVENTORY_DOC, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const uploadData = (uploadRes as any)?.data ?? uploadRes;
          uploadedDocPath = uploadData?.documentPath;
        } catch {
          showErrorToast('Failed to upload proof document file.');
        }
      }

      const payload = {
        serviceCode: 'CARBON',
        category,
        name: nameVal,
        amount:
          category === 'Fugitive Emissions' && formState.fugitiveType === 'leakage'
            ? parseFloat(formState.leakagePercent) || 0
            : parseFloat(formState.amount) || 0,
        unit: unitVal,
        ef: efValue,
        efSource: formState.efSource || currentMatchingEF?.source || 'IPCC-AR6',
        formula: currentMatchingEF?.formula,
        dateFrom: formState.dateFrom || '2026-01-01',
        dateTo: formState.dateTo || '2026-12-31',
        facility: formState.facility || defaultFacilityName,
        approvalStatus: formState.approvalStatus || 'Approved',
        comment: formState.comment,
        documentPath: uploadedDocPath,
        fugitiveType: formState.fugitiveType,
        leakagePercent: formState.leakagePercent,
        dataAcquisitionMethod: formState.dataAcquisitionMethod,
      };

      await apiService.post<InventoryItem>(API_LIST.INVENTORY_ENTRIES, payload);

      showSuccessToast(`${category} inventory entry saved successfully!`);
      refetch();

      formState.setAmount('');
      formState.setLeakagePercent('');
      formState.setInventoryName('');
      formState.setComment('');
      formState.setProofFile(null);
    } catch {
      showErrorToast('Failed to save inventory record.');
    } finally {
      setSaving(false);
    }
  };

  return {
    canEdit,
    editingItem,
    setEditingItem,
    activityNotRelevant,
    setActivityNotRelevant,
    showNotRelevantModal,
    setShowNotRelevantModal,
    selectedYear,
    setSelectedYear,
    selectedFacilityHeader,
    setSelectedFacilityHeader,
    handleActivityNotRelevantChange,
    loadingEF,
    saving,
    filterFacility,
    filterStatus,
    list,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    searchInput,
    setSearch,
    setSorting,
    setAdditionalFilter,
    loadMore,
    refetch,
    ...formState,
    dbFacilities,
    availableEfSources,
    availableVersions,
    availableFuelOrGasTypes,
    currentMatchingEF,
    totalEmissionVal,
    handleFilterUpdate,
    handleSaveToDatabase,
    handleCopyItem: (item: any) => commonCopy(item, refetch),
    handleDeleteItem: (id: number) => commonDelete(id, refetch),
  };
}
