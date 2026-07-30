'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Trash2, Loader2 } from 'lucide-react';
import { FacilityItem } from '../tabs/org-facilities-tab';
import { FacilityFormState } from './org-dialogs';

interface FacilityDialogsProps {
  orgName: string;
  isAddFacilityOpen: boolean;
  setIsAddFacilityOpen: (open: boolean) => void;
  editingFacility: FacilityItem | null;
  facilityForm: FacilityFormState;
  setFacilityForm: React.Dispatch<React.SetStateAction<FacilityFormState>>;
  isSavingFacility: boolean;
  onSaveFacility: (e: React.FormEvent) => void;
  deletingFacility: FacilityItem | null;
  setDeletingFacility: (fac: FacilityItem | null) => void;
  onDeleteFacilityConfirm: () => void;
}

export function FacilityDialogs({
  orgName,
  isAddFacilityOpen,
  setIsAddFacilityOpen,
  editingFacility,
  facilityForm,
  setFacilityForm,
  isSavingFacility,
  onSaveFacility,
  deletingFacility,
  setDeletingFacility,
  onDeleteFacilityConfirm,
}: FacilityDialogsProps) {
  return (
    <>
      {/* Add / Edit Facility Dialog */}
      <Dialog open={isAddFacilityOpen} onOpenChange={setIsAddFacilityOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {editingFacility ? 'Edit Facility Site' : 'Add Facility Site'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure plant site details for <span className="font-semibold text-foreground">{orgName}</span>.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={onSaveFacility} className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Facility Site Name *
              </Label>
              <Input
                placeholder="e.g. Manchester Logistics Center"
                value={facilityForm.name}
                onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                required
                className="h-10 text-sm border-input-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Street Address
              </Label>
              <Input
                placeholder="100 Logistics Way, Wharf Rd"
                value={facilityForm.address}
                onChange={(e) => setFacilityForm({ ...facilityForm, address: e.target.value })}
                className="h-10 text-sm border-input-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Postcode
                </Label>
                <Input
                  placeholder="M1 1AA"
                  value={facilityForm.postCode}
                  onChange={(e) => setFacilityForm({ ...facilityForm, postCode: e.target.value })}
                  className="h-10 text-sm font-mono border-input-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  UN/LOCODE
                </Label>
                <Input
                  placeholder="GBMCR"
                  value={facilityForm.unLocode}
                  onChange={(e) => setFacilityForm({ ...facilityForm, unLocode: e.target.value })}
                  className="h-10 text-sm font-mono border-input-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="53.4808"
                  value={facilityForm.latitude}
                  onChange={(e) => setFacilityForm({ ...facilityForm, latitude: e.target.value })}
                  className="h-10 text-sm font-mono border-input-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="-2.2426"
                  value={facilityForm.longitude}
                  onChange={(e) => setFacilityForm({ ...facilityForm, longitude: e.target.value })}
                  className="h-10 text-sm font-mono border-input-border"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddFacilityOpen(false)}
                className="h-10 text-sm border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingFacility}
                className="h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
              >
                {isSavingFacility ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Saving Site…
                  </>
                ) : editingFacility ? (
                  'Save Facility Site'
                ) : (
                  'Add Facility Site'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Facility Confirmation Dialog */}
      <Dialog open={Boolean(deletingFacility)} onOpenChange={(open) => { if (!open) setDeletingFacility(null); }}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/10 flex items-center justify-center text-destructive">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Facility Site
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete facility site <strong className="text-foreground">{deletingFacility?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingFacility(null)}
              disabled={isSavingFacility}
              className="h-10 text-sm border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onDeleteFacilityConfirm}
              disabled={isSavingFacility}
              className="h-10 text-sm bg-negative-500 hover:bg-negative-500/90 text-primary-foreground font-semibold shadow-xs"
            >
              {isSavingFacility ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Deleting…
                </>
              ) : (
                'Delete Site'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
