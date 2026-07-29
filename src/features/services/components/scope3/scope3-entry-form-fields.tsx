'use client';

import React from 'react';
import { Scope3CategoryType } from '../../constants/scope3-category-helpers';
import { Scope3EntryFormFieldsProps } from '@/types/components/services.types';

export function Scope3EntryFormFields({
  category,
  activeSubTab,
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
}: Scope3EntryFormFieldsProps) {
  const isPurchasedGoods = category === 'Purchased Goods and Services';
  const isCapitalGoods = category === 'Capital Goods';
  const isUpstreamTransport = category === 'Upstream Transportation';
  const isDownstreamTransport = category === 'Downstream Transportation';
  const isWaste = category === 'Waste Generated in Operations';
  const isBusinessTravel = category === 'Business Travel';
  const isEmployeeCommuting = category === 'Employee Commuting';
  const isProcessingSold = category === 'Processing of Sold Products';
  const isUseSold = category === 'Use of Sold Products';
  const isEolSold = category === 'EOL Treatment of Sold Products' || (category as string) === 'End of Life Treatment of Sold Product';
  const isFranchise = category === 'Franchise';
  const isInvestments = category === 'Investments';

  return (
    <div className="space-y-3.5">
      {!isInvestments && (
        <>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Emission Factor Source
            </label>
            <select
              value={efSource}
              onChange={(e) => setEfSource(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select your option</option>
              {availableSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Factor Version
            </label>
            <select
              value={factorVersion}
              onChange={(e) => setFactorVersion(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select your option</option>
              {availableVersions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {(isPurchasedGoods || isCapitalGoods) && (
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            {activeSubTab === 'Spend Based' ? 'Service' : 'Material/Product'}
          </label>
          <select
            value={materialProduct}
            onChange={(e) => setMaterialProduct(e.target.value)}
            className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select your option</option>
            {dbFactors
              .map((f) => f.fuelOrGasType)
              .filter(Boolean)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </select>
        </div>
      )}

      {(isUpstreamTransport || isDownstreamTransport) && (
        <>
          {activeSubTab === 'Activity Based' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Activity</label>
                <select
                  value={activityOption}
                  onChange={(e) => setActivityOption(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  <option value="Freighting Goods">Freighting Goods</option>
                  <option value="Cargo Ship">Cargo Ship</option>
                  <option value="HGV Transport">HGV Transport</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Type</label>
                <select
                  value={typeOption}
                  onChange={(e) => setTypeOption(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  <option value="HGV (all diesel)">HGV (all diesel)</option>
                  <option value="Lethal Fuel">Lethal Fuel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Size</label>
                <select
                  value={sizeOption}
                  onChange={(e) => setSizeOption(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  <option value="All rigid (>7.5t - 17t)">All rigid (&gt;7.5t - 17t)</option>
                  <option value="Articulated (>33t)">Articulated (&gt;33t)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Distance (km)</label>
                <input
                  type="number"
                  placeholder="Please enter distance"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}
        </>
      )}

      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount</label>
        <input
          type="number"
          placeholder="Please enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}
