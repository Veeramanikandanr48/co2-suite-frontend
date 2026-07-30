'use client';

import React from 'react';
import { ActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { ScopeHeader } from '../shared/scope-header';
import { Scope3FormCards } from './scope3-form-cards';
import { ScopeTableSection } from '../shared/scope-table-section';
import { useScope3Calculation } from '../../hooks/use-scope3-calculation';
import { Scope3TravelSubTabs } from './scope3-travel-subtabs';
import { Scope3CategoryType } from '../../constants/scope3-category-helpers';
import { Scope3CalculationViewProps } from '@/types/components/services.types';

export type { Scope3CategoryType };

export function Scope3CalculationView({ category = 'Purchased Goods and Services' }: Scope3CalculationViewProps) {
  const categoryTyped = category as Scope3CategoryType;
  const h = useScope3Calculation(category);

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
        checkboxId="s3NotRelevant"
      />

      <ActivityNotRelevantModal
        open={h.showNotRelevantModal}
        onConfirm={() => { h.setShowNotRelevantModal(false); h.setIsNotRelevant(true); }}
        onCancel={() => { h.setShowNotRelevantModal(false); h.setIsNotRelevant(false); }}
      />

      {category === 'Business Travel' && (
        <Scope3TravelSubTabs activeSubTab={h.activeSubTab} setActiveSubTab={h.setActiveSubTab} />
      )}

      <Scope3FormCards
        category={categoryTyped}
        activeSubTab={h.activeSubTab}
        isNotRelevant={h.isNotRelevant}
        efSource={h.efSource}
        setEfSource={h.setEfSource}
        availableSources={h.availableSources}
        factorVersion={h.factorVersion}
        setFactorVersion={h.setFactorVersion}
        availableVersions={h.availableVersions}
        materialProduct={h.materialProduct}
        setMaterialProduct={h.setMaterialProduct}
        dbFactors={h.dbFactors}
        activityOption={h.activityOption}
        setActivityOption={h.setActivityOption}
        typeOption={h.typeOption}
        setTypeOption={h.setTypeOption}
        sizeOption={h.sizeOption}
        setSizeOption={h.setSizeOption}
        distance={h.distance}
        setDistance={h.setDistance}
        amount={h.amount}
        setAmount={h.setAmount}
        travelOption={h.travelOption}
        setTravelOption={h.setTravelOption}
        peopleCount={h.peopleCount}
        setPeopleCount={h.setPeopleCount}
        fuelType={h.fuelType}
        setFuelType={h.setFuelType}
        sourceOption={h.sourceOption}
        setSourceOption={h.setSourceOption}
        wasteType={h.wasteType}
        setWasteType={h.setWasteType}
        treatmentOption={h.treatmentOption}
        setTreatmentOption={h.setTreatmentOption}
        country={h.country}
        setCountry={h.setCountry}
        inventoryName={h.inventoryName}
        setInventoryName={h.setInventoryName}
        dataAcquisitionMethod={h.dataAcquisitionMethod}
        setDataAcquisitionMethod={h.setDataAcquisitionMethod}
        investeeScope1={h.investeeScope1}
        setInvesteeScope1={h.setInvesteeScope1}
        investeeScope2={h.investeeScope2}
        setInvesteeScope2={h.setInvesteeScope2}
        equityShare={h.equityShare}
        setEquityShare={h.setEquityShare}
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
