'use client';

import React from 'react';
import { Organization } from '@/types/organizations';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ArrowLeft,
  ChevronRight,
  Edit2,
  XCircle,
  Save,
  X,
  Loader2,
  Users,
  Mail,
  Globe,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { OrgHeaderProps } from '@/types/components/organizations.types';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getOrgMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function OrgHeader({
  orgDetails,
  userTotalCount,
  isSuperAdmin,
  canEdit,
  isEditing,
  isSubmitting,
  onEditToggle,
  onSave,
  onCancelEdit,
  onDeactivateOpen,
  onBack,
}: OrgHeaderProps) {
  const monogram = getOrgMonogram(orgDetails.name);

  return (
    <div className="bg-background border-b border-border px-8 pt-6 pb-0">
      {/* Breadcrumb */}
      {isSuperAdmin && (
        <div className="flex items-center gap-1.5 text-xs text-header-secondary mb-4">
          <button
            onClick={onBack}
            className="hover:text-primary transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            Organizations
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-header-primary font-semibold truncate max-w-[240px]">
            {orgDetails.name}
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          {isSuperAdmin && (
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 text-header-secondary hover:text-header-primary rounded-xl shrink-0 hidden sm:flex border-border hover:bg-background-inner"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          {/* Monogram Box */}
          <div className="w-13 h-13 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shrink-0 select-none shadow-xs">
            {monogram}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-header-primary tracking-tight leading-none">
                {orgDetails.name}
              </h1>
              {orgDetails.isActive ? (
                <span className="status-badge-positive">ACTIVE</span>
              ) : (
                <span className="status-badge-negative">INACTIVE</span>
              )}
            </div>

            {/* Metadata line */}
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-header-secondary font-medium">
              <span># {orgDetails.code}</span>
              <span className="text-neutral-300">|</span>
              <span>ID #{orgDetails.id}</span>
              {orgDetails.timezone && (
                <>
                  <span className="text-neutral-300">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-950" />
                    {orgDetails.timezone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                className="h-9 text-xs font-semibold gap-1.5 px-4 border-border text-header-secondary"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={isSubmitting}
                className="h-9 text-xs bg-primary hover:bg-primary-300 text-primary-foreground font-bold gap-1.5 px-4 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {isSuperAdmin && orgDetails.isActive && (
                <Button
                  onClick={onDeactivateOpen}
                  variant="outline"
                  className="h-9 text-xs font-semibold border-border text-header-secondary hover:bg-background-inner hover:text-header-primary gap-1.5 px-4 rounded-lg"
                >
                  <XCircle className="w-4 h-4 text-neutral-950" />
                  Deactivate
                </Button>
              )}
              {canEdit && (
                <Button
                  onClick={onEditToggle}
                  className="h-9 text-xs bg-primary hover:bg-primary-300 text-primary-foreground font-bold gap-1.5 px-5 rounded-lg shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 fill-current" />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-7 pb-6">
        {/* Total Members */}
        <div className="flex items-center gap-3.5">
          <div className="stat-icon-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-label">TOTAL MEMBERS</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="kpi-value">{userTotalCount}</span>
              <span className="text-xs text-header-secondary font-normal">Active users</span>
            </div>
          </div>
        </div>

        {/* Contact Email */}
        <div className="flex items-center gap-3.5">
          <div className="stat-icon-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="kpi-label">CONTACT EMAIL</p>
            <p className="text-sm font-bold text-header-primary truncate mt-0.5">
              {orgDetails.contactEmail || '—'}
            </p>
          </div>
        </div>

        {/* Email Domain */}
        <div className="flex items-center gap-3.5">
          <div className="stat-icon-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="kpi-label">EMAIL DOMAIN</p>
            <p className="text-base font-bold text-header-primary truncate mt-0.5">
              {orgDetails.emailDomain || '—'}
            </p>
          </div>
        </div>

        {/* Onboarded */}
        <div className="flex items-center gap-3.5">
          <div className="stat-icon-primary">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="kpi-label">ONBOARDED</p>
            <p className="text-sm font-bold text-header-primary truncate mt-0.5">
              {formatDate(orgDetails.createdOn)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
