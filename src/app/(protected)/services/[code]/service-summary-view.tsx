'use client';

import React from 'react';
import {
  Loader2,
  Building2,
  Calendar,
  RefreshCw,
  ChevronDown,
  BarChart3,
  Layers,
  Factory,
  ClipboardCheck,
} from 'lucide-react';
import { ServiceSummaryViewProps } from '@/types/components/services.types';
import { SummaryChartsGrid } from './summary-charts-grid';
import { SummaryCategoryBreakdown } from './summary-category-breakdown';
import { SummaryActivityTable } from './summary-activity-table';

export function ServiceSummaryView({
  summaryData,
  loadingSummary,
  selectedYear,
  setSelectedYear,
  selectedFacility,
  setSelectedFacility,
  fetchCarbonSummary,
}: ServiceSummaryViewProps) {
  const kpis = summaryData?.kpis as any;
  const totalEmissions = kpis?.totalEmissions || 0;
  const totalEntries = summaryData?.totalEntries || kpis?.totalInventoryEntries || 0;
  const facilitiesCount = summaryData?.availableFacilities?.length || kpis?.facilitiesCount || 0;
  const completeness = kpis?.dataCompletenessPercent || 100;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Real-time Sync
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            &middot; {totalEntries} entries &middot; {facilitiesCount} facilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-background border border-border text-xs font-semibold text-foreground pl-7 pr-7 py-1.5 rounded-lg cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Years</option>
              {summaryData?.availableYears?.map((yr) => (
                <option key={yr} value={yr}>Year {yr}</option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="appearance-none bg-background border border-border text-xs font-semibold text-foreground pl-7 pr-7 py-1.5 rounded-lg cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {summaryData?.availableFacilities?.map((fac) => (
                <option key={fac} value={fac === 'All Facilities' ? 'all' : fac}>{fac}</option>
              )) || <option value="all">All Facilities</option>}
            </select>
            <Building2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={fetchCarbonSummary}
            title="Refresh Real-time Data"
            className="p-2 bg-background hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Carbon Footprint</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </p>
            <p className="text-[11px] text-muted-foreground">tonne CO₂e</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Inventory Entries</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{totalEntries}</p>
            <p className="text-[11px] text-muted-foreground">Active entries logged</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Reporting Facilities</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{facilitiesCount}</p>
            <p className="text-[11px] text-muted-foreground">Active sites</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Data Quality Score</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{completeness}%</p>
            <p className="text-[11px] text-muted-foreground">GHG Protocol verified</p>
          </div>
        </div>
      </div>

      {loadingSummary && !summaryData ? (
        <div className="w-full h-64 flex flex-col items-center justify-center bg-card rounded-xl border border-border shadow-xs space-y-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Calculating real-time carbon summary...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SummaryChartsGrid summaryData={summaryData} />
          <SummaryCategoryBreakdown summaryData={summaryData} />
          <SummaryActivityTable summaryData={summaryData} />
        </div>
      )}
    </div>
  );
}

