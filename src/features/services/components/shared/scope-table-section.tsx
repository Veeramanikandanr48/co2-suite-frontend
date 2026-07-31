'use client';

import React, { useMemo } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { ReusableTable } from '@/components/shared/table/reusable-table';
import { EditInventoryModal } from '@/features/services/components/shared/edit-inventory-modal';
import { createInventoryColumns } from '../shared/inventory-table-columns';
import { ScopeTableSectionProps } from '@/types/components/services.types';

export function ScopeTableSection({
  totalCount,
  isLoading,
  notRelevant,
  searchInput,
  setSearch,
  filterFacility,
  filterStatus,
  dbFacilities,
  handleFilterUpdate,
  setSelectedFacilityHeader,
  setSelectedYear,
  setAdditionalFilter,
  refetch,
  list,
  canEdit,
  editingItem,
  setEditingItem,
  handleCopyItem,
  handleDeleteItem,
  setSorting,
  isLoadingMore,
  hasMore,
  loadMore,
}: ScopeTableSectionProps) {
  const columns = useMemo(
    () =>
      createInventoryColumns({
        canEdit,
        setEditingItem,
        handleCopyItem,
        handleDeleteItem,
        setSorting,
      }),
    [canEdit, setEditingItem, handleCopyItem, handleDeleteItem, setSorting],
  );

  return (
    <>
      <div className={`bg-card border border-border rounded-xl p-5 shadow-xs space-y-4 ${notRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground tracking-wide">
              Inventory Table ({totalCount})
            </h2>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </div>

          <button
            onClick={() => {
              setSearch('');
              handleFilterUpdate({ facility: '', status: '', year: 'All Years' });
              setSelectedFacilityHeader('All Facilities');
              setSelectedYear('All Years');
              setAdditionalFilter({});
              refetch();
            }}
            className="px-4 py-2 bg-[#09152b] hover:bg-[#0f2347] text-white font-bold text-xs rounded-md shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchInput}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-card border border-border text-xs text-foreground pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchInput && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterFacility}
              onChange={(e) => handleFilterUpdate({ facility: e.target.value })}
              className="bg-card border border-border text-xs text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Facilities</option>
              {dbFacilities.map((fac: any) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => handleFilterUpdate({ status: e.target.value })}
              className="bg-card border border-border text-xs text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <ReusableTable
          data={list}
          columns={columns}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          handleLoadMore={loadMore}
          tableHeight="calc(100vh - 420px)"
        />
      </div>

      <EditInventoryModal
        open={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={refetch}
        dbFacilities={dbFacilities}
      />
    </>
  );
}
