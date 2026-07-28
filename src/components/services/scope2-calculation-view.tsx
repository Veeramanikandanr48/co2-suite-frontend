'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Info,
  UploadCloud,
  Edit2,
  Copy,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

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

export function Scope2CalculationView({ category }: Scope2CalculationViewProps) {
  const isElectricity = category === 'Purchased Electricity';

  // Selected filters
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFacilityHeader, setSelectedFacilityHeader] = useState('All Facilities');
  const [isNotRelevant, setIsNotRelevant] = useState(false);

  // Form State
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

  // API Data State
  const [dbFactors, setDbFactors] = useState<DBEmissionFactor[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Emission Factors & Inventory Entries from DB
  const fetchData = async () => {
    try {
      setLoading(true);
      const efCategory = isElectricity ? 'Purchased Electricity' : 'Purchased Heating & Steam';
      
      const [efRes, invRes] = await Promise.all([
        fetch(`http://localhost:3001/emission-factors?category=${encodeURIComponent(efCategory)}`),
        fetch(`http://localhost:3001/inventory-entries?category=${encodeURIComponent(efCategory)}`),
      ]);

      if (efRes.ok) {
        const efJson = await efRes.json();
        setDbFactors(efJson.data || []);
      }
      if (invRes.ok) {
        const invJson = await invRes.json();
        setInventoryList(invJson.data || []);
      }
    } catch (err) {
      console.error('Failed to load Scope 2 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

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
    return inventoryList.reduce((acc, curr) => {
      const val = Number(curr.emission) || 0;
      return acc + val;
    }, 0);
  }, [inventoryList]);

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
      
      const payload = {
        serviceCode: 'CARBON',
        category: efCategory,
        name: itemName,
        amount: Number(amount),
        unit: 'kWh',
        efSource: efSource || 'IEA - 2023 Edition-2021',
        dateFrom: dateFrom || '01.01.2026',
        dateTo: dateTo || '31.12.2026',
        facility: facility || 'Manchester Facility',
        status: 'completed',
        comment,
        approvalStatus,
      };

      const res = await fetch('http://localhost:3001/inventory-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save inventory entry');
      }

      toast.success('Inventory entry saved successfully!');
      setAmount('');
      setComment('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error saving to database');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Entry from DB
  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/inventory-entries/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Inventory entry deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete item');
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
              onChange={(e) => setIsNotRelevant(e.target.checked)}
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
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-[11px] bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-700"
              >
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
              onChange={(e) => setSelectedFacilityHeader(e.target.value)}
              className="text-[11px] bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-700"
            >
              <option value="All Facilities">All Facilities</option>
              <option value="Manchester Facility">Manchester Facility</option>
              <option value="Leeds Facility">Leeds Facility</option>
            </select>
          </div>
        </div>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <option value="Manchester Facility">Manchester Facility</option>
                <option value="Leeds Facility">Leeds Facility</option>
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
              <div className="border-2 border-dashed border-neutral-200 hover:border-emerald-400 transition-colors rounded-xl p-6 text-center cursor-pointer bg-neutral-50/50 flex flex-col items-center justify-center gap-2">
                <UploadCloud className="w-8 h-8 text-neutral-400" />
                <div className="text-xs font-semibold text-neutral-700">
                  Click to upload <span className="font-normal text-neutral-500">or drag and drop</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Allowed formats: JPEG, PNG, XLSX, PDF
                </div>
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
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800 tracking-wide">
            Inventory Table
          </h2>
          <button
            type="button"
            className="px-3 py-1.5 bg-navy-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
            style={{ backgroundColor: '#0B132B' }}
          >
            Clear All Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100 text-[11px] font-bold text-neutral-600 border-b border-neutral-200">
                <th className="py-2.5 px-3">Actions</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">EF Source</th>
                <th className="py-2.5 px-3">From</th>
                <th className="py-2.5 px-3">To</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Emission (t CO₂-e)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading inventory table...
                  </td>
                </tr>
              ) : inventoryList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400 font-medium">
                    No data available.
                  </td>
                </tr>
              ) : (
                inventoryList.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Edit2 className="w-3.5 h-3.5 hover:text-emerald-600 cursor-pointer" />
                        <Copy className="w-3.5 h-3.5 hover:text-blue-600 cursor-pointer" />
                        <Trash2
                          className="w-3.5 h-3.5 hover:text-red-600 cursor-pointer"
                          onClick={() => handleDeleteItem(item.id)}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-neutral-800">{item.name}</td>
                    <td className="py-3 px-3 text-neutral-600">{item.efSource || '-'}</td>
                    <td className="py-3 px-3 text-neutral-500">{item.dateFrom || item.from || '-'}</td>
                    <td className="py-3 px-3 text-neutral-500">{item.dateTo || item.to || '-'}</td>
                    <td className="py-3 px-3 text-neutral-700">{item.facility || '-'}</td>
                    <td className="py-3 px-3 font-bold text-neutral-800">
                      {Number(item.emission || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
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
