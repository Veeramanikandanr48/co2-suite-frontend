'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Info,
  UploadCloud,
  Edit2,
  Copy,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  Paperclip,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';
import {
  ActivityNotRelevantModal,
  shouldSkipActivityNotRelevantModal,
} from '@/components/reusables/activity-not-relevant-modal';
import { ReusableTable } from '@/components/reusables/reusable-table';
import { EditInventoryModal, InventoryItem as EditModalItem } from '@/components/services/edit-inventory-modal';
import { useFetchList } from '@/hooks/use-fetchlist';
import { ColumnDef } from '@tanstack/react-table';

export type Scope2CategoryType =
  | 'Purchased Electricity'
  | 'Purchased Heating & Steam'
  | 'Purchased Heating & Cooling';

interface Scope2CalculationViewProps {
  category: Scope2CategoryType;
}

interface DBEmissionFactor {
  id: number;
  category: string;
  source: string;
  version: string;
  fuelOrGasType: string;
  unit: string;
  factor: number;
  formula: string;
}

interface InventoryItem {
  id: number;
  name: string;
  category?: string;
  amount?: number | string;
  unit?: string;
  ef?: number | string;
  efSource?: string;
  formula?: string;
  dateFrom?: string;
  dateTo?: string;
  from?: string;
  to?: string;
  facility?: string;
  emission?: number | string;
  status?: string;
  comment?: string;
  approvalStatus?: string;
  documentPath?: string;
}

