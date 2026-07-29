'use client';

import React from 'react';
import { Organization, EditOrganizationPayload } from '@/types/organizations';
import {
  Building2,
  Shield,
  Info,
} from 'lucide-react';
import { OrgOverviewEditForm } from '../org-overview-edit-form';
import { OrgOverviewTabProps } from '@/types/components/organizations.types';

function SectionField({
  label,
  value,
  isHighlight = false,
}: {
  label: string;
  value?: string | null | number;
  isHighlight?: boolean;
}) {
  const display =
    value === null || value === undefined || value === '' ? '—' : String(value);
  const isEmpty = display === '—';
  return (
    <div className="flex flex-col gap-1">
      <span className="kpi-label">
        {label}
      </span>
      <span
        className={`text-sm ${
          isEmpty
            ? 'text-neutral-950 font-normal'
            : isHighlight
            ? 'text-primary font-bold'
            : 'text-header-primary font-bold'
        }`}
      >
        {display}
      </span>
    </div>
  );
}

export function OrgOverviewTab({
  orgDetails,
  isEditing,
  isSubmitting,
  editForm,
  setEditForm,
  onSave,
  onCancelEdit,
}: OrgOverviewTabProps) {
  const timezoneDisplay = orgDetails.timezone
    ? `${orgDetails.timezone} (Universal Coordinated Time)`
    : '—';

  return (
    <div className="p-8 max-w-[1400px]">
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Profile Card */}
            <div className="rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-primary/5 border border-primary/20 px-5 py-3 flex items-center gap-2 rounded-t-xl">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  GENERAL PROFILE
                </h4>
              </div>
              <div className="bg-background border border-border border-t-0 rounded-b-xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-7 gap-x-8">
                  <SectionField label="ORGANIZATION NAME" value={orgDetails.name} />
                  <SectionField label="ORGANIZATION CODE" value={orgDetails.code} />
                  <SectionField
                    label="CONTACT EMAIL"
                    value={orgDetails.contactEmail}
                    isHighlight
                  />
                  <SectionField label="EMAIL DOMAIN" value={orgDetails.emailDomain} />
                  <SectionField label="CONTACT PHONE" value={orgDetails.phone} />
                  <SectionField label="OFFICIAL WEBSITE" value={orgDetails.website} />
                </div>
              </div>
            </div>

            {/* Headquarters & Location Card */}
            <div className="rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-primary/5 border border-primary/20 px-5 py-3 flex items-center gap-2 rounded-t-xl">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  HEADQUARTERS & LOCATION
                </h4>
              </div>
              <div className="bg-background border border-border border-t-0 rounded-b-xl p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-7 gap-x-6">
                  <SectionField label="STREET ADDRESS" value={orgDetails.address} />
                  <SectionField label="CITY" value={orgDetails.city} />
                  <SectionField label="STATE / PROVINCE" value={orgDetails.state} />
                  <SectionField label="COUNTRY" value={orgDetails.country} />
                  <SectionField label="POSTAL / ZIP CODE" value={orgDetails.postalCode} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Span) */}
          <div className="lg:col-span-1">
            <div className="rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-primary/5 border border-primary/20 px-5 py-3 flex items-center gap-2 rounded-t-xl">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  COMPLIANCE
                </h4>
              </div>
              <div className="bg-background border border-border border-t-0 rounded-b-xl p-6 space-y-7">
                <SectionField label="TAX / VAT ID" value={orgDetails.taxId} />
                <SectionField label="PRIMARY INDUSTRY" value={orgDetails.industry} />
                <SectionField label="TIMEZONE" value={timezoneDisplay} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <OrgOverviewEditForm
          editForm={editForm}
          setEditForm={setEditForm}
          isSubmitting={isSubmitting}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
        />
      )}
    </div>
  );
}
