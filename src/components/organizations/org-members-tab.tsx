'use client';

import React from 'react';
import { UserPlus, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { ReusableTable } from '@/components/reusables/reusable-table';
import { OrgUser, TableOrgUser } from '@/types/organizations';

export type { OrgUser, TableOrgUser };

interface OrgMembersTabProps {
  userTableData: TableOrgUser[];
  userColumns: ColumnDef<TableOrgUser>[];
  userTotalCount: number;
  userIsLoadingMore: boolean;
  userHasMore: boolean;
  setUserSearch: (search: string) => void;
  userLoadMore: () => void;
  canEdit: boolean;
  onAddMemberOpen: () => void;
}

export function OrgMembersTab({
  userTableData,
  userColumns,
  userTotalCount,
  userIsLoadingMore,
  userHasMore,
  setUserSearch,
  userLoadMore,
  canEdit,
  onAddMemberOpen,
}: OrgMembersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full bg-background border border-border text-xs text-foreground pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        {canEdit && (
          <button
            onClick={onAddMemberOpen}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        )}
      </div>

      <ReusableTable
        data={userTableData}
        columns={userColumns}
        isLoadingMore={userIsLoadingMore}
        hasMore={userHasMore}
        handleLoadMore={userLoadMore}
      />
    </div>
  );
}
