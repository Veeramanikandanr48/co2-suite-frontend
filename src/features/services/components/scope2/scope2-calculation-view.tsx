'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ActivityNotRelevantModal } from '@/components/shared/modals/activity-not-relevant-modal';
import { Scope2CategoryType } from '@/types/inventory';
import { Scope2FormCards } from './scope2-form-cards';
import { Scope2TableSection } from './scope2-table-section';
import { useScope2Calculation } from '../../hooks/use-scope2-calculation';

export type { Scope2CategoryType };
import { Scope2CalculationViewProps } from '@/types/components/services.types';


export function Scope2CalculationView({ type, category = 'electricity' }: Scope2CalculationViewProps) {
  const activeCategory = (type || category) as Scope2CategoryType;
  const isHeat = activeCategory === 'heat' || activeCategory === 'Purchased Heating & Steam';
  const calculationType = isHeat ? 'heat' : 'electricity';

  const {
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
    efSource,
    setEfSource,
    factorVersion,
    setFactorVersion,
    fuelOrGasType,
    setFuelOrGasType,
    energyAmount,
    setEnergyAmount,
    unit,
    setUnit,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    facility,
    setFacility,
    comment,
    setComment,
    approvalStatus,
    setApprovalStatus,
    dbFacilities,
    availableEfSources,
    availableVersions,
    availableFuelOrGasTypes,
    currentMatchingEF,
    totalEmissionVal,
    handleNotRelevantToggle,
    handleFilterUpdate,
    handleSaveToDatabase,
    handleCopyItem,
    handleDeleteItem,
  } = useScope2Calculation(calculationType);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scope2NotRelevant"
              checked={isNotRelevant}
              onChange={(e) => handleNotRelevantToggle(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="scope2NotRelevant" className="text-xs font-semibold text-neutral-500 cursor-pointer">
              Activity is not relevant
            </label>
          </div>
          <h1 className="text-2xl font-black text-neutral-800 tracking-tight">
            {config.title}
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            {config.descriptionText}
          </p>
          <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-amber-800 font-medium leading-normal">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{config.noteText}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-4 min-w-[240px] shadow-sm shrink-0 self-stretch lg:self-auto flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2">
            <span className="text-xs font-extrabold text-emerald-600 tracking-tight">
              Total Emission
            </span>
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
              <p className="text-3xl font-black text-neutral-800 tracking-tight">
                {totalEmissionVal}
              </p>
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
          setIsNotRelevant(true);
        }}
        onCancel={() => {
          setShowNotRelevantModal(false);
          setIsNotRelevant(false);
        }}
      />

      <Scope2FormCards
        config={config}
        isNotRelevant={isNotRelevant}
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
        energyAmount={energyAmount}
        setEnergyAmount={setEnergyAmount}
        unit={unit}
        setUnit={setUnit}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        facility={facility}
        setFacility={setFacility}
        dbFacilities={dbFacilities}
        comment={comment}
        setComment={setComment}
        approvalStatus={approvalStatus}
        setApprovalStatus={setApprovalStatus}
        submitting={submitting}
        onSaveToDatabase={handleSaveToDatabase}
      />

      <Scope2TableSection
        isElectricity={isElectricity}
        totalCount={totalCount}
        isLoading={isLoading}
        isNotRelevant={isNotRelevant}
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
