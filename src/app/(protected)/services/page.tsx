'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Loader2, RefreshCw, Package, Search, X } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { Service, OrganizationService } from '@/types/services';
import { ListResponse } from '@/types/fetch';
import { ServiceCard } from '@/features/services/components/shared/service-card';
import { PageHeader } from '@/components/shared';
import { showErrorToast } from '@/components/shared/toast-variant';
import { Button } from '@/components/ui/button';

export default function ServicesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN;
  const orgId = user?.organizationId;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const fetchServices = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      if (isSuperAdmin) {
        const response = await apiService.get<ListResponse<Service>>(API_LIST.SERVICES, {
          limit: '100',
        });
        setServices(response?.data?.listData ?? []);
      } else if (orgId) {
        const response = await apiService.get<OrganizationService[]>(`organizations/${orgId}/services`);
        const orgData = (response as unknown as { data?: OrganizationService[] })?.data ?? (response as unknown as OrganizationService[]);
        if (Array.isArray(orgData)) {
          const activeSubscribedServices = orgData.filter((os) => os.isActive && os.service).map((os) => os.service);
          setServices(activeSubscribedServices);
        } else {
          setServices([]);
        }
      } else {
        setServices([]);
      }
    } catch (err: unknown) {
      showErrorToast((err as { message?: string })?.message ?? 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, orgId]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    services.forEach((s) => s.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || s.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [services, searchQuery, selectedTag]);

  if (loading) {
    return (
      <div className="page-container min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LayoutGrid className="w-8 h-8 text-primary/40" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-background rounded-full flex items-center justify-center shadow border border-border">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-foreground">Loading Services</p>
            <p className="text-muted-foreground mt-1">Fetching available modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="page-container"
    >
      <PageHeader
        icon={Package}
        title="CO2 Suite Services"
        description={
          isSuperAdmin
            ? `${services.length} module${services.length !== 1 ? 's' : ''} available in master catalog`
            : `${services.length} active module${services.length !== 1 ? 's' : ''} subscribed to your organization`
        }
        action={
          <Button variant="outline" size="sm" onClick={fetchServices}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border text-sm text-foreground pl-10 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        {allTags.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {searchQuery || selectedTag !== 'all' ? 'No services match your filters' : 'No services found'}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {searchQuery || selectedTag !== 'all'
              ? 'Try adjusting your search query or filter selection.'
              : isSuperAdmin
                ? 'Services will appear here once the backend seeds them on startup.'
                : 'No active services assigned to your organization. Please contact your Super Admin.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-medium mb-3">
            Showing {filteredServices.length} of {services.length} module{services.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <ServiceCard
                  service={service}
                  isSubscribed={!isSuperAdmin}
                  showControls={false}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
