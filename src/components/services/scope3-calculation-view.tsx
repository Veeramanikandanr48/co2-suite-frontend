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
  Download,
  Zap,
  DollarSign,
  Truck,
  Trash,
  Plane,
  Ship,
  Train,
  Building,
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

export type Scope3CategoryType =
  | 'Purchased Goods and Services'
  | 'Capital Goods'
  | 'Energy and Fuel Related Activities'
  | 'Upstream Transportation'
  | 'Waste Generated in Operations'
  | 'Business Travel'
  | 'Employee Commuting'
  | 'Downstream Transportation'
  | 'Processing of Sold Products'
  | 'Use of Sold Products'
  | 'EOL Treatment of Sold Products'
  | 'Franchise'
  | 'Investments';

interface Scope3CalculationViewProps {
  category: Scope3CategoryType;
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
  distance?: number | string;
  documentPath?: string;
}

export function Scope3CalculationView({ category }: Scope3CalculationViewProps) {
  const { user } = useAuth();
  const canEdit = !user || user.roleId === MasterRole.SUPER_ADMIN || user.roleId === MasterRole.ADMIN;
  // Category logic flags
  const isPurchasedGoods = category === 'Purchased Goods and Services';
  const isCapitalGoods = category === 'Capital Goods';
  const isUpstreamTransport = category === 'Upstream Transportation';
  const isDownstreamTransport = category === 'Downstream Transportation';
  const isWaste = category === 'Waste Generated in Operations';
  const isBusinessTravel = category === 'Business Travel';
  const isEmployeeCommuting = category === 'Employee Commuting';
  const isProcessingSold = category === 'Processing of Sold Products';
  const isUseSold = category === 'Use of Sold Products';
  const isEolSold = category === 'EOL Treatment of Sold Products' || (category as string) === 'End of Life Treatment of Sold Product';
  const isFranchise = category === 'Franchise';
  const isInvestments = category === 'Investments';

  // Sub-tabs active state
  const [activeSubTab, setActiveSubTab] = useState<string>(
    isFranchise ? 'Electricity Consumption' : isWaste ? 'Waste' : isBusinessTravel ? 'Air' : 'Activity Based'
  );

  // Form Field States
  const [editingItem, setEditingItem] = useState<EditModalItem | null>(null);
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

  // Form Field States
  const [efSource, setEfSource] = useState('');
  const [factorVersion, setFactorVersion] = useState('');
  const [materialProduct, setMaterialProduct] = useState('');
  const [inventoryName, setInventoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [distance, setDistance] = useState('');
  const [customEf, setCustomEf] = useState('');
  const [dataAcquisitionMethod, setDataAcquisitionMethod] = useState('');
  const [activityOption, setActivityOption] = useState('');
  const [typeOption, setTypeOption] = useState('');
  const [sizeOption, setSizeOption] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [treatmentOption, setTreatmentOption] = useState('');
  const [travelOption, setTravelOption] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [country, setCountry] = useState('Republic of Türkiye');
  const [sourceOption, setSourceOption] = useState('');
  const [investeeScope1, setInvesteeScope1] = useState('');
  const [investeeScope2, setInvesteeScope2] = useState('');
  const [equityShare, setEquityShare] = useState('');

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
    additionalFilter: { category },
    limit: 10,
  });

  // Fetch Emission Factors & Facilities from DB
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [efRes, facRes] = await Promise.all([
        apiService.get<any>(`${API_LIST.EMISSION_FACTORS}?category=${encodeURIComponent(category)}`),
        apiService.get<any>(API_LIST.FACILITIES),
      ]);

      const efData = (efRes as any)?.data ?? efRes;
      setDbFactors(Array.isArray(efData) ? efData : []);

      const facData = (facRes as any)?.data ?? facRes;
      setDbFacilities(Array.isArray(facData) ? facData : []);
    } catch (err) {
      console.error('Failed to load Scope 3 data:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

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

    setAdditionalFilter({
      category,
      facility: fac && fac !== 'All Facilities' ? fac : undefined,
      status: stat && stat !== 'All Statuses' ? stat : undefined,
      year: yr && yr !== 'All Years' ? yr : undefined,
    });
  }, [category, filterFacility, filterStatus, selectedFacilityHeader, selectedYear, setAdditionalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Total Emissions Sum
  const totalEmissions = useMemo(() => {
    return list.reduce((acc, curr) => {
      const val = Number(curr.emission) || 0;
      return acc + val;
    }, 0);
  }, [list]);

  // Derived options for dropdowns
  const availableSources = useMemo(() => {
    return Array.from(new Set(dbFactors.map((f) => f.source).filter(Boolean)));
  }, [dbFactors]);

  const availableVersions = useMemo(() => {
    const filtered = efSource ? dbFactors.filter((f) => f.source === efSource) : dbFactors;
    return Array.from(new Set(filtered.map((f) => f.version).filter(Boolean)));
  }, [dbFactors, efSource]);

  // Save Entry to DB
  const handleSaveToDatabase = async () => {
    if (!isInvestments && (!amount || Number(amount) <= 0)) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      const itemName =
        materialProduct ||
        inventoryName ||
        travelOption ||
        wasteType ||
        typeOption ||
        fuelType ||
        sourceOption ||
        category;

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
            f.fuelOrGasType === itemName
        ) ||
        dbFactors.find(
          (f) =>
            (!efSource || f.source === efSource) &&
            (!factorVersion || f.version === factorVersion)
        ) ||
        dbFactors.find((f) => f.category === category);

      const amountVal = isBusinessTravel && activeSubTab !== 'Hotel' ? (Number(distance) || 0) : (Number(amount) || 1);
      const defaultUnit =
        activeSubTab === 'Spend Based'
          ? 'USD'
          : isWaste && activeSubTab === 'Wastewater'
          ? 'm3'
          : isUpstreamTransport || isDownstreamTransport || (isWaste && activeSubTab === 'Waste') || isEolSold
          ? 'tonne'
          : isEmployeeCommuting || isBusinessTravel
          ? activeSubTab === 'Hotel'
            ? 'room-night'
            : 'km'
          : 'kg';
      const efValue = customEf ? parseFloat(customEf) : matchingEF?.factor ?? 1.0;
      const unitVal = activeSubTab === 'Spend Based' ? 'USD' : matchingEF?.unit || defaultUnit;

      const payload = {
        serviceCode: 'CARBON',
        category: category,
        name: itemName,
        amount: amountVal,
        distance: isBusinessTravel && activeSubTab !== 'Hotel' ? Number(distance) || 0 : (isWaste && activeSubTab === 'Waste') || isUpstreamTransport || isDownstreamTransport ? Number(distance) || 0 : undefined,
        unit: unitVal,
        ef: efValue,
        efSource: efSource || matchingEF?.source || 'DEFRA 2024',
        formula: matchingEF?.formula,
        dateFrom: dateFrom || '01.01.2026',
        dateTo: dateTo || '31.12.2026',
        facility: facility || 'Central HQ',
        status: 'completed',
        comment,
        approvalStatus: approvalStatus || 'Approved',
        documentPath: uploadedDocPath,
      };

      await apiService.post(API_LIST.INVENTORY_ENTRIES, payload);

      toast.success(`${category} inventory entry saved to Database successfully!`);
      refetch();
      setAmount('');
      setDistance('');
      setPeopleCount('');
      setComment('');
      setProofFile(null);
      fetchData();
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
        category: item.category || category,
        name: item.name ? `${item.name} (Copy)` : 'Copy Entry',
        amount: Number(item.amount) || 0,
        unit: item.unit || 'kg',
        ef: Number(item.ef) || 0,
        efSource: item.efSource || 'IPCC-AR6',
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
    } catch (err) {
      console.error('Failed to delete inventory entry:', err);
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with Title, Description, and Import/Total Emission Cards */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notRelevantScope3"
              checked={isNotRelevant}
              onChange={(e) => handleActivityNotRelevantChange(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="notRelevantScope3" className="text-xs font-medium text-neutral-500">
              Activity is not relevant
            </label>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {isDownstreamTransport
              ? 'Downstream Transportation & Distribution'
              : isUpstreamTransport
              ? 'Upstream Transportation & Distribution'
              : category}
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {isPurchasedGoods &&
              'This category includes all upstream (i.e. cradle-to-gate) emissions from the production of products purchased or acquired by the reporting organisation during the reporting year. Products include both goods (tangible products) and services (intangible products).'}
            {isCapitalGoods &&
              'This category includes all upstream (i.e. cradle-to-gate) emissions from the production of capital goods purchased or produced by the reporting company in the reporting year.'}
            {isUpstreamTransport &&
              "Emissions from transport and distribution of products purchased during the reporting year between a company's Tier 1 suppliers and its own operations in vehicles not owned or operated by the reporting company."}
            {isDownstreamTransport &&
              'This category includes emissions generated during the reporting year by the transport and distribution of products sold in vehicles and facilities not owned or controlled by the reporting organisation.'}
            {isWaste &&
              'Emissions from disposal and treatment of waste by third parties generated by operations owned or controlled by the reporting organisation during the reporting year. This category includes emissions from the disposal of solid waste and waste water.'}
            {isBusinessTravel &&
              'This category includes emissions from the transport of employees for business activities in vehicles owned or operated by third parties, such as aircraft, trains, buses and cars.'}
            {isEmployeeCommuting &&
              'This category includes emissions from the transport of employees between home and work.'}
            {isProcessingSold &&
              'Emissions from the processing of intermediate products sold by third parties (e.g. manufacturers) after sale by the reporting company.'}
            {isUseSold &&
              'This category includes emissions resulting from the use of goods and services sold by the reporting company during the reporting year.'}
            {isEolSold &&
              'Emissions from the disposal and treatment of products sold by the reporting company at the end of their life.'}
            {isFranchise &&
              "Emissions from transport and distribution of products purchased during the reporting year between a company's Tier 1 suppliers and its own operations in vehicles not owned or operated by the reporting company."}
            {isInvestments &&
              "This category encompasses Scope 3 emissions related to the reporting company's investments during the reporting year, excluding those already accounted for in Scope 1 or Scope 2."}
          </p>
        </div>

        {/* Top Right Header Cards Container */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Inventory Import Card */}
          {(isPurchasedGoods || isUpstreamTransport || isDownstreamTransport) && (
            <div className="hidden md:flex flex-col justify-between bg-white border border-emerald-300 rounded-xl p-3 shadow-xs w-64">
              <div>
                <span className="text-xs font-bold text-emerald-600">Inventory Import</span>
                <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">
                  You can import your entire inventory with this feature and save it to the emissions database.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <button className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors">
                  <Download className="w-3 h-3" /> Download Template
                </button>
                <button className="flex-1 py-1 px-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors">
                  <UploadCloud className="w-3 h-3" /> Upload Inventory
                </button>
              </div>
            </div>
          )}

          {/* Total Emission Card */}
          <div className="w-full lg:w-64 bg-white border-2 border-emerald-400 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-600">Total Emission</span>
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

      {/* Category Specific Note Alerts */}
      {isPurchasedGoods && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <span className="text-amber-600 font-bold text-sm">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note:</span> Includes all raw materials, consumables and municipal water purchased during the reporting year, as well as all services outsourced by the company.
          </p>
        </div>
      )}

      {isEmployeeCommuting && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <span className="text-amber-600 font-bold text-sm">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note:</span> It should be taken into consideration that fuel consumption will vary according to vehicle type. WTT emissions should be calculated in the Fuel and Energy Related Activities category for fuel consumptions that constitute input in this category.
          </p>
        </div>
      )}

      {isWaste && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <span className="text-amber-600 font-bold text-sm">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note:</span> Chemically or biologically contaminated materials should be treated as industrial waste, even if they are recyclable.
          </p>
        </div>
      )}

      {isDownstreamTransport && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <span className="text-amber-600 font-bold text-sm">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note:</span> Transports where the financial responsibility for the transport of manufactured products does not lie with the reporting company should be taken into account.
          </p>
        </div>
      )}

      {isUpstreamTransport && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
          <span className="text-amber-600 font-bold text-sm">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note:</span> Transports where the financial responsibility for the transport of purchased products lies with the reporting company should be taken into account.
          </p>
        </div>
      )}

      {/* Sub-Tab Selector Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        {(isPurchasedGoods || isCapitalGoods || isUpstreamTransport || isDownstreamTransport) && (
          <>
            <button
              onClick={() => setActiveSubTab('Activity Based')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Activity Based'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-600" /> Activity Based
            </button>
            <button
              onClick={() => setActiveSubTab('Spend Based')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Spend Based'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Spend Based
            </button>
            {(isUpstreamTransport || isDownstreamTransport) && (
              <button
                onClick={() => setActiveSubTab('Custom Transports')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Custom Transports'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
              >
                <Truck className="w-3.5 h-3.5 text-purple-600" /> Custom Transports
              </button>
            )}
          </>
        )}

        {isWaste && (
          <>
            <button
              onClick={() => setActiveSubTab('Waste')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Waste' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <Trash className="w-3.5 h-3.5 text-purple-600" /> Waste
            </button>
            <button
              onClick={() => setActiveSubTab('Wastewater')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Wastewater' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Wastewater
            </button>
          </>
        )}

        {isBusinessTravel && (
          <>
            <button
              onClick={() => setActiveSubTab('Air')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Air' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <Plane className="w-3.5 h-3.5 text-purple-600" /> Air
            </button>
            <button
              onClick={() => setActiveSubTab('Sea')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Sea' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Sea
            </button>
            <button
              onClick={() => setActiveSubTab('Land')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Land' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <Train className="w-3.5 h-3.5 text-purple-600" /> Land
            </button>
            <button
              onClick={() => setActiveSubTab('Hotel')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeSubTab === 'Hotel' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <Building className="w-3.5 h-3.5 text-purple-600" /> Hotel
            </button>
          </>
        )}

        {isFranchise && (
          <>
            <button
              onClick={() => setActiveSubTab('Electricity Consumption')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'Electricity Consumption' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              Electricity Consumption
            </button>
            <button
              onClick={() => setActiveSubTab('Stationary Combustion')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'Stationary Combustion' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              Stationary Combustion
            </button>
            <button
              onClick={() => setActiveSubTab('Water Consumption')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'Water Consumption' ? 'bg-purple-100 text-purple-700' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              Water Consumption
            </button>
          </>
        )}
      </div>

      {/* Form Fields Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        {/* Left Card: Inventory Entry */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-3">
            Inventory Entry
          </h2>

          <div className="space-y-3.5">
            {!isInvestments && (
              <>
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
              </>
            )}

            {(isPurchasedGoods || isCapitalGoods) && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  {activeSubTab === 'Spend Based' ? 'Service' : 'Material/Product'}
                </label>
                <select
                  value={materialProduct}
                  onChange={(e) => setMaterialProduct(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  {dbFactors
                    .map((f) => f.fuelOrGasType)
                    .filter(Boolean)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Custom fields per category */}
            {(isUpstreamTransport || isDownstreamTransport) && (
              <>
                {activeSubTab === 'Activity Based' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Activity</label>
                      <select
                        value={activityOption}
                        onChange={(e) => setActivityOption(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select your option</option>
                        <option value="Freighting Goods">Freighting Goods</option>
                        <option value="Cargo Ship">Cargo Ship</option>
                        <option value="HGV Transport">HGV Transport</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Type</label>
                      <select
                        value={typeOption}
                        onChange={(e) => setTypeOption(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select your option</option>
                        <option value="HGV (all diesel)">HGV (all diesel)</option>
                        <option value="Lethal Fuel">Lethal Fuel</option>
                        <option value="Cargo Aircraft">Cargo Aircraft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Size / Option</label>
                      <select
                        value={sizeOption}
                        onChange={(e) => setSizeOption(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select your option</option>
                        <option value="All HGVs">All HGVs</option>
                        <option value="Rigid (>3.5t - 7.5t)">Rigid (&gt;3.5t - 7.5t)</option>
                        <option value="Articulated (>33t)">Articulated (&gt;33t)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Distance</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Please enter distance"
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-12 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          km
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Please enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-14 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          tonne
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {activeSubTab === 'Spend Based' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Select Option</label>
                      <select
                        value={materialProduct}
                        onChange={(e) => setMaterialProduct(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select your option</option>
                        <option value="Freight Transport Services">Freight Transport Services</option>
                        <option value="Warehousing and Support Services">Warehousing and Support Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Please enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-14 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          $$$
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed font-semibold">
                      Note:
                      <span className="font-normal text-neutral-500 ml-1">
                        If you are using a unit other than those specified here, we recommend that you note the conversion factors and source you selected in the comments section.
                      </span>
                    </p>
                  </>
                )}

                {activeSubTab === 'Custom Transports' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Transport Type</label>
                      <select
                        value={typeOption}
                        onChange={(e) => setTypeOption(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select your option</option>
                        <option value="Heavy Goods Vehicle">Heavy Goods Vehicle</option>
                        <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
                        <option value="Rail Freight">Rail Freight</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Distance</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Please enter distance"
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-12 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          km
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Please enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-14 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          tonne
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {isBusinessTravel && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Travel Option</label>
                  <select
                    value={travelOption}
                    onChange={(e) => setTravelOption(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select your option</option>
                    {dbFactors.length > 0 ? (
                      dbFactors
                        .map((f) => f.fuelOrGasType)
                        .filter(Boolean)
                        .filter((val, idx, self) => self.indexOf(val) === idx)
                        .map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))
                    ) : (
                      <>
                        {activeSubTab === 'Air' && (
                          <>
                            <option value="Short Haul - Economy">Short Haul - Economy</option>
                            <option value="Long Haul - Economy">Long Haul - Economy</option>
                            <option value="Short Haul - Business">Short Haul - Business</option>
                          </>
                        )}
                        {activeSubTab === 'Sea' && (
                          <>
                            <option value="Ferry - Passenger">Ferry - Passenger</option>
                            <option value="Cruise Ship">Cruise Ship</option>
                          </>
                        )}
                        {activeSubTab === 'Land' && (
                          <>
                            <option value="Taxi - Regular">Taxi - Regular</option>
                            <option value="Train - National Rail">Train - National Rail</option>
                            <option value="Bus - Local">Bus - Local</option>
                          </>
                        )}
                        {activeSubTab === 'Hotel' && (
                          <>
                            <option value="Hotel Stay - Standard">Hotel Stay - Standard</option>
                            <option value="Hotel Stay - Luxury">Hotel Stay - Luxury</option>
                          </>
                        )}
                      </>
                    )}
                  </select>
                </div>

                {activeSubTab !== 'Hotel' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Number of People Travelled
                      </label>
                      <input
                        type="number"
                        placeholder=""
                        value={peopleCount}
                        onChange={(e) => setPeopleCount(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Distance</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Please enter distance"
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-12 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          km
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Number of Rooms Stayed
                      </label>
                      <input
                        type="number"
                        placeholder=""
                        value={peopleCount}
                        onChange={(e) => setPeopleCount(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Total Night(s) Stayed
                      </label>
                      <input
                        type="number"
                        placeholder=""
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </>
                )}

                <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed font-semibold">
                  Note:
                  <span className="font-normal text-neutral-500 ml-1">
                    If you are using a unit other than those specified here, we recommend that you note the conversion factors and source you selected in the comments section.
                  </span>
                </p>
              </>
            )}

            {(isEmployeeCommuting || (isFranchise && activeSubTab === 'Stationary Combustion')) && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  <option value="Natural Gas">Natural Gas</option>
                  <option value="Diesel">Diesel</option>
                  <option value="On Road - Diesel">On Road - Diesel</option>
                  <option value="On Road - Petrol">On Road - Petrol</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>
            )}

            {(isProcessingSold || isUseSold) && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Source</label>
                <select
                  value={sourceOption}
                  onChange={(e) => setSourceOption(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  <option value="Manufacturing Facility">Manufacturing Facility</option>
                  <option value="Consumer Use">Consumer Use</option>
                </select>
              </div>
            )}

            {(isEolSold || isWaste) && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Waste</label>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select your option</option>
                    {isWaste && activeSubTab === 'Wastewater' ? (
                      <>
                        <option value="Discharged Wastewater">Discharged Wastewater</option>
                        <option value="Industrial Wastewater">Industrial Wastewater</option>
                      </>
                    ) : (
                      dbFactors.length > 0 ? (
                        dbFactors
                          .map((f) => f.fuelOrGasType)
                          .filter(Boolean)
                          .filter((val, idx, self) => self.indexOf(val) === idx)
                          .map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))
                      ) : (
                        <>
                          <option value="Average Construction - Closed Loop">Average Construction - Closed Loop</option>
                          <option value="Glass - Closed Loop">Glass - Closed Loop</option>
                          <option value="Commercial Mixed Waste - Landfill">Commercial Mixed Waste - Landfill</option>
                          <option value="Paper Board">Paper Board</option>
                        </>
                      )
                    )}
                  </select>
                </div>
                {(!isWaste || activeSubTab === 'Waste') && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Treatment</label>
                    <select
                      value={treatmentOption}
                      onChange={(e) => setTreatmentOption(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select your option</option>
                      <option value="Closed Loop">Closed Loop</option>
                      <option value="Open Loop">Open Loop</option>
                      <option value="Landfill">Landfill</option>
                      <option value="Incineration">Incineration</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {isFranchise && activeSubTab === 'Electricity Consumption' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your option</option>
                  <option value="Republic of Türkiye">Republic of Türkiye</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            )}

            {isInvestments && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Inventory Name</label>
                  <input
                    type="text"
                    placeholder="Please enter inventory name"
                    value={inventoryName}
                    onChange={(e) => setInventoryName(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Data Acquisition Method</label>
                  <select
                    value={dataAcquisitionMethod}
                    onChange={(e) => setDataAcquisitionMethod(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select your option</option>
                    <option value="Investment Specific">Investment Specific</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-neutral-500">
                    <span>Scope 1 emissions of investee</span>
                    <span>Scope 2 emissions of investee</span>
                    <span>Share of equity (percent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-600 shrink-0">Investments-1</span>
                    <input
                      type="number"
                      placeholder="Enter value"
                      value={investeeScope1}
                      onChange={(e) => setInvesteeScope1(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="number"
                      placeholder="Enter value"
                      value={investeeScope2}
                      onChange={(e) => setInvesteeScope2(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="number"
                      placeholder="%"
                      value={equityShare}
                      onChange={(e) => setEquityShare(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5"
                    />
                    <button
                      type="button"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Distance Input */}
            {(isWaste && activeSubTab === 'Waste') && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Distance</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Please enter distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-12 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                    km
                  </span>
                </div>
              </div>
            )}

            {/* Standard Amount Input */}
            {!isInvestments && !isBusinessTravel && !isUpstreamTransport && !isDownstreamTransport && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={isEmployeeCommuting ? 'Please enter distance' : 'Please enter amount'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-3 pr-14 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                    {activeSubTab === 'Spend Based'
                      ? '$$$'
                      : isFranchise
                      ? activeSubTab === 'Electricity Consumption'
                        ? 'kWh'
                        : activeSubTab === 'Water Consumption'
                        ? 'm3'
                        : ''
                      : isWaste && activeSubTab === 'Wastewater'
                      ? 'm3'
                      : isUpstreamTransport || isDownstreamTransport || isWaste || isEolSold
                      ? 'tonne'
                      : isEmployeeCommuting || isBusinessTravel
                      ? 'km'
                      : 'kg'}
                  </span>
                </div>
                {isWaste && activeSubTab === 'Wastewater' && (
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed font-semibold">
                    Note:
                    <span className="font-normal text-neutral-500 ml-1">
                      If you are using a unit other than those specified here, we recommend that you note the conversion factors and source you selected in the comments section.
                    </span>
                  </p>
                )}
                {isFranchise && activeSubTab === 'Electricity Consumption' && (
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed font-semibold">
                    Hint:
                    <span className="font-normal text-neutral-500 ml-1">
                      If you are using a unit other than those specified here, we recommend that you note the conversion factors and source you selected in the comments section.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Inventory Source */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-3">
            Inventory Source
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Facility</label>
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
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Date from</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Date to</label>
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

      {/* Middle row: Comment, Approval Status / Inventory Status, Save Button */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Comment</label>
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
            {isFranchise || isInvestments ? 'Inventory Status' : 'Approval Status'}
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
                <Loader2 className="w-4 h-4 animate-spin" /> Saving to Database...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Save to Database
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
              setSearch('');
              setFilterFacility('');
              setSelectedFacilityHeader('All Facilities');
              setFilterStatus('');
              setSelectedYear('2026');
              setAdditionalFilter({ category });
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
            ...(isFranchise ? [
              {
                accessorKey: 'amount',
                header: () => (
                  <button onClick={() => setSorting('amount')} className="flex items-center gap-1 font-bold">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </button>
                ),
                cell: ({ row }: any) => row.original.amount ?? '-',
              },
            ] : []),
            ...((((isUpstreamTransport || isDownstreamTransport) && activeSubTab !== 'Spend Based') || (isWaste && activeSubTab === 'Waste')) ? [
              {
                id: 'distance',
                header: 'Distance',
                cell: ({ row }: any) => row.original.distance ?? row.original.amount ?? '-',
              },
            ] : []),
            {
              accessorKey: 'unit',
              header: 'Unit',
              cell: ({ row }: any) => row.original.unit || '-',
            },
            {
              accessorKey: 'ef',
              header: () => (
                <button onClick={() => setSorting('ef')} className="flex items-center gap-1 font-bold">
                  <span>EF</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              ),
              cell: ({ row }: any) => row.original.ef ?? '-',
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
            ...((isFranchise && activeSubTab === 'Stationary Combustion') ? [
              {
                accessorKey: 'country',
                header: () => (
                  <button onClick={() => setSorting('country')} className="flex items-center gap-1 font-bold">
                    <span>Country</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </button>
                ),
                cell: ({ row }: any) => row.original.country || '-',
              },
            ] : []),
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
