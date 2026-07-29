'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AddMemberFormState, FacilityFormState } from '@/types/organizations';
import { FacilityDialogs } from './facility-dialogs';
import { OrgAddMemberDialog } from './org-add-member-dialog';

export type { AddMemberFormState, FacilityFormState };
import { OrgDialogsProps } from '@/types/components/organizations.types';

export function OrgDialogs({
  orgName,
  isDeleteOpen,
  setIsDeleteOpen,
  isSubmitting,
  onDeactivate,
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
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">
              Deactivate Organization
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-1">
              Are you sure you want to deactivate <strong>{orgName}</strong>? All members under this organization will lose access to its services.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onDeactivate}
              disabled={isSubmitting}
              className="h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Deactivating…
                </>
              ) : (
                'Deactivate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <OrgAddMemberDialog
        orgName={orgName}
        isAddMemberOpen={isAddMemberOpen}
        setIsAddMemberOpen={setIsAddMemberOpen}
        addMemberForm={addMemberForm}
        setAddMemberForm={setAddMemberForm}
        isAddingMember={isAddingMember}
        onAddMember={onAddMemberSubmit}
      />

      {/* Facility Dialogs */}
      <FacilityDialogs
        orgName={orgName}
        isAddFacilityOpen={isAddFacilityOpen}
        setIsAddFacilityOpen={setIsAddFacilityOpen}
        editingFacility={editingFacility}
        facilityForm={facilityForm}
        setFacilityForm={setFacilityForm}
        isSavingFacility={isSavingFacility}
        onSaveFacility={onSaveFacility}
        deletingFacility={deletingFacility}
        setDeletingFacility={setDeletingFacility}
        onDeleteFacilityConfirm={onDeleteFacilityConfirm}
      />
    </>
  );
}
