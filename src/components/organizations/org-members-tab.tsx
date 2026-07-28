'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ReusableTable } from '@/components/reusables/reusable-table';
import SearchBar from '@/components/reusables/search-bar';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

export interface OrgUser {
  id: number;
  userName: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  roleId: number;
  isActive: boolean;
  createdOn?: string;
}

export interface TableOrgUser extends Omit<OrgUser, 'id'> {
  id: string;
  rawId: number;
}

interface OrgMembersTabProps {
  userTableData: TableOrgUser[];
  userColumns: ColumnDef<TableOrgUser>[];
  userTotalCount: number;
  userIsLoadingMore: boolean;
  userHasMore: boolean;
  setUserSearch: (query: string) => void;
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
    <div className="flex-1 flex flex-col min-h-0 p-6 pt-5">
      <div className="flex-1 flex flex-col min-h-0 card-base overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-border shrink-0 bg-background-inner/80">
          <div className="flex items-center gap-3">
            <div className="stat-icon-primary shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="section-title">Organization Members</h3>
              <p className="text-muted-xs mt-0.5">
                {userTotalCount} {userTotalCount === 1 ? 'user' : 'users'} in this organization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar
              placeholder="Search by name or email…"
              onSearch={setUserSearch}
              className="w-full sm:w-64 h-9 text-sm border-[#D9E5F2]"
            />
            {canEdit && (
              <Button
                onClick={onAddMemberOpen}
                className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 px-4 shrink-0 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ReusableTable<TableOrgUser>
            data={userTableData}
            columns={userColumns}
            isLoadingMore={userIsLoadingMore}
            hasMore={userHasMore}
            handleLoadMore={userLoadMore}
            tableHeight="100%"
            rowHeight="h-14"
          />
        </div>
      </div>
    </div>
  );
}
