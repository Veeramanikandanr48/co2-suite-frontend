'use client';

import React from 'react';
import {
  Loader2,
  Building2,
  Calendar,
  RefreshCw,
  ChevronDown,
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
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            {summaryData?.totalEntries || 0} entries &middot; {summaryData?.availableFacilities?.length || 0} facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-muted border border-border text-xs font-bold text-foreground pl-7 pr-7 py-1.5 rounded-lg cursor-pointer hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Years</option>
              {summaryData?.availableYears?.map((yr) => (
                <option key={yr} value={yr}>Year {yr}</option>
              ))}
            </select>
            <Calendar className="w-3 h-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="appearance-none bg-muted border border-border text-xs font-bold text-foreground pl-7 pr-7 py-1.5 rounded-lg cursor-pointer hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {summaryData?.availableFacilities?.map((fac) => (
                <option key={fac} value={fac === 'All Facilities' ? 'all' : fac}>{fac}</option>
              )) || <option value="all">All Facilities</option>}
            </select>
            <Building2 className="w-3 h-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={fetchCarbonSummary}
            title="Refresh"
            className="p-1.5 bg-muted hover:bg-accent border border-border rounded-lg text-muted-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {loadingSummary && !summaryData ? (
        <div className="w-full h-64 flex flex-col items-center justify-center bg-card rounded-xl border border-border shadow-xs space-y-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Calculating carbon summary...</p>
        </div>
      ) : (
        <div className="space-y-5">
          <SummaryChartsGrid summaryData={summaryData} />
          <SummaryCategoryBreakdown summaryData={summaryData} />
          <SummaryActivityTable summaryData={summaryData} />
        </div>
      )}
    </div>
  );
}
