'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Loader2, RefreshCw, Package } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { Service, OrganizationService } from '@/types/services';
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

  const fetchServices = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      if (isSuperAdmin) {
        const response = await apiService.get<Service[]>(API_LIST.SERVICES);
        const data =
          (response as unknown as { data?: Service[] })?.data ??
          (response as unknown as Service[]);
        setServices(Array.isArray(data) ? data : []);
      } else if (orgId) {
        const response = await apiService.get<OrganizationService[]>(
          `organizations/${orgId}/services`,
        );
        const orgData =
          (response as unknown as { data?: OrganizationService[] })?.data ??
          (response as unknown as OrganizationService[]);
        if (Array.isArray(orgData)) {
          const activeSubscribedServices = orgData
            .filter((os) => os.isActive && os.service)
            .map((os) => os.service);
          setServices(activeSubscribedServices);
        } else {
          setServices([]);
        }
      } else {
        setServices([]);
      }
    } catch (err: unknown) {
      showErrorToast(
        (err as { message?: string })?.message ?? 'Failed to load services',
      );
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, orgId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
            <p className="text-muted-foreground mt-1">Fetching available modules…</p>
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

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">No services found</p>
          <p className="text-xs text-muted-foreground/60">
            {isSuperAdmin
              ? 'Services will appear here once the backend seeds them on startup.'
              : 'No active services assigned to your organization. Please contact your Super Admin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <ServiceCard
                service={service}
                isSubscribed={!isSuperAdmin}
                showControls={false}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
