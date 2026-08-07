'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { MasterItem } from '@/types/master-management.types';
import { Search, Plus, Download, Upload, Edit, Trash2, Tag, Layers, RefreshCw } from 'lucide-react';
import { MasterTypeSchemaResponse } from './dynamic-form-renderer';

interface DynamicGridContainerProps {
  typeCode: string;
  items: MasterItem[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
  onEdit: (item: MasterItem) => void;
  onDelete: (item: MasterItem) => void;
}

export function DynamicGridContainer({
  typeCode,
  items,
  loading,
  onRefresh,
  onCreateNew,
  onEdit,
  onDelete,
}: DynamicGridContainerProps) {
  const [schema, setSchema] = useState<MasterTypeSchemaResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadSchema() {
      try {
        const endpoint = API_LIST.MASTERS_TYPE_SCHEMA.replace(':code', typeCode);
        const res = await apiService.get<MasterTypeSchemaResponse>(endpoint);
        setSchema(res?.data || res);
      } catch {
        // fallback
      }
    }
    if (typeCode) {
      loadSchema();
    }
  }, [typeCode]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = schema?.gridSchema?.columns || [
    { field: 'code', headerName: 'Code', width: 140 },
    { field: 'name', headerName: 'Name', width: 220 },
    { field: 'description', headerName: 'Description', width: 280 },
    { field: 'status', headerName: 'Status', width: 120, type: 'badge' },
    { field: 'updatedAt', headerName: 'Last Updated', width: 160, type: 'date' },
  ];

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${schema?.name || typeCode}...`}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="DEPRECATED">Deprecated</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-1.5 border border-border rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCreateNew}
            className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New {schema?.name || typeCode}</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto scrollbar-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-xs text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span>Fetching master items...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Layers className="w-8 h-8 stroke-1 text-muted-foreground/50 mb-2" />
            <p className="text-xs font-medium">No master items found for {typeCode}</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">Try clearing your filters or create a new entry.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-muted/60 border-b border-border z-10">
              <tr>
                {columns.map((col: any) => (
                  <th key={col.field} className="px-3.5 py-2.5 font-semibold text-muted-foreground select-none">
                    {col.headerName}
                  </th>
                ))}
                <th className="px-3.5 py-2.5 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors group">
                  {columns.map((col: any) => {
                    const val = (item as any)[col.field];

                    if (col.type === 'badge') {
                      return (
                        <td key={col.field} className="px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {item.status || 'PUBLISHED'}
                          </span>
                        </td>
                      );
                    }

                    if (col.type === 'date') {
                      return (
                        <td key={col.field} className="px-3.5 py-2.5 text-muted-foreground font-mono text-[11px]">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                        </td>
                      );
                    }

                    return (
                      <td key={col.field} className="px-3.5 py-2.5 font-medium text-foreground">
                        {col.field === 'code' ? (
                          <span className="font-mono text-primary font-bold">{val}</span>
                        ) : (
                          val || '-'
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit Master Item"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        title="Delete Master Item"
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-3.5 py-2 border-t border-border bg-muted/10 text-[11px] text-muted-foreground">
        <span>Showing {filteredItems.length} of {items.length} items</span>
        <span className="font-mono">Type: {typeCode}</span>
      </div>
    </div>
  );
}
