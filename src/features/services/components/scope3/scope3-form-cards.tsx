'use client';

import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Scope3CategoryType } from '../../constants/scope3-category-helpers';
import { Scope3EntryFormFields } from './scope3-entry-form-fields';
import { Scope2InventorySourceCard } from '../scope2/scope2-inventory-source-card';
import { Scope3FormCardsProps } from '@/types/components/services.types';


export function Scope3FormCards({
  category,
  activeSubTab,
  isNotRelevant,
  efSource,
  setEfSource,
  availableSources,
  factorVersion,
  setFactorVersion,
  availableVersions,
  materialProduct,
  setMaterialProduct,
  dbFactors,
  activityOption,
  setActivityOption,
  typeOption,
  setTypeOption,
  sizeOption,
  setSizeOption,
  distance,
  setDistance,
  amount,
  setAmount,
  travelOption,
  setTravelOption,
  peopleCount,
  setPeopleCount,
  fuelType,
  setFuelType,
  sourceOption,
  setSourceOption,
  wasteType,
  setWasteType,
  treatmentOption,
  setTreatmentOption,
  country,
  setCountry,
  inventoryName,
  setInventoryName,
  dataAcquisitionMethod,
  setDataAcquisitionMethod,
  investeeScope1,
  setInvesteeScope1,
  investeeScope2,
  setInvesteeScope2,
  equityShare,
  setEquityShare,
  facility,
  setFacility,
  dbFacilities,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  proofFile,
  setProofFile,
  fileInputRef,
  comment,
  setComment,
  approvalStatus,
  setApprovalStatus,
  submitting,
  onSaveToDatabase,
}: Scope3FormCardsProps) {
  return (
    <>
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        {/* Left Card: Inventory Entry */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-3">
            Inventory Entry
          </h2>

          <Scope3EntryFormFields
            category={category}
            activeSubTab={activeSubTab}
            efSource={efSource}
            setEfSource={setEfSource}
            availableSources={availableSources}
            factorVersion={factorVersion}
            setFactorVersion={setFactorVersion}
            availableVersions={availableVersions}
            materialProduct={materialProduct}
            setMaterialProduct={setMaterialProduct}
            dbFactors={dbFactors}
            activityOption={activityOption}
            setActivityOption={setActivityOption}
            typeOption={typeOption}
            setTypeOption={setTypeOption}
            sizeOption={sizeOption}
            setSizeOption={setSizeOption}
            distance={distance}
            setDistance={setDistance}
            amount={amount}
            setAmount={setAmount}
            travelOption={travelOption}
            setTravelOption={setTravelOption}
            peopleCount={peopleCount}
            setPeopleCount={setPeopleCount}
            fuelType={fuelType}
            setFuelType={setFuelType}
            sourceOption={sourceOption}
            setSourceOption={setSourceOption}
            wasteType={wasteType}
            setWasteType={setWasteType}
            treatmentOption={treatmentOption}
            setTreatmentOption={setTreatmentOption}
            country={country}
            setCountry={setCountry}
            inventoryName={inventoryName}
            setInventoryName={setInventoryName}
            dataAcquisitionMethod={dataAcquisitionMethod}
            setDataAcquisitionMethod={setDataAcquisitionMethod}
            investeeScope1={investeeScope1}
            setInvesteeScope1={setInvesteeScope1}
            investeeScope2={investeeScope2}
            setInvesteeScope2={setInvesteeScope2}
            equityShare={equityShare}
            setEquityShare={setEquityShare}
          />
        </div>

        {/* Right Card: Inventory Source */}
        <Scope2InventorySourceCard
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
        />
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Comment
            </label>
            <input
              type="text"
              placeholder=""
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Approval Status
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <button
          onClick={onSaveToDatabase}
          disabled={submitting}
          className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Save to Database</span>
        </button>
      </div>
    </>
  );
}
