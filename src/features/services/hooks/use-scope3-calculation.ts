'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { showSuccessToast, showErrorToast } from '@/components/shared/toast-variant';
import { shouldSkipActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { EditModalItem } from '@/features/services/components/shared/edit-inventory-modal';
import { useFetchList } from '@/hooks/use-fetch-list';
import { DBEmissionFactor, InventoryItem } from '@/types/inventory';
import { SCOPE3_CONFIGS } from '../constants/scope3-category-helpers';
import { useScopeCommon } from './use-scope-common';
import { useScope3FormState } from './use-scope3-form-state';

export function useScope3Calculation(category: string) {
  const config = SCOPE3_CONFIGS[category] || SCOPE3_CONFIGS['Purchased Goods and Services'];

  const [activeSubTab, setActiveSubTab] = useState<'Flight' | 'Taxi' | 'Sea' | 'Land' | 'Hotel'>('Flight');
  const [isNotRelevant, setIsNotRelevant] = useState(false);
  const [showNotRelevantModal, setShowNotRelevantModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditModalItem | null>(null);

  const [dbFactors, setDbFactors] = useState<DBEmissionFactor[]>([]);
  const [loadingEF, setLoadingEF] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    additionalFilter: { category: config.categoryTag },
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
  } = useScopeCommon(config.categoryTag, setAdditionalFilter);

  const formState = useScope3FormState();

  const handleNotRelevantToggle = (checked: boolean) => {
    if (!checked) {
      setIsNotRelevant(false);
      return;
    }
    if (shouldSkipActivityNotRelevantModal()) {
      setIsNotRelevant(true);
      return;
    }
    setShowNotRelevantModal(true);
  };

  const fetchEmissionFactors = useCallback(async () => {
    try {
      setLoadingEF(true);
      const response = await apiService.get<DBEmissionFactor[]>(
        `${API_LIST.EMISSION_FACTORS}?category=${encodeURIComponent(config.categoryTag)}`
      );
      const data = (response as any)?.data ?? response;
      const listData = Array.isArray(data) ? data : [];
      setDbFactors(listData);

      if (listData.length > 0) {
        formState.setEfSource(listData[0].source);
        formState.setFactorVersion(listData[0].version || 'AR6');
        formState.setMaterialProduct(listData[0].fuelOrGasType);
      }
    } catch (error) {
      console.error('Failed to fetch Scope 3 emission factors:', error);
    } finally {
      setLoadingEF(false);
    }
  }, [config.categoryTag]);

  useEffect(() => {
    fetchEmissionFactors();
  }, [fetchEmissionFactors]);

  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    dbFactors.forEach((item) => sources.add(item.source));
    return Array.from(sources);
  }, [dbFactors]);

  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    dbFactors
      .filter((item) => !formState.efSource || item.source === formState.efSource)
      .forEach((item) => versions.add(item.version));
    return Array.from(versions);
  }, [dbFactors, formState.efSource]);

  const currentMatchingEF = useMemo(() => {
    return dbFactors.find(
      (item) =>
        (!formState.efSource || item.source === formState.efSource) &&
        (!formState.factorVersion || item.version === formState.factorVersion) &&
        (!formState.materialProduct || item.fuelOrGasType === formState.materialProduct),
    );
  }, [dbFactors, formState.efSource, formState.factorVersion, formState.materialProduct]);

  const totalEmissionVal = list
    .reduce((sum, item) => sum + (parseFloat(String(item.emission)) || 0), 0)
    .toFixed(1);

  const handleSaveToDatabase = async () => {
    if (!canEdit) {
      showErrorToast('Only Admin and Super Admin can add or edit inventory entries.');
      return;
    }

    try {
      setSubmitting(true);
      const efValue = currentMatchingEF?.factor ?? 0.85;
      const unitVal = currentMatchingEF?.unit || config.defaultUnit;
      const nameVal = formState.materialProduct || formState.inventoryName || config.title;
      const defaultFacilityName = dbFacilities[0]?.name || 'Central HQ';

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
        category: config.categoryTag,
        name: nameVal,
        amount: parseFloat(formState.amount) || 0,
        unit: unitVal,
        ef: efValue,
        efSource: formState.efSource || currentMatchingEF?.source || 'IPCC-AR6',
        formula: currentMatchingEF?.formula || config.formulaLabel,
        dateFrom: formState.dateFrom || '01.01.2026',
        dateTo: formState.dateTo || '31.12.2026',
        facility: formState.facility || defaultFacilityName,
        approvalStatus: formState.approvalStatus || 'Approved',
        comment: formState.comment,
        documentPath: uploadedDocPath,
      };

      await apiService.post<InventoryItem>(API_LIST.INVENTORY_ENTRIES, payload);
      showSuccessToast(`${config.title} inventory entry saved successfully!`);
      refetch();

      formState.setAmount('');
      formState.setComment('');
      formState.setProofFile(null);
    } catch {
      showErrorToast('Failed to save Scope 3 record.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    config,
    canEdit,
    activeSubTab,
    setActiveSubTab,
    isNotRelevant,
    setIsNotRelevant,
    showNotRelevantModal,
    setShowNotRelevantModal,
    editingItem,
    setEditingItem,
    selectedYear,
    setSelectedYear,
    selectedFacilityHeader,
    setSelectedFacilityHeader,
    loadingEF,
    submitting,
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
    dbFactors,
    availableSources,
    availableVersions,
    currentMatchingEF,
    totalEmissionVal,
    handleNotRelevantToggle,
    handleFilterUpdate,
    handleSaveToDatabase,
    handleCopyItem: (item: any) => commonCopy(item, refetch),
    handleDeleteItem: (id: number) => commonDelete(id, refetch),
  };
}
