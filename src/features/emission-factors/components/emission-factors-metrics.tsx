'use client';

import React from 'react';
import {
  Database,
  Plus,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  Globe,
} from 'lucide-react';

interface MetricsProps {
  metrics: {
    total: number;
    active: number;
    categoriesCount: number;
    sourcesCount: number;
  };
  onOpenCreateModal: () => void;
}

export function EmissionFactorsMetrics({ metrics, onOpenCreateModal }: MetricsProps) {
  return (
    <>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-slate-900 to-navy-950 p-4 rounded-xl text-white shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">
              Emission Factors Management
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Configure global emission factors, conversion rates, fuel types, and calculation formulas used dynamically across GHG Scope 1, Scope 2, and Scope 3 services.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-md transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Emission Factor
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.total}</div>
            <div className="text-[11px] font-medium text-neutral-500">Total Emission Factors</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.active}</div>
            <div className="text-[11px] font-medium text-neutral-500">Active Factors</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.categoriesCount}</div>
            <div className="text-[11px] font-medium text-neutral-500">Categories Covered</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.sourcesCount}</div>
            <div className="text-[11px] font-medium text-neutral-500">DB Sources (DEFRA/IPCC)</div>
          </div>
        </div>
      </div>
    </>
  );
}
