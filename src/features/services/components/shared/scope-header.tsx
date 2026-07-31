'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ScopeHeaderProps } from '@/types/components/services.types';

export function ScopeHeader({
  title,
  description,
  warningText,
  totalEmissionVal,
  selectedYear,
  onYearChange,
  selectedFacilityHeader,
  onFacilityChange,
  dbFacilities,
  notRelevant,
  onNotRelevantChange,
  checkboxId = 'scopeNotRelevant',
}: ScopeHeaderProps) {
  const defaultWarning =
    'Note: The sector in which the emission-generating fuel is used is crucial. Additionally, if fuel is consumed in laboratory experiments for R&D or similar purposes, it must also be considered.';

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-card p-6 rounded-2xl border border-border shadow-xs">
      <div className="space-y-2 flex-1">
        {onNotRelevantChange && (
          <div className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              id={checkboxId}
              checked={!!notRelevant}
              onChange={(e) => onNotRelevantChange(e.target.checked)}
              className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <label
              htmlFor={checkboxId}
              className="text-xs font-semibold text-foreground/80 cursor-pointer select-none"
            >
              Activity is not relevant
            </label>
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

        <div className="mt-3 bg-muted/40 border border-border/80 rounded-lg p-3 flex items-start gap-2 text-xs text-foreground/80 leading-snug">
          <AlertCircle className="w-4 h-4 text-foreground/70 shrink-0 mt-0.5" />
          <p className="font-normal text-[11px]">{warningText || defaultWarning}</p>
        </div>
      </div>

      <div className="bg-background border-2 border-[#00d2c4] rounded-xl p-4 min-w-[260px] shadow-xs shrink-0 self-stretch lg:self-auto flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
          <span className="text-xs font-bold text-[#00d2c4] tracking-tight">Total Emission</span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="bg-background border border-border text-xs font-medium text-foreground px-2.5 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00d2c4] cursor-pointer"
          >
            <option value="All Years">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">tonne CO₂e</p>
            <p className="text-3xl font-bold text-foreground tracking-tight leading-none">
              {totalEmissionVal}
            </p>
          </div>
          <select
            value={selectedFacilityHeader}
            onChange={(e) => onFacilityChange(e.target.value === 'All Facilities' ? '' : e.target.value)}
            className="bg-background border border-border text-xs font-medium text-foreground px-2.5 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00d2c4] cursor-pointer"
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
  );
}

