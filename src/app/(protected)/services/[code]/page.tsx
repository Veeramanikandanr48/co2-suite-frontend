'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Download,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { ServiceScopeItem } from '@/types/services';

export default function ServiceDetailPage() {
  const params = useParams();
  const rawCode = (params.code as string) || 'carbon';
  const code = rawCode.toLowerCase();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('Summary');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFacility, setSelectedFacility] = useState('Leeds Facility');

  // Dynamic scope items state from database
  const [scopeItems, setScopeItems] = useState<ServiceScopeItem[]>([]);
  const [loadingScopes, setLoadingScopes] = useState(true);
  const [openScopes, setOpenScopes] = useState<Record<string, boolean>>({});

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

      // Initialize all scopes as expanded by default
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

  useEffect(() => {
    fetchScopeItems();
  }, [fetchScopeItems]);

  // Group items by scope (e.g. Scope 1, Scope 2, Scope 3) dynamically
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

  // Dynamic scope count calculations for KPI metrics
  const scope1Items = groupedScopes['Scope 1'] || [];
  const scope2Items = groupedScopes['Scope 2'] || [];
  const scope3Items = groupedScopes['Scope 3'] || [];

  return (
    <div className="w-full h-full min-h-[calc(100vh-120px)] flex bg-[#F4F6F8] font-sans text-neutral-800 overflow-hidden rounded-xl border border-[#E6E8EB]">
      {/* ─── Inner Module Left Sidebar ───────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-[#E6E8EB] flex flex-col shrink-0 h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand header */}
        <div className="p-4 border-b border-[#E6E8EB] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00C9A7] flex items-center justify-center text-white font-bold text-[10px] shadow-xs shrink-0">
            DEMO
          </div>
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              MODULE
            </h2>
            <p className="text-xs font-bold text-neutral-800 truncate">
              {currentConfig.name}
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3.5 space-y-4 flex-1 text-xs font-medium">
          {/* START Section */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              START
            </p>
            <button
              onClick={() => setActiveTab('Summary')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors text-xs ${
                activeTab === 'Summary'
                  ? 'bg-[#ECFDF5] text-[#059669] font-bold border-l-4 border-[#059669]'
                  : 'text-neutral-600 hover:bg-[#F8F9FA]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#059669]" />
              Summary
            </button>
          </div>

          {/* CALCULATE Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              CALCULATE
            </p>

            {loadingScopes ? (
              <div className="flex items-center gap-2 text-neutral-400 py-3 px-1 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#059669]" />
                <span>Loading scopes from DB...</span>
              </div>
            ) : Object.keys(groupedScopes).length === 0 ? (
              <p className="text-[11px] text-neutral-400 italic">No scope items found in DB.</p>
            ) : (
              Object.entries(groupedScopes).map(([scopeName, items]) => {
                const isOpen = openScopes[scopeName] !== false;
                return (
                  <div key={scopeName} className="space-y-1">
                    <button
                      onClick={() => toggleScope(scopeName)}
                      className="w-full flex items-center justify-between text-neutral-700 py-0.5 text-xs font-semibold hover:text-[#059669] transition-colors"
                    >
                      <span>{scopeName}</span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="ml-2.5 pl-2 border-l border-[#E6E8EB] space-y-0.5 mt-0.5 text-[11px] text-neutral-500">
                        {items.map((item) => (
                          <p
                            key={item.id}
                            title={item.description || item.name}
                            className="hover:text-[#059669] cursor-pointer py-0.5 truncate transition-colors"
                          >
                            {item.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* ─── Right Content Area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Title Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-neutral-800 tracking-tight">
                Summary
              </h1>

              {/* Year selector */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-[#E6E8EB] text-xs font-bold text-neutral-700 px-3 py-1 pr-7 rounded-lg cursor-pointer hover:border-neutral-300 focus:outline-none"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-2 pointer-events-none" />
              </div>

              {/* Days Left pill badge */}
              <span className="bg-[#00C9A7] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                {currentConfig.daysLeft} Days Left
              </span>
            </div>
          </div>

          {/* Top 4 KPI Cards Grid dynamically reflecting DB scope structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Emissions (Gradient Teal Card) */}
            <div className="bg-gradient-to-br from-[#00C9A7] to-[#059669] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="text-[11px] font-extrabold opacity-90 text-center tracking-wider uppercase">
                  TOTAL EMISSIONS
                </p>
                <div className="text-center my-2">
                  <p className="text-4xl font-black tracking-tight">143.2</p>
                  <p className="text-[11px] font-medium opacity-80 mt-0.5">
                    tonne CO₂-e
                  </p>
                </div>
              </div>

              {/* Dynamic Scope Counts from Database */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center pt-2 border-t border-white/20">
                <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 1</p>
                  <p className="text-xs font-black">3/{scope1Items.length || 4}</p>
                </div>
                <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 2</p>
                  <p className="text-xs font-black">1/{scope2Items.length || 2}</p>
                </div>
                <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 3</p>
                  <p className="text-xs font-black">8/{scope3Items.length || 13}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Scope 1 */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider text-center">
                  SCOPE 1
                </p>
                <div className="text-center my-2">
                  <p className="text-3xl font-extrabold text-neutral-800">0.0</p>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    tonne CO₂-e ({scope1Items.length} categories)
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1">
                  <span>0.0%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00C9A7] w-[0%]" />
                </div>
              </div>
            </div>

            {/* Card 3: Scope 2 */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider text-center">
                  SCOPE 2
                </p>
                <div className="text-center my-2">
                  <p className="text-3xl font-extrabold text-neutral-800">0.0</p>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    tonne CO₂-e ({scope2Items.length} categories)
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1">
                  <span>0.0%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00C9A7] w-[0%]" />
                </div>
              </div>
            </div>

            {/* Card 4: Scope 3 */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider text-center">
                  SCOPE 3
                </p>
                <div className="text-center my-2">
                  <p className="text-3xl font-extrabold text-neutral-800">143.2</p>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    tonne CO₂-e ({scope3Items.length} categories)
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#059669] mb-1">
                  <span>100.0%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#059669] w-[100%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Latest Activities & Emissions Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Box: Latest Activities */}
            <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col min-h-[280px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="text-sm font-bold text-neutral-800">
                  Latest Activities
                </h3>
                <div className="relative">
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="appearance-none bg-white border border-[#E6E8EB] text-xs font-semibold text-neutral-600 px-3 py-1 pr-7 rounded-lg cursor-pointer hover:border-neutral-300"
                  >
                    <option value="Leeds Facility">Leeds Facility</option>
                    <option value="London HQ">London HQ</option>
                    <option value="Manchester Plant">Manchester Plant</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed font-medium">
                  No activities yet! Things from the past 7 days will show up
                  here soon.
                </p>
              </div>
            </div>

            {/* Right Box: Emissions Trend Chart */}
            <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col min-h-[280px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <h3 className="text-sm font-bold text-neutral-800">
                  Emissions Trend
                </h3>
                <div className="flex items-center gap-2.5">
                  <button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors">
                    <Download className="w-3 h-3" />
                    Download Chart
                  </button>

                  <div className="relative">
                    <select
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className="appearance-none bg-white border border-[#E6E8EB] text-xs font-semibold text-neutral-600 px-3 py-1 pr-7 rounded-lg cursor-pointer hover:border-neutral-300"
                    >
                      <option value="Leeds Facility">Leeds Facility</option>
                      <option value="London HQ">London HQ</option>
                      <option value="Manchester Plant">Manchester Plant</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="py-4 flex-1 flex flex-col justify-end">
                <div className="h-44 w-full flex items-end gap-6 px-4 border-b border-l border-[#E6E8EB] relative">
                  {/* Y-axis markers */}
                  <div className="absolute left-0 top-0 text-[10px] text-neutral-400 font-mono">
                    14000
                  </div>
                  <div className="absolute left-0 top-1/4 text-[10px] text-neutral-400 font-mono">
                    12000
                  </div>
                  <div className="absolute left-0 top-2/4 text-[10px] text-neutral-400 font-mono">
                    10000
                  </div>
                  <div className="absolute left-0 top-3/4 text-[10px] text-neutral-400 font-mono">
                    8000
                  </div>

                  {/* Chart Bar 1 (Light Blue Bar) */}
                  <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end pl-8">
                    <div className="w-10 bg-[#38BDF8] rounded-t-md h-[85%] group-hover:bg-[#0284C7] transition-all relative">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] py-0.5 px-2 rounded-md font-mono pointer-events-none whitespace-nowrap">
                        12,450 CO₂-e
                      </div>
                    </div>
                  </div>

                  {/* Chart Bar 2 (Deep Green Bar) */}
                  <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-10 bg-[#059669] rounded-t-md h-[40%] group-hover:bg-[#047857] transition-all relative">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] py-0.5 px-2 rounded-md font-mono pointer-events-none whitespace-nowrap">
                        5,800 CO₂-e
                      </div>
                    </div>
                  </div>

                  {/* Chart Bar 3 (Mint Bar) */}
                  <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-10 bg-[#A7F3D0] rounded-t-md h-[65%] group-hover:bg-[#34D399] transition-all relative">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] py-0.5 px-2 rounded-md font-mono pointer-events-none whitespace-nowrap">
                        9,200 CO₂-e
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
