'use client';

import React from 'react';
import { EditOrganizationPayload } from '@/types/organizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Loader2 } from 'lucide-react';
import { OrgOverviewEditFormProps } from '@/types/components/organizations.types';

export function OrgOverviewEditForm({
  editForm,
  setEditForm,
  isSubmitting,
  onSave,
  onCancelEdit,
}: OrgOverviewEditFormProps) {
  return (
    <form onSubmit={onSave} className="space-y-6 w-full">
      <div className="bg-background rounded-xl border border-border p-6 space-y-6">
        <h3 className="text-base font-bold text-header-primary">Edit Organization Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label className="kpi-label">Organization Name *</Label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Organization Code *</Label>
            <Input
              value={editForm.code}
              onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
              required
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Contact Email *</Label>
            <Input
              type="email"
              value={editForm.contactEmail}
              onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
              required
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Email Domain</Label>
            <Input
              value={editForm.emailDomain || ''}
              onChange={(e) => setEditForm({ ...editForm, emailDomain: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Contact Phone</Label>
            <Input
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Official Website</Label>
            <Input
              value={editForm.website || ''}
              onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="kpi-label">Street Address</Label>
            <Input
              value={editForm.address || ''}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">City</Label>
            <Input
              value={editForm.city || ''}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">State / Province</Label>
            <Input
              value={editForm.state || ''}
              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Country</Label>
            <Input
              value={editForm.country || ''}
              onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Postal Code</Label>
            <Input
              value={editForm.postalCode || ''}
              onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label className="kpi-label">Tax / VAT ID</Label>
            <Input
              value={editForm.taxId || ''}
              onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Industry</Label>
            <Input
              value={editForm.industry || ''}
              onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              className="h-10 text-sm border-input-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="kpi-label">Timezone</Label>
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
  );
}
