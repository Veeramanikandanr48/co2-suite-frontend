'use client';

import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Scope2FormCardsProps } from '@/types/components/services.types';

export function Scope2FormCards({
  config,
  isNotRelevant,
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
  dbFacilities,
  comment,
  setComment,
  approvalStatus,
  setApprovalStatus,
  submitting,
  onSaveToDatabase,
}: Scope2FormCardsProps) {
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-3 gap-4 ${isNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
      {/* Card 1: Factor Source Selection */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-2">
            1. Emission Factor Source
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Grid / Factor Database
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
                Version / Assessment Year
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
          Active EF Value: <span className="font-bold text-emerald-600">{currentMatchingEF?.factor ?? 0.42}</span> {currentMatchingEF?.unit || 'kg CO₂e/kWh'}
        </div>
      </div>

      {/* Card 2: Energy Consumption */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-2">
          2. Energy Consumption
        </h2>
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
              Supplier / Energy Subtype
            </label>
            <select
              value={fuelOrGasType}
              onChange={(e) => setFuelOrGasType(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableFuelOrGasTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Amount</label>
              <input
                type="number"
                placeholder="e.g. 12500"
                value={energyAmount}
                onChange={(e) => setEnergyAmount(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kWh">kWh</option>
                <option value="MWh">MWh</option>
                <option value="MJ">MJ</option>
                <option value="therms">therms</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Additional Metadata */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-2">
            3. Location & Metadata
          </h2>
          <div className="mt-3 space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Facility Site</label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Facility Site</option>
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Approval Status</label>
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
          disabled={submitting || !canEdit}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Save Entry to Database
        </button>
      </div>
    </div>
  );
}
