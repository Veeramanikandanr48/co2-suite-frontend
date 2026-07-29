'use client';

import React, { useState, useMemo } from 'react';
import {
  Database,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileSpreadsheet,
  Globe,
  Calculator,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useFetchList } from '@/hooks/use-fetchlist';
import { ReusableTable } from '@/components/reusables/reusable-table';
import { API_LIST } from '@/lib/api-list';
import { apiService } from '@/lib/api-service';
import { toast } from '@/hooks/use-toast';

export interface EmissionFactorItem {
  id: string;
  category: string;
  source: string;
  version?: string;
  fuelOrGasType: string;
  unit?: string;
  factor: number;
  formula?: string;
  isActive?: boolean;
  createdOn?: string;
}

const CATEGORY_OPTIONS = [
  'Stationary Combustion',
  'Mobile Combustion',
  'Fugitive Emissions',
  'Process Emissions',
  'Purchased Electricity',
  'Purchased Heating & Steam',
  'Purchased Goods and Services',
  'Capital Goods',
  'Energy and Fuel Related Activities',
  'Upstream Transportation',
  'Waste Generated in Operations',
  'Business Travel',
  'Employee Commuting',
  'Downstream Transportation',
  'Processing of Sold Products',
  'Use of Sold Products',
  'EOL Treatment of Sold Products',
  'Franchise',
  'Investments',
];

const CATEGORY_VARIABLE_MAP: Record<string, { name: string; color: string }[]> = {
  'Stationary Combustion': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Mobile Combustion': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Fugitive Emissions': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'leakage', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  ],
  'Process Emissions': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Purchased Electricity': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Purchased Heating & Steam': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Purchased Goods and Services': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Capital Goods': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Energy and Fuel Related Activities': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Upstream Transportation': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Downstream Transportation': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Waste Generated in Operations': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Business Travel': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { name: 'people', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { name: 'rooms', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
    { name: 'nights', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
  ],
  'Employee Commuting': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { name: 'people', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  ],
  'Processing of Sold Products': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Use of Sold Products': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'EOL Treatment of Sold Products': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Franchise': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Investments': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'scope1', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
    { name: 'scope2', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
    { name: 'equityShare', color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
  ],
};

