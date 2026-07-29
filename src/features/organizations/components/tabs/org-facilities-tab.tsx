'use client';

import React from 'react';
import { Building2, Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { FacilityItem } from '@/types/organizations';
import { OrgFacilitiesTabProps } from '@/types/components/organizations.types';

export type { FacilityItem };

export function OrgFacilitiesTab({
  facilities,
  filteredFacilities,
  facilitiesLoading,
  facilitySearch,
  setFacilitySearch,
  canEdit,
  orgName,
  onOpenAddFacility,
  onOpenEditFacility,
  onDeleteFacilityConfirmOpen,
}: OrgFacilitiesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={facilitySearch}
            onChange={(e) => setFacilitySearch(e.target.value)}
            className="w-full bg-background border border-border text-xs text-foreground pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        {canEdit && (
          <button
            onClick={onOpenAddFacility}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Facility
          </button>
        )}
      </div>

      {facilitiesLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs font-medium">Loading facilities…</span>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl text-center">
          <Building2 className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm font-semibold text-card-foreground">No Facilities Found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {facilitySearch ? 'No facilities matched your search.' : `No facilities configured for ${orgName}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-card-foreground">{fac.name}</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {fac.countryCode || 'FACILITY'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{fac.address || 'No address specified'}</p>
                {fac.unLocode && (
                  <p className="text-[11px] text-muted-foreground">
                    UN/LOCODE: <span className="font-semibold text-card-foreground">{fac.unLocode}</span>
                  </p>
                )}
              </div>

              {canEdit && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => onOpenEditFacility(fac)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                    title="Edit Facility"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteFacilityConfirmOpen(fac)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
