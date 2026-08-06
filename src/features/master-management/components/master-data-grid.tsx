'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, Upload, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, EyeOff, Trash2, CheckSquare, Square, Search,
  ChevronLeft, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import { useFetchList } from '@/hooks/use-fetch-list';
import { API_LIST } from '@/lib/api/endpoints';
import { MasterItem, MASTER_ITEM_TYPES } from '@/types/master-management.types';
import { StatusBadge } from '@/components/ui/status-badge';
import { TypeBadge } from '@/components/ui/type-badge';
import { FilterBar } from '@/components/ui/filter-bar';
import { EmptyState, RowSkeleton } from '@/components/ui/page-layout';
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api/api-service';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// ─── Label helper ─────────────────────────────────────────────────────────────
function typeLabel(key: string): string {
  return MASTER_ITEM_TYPES.find((t) => t.value === key)?.label ?? key.replace(/_/g, ' ');
}

// ─── Column definitions ───────────────────────────────────────────────────────
function buildColumns(onRowClick: (item: MasterItem) => void): ColumnDef<MasterItem>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <button
          onClick={table.getToggleAllRowsSelectedHandler()}
          className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {table.getIsAllRowsSelected() ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); row.toggleSelected(); }}
          className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {row.getIsSelected() ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      ),
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
          {getValue<string>()}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue, row }) => (
        <button
          onClick={() => onRowClick(row.original)}
          className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
        >
          {getValue<string>()}
        </button>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <TypeBadge type={getValue<string>()} />,
      size: 120,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[260px]">
          {getValue<string>() || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue<boolean>() === false ? 'ARCHIVED' : 'PUBLISHED'} />
      ),
      size: 110,
    },
    {
      accessorKey: 'sortOrder',
      header: 'Order',
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums text-muted-foreground">{getValue<number>() ?? '—'}</span>
      ),
      size: 70,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); onRowClick(row.original); }}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      ),
      size: 48,
      enableSorting: false,
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MasterDataGridProps {
  typeKey: string;
  refreshKey: number;
  selectedItem: MasterItem | null;
  onRowClick: (item: MasterItem) => void;
  onCreateClick: () => void;
  onImportClick: () => void;
  onPaletteClick: () => void;
}

export function MasterDataGrid({
  typeKey,
  refreshKey,
  selectedItem,
  onRowClick,
  onCreateClick,
  onImportClick,
}: MasterDataGridProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const isEmissionFactor = typeKey === 'EMISSION_FACTOR';
  const endpoint = isEmissionFactor ? API_LIST.EMISSION_FACTORS_FILTER : API_LIST.MASTERS_ITEMS_FILTER;

  const {
    list,
    totalCount,
    isLoading,
    searchInput,
    setSearch,
    setAdditionalFilter,
    currentPage,
    pageSize,
    setPage,
    refetch,
  } = useFetchList<MasterItem>(endpoint, {
    additionalFilter: typeKey !== 'ALL' ? { type: typeKey } : {},
    limit: 50,
  });

  // Sync type filter when key changes
  React.useEffect(() => {
    setAdditionalFilter(typeKey !== 'ALL' ? { type: typeKey } : {});
    setRowSelection({});
  }, [typeKey, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = useMemo(() => buildColumns(onRowClick), [onRowClick]);

  const table = useReactTable({
    data: list,
    columns,
    state: { columnVisibility, rowSelection, sorting },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const title = typeLabel(typeKey);

  const handleExport = useCallback(async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(list.map((item) => ({
      code: item.code,
      name: item.name,
      type: item.type,
      description: item.description ?? '',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive !== false,
    })));
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${typeKey}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Exported', description: `${list.length} items exported.` });
  }, [list, title, typeKey]);

  const handleBulkDelete = useCallback(async () => {
    const ids = selectedRows.map((r) => r.original.id);
    try {
      await Promise.all(ids.map((id) => apiService.delete(API_LIST.MASTERS_ITEMS, id)));
      toast({ title: 'Deleted', description: `${ids.length} items removed.` });
      setRowSelection({});
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Bulk delete failed.', variant: 'destructive' });
    }
  }, [selectedRows, refetch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 border-b border-border space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalCount.toLocaleString()} items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button
              onClick={onImportClick}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={onCreateClick}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <FilterBar
          search={searchInput}
          onSearchChange={setSearch}
          searchPlaceholder={`Search ${title}…`}
          rightActions={
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors text-muted-foreground"
              >
                <Eye className="w-3.5 h-3.5" />
                Columns
              </button>
              <AnimatePresence>
                {showColumnMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-9 z-50 bg-card border border-border rounded-xl shadow-[var(--shadow-lg)] p-2 w-48 space-y-0.5"
                  >
                    {table.getAllLeafColumns().filter((c) => c.id !== 'select' && c.id !== 'actions').map((col) => (
                      <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.getIsVisible()}
                          onChange={col.getToggleVisibilityHandler()}
                          className="rounded"
                        />
                        <span className="text-xs font-medium text-foreground capitalize">
                          {col.id.replace(/_/g, ' ')}
                        </span>
                        {col.getIsVisible() ? (
                          <Eye className="w-3 h-3 ml-auto text-muted-foreground" />
                        ) : (
                          <EyeOff className="w-3 h-3 ml-auto text-muted-foreground" />
                        )}
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
        />

        {/* Bulk action bar */}
        <AnimatePresence>
          {selectedRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg overflow-hidden"
            >
              <span className="text-xs font-semibold text-primary">
                {selectedRows.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1 text-xs font-medium text-negative-600 hover:text-negative-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete selected
              </button>
              <button
                onClick={() => setRowSelection({})}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto scrollbar-custom" onClick={() => setShowColumnMenu(false)}>
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                    className={cn(
                      'px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none',
                      header.column.getCanSort() && 'cursor-pointer hover:text-foreground transition-colors'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-primary" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="w-3 h-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <RowSkeleton rows={10} cols={7} />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={Search}
                    title="No items found"
                    description={searchInput ? `No results for "${searchInput}". Try a different search.` : `No ${title} items yet. Add one to get started.`}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isActive = selectedItem?.id === row.original.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick(row.original)}
                    className={cn(
                      'group cursor-pointer transition-colors',
                      isActive
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-muted/40',
                      row.getIsSelected() && 'bg-primary/5'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
