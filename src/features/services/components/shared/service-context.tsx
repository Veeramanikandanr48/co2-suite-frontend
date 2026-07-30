'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/lib/api/api-service';
import { ServiceScopeItem } from '@/types/services';
import { ServiceConfig, ServiceContextValue } from '@/types/components/services.types';

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function useServiceContext() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServiceContext must be used within ServiceProvider');
  return ctx;
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  carbon: { name: 'CO2 Suite Carbon', tag: 'Carbon', daysLeft: 2863 },
  cbam: { name: 'CO2 Suite CBAM', tag: 'CBAM', daysLeft: 1420 },
  pef_textiles: { name: 'CO2 Suite PEF', tag: 'Textiles & Apparels', daysLeft: 980 },
  lca_plastics: { name: 'CO2 Suite LCA', tag: 'Plastics', daysLeft: 1840 },
  lca_metals: { name: 'CO2 Suite LCA', tag: 'Metals', daysLeft: 2100 },
  esg: { name: 'CO2 Suite ESG', tag: 'ESG', daysLeft: 3120 },
  epd_cables: { name: 'CO2 Suite EPD', tag: 'Cables', daysLeft: 1650 },
};

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const rawCode = (params.code as string) || 'carbon';
  const code = rawCode.toLowerCase();

  const [scopeItems, setScopeItems] = useState<ServiceScopeItem[]>([]);
  const [loadingScopes, setLoadingScopes] = useState(true);
  const [openScopes, setOpenScopes] = useState<Record<string, boolean>>({});

  const currentConfig = SERVICE_CONFIGS[code] || {
    name: `CO2 Suite ${code.toUpperCase()}`,
    tag: code.toUpperCase(),
    daysLeft: 2863,
  };

  const fetchScopeItems = useCallback(async () => {
    try {
      setLoadingScopes(true);
      const response = await apiService.get<ServiceScopeItem[]>(`services/${code}/scopes`);
      const data = (response as any)?.data ?? response;
      const items = Array.isArray(data) ? data : [];
      setScopeItems(items);
      const initialOpenState: Record<string, boolean> = {};
      items.forEach((item) => { initialOpenState[item.scope] = true; });
      setOpenScopes(initialOpenState);
    } catch {
      setScopeItems([]);
    } finally {
      setLoadingScopes(false);
    }
  }, [code]);

  useEffect(() => { fetchScopeItems(); }, [fetchScopeItems]);

  const groupedScopes = useMemo(() => {
    const groups: Record<string, ServiceScopeItem[]> = {};
    for (const item of scopeItems) {
      if (!groups[item.scope]) groups[item.scope] = [];
      groups[item.scope].push(item);
    }
    return groups;
  }, [scopeItems]);

  const toggleScope = (scopeName: string) => {
    setOpenScopes((prev) => ({ ...prev, [scopeName]: prev[scopeName] !== undefined ? !prev[scopeName] : false }));
  };

  return (
    <ServiceContext.Provider value={{ code, currentConfig, scopeItems, loadingScopes, groupedScopes, openScopes, toggleScope }}>
      {children}
    </ServiceContext.Provider>
  );
}
