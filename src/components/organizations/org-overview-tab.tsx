'use client';

import React from 'react';
import { Organization, EditOrganizationPayload } from '@/types/organizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building2,
  MapPin,
  Shield,
  Info,
  Save,
  X,
  Loader2,
} from 'lucide-react';

interface OrgOverviewTabProps {
  orgDetails: Organization;
  isEditing: boolean;
  isSubmitting: boolean;
  editForm: EditOrganizationPayload;
  setEditForm: React.Dispatch<React.SetStateAction<EditOrganizationPayload>>;
  onSave: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

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
        /* Edit Mode Form */
        <form onSubmit={onSave} className="space-y-6 max-w-4xl">
          <div className="bg-background rounded-xl border border-border p-6 space-y-6">
            <h3 className="text-base font-bold text-header-primary">Edit Organization Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Organization Name *
                </Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Organization Code *
                </Label>
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                  required
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Contact Email *
                </Label>
                <Input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                  required
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Email Domain
                </Label>
                <Input
                  value={editForm.emailDomain || ''}
                  onChange={(e) => setEditForm({ ...editForm, emailDomain: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Contact Phone
                </Label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Official Website
                </Label>
                <Input
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="kpi-label">
                  Street Address
                </Label>
                <Input
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  City
                </Label>
                <Input
                  value={editForm.city || ''}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  State / Province
                </Label>
                <Input
                  value={editForm.state || ''}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Country
                </Label>
                <Input
                  value={editForm.country || ''}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Postal Code
                </Label>
                <Input
                  value={editForm.postalCode || ''}
                  onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Tax / VAT ID
                </Label>
                <Input
                  value={editForm.taxId || ''}
                  onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Industry
                </Label>
                <Input
                  value={editForm.industry || ''}
                  onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="kpi-label">
                  Timezone
                </Label>
                <Input
                  value={editForm.timezone || ''}
                  onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Checkbox
                id="isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isActive: Boolean(checked) })
                }
              />
              <Label htmlFor="isActive" className="text-sm font-semibold text-header-primary">
                Organization Active
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="h-10 text-sm border-border"
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 text-sm bg-primary hover:bg-primary-300 text-primary-foreground font-bold px-5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
