'use client';

import React from 'react';
import { Service, OrganizationService } from '@/types/services';
import { ServiceCard } from '@/features/services/components/shared/service-card';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { OrgServicesTabProps } from '@/types/components/organizations.types';

export function OrgServicesTab({
  allServices,
  orgServices,
  subscribedServiceIds,
  servicesLoading,
  isSuperAdmin,
  assigningServiceId,
  removingServiceId,
  onRefresh,
  onAssignService,
  onRemoveService,
}: OrgServicesTabProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="section-title">CageSuite Services</h3>
          <p className="text-muted-xs mt-0.5">
            {isSuperAdmin
              ? 'Assign or remove modules for this organization'
              : 'Modules subscribed to this organization'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={onRefresh}
            disabled={servicesLoading}
            className="inline-flex items-center gap-2 text-xs font-semibold text-header-secondary hover:text-header-primary px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-background-inner hover:shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {servicesLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LayoutGrid className="w-3.5 h-3.5" />
            )}
            Refresh Modules
          </button>
        )}
      </div>

      {/* Loading state */}
      {servicesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : isSuperAdmin ? (
        /* Super Admin: show all master services with assign/remove controls */
        allServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 card-base">
            <div className="w-14 h-14 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
              <LayoutGrid className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-600 font-bold">No services available</p>
            <p className="text-xs text-neutral-400">Services will appear after the backend seeds them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSubscribed={subscribedServiceIds.has(service.id)}
                showControls
                isAssigning={assigningServiceId === service.id}
                isRemoving={removingServiceId === service.id}
                onAssign={onAssignService}
                onRemove={onRemoveService}
              />
            ))}
          </div>
        )
      ) : (
        /* Org Admin / User: read-only subscribed services */
        orgServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 card-base">
            <div className="w-14 h-14 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
              <LayoutGrid className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-600 font-bold">No services subscribed</p>
            <p className="text-xs text-neutral-400">Contact your Super Admin to enable modules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {orgServices.map((os) => (
              <ServiceCard
                key={os.id}
                service={os.service}
                isSubscribed
                showControls={false}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
