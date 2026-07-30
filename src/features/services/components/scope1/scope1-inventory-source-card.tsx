'use client';

import React from 'react';
import { ChevronDown, Upload, Paperclip, X } from 'lucide-react';
import { Scope1InventorySourceCardProps } from '@/types/components/services.types';

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
    <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-foreground tracking-tight">
          Inventory Source
        </h3>

        {/* Facility Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground">
            Facility
          </label>
          <div className="relative">
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full appearance-none bg-card border border-border text-xs text-foreground px-3 py-2 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="">Select your option</option>
              {dbFacilities.map((fac) => (
                <option key={fac.id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Date Range Pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground">
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-card border border-border text-xs text-foreground px-3 py-2 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground">
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-card border border-border text-xs text-foreground px-3 py-2 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Proof of Documents Upload Zone */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground">
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
            className="border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-all group"
          >
            {proofFile ? (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs font-semibold text-primary">
                <Paperclip className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[200px]">{proofFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProofFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-muted-foreground hover:text-destructive ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
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
