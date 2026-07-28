'use client';

import React from 'react';
import SearchBar from '@/components/reusables/search-bar';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

export interface FacilityItem {
  id: number;
  organizationId: number;
  name: string;
  address?: string;
  countryCode?: string;
  postCode?: string;
  unLocode?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  createdOn?: string;
}

interface OrgFacilitiesTabProps {
  facilities: FacilityItem[];
  filteredFacilities: FacilityItem[];
  facilitiesLoading: boolean;
  facilitySearch: string;
  setFacilitySearch: (val: string) => void;
  canEdit: boolean;
  orgName: string;
  onOpenAddFacility: () => void;
  onOpenEditFacility: (fac: FacilityItem) => void;
  onDeleteFacilityConfirmOpen: (fac: FacilityItem) => void;
}

export function OrgFacilitiesTab({
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="section-title">Organization Facility Sites</h3>
          <p className="text-muted-xs mt-0.5">
            Manage operational plant locations, UN/LOCODEs, postcodes, and addresses for {orgName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search site, UN/LOCODE, address..."
            onSearch={setFacilitySearch}
            className="w-full sm:w-64 h-9 text-sm border-[#D9E5F2]"
          />
          {canEdit && (
            <Button
              onClick={onOpenAddFacility}
              className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 px-4 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Facility Site
            </Button>
          )}
        </div>
      </div>

      {/* Facility Cards Grid */}
      {facilitiesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 card-base">
          <div className="w-14 h-14 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
            <MapPin className="w-7 h-7 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-600 font-bold">No facility sites found</p>
          <p className="text-xs text-neutral-400">
            {facilitySearch ? 'Try adjusting your search query.' : 'Click "Add Facility Site" to create the first site.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="card-base p-5 hover:border-primary/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="section-title leading-snug">{fac.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">ID #{fac.id}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    {fac.unLocode || fac.countryCode || 'UK'}
                  </span>
                </div>

                {fac.address && (
                  <p className="text-xs text-neutral-600 flex items-start gap-1.5 pt-1 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{fac.address}</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Postcode</span>
                    <p className="font-mono font-semibold text-neutral-700 mt-0.5">{fac.postCode || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">UN/LOCODE</span>
                    <p className="font-mono font-semibold text-neutral-700 mt-0.5">{fac.unLocode || '—'}</p>
                  </div>
                </div>

                {(fac.latitude || fac.longitude) && (
                  <div className="text-[11px] text-neutral-400 font-mono pt-1">
                    Coordinates: {fac.latitude || '0'}, {fac.longitude || '0'}
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenEditFacility(fac)}
                    className="h-8 text-xs font-semibold gap-1 border-border hover:bg-background-inner"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteFacilityConfirmOpen(fac)}
                    className="h-8 text-xs font-semibold gap-1 border-negative-50 text-negative-500 hover:bg-negative-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
