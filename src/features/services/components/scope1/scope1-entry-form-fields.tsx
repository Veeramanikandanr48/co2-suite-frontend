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
  const inputClass =
    'w-full bg-background border border-input rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
  const labelClass = 'block text-xs font-semibold text-foreground/80 mb-1.5';

  const fuelOptions = availableFuelOrGasTypes;
  const gasOptions = availableFuelOrGasTypes;

  if (category === 'Fugitive Emissions') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Gas Type</label>
          <select
            value={fuelOrGasType}
            onChange={(e) => setFuelOrGasType(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your option</option>
            {gasOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="radio"
                name="fugitiveType"
                value="filling"
                checked={fugitiveType === 'filling'}
                onChange={() => setFugitiveType('filling')}
                className="w-3.5 h-3.5 text-primary border-input focus:ring-primary"
              />
              Filling
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="radio"
                name="fugitiveType"
                value="leakage"
                checked={fugitiveType === 'leakage'}
                onChange={() => setFugitiveType('leakage')}
                className="w-3.5 h-3.5 text-primary border-input focus:ring-primary"
              />
              Leakage
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Leakage (%)</label>
              <input
                type="number"
                placeholder="Please enter leakage"
                value={leakagePercent}
                onChange={(e) => setLeakagePercent(e.target.value)}
                disabled={fugitiveType === 'filling'}
                className={`${inputClass} ${fugitiveType === 'filling' ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
              />
            </div>
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                placeholder="Please enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={fugitiveType === 'leakage'}
                className={`${inputClass} ${fugitiveType === 'leakage' ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (category === 'Process Emissions') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Inventory Name</label>
          <input
            type="text"
            placeholder="Please enter inventory name"
            value={inventoryName}
            onChange={(e) => setInventoryName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Emission</label>
          <div className="relative">
            <input
              type="number"
              placeholder="Please enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputClass} pr-16`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
              kgCO2
            </span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Data Acquisition Method</label>
          <select
            value={dataAcquisitionMethod}
            onChange={(e) => setDataAcquisitionMethod(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your option</option>
            <option value="Direct Mass Balance">Direct Mass Balance</option>
            <option value="Stoichiometric Model">Stoichiometric Model</option>
            <option value="Continuous Emission Monitoring (CEMS)">Continuous Emission Monitoring (CEMS)</option>
            <option value="Sample Analysis">Sample Analysis</option>
          </select>
        </div>

        <div className="text-[11px] text-muted-foreground leading-relaxed pt-1">
          <span className="font-semibold text-foreground">Note:</span> If you have the data in units not specified here, then please provide the conversion factor to get to this value in the comment section below.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Fuel Type</label>
        <select
          value={fuelOrGasType}
          onChange={(e) => setFuelOrGasType(e.target.value)}
          className={inputClass}
        >
          <option value="">Select your option</option>
          {fuelOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Amount {currentMatchingEF?.unit ? `(${currentMatchingEF.unit})` : ''}
        </label>
        <input
          type="number"
          placeholder="Please enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="text-[11px] text-muted-foreground leading-relaxed pt-1">
        <span className="font-semibold text-foreground">Note:</span> If you have the data in units not specified here, then please provide the conversion factor to get to this value in the comment section below.
      </div>
    </div>
  );
}