export function Scope2CalculationView({ category }: Scope2CalculationViewProps) {
  const isElectricity = category === 'Purchased Electricity';
  const { user } = useAuth();
  const canEdit = !user || user.roleId === MasterRole.SUPER_ADMIN || user.roleId === MasterRole.ADMIN;

  // Selected filters
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFacilityHeader, setSelectedFacilityHeader] = useState('All Facilities');
  const [isNotRelevant, setIsNotRelevant] = useState(false);
  const [showNotRelevantModal, setShowNotRelevantModal] = useState(false);

  /** Handle "Activity is not relevant" checkbox change */
  const handleActivityNotRelevantChange = (checked: boolean) => {
    if (!checked) {
      setIsNotRelevant(false);
      return;
    }
    if (shouldSkipActivityNotRelevantModal()) {
      setIsNotRelevant(true);
      return;
    }
    setShowNotRelevantModal(true);
  };

  // Form State
  const [editingItem, setEditingItem] = useState<EditModalItem | null>(null);
  const [efSource, setEfSource] = useState('');
  const [factorVersion, setFactorVersion] = useState('');
  const [country, setCountry] = useState('Republic of Türkiye');
  const [inventoryName, setInventoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [customEf, setCustomEf] = useState('');
  const [indirectEf, setIndirectEf] = useState('0.00');
  const [dataAcquisitionMethod, setDataAcquisitionMethod] = useState('');
  const [facility, setFacility] = useState('Manchester Facility');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [comment, setComment] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');

  // Proof of document file state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // API Data State
  const [dbFactors, setDbFactors] = useState<DBEmissionFactor[]>([]);
  const [dbFacilities, setDbFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters for useFetchList
  const [filterFacility, setFilterFacility] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';

  // Server-side paginated & filtered inventory list hook
  const {
    list,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    searchInput,
    setSearch,
    setSorting,
    setAdditionalFilter,
    loadMore,
    refetch,
  } = useFetchList<InventoryItem>(API_LIST.INVENTORY_ENTRIES_FILTER, {
    additionalFilter: { category: efCategory },
    limit: 10,
  });

  // Fetch Emission Factors & Facilities from DB
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';

      const [efRes, facRes] = await Promise.all([
        apiService.get<any>(`${API_LIST.EMISSION_FACTORS}?category=${encodeURIComponent(efCategory)}`),
        apiService.get<any>(API_LIST.FACILITIES),
      ]);

      const efData = (efRes as any)?.data ?? efRes;
      setDbFactors(Array.isArray(efData) ? efData : []);

      const facData = (facRes as any)?.data ?? facRes;
      setDbFacilities(Array.isArray(facData) ? facData : []);
    } catch (err) {
      console.error('Failed to load Scope 2 data:', err);
    } finally {
      setLoading(false);
    }
  }, [isElectricity]);

  const handleFilterUpdate = useCallback((updates: {
    year?: string;
    facility?: string;
    status?: string;
  }) => {
    const yr = updates.year !== undefined ? updates.year : selectedYear;
    const fac = updates.facility !== undefined ? updates.facility : (filterFacility || (selectedFacilityHeader !== 'All Facilities' ? selectedFacilityHeader : ''));
    const stat = updates.status !== undefined ? updates.status : filterStatus;

    if (updates.year !== undefined) setSelectedYear(updates.year);
    if (updates.facility !== undefined) {
      setFilterFacility(updates.facility);
      setSelectedFacilityHeader(updates.facility || 'All Facilities');
    }
    if (updates.status !== undefined) setFilterStatus(updates.status);

    const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';
    setAdditionalFilter({
      category: efCategory,
      facility: fac && fac !== 'All Facilities' ? fac : undefined,
      status: stat && stat !== 'All Statuses' ? stat : undefined,
      year: yr && yr !== 'All Years' ? yr : undefined,
    });
  }, [isElectricity, filterFacility, filterStatus, selectedFacilityHeader, selectedYear, setAdditionalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived options for dropdowns strictly from DB
  const availableSources = useMemo(() => {
    return Array.from(new Set(dbFactors.map((f) => f.source).filter(Boolean)));
  }, [dbFactors]);

  const availableVersions = useMemo(() => {
    const filtered = efSource ? dbFactors.filter((f) => f.source === efSource) : dbFactors;
    return Array.from(new Set(filtered.map((f) => f.version).filter(Boolean)));
  }, [dbFactors, efSource]);

  const availableCountries = useMemo(() => {
    return Array.from(new Set(dbFactors.map((f) => f.fuelOrGasType).filter(Boolean)));
  }, [dbFactors]);

  // Calculate Total Emissions from Inventory Table
  const totalEmissions = useMemo(() => {
    return list.reduce((acc, curr) => {
      const val = Number(curr.emission) || 0;
      return acc + val;
    }, 0);
  }, [list]);

  // Save Entry to DB
  const handleSaveToDatabase = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';
      const itemName = isElectricity ? country : inventoryName || 'Purchased Heating Item';

      let uploadedDocPath: string | undefined = undefined;
      if (proofFile) {
        try {
          const formData = new FormData();
          formData.append('file', proofFile);
          const uploadRes = await apiService.post<any>(API_LIST.UPLOAD_INVENTORY_DOC, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const uploadData = (uploadRes as any)?.data ?? uploadRes;
          uploadedDocPath = uploadData?.documentPath;
        } catch (uploadErr) {
          console.error('Failed to upload proof document:', uploadErr);
          toast.error('Failed to upload proof document file.');
        }
      }

      const matchingEF =
        dbFactors.find(
          (f) =>
            (!efSource || f.source === efSource) &&
            (!factorVersion || f.version === factorVersion) &&
            (f.fuelOrGasType === itemName || f.fuelOrGasType === country)
        ) ||
        dbFactors.find(
          (f) =>
            (!efSource || f.source === efSource) &&
            (!factorVersion || f.version === factorVersion)
        ) ||
        dbFactors.find((f) => f.fuelOrGasType === itemName || f.fuelOrGasType === country);
      const efValue = customEf ? parseFloat(customEf) : matchingEF?.factor ?? (isElectricity ? 0.442 : 0.171);

      const payload = {
        serviceCode: 'CARBON',
        category: efCategory,
        name: itemName,
        amount: Number(amount),
        unit: matchingEF?.unit || 'kWh',
        ef: efValue,
        efSource: efSource || matchingEF?.source || 'IEA Grid Factors 2023',
        formula: matchingEF?.formula,
        dateFrom: dateFrom || '01.01.2026',
        dateTo: dateTo || '31.12.2026',
        facility: facility || 'Central HQ',
        status: 'completed',
        comment,
        approvalStatus: approvalStatus || 'Approved',
        documentPath: uploadedDocPath,
      };

      const response = await apiService.post<InventoryItem>(
        API_LIST.INVENTORY_ENTRIES,
        payload,
      );

      toast.success(
        `${isElectricity ? 'Purchased Electricity' : 'Purchased Heating'} inventory entry saved to Database successfully!`,
      );
      setAmount('');
      setComment('');
      setProofFile(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Error saving to database');
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate/Copy inventory entry in Backend DB
  const handleCopyItem = async (item: InventoryItem) => {
    if (!canEdit) {
      toast.error('Only Admin and Super Admin can duplicate inventory entries.');
      return;
    }

    try {
      const payload = {
        serviceCode: 'CARBON',
        category: item.category || efCategory,
        name: item.name ? `${item.name} (Copy)` : 'Copy Entry',
        amount: Number(item.amount) || 0,
        unit: item.unit || 'kWh',
        ef: Number(item.ef) || 0,
        efSource: item.efSource || 'IEA Grid Factors 2023',
        formula: item.formula,
        dateFrom: item.dateFrom || item.from || '01.01.2026',
        dateTo: item.dateTo || item.to || '31.12.2026',
        facility: item.facility || 'Central HQ',
        approvalStatus: item.approvalStatus || item.status || 'Approved',
        comment: item.comment ? `${item.comment} (Duplicated)` : 'Duplicated entry',
        documentPath: item.documentPath,
      };

      await apiService.post(API_LIST.INVENTORY_ENTRIES, payload);
      toast.success('Inventory entry duplicated successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to duplicate inventory entry:', error);
      toast.error('Failed to duplicate inventory record.');
    }
  };

  // Delete Entry from DB
  const handleDeleteItem = async (id: number) => {
    if (!canEdit) {
      toast.error('Only Admin and Super Admin can delete inventory entries.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this inventory record?')) {
      return;
    }

    try {
      await apiService.delete(API_LIST.INVENTORY_ENTRIES, id);
      toast.success('Inventory entry deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete inventory entry:', error);
      toast.error('Failed to delete inventory entry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with title and description */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notRelevant"
              checked={isNotRelevant}
              onChange={(e) => handleActivityNotRelevantChange(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="notRelevant" className="text-xs font-medium text-neutral-500">
              Activity is not relevant
            </label>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Cooling'}
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Carbon dioxide (CO₂), methane (CH₄) and nitrous oxide (N₂O) are emitted into the atmosphere when fuels are burned to produce heat and electricity. Therefore, activities that use purchased {isElectricity ? 'electricity' : 'heat/cooling'} indirectly cause greenhouse gas (GHG) emissions.
          </p>
        </div>

        {/* Total Emission Card Top Right */}
        <div className="w-full lg:w-72 bg-white border-2 border-emerald-400 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-600">Total Emission</span>
            <div className="flex items-center gap-1">
              <select
                value={selectedYear}
                onChange={(e) => handleFilterUpdate({ year: e.target.value })}
                className="text-[11px] bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-700"
              >
                <option value="All Years">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="text-3xl font-extrabold text-neutral-900">
                {totalEmissions.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
              </div>
              <div className="text-[11px] text-neutral-500 font-medium">tonne CO₂-e</div>
            </div>
            <select
              value={selectedFacilityHeader}
              onChange={(e) => handleFilterUpdate({ facility: e.target.value === 'All Facilities' ? '' : e.target.value })}
              className="text-[11px] bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-700"
            >
              <option value="All Facilities">All Facilities</option>
              {dbFacilities.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Not Relevant Modal */}
      <ActivityNotRelevantModal
        open={showNotRelevantModal}
        onConfirm={() => {
          setShowNotRelevantModal(false);
          setIsNotRelevant(true);
        }}
        onCancel={() => {
          setShowNotRelevantModal(false);
          setIsNotRelevant(false);
        }}
      />

      {/* Not-relevant notice banner */}
      {isNotRelevant && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            This activity has been marked as <strong>not relevant</strong>. The entries below
            will not be included in the total emission calculations.
          </span>
        </div>
      )}

      {/* Electricity Specific Note Alert */}
      {isElectricity && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <span className="text-amber-600 font-bold text-sm">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note:</span> The electricity consumed by the facilities within the system boundaries during the reporting year should be taken into account, taking into account the location of the grid from which the facility supplies electricity. The emission factor of electricity purchased from the market should be entered as custom if available.
          </p>
        </div>
      )}

      {/* Main Grid Forms */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        {/* Left Card: Inventory Entry */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-3">
            Inventory Entry
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Emission Factor Source
              </label>
              <select
                value={efSource}
                onChange={(e) => setEfSource(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select your option</option>
                {availableSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Factor Version
              </label>
              <select
                value={factorVersion}
                onChange={(e) => setFactorVersion(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select your option</option>
                {availableVersions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {isElectricity ? (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Inventory Name
                </label>
                <input
                  type="text"
                  placeholder="Please enter inventory name"
                  value={inventoryName}
                  onChange={(e) => setInventoryName(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Please enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-12 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                  kWh
                </span>
              </div>
            </div>

            {!isElectricity && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Emission Factor (EF)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Please enter emission factor"
                      value={customEf}
                      onChange={(e) => setCustomEf(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-14 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                      kg CO₂
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-neutral-600">
                      Indirect
                    </label>
                    <Info className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={indirectEf}
                      onChange={(e) => setIndirectEf(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-3 pr-14 py-2 text-neutral-800 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                      kg CO₂
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Data Acquisition Method
                  </label>
                  <select
                    value={dataAcquisitionMethod}
                    onChange={(e) => setDataAcquisitionMethod(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select your option</option>
                    <option value="Supplier Specific">Supplier Specific</option>
                    <option value="Grid Average">Grid Average</option>
                    <option value="Location Based">Location Based</option>
                    <option value="Market Based">Market Based</option>
                  </select>
                </div>
              </>
            )}

            <div className="pt-2">
              <p className="text-[11px] text-neutral-500 leading-normal">
                <span className="font-semibold">Note:</span> If you have the data in units not specified here, then please provide the conversion factor to get to this value in the comment section below.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Inventory Source */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-3">
            Inventory Source
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Facility
              </label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select your option</option>
                {dbFacilities.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Date from
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Date to
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Proof of Documents if any (Invoices, SAP output, screenshot etc.)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png,.xlsx,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setProofFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-200 hover:border-emerald-400 transition-colors rounded-xl p-4 text-center cursor-pointer bg-neutral-50/50 flex flex-col items-center justify-center gap-2"
              >
                {proofFile ? (
                  <div className="flex items-center gap-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#059669]">
                    <Paperclip className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-[200px]">{proofFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProofFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-neutral-400 hover:text-red-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-neutral-400" />
                    <div className="text-xs font-semibold text-neutral-700">
                      Click to upload <span className="font-normal text-neutral-500">or drag and drop</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Allowed formats: JPEG, PNG, XLSX, PDF
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle row: Comment, Approval Status, Save Button */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            Comment
          </label>
          <input
            type="text"
            placeholder="Please enter comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            Approval Status
          </label>
          <select
            value={approvalStatus}
            onChange={(e) => setApprovalStatus(e.target.value)}
            className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select your option</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="lg:col-span-2 flex justify-center pt-2">
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={submitting}
            className="w-full py-2.5 bg-slate-300 hover:bg-emerald-600 text-slate-700 hover:text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving to Database...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Save to Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inventory Table Section */}
      <div className={`bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4 ${isNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-800 tracking-wide">
              Inventory Table ({totalCount})
            </h2>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            )}
          </div>
        </div>

        {/* Toolbar: Search, Facility Filter, Status Filter, Clear Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search entries..."
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

            {/* Facility Filter */}
            <select
              value={filterFacility}
              onChange={(e) => handleFilterUpdate({ facility: e.target.value })}
              className="bg-white border border-neutral-200 text-xs text-neutral-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Facilities</option>
              {dbFacilities.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => handleFilterUpdate({ status: e.target.value })}
              className="bg-white border border-neutral-200 text-xs text-neutral-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';
              setSearch('');
              setFilterFacility('');
              setSelectedFacilityHeader('All Facilities');
              setFilterStatus('');
              setSelectedYear('2026');
              setAdditionalFilter({ category: efCategory });
              refetch();
            }}
            className="px-4 py-1.5 bg-navy-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors shrink-0"
            style={{ backgroundColor: '#0B132B' }}
          >
            Clear All Filters
          </button>
        </div>

        {/* ReusableTable component */}
        <ReusableTable
          data={list.map((item) => ({ ...item, id: String(item.id) }))}
          columns={[
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }) => (
                canEdit ? (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(row.original as any);
                      }}
                      className="hover:text-emerald-600 transition-colors"
                      title="Edit Inventory Entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyItem(row.original as any);
                      }}
                      className="hover:text-blue-600 transition-colors"
                      title="Duplicate Inventory Entry"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(Number(row.original.id));
                      }}
                      className="hover:text-red-600 transition-colors"
                      title="Delete Inventory Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-400 italic">Read-only</span>
                )
              ),
            },
            {
              accessorKey: 'name',
              header: () => (
                <button onClick={() => setSorting('name')} className="flex items-center gap-1 font-bold">
                  <span>Name</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              ),
              cell: ({ row }: any) => <span className="font-medium text-neutral-800">{row.original.name}</span>,
            },
            {
              accessorKey: 'efSource',
              header: () => (
                <button onClick={() => setSorting('efSource')} className="flex items-center gap-1 font-bold">
                  <span>EF Source</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              ),
              cell: ({ row }: any) => row.original.efSource || '-',
            },
            {
              accessorKey: 'dateFrom',
              header: 'From',
              cell: ({ row }: any) => row.original.dateFrom || row.original.from || '-',
            },
            {
              accessorKey: 'dateTo',
              header: 'To',
              cell: ({ row }: any) => row.original.dateTo || row.original.to || '-',
            },
            {
              accessorKey: 'facility',
              header: () => (
                <button onClick={() => setSorting('facility')} className="flex items-center gap-1 font-bold">
                  <span>Facility</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              ),
              cell: ({ row }: any) => row.original.facility || '-',
            },
            {
              id: 'documentPath',
              header: 'Doc',
              cell: ({ row }: any) => (
                row.original.documentPath ? (
                  <a
                    href={(() => {
                      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1/';
                      const baseUrl = serverUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
                      return `${baseUrl}/${row.original.documentPath.replace(/^\/+/, '')}`;
                    })()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-bold text-xs"
                    title="View proof document"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Doc</span>
                  </a>
                ) : (
                  <span className="text-neutral-300">-</span>
                )
              ),
            },
            {
              accessorKey: 'emission',
              header: () => (
                <button onClick={() => setSorting('emission')} className="flex items-center gap-1 font-bold">
                  <span>Emission (t CO₂-e)</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              ),
              cell: ({ row }: any) => (
                <span className="font-bold text-neutral-800">
                  {Number(row.original.emission || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 3,
                  })}
                </span>
              ),
            },
            {
              accessorKey: 'status',
              header: 'Status',
              cell: ({ row }: any) => {
                const statusText =
                  row.original.approvalStatus ||
                  row.original.status ||
                  'Approved';
                const s = String(statusText).toLowerCase();

                let dotColor = 'bg-emerald-500';
                if (s.includes('pending')) {
                  dotColor = 'bg-amber-500';
                } else if (s.includes('draft')) {
                  dotColor = 'bg-slate-400';
                } else if (s.includes('reject')) {
                  dotColor = 'bg-red-500';
                }

                return (
                  <div className="flex items-center gap-1.5" title={`Status: ${statusText}`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                    <span className="text-[11px] text-neutral-600 font-medium capitalize">
                      {statusText}
                    </span>
                  </div>
                );
              },
            },
          ] as ColumnDef<any>[]}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          handleLoadMore={loadMore}
          tableHeight="auto"
        />
      </div>

      <EditInventoryModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSaved={refetch}
        facilities={dbFacilities}
      />
    </div>
  );
}
