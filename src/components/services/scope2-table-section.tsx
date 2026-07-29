'use client';

import React, { useMemo } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { ReusableTable } from '@/components/reusables/reusable-table';
import { EditInventoryModal, InventoryItem as EditModalItem } from '@/components/services/edit-inventory-modal';
import { Scope2TableSectionProps } from '@/types/components/services.types';
import { createInventoryColumns } from './inventory-table-columns';

export function Scope2TableSection({
  isElectricity,
  totalCount,
  isLoading,
  isNotRelevant,
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
}: Scope2TableSectionProps) {
  const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';

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
      <div className={`bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4 ${isNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-800 tracking-wide">
              Inventory Table ({totalCount})
            </h2>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchInput}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchInput && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterFacility}
              onChange={(e) => handleFilterUpdate({ facility: e.target.value })}
              className="bg-white border border-neutral-300 text-xs text-neutral-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Facilities</option>
              {dbFacilities.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => handleFilterUpdate({ status: e.target.value })}
              className="bg-white border border-neutral-300 text-xs text-neutral-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              handleFilterUpdate({ facility: '', status: '', year: 'All Years' });
              setSelectedFacilityHeader('All Facilities');
              setSelectedYear('All Years');
              setAdditionalFilter({ category: efCategory });
              refetch();
            }}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Clear Filters
          </button>
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
