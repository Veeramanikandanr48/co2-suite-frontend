'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Mail, CalendarDays } from 'lucide-react';
import { TableOrgUser } from '@/components/organizations/org-members-tab';
import {
  getOrgMonogram,
  getAvatarColors,
  formatDate,
  Badge,
  RoleBadge,
} from './org-detail-utils';

export function createOrgUserColumns(): ColumnDef<TableOrgUser>[] {
  return [
    {
      header: 'Member',
      accessorKey: 'firstName',
      size: 260,
      cell: ({ row }) => {
        const fullName = `${row.original.firstName} ${row.original.lastName || ''}`.trim();
        const colors = getAvatarColors(fullName);
        const initials = getOrgMonogram(fullName);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center text-xs font-bold shrink-0 select-none`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-700 truncate">{fullName}</p>
              <p className="text-[11px] text-neutral-400 font-mono truncate">
                @{row.original.userName}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Email',
      accessorKey: 'email',
      size: 240,
      cell: ({ row }) => (
        <span className="text-sm text-neutral-500 flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
          <span className="truncate">{row.original.email}</span>
        </span>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'roleId',
      size: 160,
      cell: ({ row }) => <RoleBadge roleId={row.original.roleId} />,
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      size: 110,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="active">Active</Badge>
        ) : (
          <Badge variant="inactive">Inactive</Badge>
        ),
    },
    {
      header: 'Joined',
      accessorKey: 'createdOn',
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm text-neutral-400 flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
          {formatDate(row.original.createdOn)}
        </span>
      ),
    },
  ];
}
