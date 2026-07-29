'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Copy, Trash2, ArrowUpDown, Paperclip } from 'lucide-react';
import { InventoryItem, EditModalItem } from '@/types/inventory';
import { CreateInventoryColumnsParams } from '@/types/components/services.types';


export function createInventoryColumns({
  canEdit,
  setEditingItem,
  handleCopyItem,
  handleDeleteItem,
  setSorting,
}: CreateInventoryColumnsParams): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <button
          onClick={() => setSorting?.('id')}
          className="flex items-center gap-1 hover:text-neutral-900 transition-colors font-bold uppercase tracking-wider text-[11px]"
        >
          ID <ArrowUpDown className="w-3 h-3 ml-0.5 text-neutral-400" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-neutral-700">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          onClick={() => setSorting?.('name')}
          className="flex items-center gap-1 hover:text-neutral-900 transition-colors font-bold uppercase tracking-wider text-[11px]"
        >
          Activity Name <ArrowUpDown className="w-3 h-3 ml-0.5 text-neutral-400" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
          <span>{row.original.name || '—'}</span>
          {row.original.documentPath && (
            <span
              title="Proof Document Attached"
              className="p-1 bg-emerald-50 text-emerald-600 rounded"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount / Consumed',
      cell: ({ row }) => {
        const amt = row.original.amount;
        const unit = row.original.unit || '';
        return (
          <span className="font-semibold text-neutral-700">
            {amt !== undefined && amt !== null ? `${amt} ${unit}` : '—'}
          </span>
        );
      },
    },
    {
      accessorKey: 'ef',
      header: 'Emission Factor',
      cell: ({ row }) => {
        const ef = row.original.ef;
        const source = row.original.efSource || '';
        return (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-emerald-600">{ef ?? '—'}</span>
            <span className="text-[10px] text-neutral-400 font-medium">{source}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'emission',
      header: ({ column }) => (
        <button
          onClick={() => setSorting?.('emission')}
          className="flex items-center gap-1 hover:text-neutral-900 transition-colors font-bold uppercase tracking-wider text-[11px]"
        >
          CO₂e Emission <ArrowUpDown className="w-3 h-3 ml-0.5 text-neutral-400" />
        </button>
      ),
      cell: ({ row }) => {
        const em = row.original.emission;
        return (
          <span className="font-extrabold text-neutral-900">
            {em !== undefined && em !== null ? `${em} tCO₂e` : '0 tCO₂e'}
          </span>
        );
      },
    },
    {
      accessorKey: 'facility',
      header: 'Facility',
      cell: ({ row }) => (
        <span className="text-neutral-600 font-medium">{row.original.facility || 'Central HQ'}</span>
      ),
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.approvalStatus || row.original.status || 'Approved';
        const isApproved = status === 'Approved';
        const isPending = status === 'Pending Review' || status === 'Pending';
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
              isApproved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isPending
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        if (!canEdit) {
          return <span className="text-[10px] text-neutral-400 italic">Read-only</span>;
        }

        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingItem(item)}
              title="Edit Entry"
              className="p-1.5 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleCopyItem(item)}
              title="Duplicate Entry"
              className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteItem(Number(item.id))}
              title="Delete Entry"
              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];
}
