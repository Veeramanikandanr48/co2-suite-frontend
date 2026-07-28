'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Upload,
  AlertTriangle,
  ChevronDown,
  Edit2,
  Copy,
  Trash2,
  Filter,
  ArrowUpDown,
  Plus,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';
import { showSuccessToast, showErrorToast } from '@/components/reusables/toast-variant';

export type Scope1CategoryType =
  | 'Stationary Combustion'
  | 'Mobile Combustion'
  | 'Fugitive Emissions'
  | 'Process Emissions';

interface Scope1CalculationViewProps {
  category: Scope1CategoryType;
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
  amount?: number | string;
  unit?: string;
  ef?: number | string;
  efSource?: string;
  dateFrom?: string;
  dateTo?: string;
  from?: string;
  to?: string;
  facility?: string;
  emission?: number | string;
  status?: string;
  comment?: string;
  approvalStatus?: string;
}

const CATEGORY_DESCRIPTIONS: Record<
  Scope1CategoryType,
  { title: string; description: string; note: string }
> = {
  'Stationary Combustion': {
    title: 'Stationary Combustion',
    description:
      'Carbon dioxide (CO₂), methane (CH₄), and nitrous oxide (N₂O) are the three greenhouse gases (GHGs) released when fuels burn in stationary combustion sources. Boilers, heaters, furnaces, kilns, ovens, flares, thermal oxidizers, dryers, and any other apparatus or equipment that burns carbon-bearing fuels or waste stream materials are examples of stationary combustion sources of emissions.',
    note: 'Note: The sector in which the emission-generating fuel is used is crucial. Additionally, if fuel is consumed in laboratory experiments for R&D or similar purposes, it must also be considered.',
  },
  'Mobile Combustion': {
    title: 'Mobile Combustion',
    description:
      'Mobile emissions refer to a wide range of company-owned or operated vehicles, engines and equipment that generate greenhouse gas emissions from the combustion of various fuels as they move from one location to another.',
    note: 'Note: Includes emissions from fuel consumption of company-owned vehicles and rental vehicles. Off-road vehicles such as forklifts etc. should also be taken into account. Fuel consumption from employee shuttle services should be excluded.',
  },
  'Fugitive Emissions': {
    title: 'Fugitive Emissions',
    description:
      'Fugitive emissions refer to greenhouse gases (CO₂, CH₄, HFCs, PFCs, etc.) that escape into the atmosphere during the use of equipment such as refrigerants and fire extinguishers.',
    note: 'Note: Greenhouse gases used for different purposes by various vehicles should be taken into account in the reporting year, taking into account the upper value of the annual theoretical leakage rate of the relevant vehicle. Theoretical leakage rates vary according to the vehicle in which the gas is used. These values are usually declared by the manufacturer in the technical specifications of the vehicles.',
  },
  'Process Emissions': {
    title: 'Process Emissions',
    description:
      'Process emissions generally include emissions from the chemical transformation of raw materials and fugitive emissions. The chemical transformation of raw materials often releases greenhouse gases such as CO₂, CH₄, and N₂O.',
    note: 'Note: If MRV was measured and reported during the reporting year, the values here can be used.',
  },
};

