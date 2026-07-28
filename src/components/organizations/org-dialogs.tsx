'use client';

import React from 'react';
import { MasterRole } from '@/enums/base-enum';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  UserPlus,
  MapPin,
  Trash2,
  Loader2,
} from 'lucide-react';
import { FacilityItem } from './org-facilities-tab';

export interface AddMemberFormState {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface FacilityFormState {
  name: string;
  address: string;
  countryCode: string;
  postCode: string;
  unLocode: string;
  latitude: string;
  longitude: string;
}

interface OrgDialogsProps {
  // Organization Deactivate Dialog
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
  isSubmitting: boolean;
  onDeactivate: () => void;
  orgName: string;

  // Add Member Dialog
  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  isAddingMember: boolean;
  addMemberForm: AddMemberFormState;
  setAddMemberForm: React.Dispatch<React.SetStateAction<AddMemberFormState>>;
  onAddMemberSubmit: (e: React.FormEvent) => void;

  // Add/Edit Facility Dialog
  isAddFacilityOpen: boolean;
  setIsAddFacilityOpen: (open: boolean) => void;
  editingFacility: FacilityItem | null;
  facilityForm: FacilityFormState;
  setFacilityForm: React.Dispatch<React.SetStateAction<FacilityFormState>>;
  isSavingFacility: boolean;
  onSaveFacility: (e: React.FormEvent) => void;

  // Delete Facility Dialog
  deletingFacility: FacilityItem | null;
  setDeletingFacility: (fac: FacilityItem | null) => void;
  onDeleteFacilityConfirm: () => void;
}

export function OrgDialogs({
  isDeleteOpen,
  setIsDeleteOpen,
  isSubmitting,
  onDeactivate,
  orgName,

  isAddMemberOpen,
  setIsAddMemberOpen,
  isAddingMember,
  addMemberForm,
  setAddMemberForm,
  onAddMemberSubmit,

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
}: OrgDialogsProps) {
  return (
    <>
      {/* Deactivate Organization Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-negative-50 border border-negative-50 flex items-center justify-center text-[#CC4529]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-800">
              Deactivate Organization
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500 leading-relaxed">
              Are you sure you want to deactivate <strong className="text-neutral-700">{orgName}</strong>? All members will immediately lose access to their portal accounts.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
              className="h-10 text-sm border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onDeactivate}
              disabled={isSubmitting}
              className="h-10 text-sm bg-negative-500 hover:bg-negative-500/90 text-primary-foreground font-semibold shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Deactivating…
                </>
              ) : (
                'Deactivate Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border bg-background-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-neutral-800">
                  Add New Organization Member
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400 mt-0.5">
                  Create a user account for <span className="font-semibold text-neutral-600">{orgName}</span>.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={onAddMemberSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  First Name *
                </Label>
                <Input
                  placeholder="John"
                  value={addMemberForm.firstName}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, firstName: e.target.value })}
                  required
                  className="h-10 text-sm border-input-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Last Name
                </Label>
                <Input
                  placeholder="Doe"
                  value={addMemberForm.lastName}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, lastName: e.target.value })}
                  className="h-10 text-sm border-input-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Username *
              </Label>
              <Input
                placeholder="johndoe"
                value={addMemberForm.userName}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, userName: e.target.value })}
                required
                className="h-10 text-sm border-input-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Email Address *
              </Label>
              <Input
                type="email"
                placeholder="john@organization.com"
                value={addMemberForm.email}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
                required
                className="h-10 text-sm border-input-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Temporary Password *
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={addMemberForm.password}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, password: e.target.value })}
                required
                className="h-10 text-sm border-input-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Role *
              </Label>
              <Select
                value={String(addMemberForm.roleId)}
                onValueChange={(val) => setAddMemberForm({ ...addMemberForm, roleId: Number(val) })}
              >
                <SelectTrigger className="h-10 text-sm border-input-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(MasterRole.ADMIN)}>Org Admin</SelectItem>
                  <SelectItem value={String(MasterRole.USER)}>Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
                className="h-10 text-sm border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingMember}
                className="h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
              >
                {isAddingMember ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Adding Member…
                  </>
                ) : (
                  'Add Member'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Facility Dialog */}
      <Dialog open={isAddFacilityOpen} onOpenChange={setIsAddFacilityOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border bg-background-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-neutral-800">
                  {editingFacility ? 'Edit Facility Site' : 'Add Facility Site'}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400 mt-0.5">
                  Configure plant site details for <span className="font-semibold text-neutral-600">{orgName}</span>.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={onSaveFacility} className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
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
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
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
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
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
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
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
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
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
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
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
            <div className="w-12 h-12 rounded-2xl bg-negative-50 border border-negative-50 flex items-center justify-center text-[#CC4529]">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-800">
              Delete Facility Site
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500 leading-relaxed">
              Are you sure you want to delete facility site <strong className="text-neutral-700">{deletingFacility?.name}</strong>? This action cannot be undone.
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


