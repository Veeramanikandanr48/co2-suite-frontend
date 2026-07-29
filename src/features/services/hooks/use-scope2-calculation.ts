'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { showSuccessToast, showErrorToast } from '@/components/shared/toast-variant';
import { shouldSkipActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { EditModalItem } from '@/features/services/components/shared/edit-inventory-modal';
import { useFetchList } from '@/hooks/use-fetch-list';
import { Scope2CategoryConfig, DBEmissionFactor, InventoryItem } from '@/types/inventory';
import { useScopeCommon } from './use-scope-common';
import { useScope2FormState } from './use-scope2-form-state';

export const SCOPE2_CONFIGS: Record<string, Scope2CategoryConfig> = {
  electricity: {
    title: 'Purchased Electricity',
    categoryTag: 'Purchased Electricity',
    subType: 'purchased_electricity',
    defaultUnit: 'kWh',
    formulaLabel: '(Consumption in kWh × Emission Factor in kg CO₂e/kWh) ÷ 1,000',
    descriptionText:
      'Carbon dioxide (CO₂), methane (CH₄), and nitrous oxide (N₂O) are released during the generation of electricity consumed by company operations.',
    noteText: 'Note: Use location-based or market-based grid emission factors provided by energy suppliers or local authorities.',
  },
  heat: {
    title: 'Purchased Heat & Steam',
    categoryTag: 'Purchased Heating & Steam',
    subType: 'purchased_heating_steam',
    defaultUnit: 'kWh',
    formulaLabel: '(Consumption in kWh/MJ × Emission Factor in kg CO₂e/unit) ÷ 1,000',
    descriptionText:
      'Emissions from off-site steam, district heating, or cooling purchased and consumed by facility infrastructure.',
    noteText: 'Note: Ensure heating units (kWh, MJ, therms) match the selected emission factor.',
  },
};

export function useScope2Calculation(type: 'electricity' | 'heat') {
  const config = SCOPE2_CONFIGS[type] || SCOPE2_CONFIGS.electricity;
  const isElectricity = type === 'electricity';

  const [isNotRelevant, setIsNotRelevant] = useState(false);
  const [showNotRelevantModal, setShowNotRelevantModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditModalItem | null>(null);

  const [dbEmissionFactors, setDbEmissionFactors] = useState<DBEmissionFactor[]>([]);
  const [loadingEF, setLoadingEF] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';

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
    additionalFilter: { category: efCategory },
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
  } = useScopeCommon(efCategory, setAdditionalFilter);

  const formState = useScope2FormState(config.defaultUnit);

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
        `${API_LIST.EMISSION_FACTORS}?category=${encodeURIComponent(efCategory)}`
      );
      const data = (response as any)?.data ?? response;
      const listData = Array.isArray(data) ? data : [];
      setDbEmissionFactors(listData);

      if (listData.length > 0) {
        formState.setEfSource(listData[0].source);
        formState.setFactorVersion(listData[0].version || 'AR6');
        formState.setFuelOrGasType(listData[0].fuelOrGasType);
        if (listData[0].unit) formState.setUnit(listData[0].unit);
      }
    } catch (error) {
      console.error('Failed to fetch Scope 2 emission factors:', error);
    } finally {
      setLoadingEF(false);
    }
  }, [efCategory]);

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
    return Array.from(types);
  }, [dbEmissionFactors, formState.efSource, formState.factorVersion]);

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

    if (!formState.energyAmount || parseFloat(formState.energyAmount) <= 0) {
      showErrorToast('Please enter a valid energy consumption amount.');
      return;
    }

    try {
      setSubmitting(true);
      const efValue = currentMatchingEF?.factor ?? (isElectricity ? 0.42 : 0.18);
      const unitVal = currentMatchingEF?.unit || formState.unit || config.defaultUnit;
      const defaultFacilityName = dbFacilities[0]?.name || 'Central HQ';

      const payload = {
        serviceCode: 'CARBON',
        category: efCategory,
        name: formState.fuelOrGasType || config.title,
        amount: parseFloat(formState.energyAmount),
        unit: unitVal,
        ef: efValue,
        efSource: formState.efSource || currentMatchingEF?.source || 'IPCC-AR6',
        formula: currentMatchingEF?.formula || config.formulaLabel,
        dateFrom: formState.dateFrom || '01.01.2026',
        dateTo: formState.dateTo || '31.12.2026',
        facility: formState.facility || defaultFacilityName,
        approvalStatus: formState.approvalStatus || 'Approved',
        comment: formState.comment,
      };

      await apiService.post<InventoryItem>(API_LIST.INVENTORY_ENTRIES, payload);
      showSuccessToast(`${config.title} inventory entry saved successfully!`);
      refetch();

      formState.setEnergyAmount('');
      formState.setComment('');
    } catch (error) {
      console.error('Failed to save Scope 2 entry:', error);
      showErrorToast('Failed to save Scope 2 record.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    config,
    isElectricity,
    canEdit,
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
    availableEfSources,
    availableVersions,
    availableFuelOrGasTypes,
    currentMatchingEF,
    totalEmissionVal,
    handleNotRelevantToggle,
    handleFilterUpdate,
    handleSaveToDatabase,
    handleCopyItem: (item: any) => commonCopy(item, refetch),
    handleDeleteItem: (id: number) => commonDelete(id, refetch),
  };
}
