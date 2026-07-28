'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { LayoutGrid, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { Service, OrganizationService } from '@/types/services';
import { ServiceCard } from '@/components/services/service-card';
import { showErrorToast } from '@/components/reusables/toast-variant';

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
        // Super Admin sees all master services in system catalog
        const response = await apiService.get<Service[]>(API_LIST.SERVICES);
        const data =
          (response as unknown as { data?: Service[] })?.data ??
          (response as unknown as Service[]);
        setServices(Array.isArray(data) ? data : []);
      } else if (orgId) {
        // Admin or User sees services assigned to their organization
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#1454CC]/10 border border-[#1454CC]/20 flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-[#1454CC]/40" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow border border-[#E6E8EB]">
            <Loader2 className="w-4 h-4 text-[#1454CC] animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-neutral-700">Loading Services</p>
          <p className="text-sm text-neutral-400 mt-1">Fetching available modules…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#F8F9FA] min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1454CC]/10 border border-[#1454CC]/15">
              <LayoutGrid className="w-5 h-5 text-[#1454CC]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">
                CageSuite Services
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isSuperAdmin
                  ? `${services.length} module${services.length !== 1 ? 's' : ''} available in master catalog`
                  : `${services.length} active module${services.length !== 1 ? 's' : ''} subscribed to your organization`}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchServices}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 px-3 py-2 rounded-lg border border-[#E6E8EB] bg-white hover:shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Grid */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-sm font-semibold text-neutral-500">No services found</p>
          <p className="text-xs text-neutral-400">
            {isSuperAdmin
              ? 'Services will appear here once the backend seeds them on startup.'
              : 'No active services assigned to your organization. Please contact your Super Admin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSubscribed={!isSuperAdmin}
              showControls={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
