'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Loader2, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { EmissionFactorItem } from '@/types/emission-factors';

interface CreateColumnsProps {
  handleOpenEditModal: (item: EmissionFactorItem) => void;
  handleDelete: (id: string | number) => void;
  isDeletingId: string | number | null;
}

export function createEmissionFactorColumns({
  handleOpenEditModal,
  handleDelete,
  isDeletingId,
}: CreateColumnsProps): ColumnDef<EmissionFactorItem>[] {
  return [
    {
      id: 'actions',
      header: 'Actions',
      size: 70,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5 justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(item);
              }}
              title="Edit Emission Factor"
              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${item.fuelOrGasType}"?`)) {
                  handleDelete(item.id);
                }
              }}
              disabled={isDeletingId === item.id}
              title="Delete Emission Factor"
              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
            >
              {isDeletingId === item.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'fuelOrGasType',
      header: 'Fuel / Gas / Activity',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-xs">
            {row.original.fuelOrGasType}
          </span>
          {row.original.subCategory && (
            <span className="text-[10px] text-slate-400">
              {row.original.subCategory}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'factor',
      header: 'Factor Value',
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600 text-xs">
          {row.original.factor}
        </span>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs font-mono">
          {row.original.unit || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'source',
      header: 'EF Source',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-700 text-xs font-medium">
            {row.original.source}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }) => (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
          {row.original.version || 'AR6'}
        </span>
      ),
    },
    {
      accessorKey: 'formula',
      header: 'Calculation Formula',
      cell: ({ row }) => (
        <span className="text-slate-500 text-[11px] font-mono italic max-w-[200px] truncate block">
          {row.original.formula || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.isActive !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
              active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {active ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> Active
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" /> Inactive
              </>
            )}
          </span>
        );
      },
    },
  ];
}
