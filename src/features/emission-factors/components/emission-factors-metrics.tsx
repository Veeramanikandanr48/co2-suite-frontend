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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0B132B] p-4 rounded-xl text-white shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg border border-white/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">
              Emission Factors Management
            </h1>
          </div>
          <p className="text-xs text-neutral-300 max-w-2xl">
            Configure global emission factors, conversion rates, fuel types, and calculation formulas used dynamically across GHG Scope 1, Scope 2, and Scope 3 services.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Emission Factor
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#0B132B] text-white rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.total}</div>
            <div className="text-[11px] font-semibold text-neutral-500">Total Emission Factors</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#0B132B] text-white rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.active}</div>
            <div className="text-[11px] font-semibold text-neutral-500">Active Factors</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#0B132B] text-white rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.categoriesCount}</div>
            <div className="text-[11px] font-semibold text-neutral-500">Categories Covered</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#0B132B] text-white rounded-lg">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.sourcesCount}</div>
            <div className="text-[11px] font-semibold text-neutral-500">DB Sources (DEFRA/IPCC)</div>
          </div>
        </div>
      </div>
    </>
  );
}
