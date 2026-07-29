'use client';

import React from 'react';
import { Scope1EntryFormFieldsProps } from '@/types/components/services.types';

export function Scope1EntryFormFields({
  category,
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
  currentMatchingEF,
}: Scope1EntryFormFieldsProps) {
  if (category === 'Fugitive Emissions') {
    return (
      <div className="space-y-3 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Refrigerant / Gas Type</label>
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
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Calculation Method</label>
            <select
              value={fugitiveType}
              onChange={(e) => setFugitiveType(e.target.value as 'filling' | 'leakage')}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="filling">Capacity Refilled (kg)</option>
              <option value="leakage">Annual Leakage (%)</option>
            </select>
          </div>
          {fugitiveType === 'leakage' ? (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Leakage Rate (%)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={leakagePercent}
                onChange={(e) => setLeakagePercent(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Amount (kg)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (category === 'Process Emissions') {
    return (
      <div className="space-y-3 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Process Name / Description</label>
          <input
            type="text"
            placeholder="e.g. Lime Production Chemical Reaction"
            value={inventoryName}
            onChange={(e) => setInventoryName(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Data Source Method</label>
            <select
              value={dataAcquisitionMethod}
              onChange={(e) => setDataAcquisitionMethod(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="direct">Direct Mass Balance</option>
              <option value="stoichiometric">Stoichiometric Model</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Output Amount (kg)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      <div>
        <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Fuel / Material Type</label>
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

      <div>
        <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
          Consumed Amount ({currentMatchingEF?.unit || 'units'})
        </label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}
