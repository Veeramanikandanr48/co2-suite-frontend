import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Loader2, CheckCircle2, AlertCircle, Tag, Layers, History } from 'lucide-react';
import { MasterItem } from '@/types/master-management.types';

interface CreateColumnsProps {
  handleOpenEditModal: (item: MasterItem) => void;
  handleDelete: (id: string | number) => void;
  handleOpenHistoryModal?: (item: MasterItem) => void;
  isDeletingId: string | number | null;
}

export function createMasterItemColumns({
  handleOpenEditModal,
  handleDelete,
  handleOpenHistoryModal,
  isDeletingId,
}: CreateColumnsProps): ColumnDef<MasterItem>[] {
  return [
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      size: 90,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5 justify-center">
            {handleOpenHistoryModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenHistoryModal(item);
                }}
                title="View Revision History & Diffs"
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(item);
              }}
              title="Edit Master Item"
              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to deactivate master item "${item.name}"?`)) {
                  handleDelete(item.id);
                }
              }}
              disabled={isDeletingId === item.id}
              title="Deactivate Master Item"
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
      accessorKey: 'type',
      header: 'Master Type',
      cell: ({ row }) => {
        const type = row.original.type;
        let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        if (type === 'FUEL_TYPE') colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
        if (type === 'ACTIVITY_CATEGORY') colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
        if (type === 'UNIT') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (type === 'FACTOR_SOURCE') colorClass = 'bg-cyan-50 text-cyan-800 border-cyan-200';
        if (type === 'FACTOR_VERSION') colorClass = 'bg-teal-50 text-teal-800 border-teal-200';

        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${colorClass}`}>
            <Tag className="w-3 h-3" />
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Display Name',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-xs">
                {item.name}
              </span>
              {item.subType && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  item.subType === 'Gas' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.subType}
                </span>
              )}
            </div>
            {item.description && (
              <span className="text-[10px] text-slate-500 max-w-[240px] truncate">
                {item.description}
              </span>
            )}
            {item.allowedUnits && item.allowedUnits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.allowedUnits.map((u, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded text-[9px] font-medium">
                    {u}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'parent',
      header: 'Parent Mapping',
      cell: ({ row }) => {
        const item = row.original;
        const parentName = item.parent?.name;
        const scopeName = item.scope;

        return (
          <div className="flex items-center gap-1">
            {parentName ? (
              <>
                <Layers className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-slate-700 text-xs font-medium">
                  {parentName}
                </span>
              </>
            ) : scopeName ? (
              <>
                <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="text-slate-700 text-xs font-medium">
                  {scopeName}
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-xs italic">— Global —</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'serviceCode',
      header: 'Service',
      cell: ({ row }) => {
        const serviceCode = row.original.serviceCode || 'GLOBAL';
        const isGlobal = serviceCode === 'GLOBAL';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
            isGlobal ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {serviceCode}
          </span>
        );
      },
    },
    {
      accessorKey: 'sortOrder',
      header: 'Sort Order',
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs font-mono">
          {row.original.sortOrder ?? 0}
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
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${active
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