export function EmissionFactorsView() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmissionFactorItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<{
    category: string;
    source: string;
    version: string;
    fuelOrGasType: string;
    unit: string;
    factor: string;
    formula: string;
    isActive: boolean;
  }>({
    category: 'Stationary Combustion',
    source: 'DEFRA',
    version: '2024',
    fuelOrGasType: '',
    unit: 'kg CO2e',
    factor: '',
    formula: '(amount * factor) / 1000',
    isActive: true,
  });

  // Insert field token or operator into formula
  const handleInsertToken = (token: string) => {
    setFormData((prev) => {
      const current = prev.formula || '';
      const needsSpace = current.length > 0 && !current.endsWith(' ') && !current.endsWith('(');
      const updated = needsSpace ? `${current} ${token}` : `${current}${token}`;
      return { ...prev, formula: updated };
    });
  };

  // Live Formula Evaluation Preview for Formula Builder
  const formulaPreview = useMemo(() => {
    const formula = formData.formula;
    if (!formula || !formula.trim()) return null;
    try {
      const factorNum = Number(formData.factor) || 1.942;
      let expr = formula.toLowerCase().trim();
      expr = expr.replace(/\bamount\b/g, '100');
      expr = expr.replace(/\bfactor\b/g, String(factorNum));
      expr = expr.replace(/\bef\b/g, String(factorNum));
      expr = expr.replace(/\bdistance\b/g, '500');
      expr = expr.replace(/\bpeople\b/g, '2');
      expr = expr.replace(/\brooms\b/g, '1');
      expr = expr.replace(/\bnights\b/g, '3');
      expr = expr.replace(/\bleakage\b/g, '5');
      expr = expr.replace(/\bscope1\b/g, '50');
      expr = expr.replace(/\bscope2\b/g, '30');
      expr = expr.replace(/\bequityshare\b/g, '25');

      if (!/^[0-9\s\+\-\*\/\(\)\.]+$/.test(expr)) {
        return { valid: false, message: 'Contains unrecognized variable or symbol' };
      }
      const result = new Function(`"use strict"; return (${expr})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return { valid: true, value: Number(result.toFixed(4)) };
      }
    } catch (e) {
      return { valid: false, message: 'Syntax error in formula expression' };
    }
    return null;
  }, [formData.formula, formData.factor]);

  // Filters for useFetchList
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSource, setFilterSource] = useState('');

  // Server-side paginated & filtered list hook
  const {
    list,
    totalCount,
    isLoadingMore,
    hasMore,
    searchInput,
    setSearch,
    setAdditionalFilter,
    loadMore,
    refetch,
  } = useFetchList<EmissionFactorItem>(API_LIST.EMISSION_FACTORS_FILTER, {
    limit: 15,
  });

  // Formatted list ensuring id is string for ReusableTable
  const formattedList = useMemo<EmissionFactorItem[]>(() => {
    return list.map((item) => ({
      ...item,
      id: String(item.id),
    }));
  }, [list]);

  // Calculate summary metrics from list
  const metrics = useMemo(() => {
    const categoriesSet = new Set(formattedList.map((item) => item.category).filter(Boolean));
    const sourcesSet = new Set(formattedList.map((item) => item.source).filter(Boolean));
    const activeCount = formattedList.filter((item) => item.isActive !== false).length;
    return {
      total: totalCount || formattedList.length,
      active: activeCount,
      categoriesCount: categoriesSet.size,
      sourcesCount: sourcesSet.size,
    };
  }, [formattedList, totalCount]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      category: 'Stationary Combustion',
      source: 'DEFRA',
      version: '2024',
      fuelOrGasType: '',
      unit: 'kg CO2e',
      factor: '',
      formula: '(amount * factor) / 1000',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: EmissionFactorItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Stationary Combustion',
      source: item.source || '',
      version: item.version || '',
      fuelOrGasType: item.fuelOrGasType || '',
      unit: item.unit || '',
      factor: String(item.factor || ''),
      formula: item.formula || '',
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.fuelOrGasType || !formData.source || !formData.factor) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Category, Fuel/Gas Type, Source, Factor)',
        variant: 'destructive',
      });
      return;
    }

    const factorNum = Number(formData.factor);
    if (isNaN(factorNum) || factorNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid positive number for emission factor',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        category: formData.category,
        source: formData.source,
        version: formData.version,
        fuelOrGasType: formData.fuelOrGasType,
        unit: formData.unit,
        factor: factorNum,
        formula: formData.formula,
        isActive: formData.isActive,
      };

      if (editingItem) {
        await apiService.put(API_LIST.EMISSION_FACTORS, editingItem.id, payload);
        toast({
          title: 'Success',
          description: 'Emission factor updated successfully',
        });
      } else {
        await apiService.post(API_LIST.EMISSION_FACTORS, payload);
        toast({
          title: 'Success',
          description: 'New emission factor created successfully',
        });
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error('Failed to save emission factor:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to save emission factor',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Emission Factor
  const handleDelete = async (id: string) => {
    try {
      setIsDeletingId(id);
      await apiService.delete(API_LIST.EMISSION_FACTORS, id);
      toast({
        title: 'Success',
        description: 'Emission factor deleted successfully',
      });
      refetch();
    } catch (err: any) {
      console.error('Failed to delete emission factor:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to delete emission factor',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Table Columns Definition
  const columns = useMemo<ColumnDef<EmissionFactorItem>[]>(() => [
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
              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
      header: 'Category / Scope',
      size: 180,
      cell: ({ row }) => (
        <span className="font-semibold text-neutral-800 text-xs">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'fuelOrGasType',
      header: 'Fuel / Gas / Item',
      size: 160,
      cell: ({ row }) => (
        <span className="font-medium text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
          {row.original.fuelOrGasType}
        </span>
      ),
    },
    {
      accessorKey: 'factor',
      header: 'Factor Value',
      size: 110,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-neutral-900 text-xs">
          {Number(row.original.factor).toLocaleString('en-US', { maximumFractionDigits: 6 })}
        </span>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      size: 110,
      cell: ({ row }) => (
        <span className="text-neutral-600 text-xs">
          {row.original.unit || 'kg CO2e'}
        </span>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Database Source',
      size: 130,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-slate-700 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">
          <Globe className="w-3 h-3 text-slate-500" />
          {row.original.source}
        </span>
      ),
    },
    {
      accessorKey: 'version',
      header: 'Version / Year',
      size: 100,
      cell: ({ row }) => (
        <span className="text-neutral-500 text-xs">
          {row.original.version || 'Default'}
        </span>
      ),
    },
    {
      accessorKey: 'formula',
      header: 'Calculation Formula',
      size: 170,
      cell: ({ row }) => (
        <code className="text-[11px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
          {row.original.formula || '(amount * factor) / 1000'}
        </code>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      size: 90,
      cell: ({ row }) => {
        const isActive = row.original.isActive !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
          >
            {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {isActive ? 'Active' : 'Disabled'}
          </span>
        );
      },
    },
  ], [isDeletingId]);

  return (
    <div className="p-4 space-y-3.5 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-slate-900 to-navy-950 p-4 rounded-xl text-white shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">
              Emission Factors Management
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Configure global emission factors, conversion rates, fuel types, and calculation formulas used dynamically across GHG Scope 1, Scope 2, and Scope 3 services.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-md transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Emission Factor
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.total}</div>
            <div className="text-[11px] font-medium text-neutral-500">Total Emission Factors</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.active}</div>
            <div className="text-[11px] font-medium text-neutral-500">Active Factors</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.categoriesCount}</div>
            <div className="text-[11px] font-medium text-neutral-500">Categories Covered</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{metrics.sourcesCount}</div>
            <div className="text-[11px] font-medium text-neutral-500">DB Sources (DEFRA/IPCC)</div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs space-y-3">
        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search category, fuel, source..."
                value={searchInput}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-xs text-neutral-700 pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
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

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setFilterCategory(cat);
                setAdditionalFilter({ category: cat, source: filterSource });
              }}
              className="bg-white border border-neutral-200 text-xs text-neutral-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories / Scopes</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => {
                const src = e.target.value;
                setFilterSource(src);
                setAdditionalFilter({ category: filterCategory, source: src });
              }}
              className="bg-white border border-neutral-200 text-xs text-neutral-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Database Sources</option>
              <option value="DEFRA">DEFRA</option>
              <option value="IPCC">IPCC</option>
              <option value="IEA">IEA</option>
              <option value="Ecoinvent">Ecoinvent</option>
              <option value="EXIOBASE">EXIOBASE</option>
              <option value="PCAF">PCAF</option>
              <option value="EPA">EPA</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilterCategory('');
              setFilterSource('');
              setAdditionalFilter({});
              refetch();
            }}
            className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors shrink-0"
          >
            Clear All Filters
          </button>
        </div>

        {/* Reusable Table */}
        <ReusableTable
          data={formattedList}
          columns={columns}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          handleLoadMore={loadMore}
          tableHeight="calc(100vh - 440px)"
        />
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingItem ? 'Edit Emission Factor' : 'Add New Emission Factor'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-neutral-700">Category / Scope *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fuel or Gas Type Name */}
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Fuel / Gas / Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Natural Gas, Diesel, Grid Power"
                    value={formData.fuelOrGasType}
                    onChange={(e) => setFormData({ ...formData, fuelOrGasType: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Emission Factor Value */}
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Emission Factor Value *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1.942"
                    value={formData.factor}
                    onChange={(e) => setFormData({ ...formData, factor: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. kg CO2e / liter, sm3, kWh"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Database Source */}
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Database Source *</label>
                  <input
                    type="text"
                    placeholder="e.g. DEFRA, IPCC, EPA"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Version / Year */}
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Version / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024, AR6"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isActiveToggle" className="font-bold text-neutral-700 cursor-pointer">
                    Active Emission Factor
                  </label>
                </div>

                {/* Calculation Formula Section */}
                <div className="space-y-2 md:col-span-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-neutral-700 text-xs">Calculation Formula</label>
                    {formData.formula && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, formula: '' })}
                        className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Input with Drop Zone & Live Result Indicator */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const token = e.dataTransfer.getData('text/plain');
                      if (token) handleInsertToken(token);
                    }}
                    className="relative"
                  >
                    <input
                      type="text"
                      placeholder="e.g. (amount * factor) / 1000"
                      value={formData.formula}
                      onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 pr-28 text-xs font-mono text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    {formulaPreview?.valid && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 pointer-events-none">
                        = {formulaPreview.value} tCO₂e
                      </span>
                    )}
                  </div>

                  {/* Clean Drag/Click Pills & Math Toolbar Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Variable Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(CATEGORY_VARIABLE_MAP[formData.category] || [
                        { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                      ]).map((col) => (
                        <span
                          key={col.name}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', col.name);
                          }}
                          onClick={() => handleInsertToken(col.name)}
                          className={`px-2 py-0.5 rounded border text-[11px] font-mono font-medium transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1 cursor-grab active:cursor-grabbing select-none ${col.color}`}
                          title="Drag into formula field or click to insert"
                        >
                          <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0" />
                          <span>{col.name}</span>
                        </span>
                      ))}
                    </div>

                    {/* Operators & Template Dropdown */}
                    <div className="flex items-center gap-1">
                      {['+', '-', '*', '/', '(', ')', '/ 1000'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => handleInsertToken(op)}
                          className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-mono font-semibold border border-neutral-200 rounded text-xs transition-colors cursor-pointer"
                        >
                          {op}
                        </button>
                      ))}

                      {/* Preset Template Select */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData({ ...formData, formula: e.target.value });
                            e.target.value = '';
                          }
                        }}
                        className="bg-neutral-50 border border-neutral-200 text-[11px] font-medium text-neutral-600 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ml-1"
                      >
                        <option value="">Templates</option>
                        <option value="(amount * factor) / 1000">(amount * factor) / 1000</option>
                        <option value="amount * factor">amount * factor</option>
                        <option value="(distance * amount * factor) / 1000">(distance * amount * factor) / 1000</option>
                        <option value="(people * distance * factor) / 1000">(people * distance * factor) / 1000</option>
                        <option value="(rooms * nights * factor) / 1000">(rooms * nights * factor) / 1000</option>
                        <option value="(amount * (leakage / 100) * factor) / 1000">(amount * (leakage / 100) * factor) / 1000</option>
                        <option value="(scope1 + scope2) * (equityShare / 100)">(scope1 + scope2) * (equityShare / 100)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? 'Save Changes' : 'Create Emission Factor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
