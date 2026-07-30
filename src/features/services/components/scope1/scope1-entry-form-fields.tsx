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
  const inputClass = "w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-[11px] font-semibold text-muted-foreground mb-1";

  if (category === 'Fugitive Emissions') {
    return (
      <div className="space-y-3 pt-1">
        <div>
          <label className={labelClass}>Refrigerant / Gas Type</label>
          <select
            value={fuelOrGasType}
            onChange={(e) => setFuelOrGasType(e.target.value)}
            className={inputClass}
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
            <label className={labelClass}>Calculation Method</label>
            <select
              value={fugitiveType}
              onChange={(e) => setFugitiveType(e.target.value as 'filling' | 'leakage')}
              className={inputClass}
            >
              <option value="filling">Capacity Refilled (kg)</option>
              <option value="leakage">Annual Leakage (%)</option>
            </select>
          </div>
          {fugitiveType === 'leakage' ? (
            <div>
              <label className={labelClass}>Leakage Rate (%)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={leakagePercent}
                onChange={(e) => setLeakagePercent(e.target.value)}
                className={inputClass}
              />
            </div>
          ) : (
            <div>
              <label className={labelClass}>Amount (kg)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
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
          <label className={labelClass}>Process Name / Description</label>
          <input
            type="text"
            placeholder="e.g. Lime Production Chemical Reaction"
            value={inventoryName}
            onChange={(e) => setInventoryName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Data Source Method</label>
            <select
              value={dataAcquisitionMethod}
              onChange={(e) => setDataAcquisitionMethod(e.target.value)}
              className={inputClass}
            >
              <option value="direct">Direct Mass Balance</option>
              <option value="stoichiometric">Stoichiometric Model</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Output Amount (kg)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      <div>
        <label className={labelClass}>Fuel / Material Type</label>
        <select
          value={fuelOrGasType}
          onChange={(e) => setFuelOrGasType(e.target.value)}
          className={inputClass}
        >
          {availableFuelOrGasTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Consumed Amount ({currentMatchingEF?.unit || 'units'})
        </label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
