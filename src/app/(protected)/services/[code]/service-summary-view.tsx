'use client';

import React from 'react';
import {
  ChevronRight,
  Loader2,
  Building2,
  Calendar,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { CarbonSummaryData } from '@/types/carbon-summary';
import { SummaryChartsGrid } from './summary-charts-grid';
import { SummaryCategoryBreakdown } from './summary-category-breakdown';
import { SummaryActivityTable } from './summary-activity-table';

interface ServiceSummaryViewProps {
  summaryData: CarbonSummaryData | null;
  loadingSummary: boolean;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedFacility: string;
  setSelectedFacility: (fac: string) => void;
  fetchCarbonSummary: () => void;
  currentConfig: { name: string; tag: string; daysLeft: number };
  setActiveTab: (tab: string) => void;
  maxTrendTotal: number;
}

export function ServiceSummaryView({
  summaryData,
  loadingSummary,
  selectedYear,
  setSelectedYear,
  selectedFacility,
  setSelectedFacility,
  fetchCarbonSummary,
  currentConfig,
  setActiveTab,
  maxTrendTotal,
}: ServiceSummaryViewProps) {
  return (
    <>
      {/* Top Title & Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-foreground tracking-tight">
                Overall Carbon Summary
              </h1>
              <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live DB Data
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Calculated directly from database inventory entries & activity logs
            </p>
          </div>
        </div>

        {/* Filter Dropdowns & Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Year selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-muted border border-border text-xs font-bold text-foreground pl-8 pr-8 py-1.5 rounded-xl cursor-pointer hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Years</option>
              {summaryData?.availableYears?.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Facility selector */}
          <div className="relative">
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="appearance-none bg-muted border border-border text-xs font-bold text-foreground pl-8 pr-8 py-1.5 rounded-xl cursor-pointer hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {summaryData?.availableFacilities?.map((fac) => (
                <option key={fac} value={fac === 'All Facilities' ? 'all' : fac}>
                  {fac}
                </option>
              )) || <option value="all">All Facilities</option>}
            </select>
            <Building2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchCarbonSummary}
            title="Refresh Data from DB"
            className="p-1.5 bg-muted hover:bg-accent border border-border rounded-xl text-muted-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin text-primary' : ''}`} />
          </button>

          {/* Days Left badge */}
          <span className="bg-primary text-primary-foreground text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
            {currentConfig.daysLeft} Days Left
          </span>
        </div>
      </div>

      {/* Loader State overlay when fetching DB summary */}
      {loadingSummary && !summaryData ? (
        <div className="w-full h-64 flex flex-col items-center justify-center bg-card rounded-2xl border border-border shadow-xs p-6 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Calculating Carbon Summary from DB...</p>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards Grid strictly from DB Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Carbon Footprint (Gradient Teal Card) */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground shadow-md flex flex-col justify-between min-h-[165px] relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-background/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold opacity-90 tracking-wider uppercase">
                    TOTAL EMISSIONS
                  </p>
                  <span className="text-[10px] font-bold bg-background/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {summaryData?.totalEntries || 0} DB Entries
                  </span>
                </div>
                <div className="text-center my-2">
                  <p className="text-4xl font-black tracking-tight">
                    {summaryData?.kpis?.totalEmissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                  </p>
                  <p className="text-[11px] font-medium opacity-80 mt-0.5">
                    {summaryData?.unit || 'tonne CO₂-e'}
                  </p>
                </div>
              </div>

              {/* Scope Counts from Database */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center pt-2 border-t border-background/20">
                <div className="bg-background/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 1</p>
                  <p className="text-xs font-black">
                    {summaryData?.kpis?.scope1CategoryCount?.recorded || 0}/{summaryData?.kpis?.scope1CategoryCount?.total || 4}
                  </p>
                </div>
                <div className="bg-background/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 2</p>
                  <p className="text-xs font-black">
                    {summaryData?.kpis?.scope2CategoryCount?.recorded || 0}/{summaryData?.kpis?.scope2CategoryCount?.total || 2}
                  </p>
                </div>
                <div className="bg-background/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 3</p>
                  <p className="text-xs font-black">
                    {summaryData?.kpis?.scope3CategoryCount?.recorded || 0}/{summaryData?.kpis?.scope3CategoryCount?.total || 13}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Scope 1 (Direct Emissions) */}
            <div
              onClick={() => setActiveTab('Stationary Combustion')}
              className="bg-card hover:border-primary cursor-pointer transition-all rounded-2xl p-5 border border-border shadow-xs flex flex-col justify-between min-h-[165px] group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    SCOPE 1 DIRECT
                  </p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-center my-2">
                  <p className="text-3xl font-extrabold text-foreground">
                    {summaryData?.kpis?.scope1Emissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    tonne CO₂-e ({summaryData?.kpis?.scope1CategoryCount?.recorded || 0} active categories)
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <span>Share of Total</span>
                  <span>{summaryData?.kpis?.scope1Percentage || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, summaryData?.kpis?.scope1Percentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Scope 2 (Indirect Energy) */}
            <div
              onClick={() => setActiveTab('Purchased Electricity')}
              className="bg-card hover:border-sky-500 cursor-pointer transition-all rounded-2xl p-5 border border-border shadow-xs flex flex-col justify-between min-h-[165px] group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    SCOPE 2 INDIRECT
                  </p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-center my-2">
                  <p className="text-3xl font-extrabold text-foreground">
                    {summaryData?.kpis?.scope2Emissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    tonne CO₂-e ({summaryData?.kpis?.scope2CategoryCount?.recorded || 0} active categories)
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-sky-600 dark:text-sky-400 mb-1">
                  <span>Share of Total</span>
                  <span>{summaryData?.kpis?.scope2Percentage || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, summaryData?.kpis?.scope2Percentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Scope 3 (Supply Chain & Value Chain) */}
            <div
              onClick={() => setActiveTab('Purchased Goods and Services')}
              className="bg-card hover:border-emerald-600 cursor-pointer transition-all rounded-2xl p-5 border border-border shadow-xs flex flex-col justify-between min-h-[165px] group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    SCOPE 3 VALUE CHAIN
                  </p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-center my-2">
                  <p className="text-3xl font-extrabold text-foreground">
                    {summaryData?.kpis?.scope3Emissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    tonne CO₂-e ({summaryData?.kpis?.scope3CategoryCount?.recorded || 0} active categories)
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <span>Share of Total</span>
                  <span>{summaryData?.kpis?.scope3Percentage || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, summaryData?.kpis?.scope3Percentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Graphs & Charts Grid */}
          <SummaryChartsGrid summaryData={summaryData} maxTrendTotal={maxTrendTotal} />

          {/* Top Categories Breakdown Section */}
          <SummaryCategoryBreakdown summaryData={summaryData} />

          {/* Bottom Table: Latest Activity Logs (100% DB Data) */}
          <SummaryActivityTable summaryData={summaryData} />
        </>
      )}
    </>
  );
}
