'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFetchList } from '@/hooks/use-fetch-list';
import { ReusableTable } from '@/components/shared/table/reusable-table';
import { API_LIST } from '@/lib/api/endpoints';
import { apiService } from '@/lib/api/api-service';
import { toast } from '@/hooks/use-toast';
import { EmissionFactorModal } from './emission-factor-modal';
import { createEmissionFactorColumns } from './emission-factor-columns';
import { EmissionFactorsMetrics } from './emission-factors-metrics';
import { EmissionFactorsToolbar } from './emission-factors-toolbar';

import { EmissionFactorItem } from '@/types/emission-factors';

export type { EmissionFactorItem };

export function EmissionFactorsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmissionFactorItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    category: string;
    source: string;
    version: string;
    fuelOrGasType: string;
    unit: string;
    factor: string;
    formula: string;
    isActive: boolean;
  }>({
    category: 'Stationary Combustion',
    source: 'DEFRA',
    version: '2024',
    fuelOrGasType: '',
    unit: 'kg CO2e',
    factor: '',
    formula: '(amount * factor) / 1000',
    isActive: true,
  });

  const [filterCategory, setFilterCategory] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const {
    list,
    totalCount,
    isLoadingMore,
    hasMore,
    searchInput,
    setSearch,
    setAdditionalFilter,
    loadMore,
    refetch,
  } = useFetchList<EmissionFactorItem>(API_LIST.EMISSION_FACTORS_FILTER, {
    limit: 15,
  });

  const formattedList = useMemo<EmissionFactorItem[]>(() => {
    return list.map((item) => ({
      ...item,
      id: String(item.id),
    }));
  }, [list]);

  const metrics = useMemo(() => {
    const categoriesSet = new Set(formattedList.map((item) => item.category).filter(Boolean));
    const sourcesSet = new Set(formattedList.map((item) => item.source).filter(Boolean));
    const activeCount = formattedList.filter((item) => item.isActive !== false).length;
    return {
      total: totalCount || formattedList.length,
      active: activeCount,
      categoriesCount: categoriesSet.size,
      sourcesCount: sourcesSet.size,
    };
  }, [formattedList, totalCount]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      category: 'Stationary Combustion',
      source: 'DEFRA',
      version: '2024',
      fuelOrGasType: '',
      unit: 'kg CO2e',
      factor: '',
      formula: '(amount * factor) / 1000',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EmissionFactorItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Stationary Combustion',
      source: item.source || '',
      version: item.version || '',
      fuelOrGasType: item.fuelOrGasType || '',
      unit: item.unit || '',
      factor: String(item.factor || ''),
      formula: item.formula || '',
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.fuelOrGasType || !formData.source || !formData.factor) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Category, Fuel/Gas Type, Source, Factor)',
        variant: 'destructive',
      });
      return;
    }

    const factorNum = Number(formData.factor);
    if (isNaN(factorNum) || factorNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid positive number for emission factor',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        category: formData.category,
        source: formData.source,
        version: formData.version,
        fuelOrGasType: formData.fuelOrGasType,
        unit: formData.unit,
        factor: factorNum,
        formula: formData.formula,
        isActive: formData.isActive,
      };

      if (editingItem) {
        await apiService.put(API_LIST.EMISSION_FACTORS, editingItem.id, payload);
        toast({
          title: 'Success',
          description: 'Emission factor updated successfully',
        });
      } else {
        await apiService.post(API_LIST.EMISSION_FACTORS, payload);
        toast({
          title: 'Success',
          description: 'New emission factor created successfully',
        });
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error('Failed to save emission factor:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to save emission factor',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setIsDeletingId(id);
      await apiService.delete(API_LIST.EMISSION_FACTORS, id);
      toast({
        title: 'Success',
        description: 'Emission factor deleted successfully',
      });
      refetch();
    } catch (err: any) {
      console.error('Failed to delete emission factor:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to delete emission factor',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns = useMemo(
    () => createEmissionFactorColumns({ handleOpenEditModal, handleDelete, isDeletingId }),
    [isDeletingId]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="page-container"
    >
      <EmissionFactorsMetrics metrics={metrics} onOpenCreateModal={handleOpenCreateModal} />

      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs space-y-3">
        <EmissionFactorsToolbar
          searchInput={searchInput}
          setSearch={setSearch}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterSource={filterSource}
          setFilterSource={setFilterSource}
          setAdditionalFilter={setAdditionalFilter}
          refetch={refetch}
        />

        <ReusableTable
          data={formattedList}
          columns={columns}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          handleLoadMore={loadMore}
          tableHeight="calc(100vh - 440px)"
        />
      </div>

      <EmissionFactorModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        handleSubmitForm={handleSubmitForm}
      />
    </motion.div>
  );
}
