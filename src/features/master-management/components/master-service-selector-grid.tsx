'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Package, Sparkles, ArrowRight, Search,
  ShieldCheck, Leaf, Factory, Zap, Building2, Flame, Clock,
} from 'lucide-react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { MASTER_SERVICES } from '@/types/master-management.types';
import { cn } from '@/lib/utils';

interface ServiceItem {
  code: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

interface MasterServiceSelectorGridProps {
  onSelectService: (serviceCode: string) => void;
}

const SERVICE_ICON_MAP: Record<string, React.ElementType> = {
  CARBON: Leaf,
  CBAM: ShieldCheck,
  PEF_TEXTILES: Package,
  LCA_PLASTICS: Factory,
  LCA_METALS: Flame,
  ESG: Building2,
  EPD_CABLES: Zap,
};

/** Only Carbon master data is currently available. */
const ACTIVE_SERVICE_CODE = 'CARBON';

export function MasterServiceSelectorGrid({ onSelectService }: MasterServiceSelectorGridProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const response = await apiService.get<any>(API_LIST.SERVICES, { limit: '100' });
        const fetchedList = response?.data?.listData ?? response?.data ?? response;
        if (Array.isArray(fetchedList) && fetchedList.length > 0) {
          const formattedList: ServiceItem[] = fetchedList.map((s: any) => ({
            code: s.code,
            name: s.name,
            description: s.description || `${s.name} Master Configuration Module`,
            category: s.category || 'Service Module',
            tags: s.tags || [s.category || 'Service'],
            isActive: s.isActive !== false,
          }));
          setServices(formattedList);
        } else {
          const fallbackList: ServiceItem[] = MASTER_SERVICES.map((s) => ({
            code: s.value,
            name: s.label,
            description: `Master data taxonomy and emission calculation rules for ${s.label}`,
            category: s.value.split('_')[0],
            tags: [s.value.split('_')[0]],
            isActive: true,
          }));
          setServices(fallbackList);
        }
      } catch {
        const fallbackList: ServiceItem[] = MASTER_SERVICES.map((s) => ({
          code: s.value,
          name: s.label,
          description: `Master data taxonomy and emission calculation rules for ${s.label}`,
          category: s.value.split('_')[0],
          tags: [s.value.split('_')[0]],
          isActive: true,
        }));
        setServices(fallbackList);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    services.forEach((s) => s.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || s.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [services, searchQuery, selectedTag]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 rounded-2xl">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">
              Master Data Hub
            </span>
            <span className="text-xs text-muted-foreground font-medium">Select a Service Domain</span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            Master Data Management by Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a service module below to enter its specific master data workspace. Currently, only{' '}
            <span className="font-semibold text-primary">Carbon</span> is available — other modules are coming soon.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service master modules…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border text-sm text-foreground pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {allTags.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedTag('all')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                selectedTag === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-card border border-border p-5 space-y-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="h-5 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-card border border-border rounded-2xl p-8">
          <Layers className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No service modules found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search query or tag filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service, i) => {
            const IconComponent = SERVICE_ICON_MAP[service.code] || Sparkles;
            const isActive = service.code === ACTIVE_SERVICE_CODE;

            return (
              <motion.div
                key={service.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                onClick={() => isActive && onSelectService(service.code)}
                className={cn(
                  'group relative bg-card border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm',
                  isActive
                    ? 'border-border hover:border-primary/40 cursor-pointer hover:shadow-md'
                    : 'border-border/50 cursor-not-allowed opacity-60'
                )}
              >
                {/* Coming Soon badge for non-active services */}
                {!isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center border transition-colors',
                      isActive
                        ? 'bg-muted text-foreground border-border group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary'
                        : 'bg-muted/50 text-muted-foreground border-border/50'
                    )}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                        Available
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-muted text-muted-foreground border-border">
                        {service.code}
                      </span>
                    )}
                  </div>

                  <h3 className={cn(
                    'text-base font-bold transition-colors',
                    isActive ? 'text-foreground group-hover:text-primary' : 'text-muted-foreground'
                  )}>
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className={cn(
                    'font-semibold transition-colors',
                    isActive ? 'text-muted-foreground group-hover:text-foreground' : 'text-muted-foreground/60'
                  )}>
                    {isActive ? 'Service Domain Workspace' : 'Under Development'}
                  </span>
                  {isActive && (
                    <div className="flex items-center gap-1 font-bold text-primary opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      <span>Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
