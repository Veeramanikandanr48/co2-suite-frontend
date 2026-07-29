'use client';

import React from 'react';
import { ChevronDown, Upload, Paperclip, X } from 'lucide-react';

interface Scope1InventorySourceCardProps {
  facility: string;
  setFacility: (v: string) => void;
  dbFacilities: any[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function Scope1InventorySourceCard({
  facility,
  setFacility,
  dbFacilities,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  proofFile,
  setProofFile,
  fileInputRef,
}: Scope1InventorySourceCardProps) {
  return (
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
          <input
            type="file"
            ref={fileInputRef as any}
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
            className="border-2 border-dashed border-[#D1D5DB] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#00C9A7] hover:bg-[#F9FAFB] transition-all group"
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
                <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-[#ECFDF5] flex items-center justify-center text-neutral-500 group-hover:text-[#059669] transition-colors mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-neutral-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Allowed formats: JPEG, PNG, XLSX, PDF
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
