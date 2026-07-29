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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MasterRole } from '@/types/enums';
import { AddMemberFormState } from './org-dialogs';

interface OrgAddMemberDialogProps {
  orgName: string;
  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  addMemberForm: AddMemberFormState;
  setAddMemberForm: React.Dispatch<React.SetStateAction<AddMemberFormState>>;
  isAddingMember: boolean;
  onAddMember: (e: React.FormEvent) => void;
}

export function OrgAddMemberDialog({
  orgName,
  isAddMemberOpen,
  setIsAddMemberOpen,
  addMemberForm,
  setAddMemberForm,
  isAddingMember,
  onAddMember,
}: OrgAddMemberDialogProps) {
  return (
    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-card-foreground">
            Add Team Member
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Invite a user to join <span className="font-semibold text-foreground">{orgName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onAddMember} className="space-y-3.5 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                First Name *
              </Label>
              <Input
                required
                placeholder="Jane"
                value={addMemberForm.firstName}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, firstName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Last Name
              </Label>
              <Input
                placeholder="Doe"
                value={addMemberForm.lastName}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, lastName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Username *
            </Label>
            <Input
              required
              placeholder="janedoe"
              value={addMemberForm.userName}
              onChange={(e) => setAddMemberForm({ ...addMemberForm, userName: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Email Address *
            </Label>
            <Input
              type="email"
              required
              placeholder="colleague@company.com"
              value={addMemberForm.email}
              onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Password *
            </Label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={addMemberForm.password}
              onChange={(e) => setAddMemberForm({ ...addMemberForm, password: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Role *
            </Label>
            <Select
              value={String(addMemberForm.roleId)}
              onValueChange={(val) => setAddMemberForm({ ...addMemberForm, roleId: Number(val) })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(MasterRole.ADMIN)}>Org Admin</SelectItem>
                <SelectItem value={String(MasterRole.USER)}>Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddMemberOpen(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingMember}
              className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
            >
              {isAddingMember ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
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
  );
}
