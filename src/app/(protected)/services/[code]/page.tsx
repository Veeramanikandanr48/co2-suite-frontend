'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Download,
  Loader2,
  BarChart3,
  PieChart,
  Building2,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Layers,
  Activity,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { ServiceScopeItem } from '@/types/services';
import { CarbonSummaryData } from '@/types/carbon-summary';
import { ServiceSidebar } from '@/components/services/service-sidebar';
import { Scope1CalculationView, Scope1CategoryType } from '@/components/services/scope1-calculation-view';
import { Scope2CalculationView, Scope2CategoryType } from '@/components/services/scope2-calculation-view';
import { Scope3CalculationView, Scope3CategoryType } from '@/components/services/scope3-calculation-view';

const SCOPE_1_CATEGORIES = [
  'Stationary Combustion',
  'Mobile Combustion',
  'Fugitive Emissions',
  'Process Emissions',
];

const SCOPE_2_CATEGORIES = [
  'Purchased Electricity',
  'Purchased Heating & Steam',
  'Purchased Heating & Cooling',
];

const SCOPE_3_CATEGORIES = [
  'Purchased Goods and Services',
  'Capital Goods',
  'Energy and Fuel Related Activities',
  'Upstream Transportation',
  'Waste Generated in Operations',
  'Business Travel',
  'Employee Commuting',
  'Downstream Transportation',
  'Processing of Sold Products',
  'Use of Sold Products',
  'EOL Treatment of Sold Products',
  'Franchise',
  'Investments',
];

