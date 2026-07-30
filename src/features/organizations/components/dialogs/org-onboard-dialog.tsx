'use client';

import React from 'react';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Loader2,
} from 'lucide-react';
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
import { OnboardOrganizationPayload } from '@/types/organizations';
import { OrgOnboardDialogProps } from '@/types/components/organizations.types';

export function OrgOnboardDialog({
  isOnboardOpen,
  setIsOnboardOpen,
  onboardForm,
  setOnboardForm,
  isSubmitting,
  onOnboardSubmit,
}: OrgOnboardDialogProps) {
  return (
    <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">Onboard New Organization</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            Create organization records and provision initial Organization Administrator credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onOnboardSubmit} className="space-y-4 py-2 text-xs">
          {/* Organization Profile Section */}
          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-3">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5 border-b border-gray-200/60 pb-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Organization Profile
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Organization Name *</Label>
                <Input
                  placeholder="Acme Corporation"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Organization Code *</Label>
                <Input
                  placeholder="ACME"
                  value={onboardForm.code}
                  onChange={(e) => setOnboardForm({ ...onboardForm, code: e.target.value.toUpperCase() })}
                  required
                  className="h-8 text-xs uppercase bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Contact Email *</Label>
                <Input
                  type="email"
                  placeholder="contact@acme.com"
                  value={onboardForm.contactEmail}
                  onChange={(e) => setOnboardForm({ ...onboardForm, contactEmail: e.target.value })}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Email Domain (Optional)</Label>
                <Input
                  placeholder="acme.com"
                  value={onboardForm.emailDomain}
                  onChange={(e) => setOnboardForm({ ...onboardForm, emailDomain: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Admin Credentials Section */}
          <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
            <div className="font-semibold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200/60 pb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Initial Organization Administrator
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Admin Username *</Label>
                <Input
                  placeholder="acme_admin"
                  value={onboardForm.adminUserName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, adminUserName: e.target.value })}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Admin Email *</Label>
                <Input
                  type="email"
                  placeholder="admin@acme.com"
                  value={onboardForm.adminEmail}
                  onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                  required
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Admin Password *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={onboardForm.adminPassword}
                onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                required
                className="h-8 text-xs bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">First Name</Label>
                <Input
                  placeholder="Acme"
                  value={onboardForm.adminFirstName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, adminFirstName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Last Name</Label>
                <Input
                  placeholder="Admin"
                  value={onboardForm.adminLastName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, adminLastName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOnboardOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Onboarding...
                </>
              ) : (
                'Complete Onboarding'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
