'use client';

import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Scope1FormCardsProps } from '@/types/components/services.types';
import { Scope1EntryFormFields } from './scope1-entry-form-fields';

export function Scope1FormCards({
  category,
  activityNotRelevant,
  canEdit,
  loadingEF,
  currentMatchingEF,
  efSource,
  setEfSource,
  availableEfSources,
  factorVersion,
  setFactorVersion,
  availableVersions,
  fuelOrGasType,
  setFuelOrGasType,
  availableFuelOrGasTypes,
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
  saving,
  onSaveToDatabase,
}: Scope1FormCardsProps) {
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-3 gap-4 ${activityNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
      {/* Card 1: Inventory Source */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-2">
            1. Inventory Source
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Database Source
              </label>
              <select
                value={efSource}
                onChange={(e) => setEfSource(e.target.value)}
                disabled={loadingEF}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableEfSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Version / Report Year
              </label>
              <select
                value={factorVersion}
                onChange={(e) => setFactorVersion(e.target.value)}
                disabled={loadingEF}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableVersions.map((ver) => (
                  <option key={ver} value={ver}>
                    {ver}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 text-[11px] text-emerald-900 font-medium">
          Current Emission Factor: <span className="font-bold text-emerald-600">{currentMatchingEF?.factor ?? '1.938'}</span> {currentMatchingEF?.unit ?? 'kgCO₂e/unit'}
        </div>
      </div>

      {/* Card 2: Entry Details */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-2">
          2. Entry Details
        </h2>
        <Scope1EntryFormFields
          category={category}
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
          currentMatchingEF={currentMatchingEF}
        />
      </div>

      {/* Card 3: Additional Data */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-2">
            3. Operational Data
          </h2>
          <div className="mt-3 space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Facility</label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Facility</option>
                {dbFacilities.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Proof Document</label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-neutral-50 border border-dashed border-neutral-300 hover:border-emerald-500 rounded-lg py-1.5 text-xs font-semibold text-neutral-600 hover:text-emerald-600 transition-colors"
              >
                {proofFile ? proofFile.name : 'Upload File Attachment'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Status</label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Comment</label>
                <input
                  type="text"
                  placeholder="Notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onSaveToDatabase}
          disabled={saving || !canEdit}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Save Entry to Database
        </button>
      </div>
    </div>
  );
}