export function Scope1CalculationView({ category }: Scope1CalculationViewProps) {
  const meta = CATEGORY_DESCRIPTIONS[category] || CATEGORY_DESCRIPTIONS['Stationary Combustion'];

  // Form states
  const [activityNotRelevant, setActivityNotRelevant] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFacilityHeader, setSelectedFacilityHeader] = useState('All Facilities');

  // Dynamic Emission Factors state from DB
  const [dbEmissionFactors, setDbEmissionFactors] = useState<DBEmissionFactor[]>([]);
  const [loadingEF, setLoadingEF] = useState(true);

  // Dynamic Inventory Table state from DB
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form input states
  const [efSource, setEfSource] = useState('');
  const [factorVersion, setFactorVersion] = useState('');
  const [fuelOrGasType, setFuelOrGasType] = useState('');
  const [fugitiveType, setFugitiveType] = useState<'filling' | 'leakage'>('filling');
  const [leakagePercent, setLeakagePercent] = useState('');
  const [amount, setAmount] = useState('');
  const [inventoryName, setInventoryName] = useState('');
  const [dataAcquisitionMethod, setDataAcquisitionMethod] = useState('');

  const [facility, setFacility] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [comment, setComment] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');

  // Fetch Emission Factors dynamically from DB
  const fetchEmissionFactors = useCallback(async () => {
    try {
      setLoadingEF(true);
      const response = await apiService.get<DBEmissionFactor[]>(`${API_LIST.EMISSION_FACTORS}?category=${encodeURIComponent(category)}`);
      const data = (response as any)?.data ?? response;
      const list = Array.isArray(data) ? data : [];
      setDbEmissionFactors(list);

      // Pre-select first EF source if available
      if (list.length > 0) {
        setEfSource(list[0].source);
        setFactorVersion(list[0].version || 'AR6');
        setFuelOrGasType(list[0].fuelOrGasType);
      }
    } catch (error) {
      console.error('Failed to fetch emission factors from DB:', error);
    } finally {
      setLoadingEF(false);
    }
  }, [category]);

  // Fetch Inventory Entries dynamically from DB
  const fetchInventoryEntries = useCallback(async () => {
    try {
      setLoadingInventory(true);
      const response = await apiService.get<InventoryItem[]>(`${API_LIST.INVENTORY_ENTRIES}?category=${encodeURIComponent(category)}`);
      const data = (response as any)?.data ?? response;
      const items = Array.isArray(data) ? data : [];
      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to fetch inventory entries from DB:', error);
    } finally {
      setLoadingInventory(false);
    }
  }, [category]);

  // Dynamic Facilities state from DB
  const [dbFacilities, setDbFacilities] = useState<any[]>([]);

  const fetchFacilities = useCallback(async () => {
    try {
      const response = await apiService.get<any[]>(API_LIST.FACILITIES);
      const data = (response as any)?.data ?? response;
      const list = Array.isArray(data) ? data : [];
      setDbFacilities(list);
    } catch (error) {
      console.error('Failed to fetch facilities from DB:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmissionFactors();
    fetchInventoryEntries();
    fetchFacilities();
  }, [fetchEmissionFactors, fetchInventoryEntries, fetchFacilities]);

  // Available unique EF Sources from DB
  const availableEfSources = useMemo(() => {
    const sources = new Set<string>();
    dbEmissionFactors.forEach((item) => sources.add(item.source));
    return Array.from(sources);
  }, [dbEmissionFactors]);

  // Available Factor Versions for selected Source
  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    dbEmissionFactors
      .filter((item) => !efSource || item.source === efSource)
      .forEach((item) => versions.add(item.version));
    return Array.from(versions);
  }, [dbEmissionFactors, efSource]);

  // Available Fuel / Gas Types for selected Source and Version
  const availableFuelOrGasTypes = useMemo(() => {
    const types = new Set<string>();
    dbEmissionFactors
      .filter((item) => (!efSource || item.source === efSource) && (!factorVersion || item.version === factorVersion))
      .forEach((item) => types.add(item.fuelOrGasType));
    return Array.from(types);
  }, [dbEmissionFactors, efSource, factorVersion]);

  // Find exact matching EF object from DB
  const currentMatchingEF = useMemo(() => {
    return dbEmissionFactors.find(
      (item) =>
        (!efSource || item.source === efSource) &&
        (!fuelOrGasType || item.fuelOrGasType === fuelOrGasType),
    );
  }, [dbEmissionFactors, efSource, fuelOrGasType]);

  // Compute total emissions sum from DB inventory records
  const totalEmissionVal = inventoryItems
    .reduce((sum, item) => sum + (parseFloat(String(item.emission)) || 0), 0)
    .toFixed(1);

  // Save new inventory entry to Backend DB
  const handleSaveToDatabase = async () => {
    if (!amount && category !== 'Process Emissions') {
      showErrorToast('Please enter an amount before saving.');
      return;
    }

    try {
      setSaving(true);
      const efValue = currentMatchingEF?.factor ?? 1.938;
      const unitVal = currentMatchingEF?.unit ?? (category === 'Fugitive Emissions' ? 'kg' : category === 'Process Emissions' ? 'kgCO2' : 'sm3');
      const nameVal =
        category === 'Process Emissions'
          ? inventoryName || 'Custom Process'
          : fuelOrGasType || 'Natural Gas';

      const payload = {
        serviceCode: 'CARBON',
        category,
        name: nameVal,
        amount: parseFloat(amount) || 0,
        unit: unitVal,
        ef: efValue,
        efSource: efSource || currentMatchingEF?.source || 'IPCC-AR6',
        dateFrom: dateFrom || '01.01.2026',
        dateTo: dateTo || '31.12.2026',
        facility: facility || 'Manchester Facility',
        approvalStatus: approvalStatus || 'Approved',
        comment,
      };

      const response = await apiService.post<InventoryItem>('inventory-entries', payload);
      const savedItem = (response as any)?.data ?? response;

      showSuccessToast(`${category} inventory entry saved to Database successfully!`);
      // Refresh inventory table from DB
      await fetchInventoryEntries();

      // Clear input fields
      setAmount('');
      setInventoryName('');
      setComment('');
    } catch (error) {
      console.error('Error saving inventory entry to DB:', error);
      showErrorToast('Failed to save inventory record to database.');
    } finally {
      setSaving(false);
    }
  };

  // Delete inventory entry from Backend DB
  const handleDeleteItem = async (id: number) => {
    try {
      await apiService.delete(`inventory-entries/${id}`);
      showSuccessToast('Inventory record deleted from Database.');
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting inventory entry from DB:', error);
      showErrorToast('Failed to delete inventory record.');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ─── Top Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activityNotRelevant"
              checked={activityNotRelevant}
              onChange={(e) => setActivityNotRelevant(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#D1D5DB] text-[#059669] focus:ring-[#059669]"
            />
            <label htmlFor="activityNotRelevant" className="text-xs font-semibold text-neutral-500 cursor-pointer">
              Activity is not relevant
            </label>
          </div>
          <h1 className="text-2xl font-black text-neutral-800 tracking-tight">
            {meta.title}
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            {meta.description}
          </p>

          {/* Warning Note Box */}
          <div className="mt-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 flex items-start gap-2 text-[11px] text-[#92400E] font-medium leading-normal">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <p>{meta.note}</p>
          </div>
        </div>

        {/* Right Badge: Total Emission Box */}
        <div className="bg-white border-2 border-[#00C9A7] rounded-2xl p-4 min-w-[240px] shadow-xs shrink-0 self-stretch lg:self-auto flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F2F5] pb-2">
            <span className="text-xs font-extrabold text-[#00C9A7] tracking-tight">
              Total Emission
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-neutral-50 border border-[#E6E8EB] text-[10px] font-bold text-neutral-600 px-2 py-0.5 rounded cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-black text-neutral-800 tracking-tight">
                {totalEmissionVal}
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">tonne CO₂-e</p>
            </div>
            <select
              value={selectedFacilityHeader}
              onChange={(e) => setSelectedFacilityHeader(e.target.value)}
              className="bg-neutral-50 border border-[#E6E8EB] text-[10px] font-bold text-neutral-600 px-2 py-0.5 rounded cursor-pointer"
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

      {/* ─── Two-Column Form Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card: Inventory Entry */}
        <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
              Inventory Entry
            </h3>
            {currentMatchingEF && (
              <span className="text-[10px] font-mono bg-[#ECFDF5] text-[#059669] font-bold px-2 py-0.5 rounded border border-[#A7F3D0]">
                EF: {currentMatchingEF.factor} {currentMatchingEF.unit}
              </span>
            )}
          </div>

          {/* Emission Factor Source */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-600">
              Emission Factor Source
            </label>
            <div className="relative">
              <select
                value={efSource}
                onChange={(e) => setEfSource(e.target.value)}
                disabled={loadingEF}
                className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7] transition-colors"
              >
                <option value="">Select your option</option>
                {availableEfSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Factor Version */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-600">
              Factor Version
            </label>
            <div className="relative">
              <select
                value={factorVersion}
                onChange={(e) => setFactorVersion(e.target.value)}
                disabled={loadingEF}
                className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7] transition-colors"
              >
                <option value="">Select your option</option>
                {availableVersions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Category-Specific Form Fields */}
          {category === 'Process Emissions' ? (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Inventory Name
                </label>
                <input
                  type="text"
                  placeholder="Please enter inventory name"
                  value={inventoryName}
                  onChange={(e) => setInventoryName(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Emission
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Please enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 pr-16 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-neutral-400 pointer-events-none">
                    kgCO2
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Data Acquisition Method
                </label>
                <div className="relative">
                  <select
                    value={dataAcquisitionMethod}
                    onChange={(e) => setDataAcquisitionMethod(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                  >
                    <option value="">Select your option</option>
                    <option value="Direct Measurement">Direct Measurement</option>
                    <option value="Continuous Emission Monitoring">Continuous Emission Monitoring</option>
                    <option value="Mass Balance Calculation">Mass Balance Calculation</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </>
          ) : category === 'Fugitive Emissions' ? (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Gas Type
                </label>
                <div className="relative">
                  <select
                    value={fuelOrGasType}
                    onChange={(e) => setFuelOrGasType(e.target.value)}
                    disabled={loadingEF}
                    className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                  >
                    <option value="">Select your option</option>
                    {availableFuelOrGasTypes.map((gt) => (
                      <option key={gt} value={gt}>
                        {gt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                  <input
                    type="radio"
                    name="fugitiveType"
                    checked={fugitiveType === 'filling'}
                    onChange={() => setFugitiveType('filling')}
                    className="text-[#059669] focus:ring-[#059669]"
                  />
                  Filling
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                  <input
                    type="radio"
                    name="fugitiveType"
                    checked={fugitiveType === 'leakage'}
                    onChange={() => setFugitiveType('leakage')}
                    className="text-[#059669] focus:ring-[#059669]"
                  />
                  Leakage
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {fugitiveType === 'leakage' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600">
                      Leakage (%)
                    </label>
                    <input
                      type="number"
                      placeholder="Please enter leakage"
                      value={leakagePercent}
                      onChange={(e) => setLeakagePercent(e.target.value)}
                      className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                    />
                  </div>
                )}
                <div className="space-y-1 col-span-1">
                  <label className="text-[11px] font-bold text-neutral-600">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Please enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Fuel Type
                </label>
                <div className="relative">
                  <select
                    value={fuelOrGasType}
                    onChange={(e) => setFuelOrGasType(e.target.value)}
                    disabled={loadingEF}
                    className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                  >
                    <option value="">Select your option</option>
                    {availableFuelOrGasTypes.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Please enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                />
              </div>
            </>
          )}

          {/* Footer Note */}
          <div className="pt-2">
            <p className="text-[10px] font-semibold text-neutral-400 leading-normal">
              <span className="font-extrabold text-neutral-700">Note:</span> If you have the data in units not specified here, then please provide the conversion factor to get to this value in the comment section below.
            </p>
          </div>
        </div>

        {/* Right Card: Inventory Source */}
        <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
              Inventory Source
            </h3>

            {/* Facility Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600">
                Facility
              </label>
              <div className="relative">
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                >
                  <option value="">Select your option</option>
                  {dbFacilities.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Date Range Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Date from
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600">
                  Date to
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
                />
              </div>
            </div>

            {/* Proof of Documents Upload Zone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600">
                Proof of Documents if any (Invoices, SAP output, screenshot etc.)
              </label>
              <div className="border-2 border-dashed border-[#D1D5DB] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#00C9A7] hover:bg-[#F9FAFB] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-[#ECFDF5] flex items-center justify-center text-neutral-500 group-hover:text-[#059669] transition-colors mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-neutral-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Allowed formats: JPEG, PNG, XLSX, PDF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Comment, Status & Save Button Row ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-600">
              Comment
            </label>
            <input
              type="text"
              placeholder=""
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-600">
              Approval Status
            </label>
            <div className="relative">
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-full appearance-none bg-white border border-[#E6E8EB] text-xs text-neutral-700 px-3 py-2 rounded-xl focus:outline-none focus:border-[#00C9A7]"
              >
                <option value="">Select your option</option>
                <option value="Approved">Approved</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Full width action button */}
        <button
          onClick={handleSaveToDatabase}
          disabled={saving}
          className="w-full bg-[#94A3B8] hover:bg-[#64748B] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Save to Database</span>
        </button>
      </div>

      {/* ─── Inventory Table Section ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
              Inventory Table
            </h3>
            {loadingInventory && (
              <Loader2 className="w-4 h-4 animate-spin text-[#059669]" />
            )}
          </div>
          <button
            onClick={fetchInventoryEntries}
            className="bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            Clear All Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto rounded-xl border border-[#E6E8EB]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E6E8EB] text-neutral-500 font-bold text-[11px]">
                <th className="p-3 whitespace-nowrap">Actions</th>
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <Filter className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                {category !== 'Fugitive Emissions' && category !== 'Process Emissions' && (
                  <>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>Unit</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>EF</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                  </>
                )}
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>EF Source</span>
                    <Filter className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>From</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>To</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Facility</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Emission (t CO₂-e)</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <Filter className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EB] text-neutral-700 font-medium">
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-neutral-400 italic">
                    {loadingInventory ? 'Loading inventory data from Database...' : 'No inventory data available in Database.'}
                  </td>
                </tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    {/* Action icons */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <button className="hover:text-[#059669] transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="hover:text-[#059669] transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-neutral-800 whitespace-nowrap underline decoration-dashed underline-offset-4 decoration-neutral-300">
                      {item.name}
                    </td>
                    {category !== 'Fugitive Emissions' && category !== 'Process Emissions' && (
                      <>
                        <td className="p-3 whitespace-nowrap">{item.amount}</td>
                        <td className="p-3 whitespace-nowrap text-neutral-500">{item.unit}</td>
                        <td className="p-3 whitespace-nowrap font-mono">{item.ef}</td>
                      </>
                    )}
                    <td className="p-3 whitespace-nowrap max-w-xs truncate text-neutral-600">
                      {item.efSource}
                    </td>
                    <td className="p-3 whitespace-nowrap text-neutral-500">{item.dateFrom || item.from || '-'}</td>
                    <td className="p-3 whitespace-nowrap text-neutral-500">{item.dateTo || item.to || '-'}</td>
                    <td className="p-3 whitespace-nowrap">{item.facility || '-'}</td>
                    <td className="p-3 whitespace-nowrap font-bold text-neutral-800">
                      {item.emission}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          item.status === 'completed'
                            ? 'bg-[#64748B]'
                            : item.status === 'pending'
                            ? 'bg-[#F97316]'
                            : 'bg-neutral-300'
                        }`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
