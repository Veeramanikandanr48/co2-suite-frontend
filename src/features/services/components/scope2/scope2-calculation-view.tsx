'use client';

import React from 'react';
import { ActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { Scope2CategoryType } from '@/types/inventory';
import { ScopeHeader } from '../shared/scope-header';
import { Scope2FormCards } from './scope2-form-cards';
import { ScopeTableSection } from '../shared/scope-table-section';
import { useScope2Calculation } from '../../hooks/use-scope2-calculation';
import { Scope2CalculationViewProps } from '@/types/components/services.types';

export type { Scope2CategoryType };

export function Scope2CalculationView({ type, category = 'electricity' }: Scope2CalculationViewProps) {
  const activeCategory = (type || category) as Scope2CategoryType;
  const isHeat = activeCategory === 'heat' || activeCategory === 'Purchased Heating & Steam';
  const calculationType = isHeat ? 'heat' : 'electricity';
  const h = useScope2Calculation(calculationType);

  return (
    <div className="space-y-6">
      <ScopeHeader
        title={h.config.title}
        description={h.config.descriptionText}
        warningText={h.config.noteText}
        totalEmissionVal={h.totalEmissionVal}
        selectedYear={h.selectedYear}
        onYearChange={(yr) => h.handleFilterUpdate({ year: yr })}
        selectedFacilityHeader={h.selectedFacilityHeader}
        onFacilityChange={(fac) => h.handleFilterUpdate({ facility: fac })}
        dbFacilities={h.dbFacilities}
        notRelevant={h.isNotRelevant}
        onNotRelevantChange={h.handleNotRelevantToggle}
        checkboxId="s2NotRelevant"
      />

      <ActivityNotRelevantModal
        open={h.showNotRelevantModal}
        onConfirm={() => { h.setShowNotRelevantModal(false); h.setIsNotRelevant(true); }}
        onCancel={() => { h.setShowNotRelevantModal(false); h.setIsNotRelevant(false); }}
      />

      <Scope2FormCards
        config={h.config}
        isNotRelevant={h.isNotRelevant}
        canEdit={h.canEdit}
        loadingEF={h.loadingEF}
        currentMatchingEF={h.currentMatchingEF}
        efSource={h.efSource}
        setEfSource={h.setEfSource}
        availableEfSources={h.availableEfSources}
        factorVersion={h.factorVersion}
        setFactorVersion={h.setFactorVersion}
        availableVersions={h.availableVersions}
        fuelOrGasType={h.fuelOrGasType}
        setFuelOrGasType={h.setFuelOrGasType}
        availableFuelOrGasTypes={h.availableFuelOrGasTypes}
        energyAmount={h.energyAmount}
        setEnergyAmount={h.setEnergyAmount}
        unit={h.unit}
        setUnit={h.setUnit}
        dateFrom={h.dateFrom}
        setDateFrom={h.setDateFrom}
        dateTo={h.dateTo}
        setDateTo={h.setDateTo}
        facility={h.facility}
        setFacility={h.setFacility}
        dbFacilities={h.dbFacilities}
        comment={h.comment}
        setComment={h.setComment}
        approvalStatus={h.approvalStatus}
        setApprovalStatus={h.setApprovalStatus}
        submitting={h.submitting}
        onSaveToDatabase={h.handleSaveToDatabase}
      />

      <ScopeTableSection
        totalCount={h.totalCount}
        isLoading={h.isLoading}
        notRelevant={h.isNotRelevant}
        searchInput={h.searchInput}
        setSearch={h.setSearch}
        filterFacility={h.filterFacility}
        filterStatus={h.filterStatus}
        dbFacilities={h.dbFacilities}
        handleFilterUpdate={h.handleFilterUpdate}
        setSelectedFacilityHeader={h.setSelectedFacilityHeader}
        setSelectedYear={h.setSelectedYear}
        setAdditionalFilter={h.setAdditionalFilter}
        refetch={h.refetch}
        list={h.list}
        canEdit={h.canEdit}
        editingItem={h.editingItem}
        setEditingItem={h.setEditingItem}
        handleCopyItem={h.handleCopyItem}
        handleDeleteItem={h.handleDeleteItem}
        setSorting={h.setSorting}
        isLoadingMore={h.isLoadingMore}
        hasMore={h.hasMore}
        loadMore={h.loadMore}
      />
    </div>
  );
}