export default function ServiceDetailPage() {
  const params = useParams();
  const rawCode = (params.code as string) || 'carbon';
  const code = rawCode.toLowerCase();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('Summary');

  // Filter state for summary
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  // Dynamic scope items state from database
  const [scopeItems, setScopeItems] = useState<ServiceScopeItem[]>([]);
  const [loadingScopes, setLoadingScopes] = useState(true);
  const [openScopes, setOpenScopes] = useState<Record<string, boolean>>({});

  // Dynamic Carbon Summary state from DB API
  const [summaryData, setSummaryData] = useState<CarbonSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Service configuration mapping
  const serviceConfig: Record<
    string,
    { name: string; tag: string; daysLeft: number }
  > = {
    carbon: { name: 'CageSuite Carbon', tag: 'Carbon', daysLeft: 2863 },
    cbam: { name: 'CageSuite CBAM', tag: 'CBAM', daysLeft: 1420 },
    pef_textiles: { name: 'CageSuite PEF', tag: 'Textiles & Apparels', daysLeft: 980 },
    lca_plastics: { name: 'CageSuite LCA', tag: 'Plastics', daysLeft: 1840 },
    lca_metals: { name: 'CageSuite LCA', tag: 'Metals', daysLeft: 2100 },
    esg: { name: 'CageSuite ESG', tag: 'ESG', daysLeft: 3120 },
    epd_cables: { name: 'CageSuite EPD', tag: 'Cables', daysLeft: 1650 },
  };

  const currentConfig = serviceConfig[code] || {
    name: `CageSuite ${code.toUpperCase()}`,
    tag: code.toUpperCase(),
    daysLeft: 2863,
  };

  // Fetch scope items dynamically from DB API
  const fetchScopeItems = useCallback(async () => {
    try {
      setLoadingScopes(true);
      const response = await apiService.get<ServiceScopeItem[]>(`services/${code}/scopes`);
      const data = (response as any)?.data ?? response;
      const items = Array.isArray(data) ? data : [];
      setScopeItems(items);

      const initialOpenState: Record<string, boolean> = {};
      items.forEach((item) => {
        initialOpenState[item.scope] = true;
      });
      setOpenScopes(initialOpenState);
    } catch (error) {
      console.error('Failed to fetch service scope items from DB:', error);
      setScopeItems([]);
    } finally {
      setLoadingScopes(false);
    }
  }, [code]);

  // Fetch dynamic Carbon Summary from DB API
  const fetchCarbonSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const params: Record<string, string> = {};
      if (selectedYear && selectedYear !== 'all') params.year = selectedYear;
      if (selectedFacility && selectedFacility !== 'all') params.facility = selectedFacility;

      const response = await apiService.getCarbonSummary<CarbonSummaryData>(code, params);
      const data = (response as any)?.data ?? response;
      if (data && typeof data === 'object') {
        setSummaryData(data);
      }
    } catch (error) {
      console.error('Failed to fetch carbon summary from DB API:', error);
      setSummaryData(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [code, selectedYear, selectedFacility]);

  useEffect(() => {
    fetchScopeItems();
  }, [fetchScopeItems]);

  useEffect(() => {
    if (activeTab === 'Summary') {
      fetchCarbonSummary();
    }
  }, [activeTab, fetchCarbonSummary]);

  // Group scope items dynamically
  const groupedScopes = useMemo(() => {
    const groups: Record<string, ServiceScopeItem[]> = {};
    for (const item of scopeItems) {
      if (!groups[item.scope]) {
        groups[item.scope] = [];
      }
      groups[item.scope].push(item);
    }
    return groups;
  }, [scopeItems]);

  const toggleScope = (scopeName: string) => {
    setOpenScopes((prev) => ({
      ...prev,
      [scopeName]: prev[scopeName] !== undefined ? !prev[scopeName] : false,
    }));
  };

  // Helper for trend bar max height scaling
  const maxTrendTotal = useMemo(() => {
    if (!summaryData?.emissionsTrend || summaryData.emissionsTrend.length === 0) return 100;
    return Math.max(...summaryData.emissionsTrend.map((t) => t.total || 0), 10);
  }, [summaryData]);

  return (
    <div className="w-full h-full min-h-[calc(100vh-120px)] flex bg-[#F4F6F8] font-sans text-neutral-800 overflow-hidden rounded-xl border border-[#E6E8EB]">
      {/* ─── Inner Module Left Sidebar ───────────────────────────────────── */}
      <ServiceSidebar
        currentConfig={currentConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loadingScopes={loadingScopes}
        groupedScopes={groupedScopes}
        openScopes={openScopes}
        toggleScope={toggleScope}
      />

      {/* ─── Right Content Area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {SCOPE_1_CATEGORIES.includes(activeTab) ? (
            <Scope1CalculationView key={activeTab} category={activeTab as Scope1CategoryType} />
          ) : SCOPE_2_CATEGORIES.includes(activeTab) ? (
            <Scope2CalculationView key={activeTab} category={activeTab as Scope2CategoryType} />
          ) : SCOPE_3_CATEGORIES.includes(activeTab) ? (
            <Scope3CalculationView key={activeTab} category={activeTab as Scope3CategoryType} />
          ) : (
            <>
              {/* Top Title & Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E6E8EB] shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00C9A7]/10 rounded-xl text-[#00C9A7]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-extrabold text-neutral-800 tracking-tight">
                        Overall Carbon Summary
                      </h1>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live DB Data
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-medium">
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
                      className="appearance-none bg-[#F8FAFC] border border-[#E6E8EB] text-xs font-bold text-neutral-700 pl-8 pr-8 py-1.5 rounded-xl cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
                    >
                      <option value="all">All Years</option>
                      {summaryData?.availableYears?.map((yr) => (
                        <option key={yr} value={yr}>
                          Year {yr}
                        </option>
                      ))}
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Facility selector */}
                  <div className="relative">
                    <select
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className="appearance-none bg-[#F8FAFC] border border-[#E6E8EB] text-xs font-bold text-neutral-700 pl-8 pr-8 py-1.5 rounded-xl cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
                    >
                      {summaryData?.availableFacilities?.map((fac) => (
                        <option key={fac} value={fac === 'All Facilities' ? 'all' : fac}>
                          {fac}
                        </option>
                      )) || <option value="all">All Facilities</option>}
                    </select>
                    <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchCarbonSummary}
                    title="Refresh Data from DB"
                    className="p-1.5 bg-[#F8FAFC] hover:bg-neutral-100 border border-[#E6E8EB] rounded-xl text-neutral-600 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin text-[#00C9A7]' : ''}`} />
                  </button>

                  {/* Days Left badge */}
                  <span className="bg-[#00C9A7] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                    {currentConfig.daysLeft} Days Left
                  </span>
                </div>
              </div>

              {/* Loader State overlay when fetching DB summary */}
              {loadingSummary && !summaryData ? (
                <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E6E8EB] shadow-xs p-6 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#00C9A7] animate-spin" />
                  <p className="text-xs font-bold text-neutral-600">Calculating Carbon Summary from DB...</p>
                </div>
              ) : (
                <>
                  {/* Top 4 KPI Cards Grid strictly from DB Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Carbon Footprint (Gradient Teal Card) */}
                    <div className="bg-gradient-to-br from-[#00C9A7] to-[#059669] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between min-h-[165px] relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-extrabold opacity-90 tracking-wider uppercase">
                            TOTAL EMISSIONS
                          </p>
                          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
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
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center pt-2 border-t border-white/20">
                        <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                          <p className="opacity-80">Scope 1</p>
                          <p className="text-xs font-black">
                            {summaryData?.kpis?.scope1CategoryCount?.recorded || 0}/{summaryData?.kpis?.scope1CategoryCount?.total || 4}
                          </p>
                        </div>
                        <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                          <p className="opacity-80">Scope 2</p>
                          <p className="text-xs font-black">
                            {summaryData?.kpis?.scope2CategoryCount?.recorded || 0}/{summaryData?.kpis?.scope2CategoryCount?.total || 2}
                          </p>
                        </div>
                        <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
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
                      className="bg-white hover:border-[#00C9A7] cursor-pointer transition-all rounded-2xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">
                            SCOPE 1 DIRECT
                          </p>
                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-[#00C9A7] transition-colors" />
                        </div>
                        <div className="text-center my-2">
                          <p className="text-3xl font-extrabold text-neutral-800">
                            {summaryData?.kpis?.scope1Emissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-medium">
                            tonne CO₂-e ({summaryData?.kpis?.scope1CategoryCount?.recorded || 0} active categories)
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-amber-600 mb-1">
                          <span>Share of Total</span>
                          <span>{summaryData?.kpis?.scope1Percentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
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
                      className="bg-white hover:border-sky-500 cursor-pointer transition-all rounded-2xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-extrabold text-sky-600 uppercase tracking-wider">
                            SCOPE 2 INDIRECT
                          </p>
                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-sky-500 transition-colors" />
                        </div>
                        <div className="text-center my-2">
                          <p className="text-3xl font-extrabold text-neutral-800">
                            {summaryData?.kpis?.scope2Emissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-medium">
                            tonne CO₂-e ({summaryData?.kpis?.scope2CategoryCount?.recorded || 0} active categories)
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-sky-600 mb-1">
                          <span>Share of Total</span>
                          <span>{summaryData?.kpis?.scope2Percentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
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
                      className="bg-white hover:border-emerald-600 cursor-pointer transition-all rounded-2xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">
                            SCOPE 3 VALUE CHAIN
                          </p>
                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <div className="text-center my-2">
                          <p className="text-3xl font-extrabold text-neutral-800">
                            {summaryData?.kpis?.scope3Emissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-medium">
                            tonne CO₂-e ({summaryData?.kpis?.scope3CategoryCount?.recorded || 0} active categories)
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-emerald-600 mb-1">
                          <span>Share of Total</span>
                          <span>{summaryData?.kpis?.scope3Percentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, summaryData?.kpis?.scope3Percentage || 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Graphs & Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Graph 1: Dynamic Monthly / Period Emissions Trend Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-[#00C9A7]" />
                          <h3 className="text-sm font-bold text-neutral-800">
                            Emissions Trend & Monthly Breakdown (DB Data)
                          </h3>
                        </div>

                        {/* Chart Legend */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span>Scope 1</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                            <span>Scope 2</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            <span>Scope 3</span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Bar Chart Visualization driven 100% by DB */}
                      <div className="py-6 flex-1 flex flex-col justify-end">
                        {summaryData?.emissionsTrend && summaryData.emissionsTrend.length > 0 ? (
                          <div className="h-48 w-full flex items-end justify-around gap-4 px-4 border-b border-l border-[#E6E8EB] relative">
                            {summaryData.emissionsTrend.map((item, idx) => {
                              const barHeightPercent = Math.max(8, Math.min(100, (item.total / maxTrendTotal) * 100));
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                                  {/* Tooltip on hover */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] p-2 rounded-lg font-mono pointer-events-none whitespace-nowrap z-20 shadow-lg border border-neutral-700">
                                    <p className="font-bold border-b border-neutral-700 pb-1 mb-1">{item.period}</p>
                                    <p className="text-amber-400">Scope 1: {item.scope1} t</p>
                                    <p className="text-sky-400">Scope 2: {item.scope2} t</p>
                                    <p className="text-emerald-400">Scope 3: {item.scope3} t</p>
                                    <p className="font-extrabold text-white pt-1 border-t border-neutral-700">Total: {item.total} t CO₂-e</p>
                                  </div>

                                  {/* Stacked / Proportional Bar */}
                                  <div
                                    className="w-12 bg-neutral-100 rounded-t-lg overflow-hidden flex flex-col justify-end group-hover:ring-2 group-hover:ring-[#00C9A7]/50 transition-all cursor-pointer"
                                    style={{ height: `${barHeightPercent}%` }}
                                  >
                                    {item.scope3 > 0 && (
                                      <div
                                        className="bg-emerald-600 w-full transition-all"
                                        style={{ height: `${(item.scope3 / item.total) * 100}%` }}
                                      />
                                    )}
                                    {item.scope2 > 0 && (
                                      <div
                                        className="bg-sky-500 w-full transition-all"
                                        style={{ height: `${(item.scope2 / item.total) * 100}%` }}
                                      />
                                    )}
                                    {item.scope1 > 0 && (
                                      <div
                                        className="bg-amber-500 w-full transition-all"
                                        style={{ height: `${(item.scope1 / item.total) * 100}%` }}
                                      />
                                    )}
                                  </div>

                                  {/* Period Label */}
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
                            <p className="text-xs font-semibold text-neutral-500">No trend data found in database</p>
                            <p className="text-[11px] text-neutral-400">Add inventory entries to render carbon trend charts.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Graph 2: Facility Emissions Footprint Breakdown (DB Data) */}
                    <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-500" />
                          <h3 className="text-sm font-bold text-neutral-800">
                            Emissions by Facility Site
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          DB Sites ({summaryData?.emissionsByFacility?.length || 0})
                        </span>
                      </div>

                      <div className="py-3 flex-1 flex flex-col justify-start space-y-3.5 overflow-y-auto max-h-[220px] pr-1">
                        {summaryData?.emissionsByFacility && summaryData.emissionsByFacility.length > 0 ? (
                          summaryData.emissionsByFacility.map((fac, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                                <span className="truncate max-w-[160px]" title={fac.facility}>
                                  {fac.facility}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-neutral-900">{fac.emission} t</span>
                                  <span className="text-[10px] text-neutral-400">({fac.percentage}%)</span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-sky-400 to-[#00C9A7] rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, fac.percentage)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <Building2 className="w-6 h-6 text-neutral-300 mb-1" />
                            <p className="text-xs text-neutral-400 font-medium">No facility emissions logged yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Categories Breakdown Section */}
                  <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-neutral-800">
                          Emissions Breakdown by Activity Category (Database)
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500">
                        {summaryData?.emissionsByCategory?.length || 0} Active Categories
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {summaryData?.emissionsByCategory && summaryData.emissionsByCategory.length > 0 ? (
                        summaryData.emissionsByCategory.map((cat, idx) => {
                          const isScope1 = cat.scope === 'Scope 1';
                          const isScope2 = cat.scope === 'Scope 2';
                          return (
                            <div
                              key={idx}
                              className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E6E8EB] hover:border-neutral-300 transition-all flex flex-col justify-between space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                    isScope1
                                      ? 'bg-amber-100 text-amber-800'
                                      : isScope2
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {cat.scope}
                                </span>
                                <span className="text-xs font-black text-neutral-800">{cat.emission} t CO₂-e</span>
                              </div>

                              <div>
                                <p className="text-xs font-bold text-neutral-800 truncate" title={cat.category}>
                                  {cat.category}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-medium">
                                  {cat.count} entry record{cat.count > 1 ? 's' : ''} ({cat.percentage}% of total)
                                </p>
                              </div>

                              <div className="w-full h-1.5 bg-[#E6E8EB] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isScope1 ? 'bg-amber-500' : isScope2 ? 'bg-sky-500' : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-6 text-center text-xs text-neutral-400">
                          No category data recorded in database.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Table: Latest Activity Logs (100% DB Data) */}
                  <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#00C9A7]" />
                        <h3 className="text-sm font-bold text-neutral-800">
                          Latest Inventory Entry Activities (Database Logs)
                        </h3>
                      </div>
                      <span className="bg-neutral-100 text-neutral-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                        Showing Top {summaryData?.latestActivities?.length || 0} Entries
                      </span>
                    </div>

                    {summaryData?.latestActivities && summaryData.latestActivities.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[#E6E8EB] bg-[#F8FAFC] text-neutral-500 font-extrabold uppercase text-[10px] tracking-wider">
                              <th className="py-2.5 px-3">Fuel / Activity Name</th>
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-3">Facility</th>
                              <th className="py-2.5 px-3 text-right">Amount</th>
                              <th className="py-2.5 px-3">Emission Factor</th>
                              <th className="py-2.5 px-3 text-right">Emissions (t CO₂-e)</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F2F5]">
                            {summaryData.latestActivities.map((act) => (
                              <tr key={act.id} className="hover:bg-neutral-50/80 transition-colors">
                                <td className="py-3 px-3 font-bold text-neutral-800 flex items-center gap-1.5">
                                  <span>{act.name}</span>
                                </td>
                                <td className="py-3 px-3 text-neutral-600 font-medium">{act.category}</td>
                                <td className="py-3 px-3 text-neutral-600 font-medium">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-neutral-400" />
                                    <span>{act.facility}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-neutral-800">
                                  {act.amount?.toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">{act.unit}</span>
                                </td>
                                <td className="py-3 px-3 text-neutral-500 text-[11px]">
                                  <span className="font-mono">{act.ef}</span>{' '}
                                  <span className="text-[10px] text-neutral-400">({act.efSource || 'Default'})</span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-extrabold text-[#00C9A7]">
                                  {act.emission?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      act.status?.toLowerCase() === 'approved' || act.status?.toLowerCase() === 'completed'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    {act.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-10 text-center space-y-2">
                        <Activity className="w-8 h-8 text-neutral-300 mx-auto" />
                        <p className="text-xs text-neutral-500 font-medium">No inventory entries logged in database yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
