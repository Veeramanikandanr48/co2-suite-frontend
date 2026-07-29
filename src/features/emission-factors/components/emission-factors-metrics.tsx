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
import { MetricCard } from '@/components/shared';

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

      {/* Summary Stat Cards using MetricCard component */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Total Emission Factors"
          value={metrics.total}
          icon={FileSpreadsheet}
        />
        <MetricCard
          title="Active Factors"
          value={metrics.active}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Categories Covered"
          value={metrics.categoriesCount}
          icon={Layers}
        />
        <MetricCard
          title="DB Sources (DEFRA/IPCC)"
          value={metrics.sourcesCount}
          icon={Globe}
        />
      </div>
    </>
  );
}
