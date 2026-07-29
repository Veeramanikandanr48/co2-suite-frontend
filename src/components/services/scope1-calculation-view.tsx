'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ActivityNotRelevantModal } from '@/components/reusables/activity-not-relevant-modal';
import { Scope1CategoryType } from '@/types/inventory';
import { Scope1FormCards } from './scope1-form-cards';
import { Scope1TableSection } from './scope1-table-section';
import { useScope1Calculation } from './use-scope1-calculation';

export type { Scope1CategoryType };

interface Scope1CalculationViewProps {
  category?: Scope1CategoryType;
}

export function Scope1CalculationView({
  category = 'Stationary Combustion',
}: Scope1CalculationViewProps) {
  const {
    canEdit,
    editingItem,
    setEditingItem,
    activityNotRelevant,
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
    efSource,
    setEfSource,
    factorVersion,
    setFactorVersion,
    fuelOrGasType,
    setFuelOrGasType,
    fugitiveType,
    setFugitiveType,
    leakagePercent,
    setLeakagePercent,
    amount,
    setAmount,
    inventoryName,
    setInventoryName,
    dataAcquisitionMethod,
    setDataAcquisitionMethod,
    facility,
    setFacility,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    comment,
    setComment,
    approvalStatus,
    setApprovalStatus,
    proofFile,
    setProofFile,
    fileInputRef,
    dbFacilities,
    availableEfSources,
    availableVersions,
    availableFuelOrGasTypes,
    currentMatchingEF,
    totalEmissionVal,
    handleFilterUpdate,
    handleSaveToDatabase,
    handleCopyItem,
    handleDeleteItem,
  } = useScope1Calculation(category);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activityNotRelevant"
              checked={activityNotRelevant}
              onChange={(e) => handleActivityNotRelevantChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="activityNotRelevant" className="text-xs font-semibold text-neutral-500 cursor-pointer">
              Activity is not relevant
            </label>
          </div>
          <h1 className="text-2xl font-black text-neutral-800 tracking-tight">{category}</h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            Emissions released directly from company-owned or controlled operations.
          </p>
          <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-amber-800 font-medium leading-normal">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Note: Fuel consumption entries require exact activity data in units of volume (L, sm³) or mass (kg).
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-4 min-w-[240px] shadow-sm shrink-0 self-stretch lg:self-auto flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2">
            <span className="text-xs font-extrabold text-emerald-600 tracking-tight">Total Emission</span>
            <select
              value={selectedYear}
              onChange={(e) => handleFilterUpdate({ year: e.target.value })}
              className="bg-neutral-50 border border-neutral-200 text-[10px] font-bold text-neutral-600 px-2 py-0.5 rounded cursor-pointer"
            >
              <option value="All Years">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-black text-neutral-800 tracking-tight">{totalEmissionVal}</p>
              <p className="text-[10px] text-neutral-400 font-medium">tonne CO₂-e</p>
            </div>
            <select
              value={selectedFacilityHeader}
              onChange={(e) => handleFilterUpdate({ facility: e.target.value === 'All Facilities' ? '' : e.target.value })}
              className="bg-neutral-50 border border-neutral-200 text-[10px] font-bold text-neutral-600 px-2 py-0.5 rounded cursor-pointer"
            >
              <option value="All Facilities">All Facilities</option>
              {dbFacilities.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ActivityNotRelevantModal
        open={showNotRelevantModal}
        onConfirm={() => {
          setShowNotRelevantModal(false);
        }}
        onCancel={() => {
          setShowNotRelevantModal(false);
        }}
      />

      <Scope1FormCards
        category={category}
        activityNotRelevant={activityNotRelevant}
        canEdit={canEdit}
        loadingEF={loadingEF}
        currentMatchingEF={currentMatchingEF}
        efSource={efSource}
        setEfSource={setEfSource}
        availableEfSources={availableEfSources}
        factorVersion={factorVersion}
        setFactorVersion={setFactorVersion}
        availableVersions={availableVersions}
        fuelOrGasType={fuelOrGasType}
        setFuelOrGasType={setFuelOrGasType}
        availableFuelOrGasTypes={availableFuelOrGasTypes}
        fugitiveType={fugitiveType}
        setFugitiveType={setFugitiveType}
        leakagePercent={leakagePercent}
        setLeakagePercent={setLeakagePercent}
        amount={amount}
        setAmount={setAmount}
        inventoryName={inventoryName}
        setInventoryName={setInventoryName}
        dataAcquisitionMethod={dataAcquisitionMethod}
        setDataAcquisitionMethod={setDataAcquisitionMethod}
        facility={facility}
        setFacility={setFacility}
        dbFacilities={dbFacilities}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        proofFile={proofFile}
        setProofFile={setProofFile}
        fileInputRef={fileInputRef}
        comment={comment}
        setComment={setComment}
        approvalStatus={approvalStatus}
        setApprovalStatus={setApprovalStatus}
        saving={saving}
        onSaveToDatabase={handleSaveToDatabase}
      />

      <Scope1TableSection
        category={category}
        totalCount={totalCount}
        isLoading={isLoading}
        activityNotRelevant={activityNotRelevant}
        searchInput={searchInput}
        setSearch={setSearch}
        filterFacility={filterFacility}
        filterStatus={filterStatus}
        dbFacilities={dbFacilities}
        handleFilterUpdate={handleFilterUpdate}
        setSelectedFacilityHeader={setSelectedFacilityHeader}
        setSelectedYear={setSelectedYear}
        setAdditionalFilter={setAdditionalFilter}
        refetch={refetch}
        list={list}
        canEdit={canEdit}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        handleCopyItem={handleCopyItem}
        handleDeleteItem={handleDeleteItem}
        setSorting={setSorting}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
      />
    </div>
  );
}
