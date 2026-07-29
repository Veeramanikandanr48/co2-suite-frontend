'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/lib/api-service';
import { ServiceScopeItem } from '@/types/services';
import { CarbonSummaryData } from '@/types/carbon-summary';
import { ServiceSidebar } from '@/components/services/service-sidebar';
import { Scope1CalculationView, Scope1CategoryType } from '@/components/services/scope1-calculation-view';
import { Scope2CalculationView, Scope2CategoryType } from '@/components/services/scope2-calculation-view';
import { Scope3CalculationView, Scope3CategoryType } from '@/components/services/scope3-calculation-view';
import { ServiceSummaryView } from './service-summary-view';

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
            <ServiceSummaryView
              summaryData={summaryData}
              loadingSummary={loadingSummary}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedFacility={selectedFacility}
              setSelectedFacility={setSelectedFacility}
              fetchCarbonSummary={fetchCarbonSummary}
              currentConfig={currentConfig}
              setActiveTab={setActiveTab}
              maxTrendTotal={maxTrendTotal}
            />
          )}
        </main>
      </div>
    </div>
  );
}
