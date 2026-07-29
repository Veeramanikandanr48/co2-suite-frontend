'use client';

import React from 'react';
import { UploadCloud, Paperclip, X } from 'lucide-react';

interface Scope2InventorySourceCardProps {
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

export function Scope2InventorySourceCard({
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
}: Scope2InventorySourceCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-3.5">
        <h2 className="text-sm font-bold text-neutral-800 tracking-wide border-b border-neutral-100 pb-3">
          Inventory Source
        </h2>

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
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            Proof of Documents if any (Invoices, SAP output, screenshot etc.)
          </label>
          <input
            type="file"
            ref={fileInputRef as any}
            accept=".jpeg,.png,.xlsx,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProofFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-neutral-50/50 transition-all group"
          >
            {proofFile ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs font-medium text-emerald-700">
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
                <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-emerald-50 flex items-center justify-center text-neutral-400 group-hover:text-emerald-600 transition-colors mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-neutral-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
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
