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
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-xs">
      <div className="space-y-1.5 max-w-3xl">
        {onNotRelevantChange && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={checkboxId}
              checked={!!notRelevant}
              onChange={(e) => onNotRelevantChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor={checkboxId} className="text-xs font-semibold text-muted-foreground cursor-pointer">
              Activity is not relevant
            </label>
          </div>
        )}
        <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{description}</p>
        <div className="mt-2.5 bg-warning-50/50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/40 rounded-xl p-3 flex items-start gap-2 text-[11px] text-warning-800 dark:text-warning-300 font-medium leading-normal">
          <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
          <p>{warningText}</p>
        </div>
      </div>

      <div className="bg-card border-2 border-primary rounded-2xl p-4 min-w-[240px] shadow-sm shrink-0 self-stretch lg:self-auto flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
          <span className="text-xs font-extrabold text-primary tracking-tight">Total Emission</span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="bg-muted border border-border text-[10px] font-bold text-foreground px-2 py-0.5 rounded cursor-pointer"
          >
            <option value="All Years">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-black text-foreground tracking-tight">{totalEmissionVal}</p>
            <p className="text-[10px] text-muted-foreground font-medium">tonne CO-e</p>
          </div>
          <select
            value={selectedFacilityHeader}
            onChange={(e) => onFacilityChange(e.target.value === 'All Facilities' ? '' : e.target.value)}
            className="bg-muted border border-border text-[10px] font-bold text-foreground px-2 py-0.5 rounded cursor-pointer"
          >
            <option value="All Facilities">All Facilities</option>
            {dbFacilities.map((fac) => (
              <option key={fac.id} value={fac.name}>{fac.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
