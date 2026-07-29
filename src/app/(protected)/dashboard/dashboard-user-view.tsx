'use client';

import React from 'react';
import {
  Sparkles,
  Building2,
  CheckCircle2,
  MapPin,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { MainDashboardSummaryData } from '@/types/main-dashboard';

interface DashboardUserViewProps {
  summaryData: MainDashboardSummaryData | null;
  maxTrendTotal: number;
}

export function DashboardUserView({ summaryData, maxTrendTotal }: DashboardUserViewProps) {
  return (
    <>
      {/* Top 4 Organization KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Corporate Carbon Footprint */}
        <div className="bg-gradient-to-br from-[#00C9A7] via-[#059669] to-emerald-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between min-h-[165px] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black opacity-90 tracking-wider uppercase">
                ORGANIZATION FOOTPRINT
              </p>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                DB Logged
              </span>
            </div>
            <div className="my-2">
              <p className="text-4xl font-black tracking-tight">
                {summaryData?.kpis?.totalEmissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
              </p>
              <p className="text-[11px] font-medium opacity-80 mt-0.5">
                {summaryData?.unit || 'tonne CO₂-e'}
              </p>
            </div>
          </div>

          {/* Scope Breakdown Pills */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center pt-2 border-t border-white/20">
            <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
              <p className="opacity-80">Scope 1</p>
              <p className="text-xs font-black">{summaryData?.kpis?.scope1Percentage || 0}%</p>
            </div>
            <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
              <p className="opacity-80">Scope 2</p>
              <p className="text-xs font-black">{summaryData?.kpis?.scope2Percentage || 0}%</p>
            </div>
            <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
              <p className="opacity-80">Scope 3</p>
              <p className="text-xs font-black">{summaryData?.kpis?.scope3Percentage || 0}%</p>
            </div>
          </div>
        </div>

        {/* Card 2: Subscribed ESG Services */}
        <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-[#00C9A7] hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                SUBSCRIBED MODULES
              </p>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Sparkles className="w-4 h-4 text-[#00C9A7]" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl font-extrabold text-neutral-900">
                {summaryData?.kpis?.activeServicesCount || 0}
              </p>
              <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                Active Sustainability Solutions
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-neutral-500 font-bold">
            <span>Carbon, CBAM, PEF, LCA, ESG, EPD</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Card 3: Active Facility Sites */}
        <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-sky-300 hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                FACILITY SITES
              </p>
              <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl font-extrabold text-neutral-900">
                {summaryData?.kpis?.facilitiesCount || summaryData?.facilities?.length || 0}
              </p>
              <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                Operational Sites & Plants
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-sky-600 font-bold">
            <span>UK & EU Installations</span>
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Inventory Records & Data Health */}
        <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                CALCULATION LOGS
              </p>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl font-extrabold text-neutral-900">
                {summaryData?.kpis?.totalInventoryEntries || 0}
              </p>
              <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                Logged Activity Entries
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-emerald-600 mb-1">
              <span>Data Completeness</span>
              <span>{summaryData?.kpis?.dataCompletenessPercent || 100}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Facility Sites Operational Breakdown */}
      <div className="bg-white rounded-3xl border border-[#E6E8EB] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900">
                Organization Operational Facility Sites (Database)
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Facility site locations, UN/LOCODEs, postcodes, and carbon footprints.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
            {summaryData?.facilities?.length || 0} Configured Sites
          </span>
        </div>

        {summaryData?.facilities && summaryData.facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryData.facilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E6E8EB] hover:border-sky-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      <h4 className="text-xs font-black text-neutral-900 truncate" title={fac.name}>
                        {fac.name}
                      </h4>
                    </div>
                    <span className="text-[9px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md uppercase">
                      {fac.unLocode || fac.countryCode}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 font-medium mt-2 leading-relaxed flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{fac.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E6E8EB] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Postcode</span>
                    <p className="text-xs font-mono font-bold text-neutral-700">{fac.postCode}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Logged Footprint</span>
                    <p className="text-xs font-mono font-black text-[#00C9A7]">
                      {fac.totalEmissions?.toLocaleString() || 0} t CO₂-e
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-neutral-400">No facilities configured for this organization.</div>
        )}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00C9A7]" />
              <h3 className="text-sm font-bold text-neutral-900">
                Organization Monthly Emissions Trend (Reporting Year 2026)
              </h3>
            </div>
          </div>

          <div className="py-6 flex-1 flex flex-col justify-end">
            {summaryData?.emissionsTrend && summaryData.emissionsTrend.length > 0 ? (
              <div className="h-48 w-full flex items-end justify-around gap-4 px-4 border-b border-l border-[#E6E8EB] relative">
                {summaryData.emissionsTrend.map((item, idx) => {
                  const barHeightPercent = Math.max(8, Math.min(100, (item.total / maxTrendTotal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      <div
                        className="w-12 bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-600 cursor-pointer"
                        style={{ height: `${barHeightPercent}%` }}
                      />
                      <span className="text-[10px] font-bold text-neutral-500 truncate max-w-[70px]">
                        {item.period}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                <Activity className="w-8 h-8 text-neutral-300 mb-2" />
                <p className="text-xs font-semibold text-neutral-500">No trend entries recorded</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#00C9A7]" />
              <h3 className="text-sm font-bold text-neutral-900">Scope Share Breakdown</h3>
            </div>
          </div>

          <div className="py-2 space-y-4 flex-1 flex flex-col justify-start overflow-y-auto max-h-[230px] pr-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700">Scope 1 Direct</span>
                <span className="text-neutral-800">{summaryData?.kpis?.scope1Emissions || 0} t ({summaryData?.kpis?.scope1Percentage || 0}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, summaryData?.kpis?.scope1Percentage || 0)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-sky-700">Scope 2 Indirect Energy</span>
                <span className="text-neutral-800">{summaryData?.kpis?.scope2Emissions || 0} t ({summaryData?.kpis?.scope2Percentage || 0}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(100, summaryData?.kpis?.scope2Percentage || 0)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700">Scope 3 Value Chain</span>
                <span className="text-neutral-800">{summaryData?.kpis?.scope3Emissions || 0} t ({summaryData?.kpis?.scope3Percentage || 0}%)</span>
              </div>
              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, summaryData?.kpis?.scope3Percentage || 0)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
