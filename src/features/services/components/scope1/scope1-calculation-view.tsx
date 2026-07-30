'use client';

import React from 'react';
import { ActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { Scope1CategoryType } from '@/types/inventory';
import { ScopeHeader } from '../shared/scope-header';
import { Scope1FormCards } from './scope1-form-cards';
import { ScopeTableSection } from '../shared/scope-table-section';
import { useScope1Calculation } from '../../hooks/use-scope1-calculation';
import { Scope1CalculationViewProps } from '@/types/components/services.types';

export type { Scope1CategoryType };

export function Scope1CalculationView({ category = 'Stationary Combustion' }: Scope1CalculationViewProps) {
  const h = useScope1Calculation(category);

  return (
    <div className="space-y-6">
      <ScopeHeader
        title={category}
        description="Emissions released directly from company-owned or controlled operations."
        warningText="Note: Fuel consumption entries require exact activity data in units of volume (L, sm) or mass (kg)."
        totalEmissionVal={h.totalEmissionVal}
        selectedYear={h.selectedYear}
        onYearChange={(yr) => h.handleFilterUpdate({ year: yr })}
        selectedFacilityHeader={h.selectedFacilityHeader}
        onFacilityChange={(fac) => h.handleFilterUpdate({ facility: fac })}
        dbFacilities={h.dbFacilities}
        notRelevant={h.activityNotRelevant}
        onNotRelevantChange={h.handleActivityNotRelevantChange}
        checkboxId="s1NotRelevant"
      />

      <ActivityNotRelevantModal
        open={h.showNotRelevantModal}
        onConfirm={() => h.setShowNotRelevantModal(false)}
        onCancel={() => h.setShowNotRelevantModal(false)}
      />

      <Scope1FormCards
        category={category}
        activityNotRelevant={h.activityNotRelevant}
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
        fugitiveType={h.fugitiveType}
        setFugitiveType={h.setFugitiveType}
        leakagePercent={h.leakagePercent}
        setLeakagePercent={h.setLeakagePercent}
        amount={h.amount}
        setAmount={h.setAmount}
        inventoryName={h.inventoryName}
        setInventoryName={h.setInventoryName}
        dataAcquisitionMethod={h.dataAcquisitionMethod}
        setDataAcquisitionMethod={h.setDataAcquisitionMethod}
        facility={h.facility}
        setFacility={h.setFacility}
        dbFacilities={h.dbFacilities}
        dateFrom={h.dateFrom}
        setDateFrom={h.setDateFrom}
        dateTo={h.dateTo}
        setDateTo={h.setDateTo}
        proofFile={h.proofFile}
        setProofFile={h.setProofFile}
        fileInputRef={h.fileInputRef}
        comment={h.comment}
        setComment={h.setComment}
        approvalStatus={h.approvalStatus}
        setApprovalStatus={h.setApprovalStatus}
        saving={h.saving}
        onSaveToDatabase={h.handleSaveToDatabase}
      />

      <ScopeTableSection
        totalCount={h.totalCount}
        isLoading={h.isLoading}
        notRelevant={h.activityNotRelevant}
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
