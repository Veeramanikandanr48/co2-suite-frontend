'use client';

import React, { useState } from 'react';
import { Loader2, UploadCloud, FileText } from 'lucide-react';
import { Scope1FormCardsProps } from '@/types/components/services.types';
import { Scope1EntryFormFields } from './scope1-entry-form-fields';

export function Scope1FormCards({
  category,
  activityNotRelevant,
  canEdit,
  loadingEF,
  currentMatchingEF,
  efSource,
  setEfSource,
  availableEfSources,
  factorVersion,
  setFactorVersion,
  availableVersions,
  fuelOrGasType,
  setFuelOrGasType,
  availableFuelOrGasTypes,
  fugitiveType,
  setFugitiveType,
  leakagePercent,
  setLeakagePercent,
  amount,
  setAmount,
  inventoryName,
  setInventoryName,
  dataAcquisitionMethod,
  setDataAcquisitionMethod,
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
  comment,
  setComment,
  approvalStatus,
  setApprovalStatus,
  saving,
  onSaveToDatabase,
}: Scope1FormCardsProps) {
  const [isDragging, setIsDragging] = useState(false);

  const inputClass =
    'w-full bg-background border border-input rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
  const labelClass = 'block text-xs font-semibold text-foreground/80 mb-1.5';

  const sourcesList = availableEfSources;
  const versionsList = availableVersions;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setProofFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`space-y-4 ${
        activityNotRelevant ? 'opacity-40 pointer-events-none select-none' : ''
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Inventory Entry */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-wide border-b border-border pb-2.5 mb-4">
              Inventory Entry
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Emission Factor Source</label>
                <select
                  value={efSource}
                  onChange={(e) => setEfSource(e.target.value)}
                  disabled={loadingEF}
                  className={inputClass}
                >
                  <option value="">Select your option</option>
                  {sourcesList.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Factor Version</label>
                <select
                  value={factorVersion}
                  onChange={(e) => setFactorVersion(e.target.value)}
                  disabled={loadingEF}
                  className={inputClass}
                >
                  <option value="">Select your option</option>
                  {versionsList.map((ver) => (
                    <option key={ver} value={ver}>
                      {ver}
                    </option>
                  ))}
                </select>
              </div>

              <Scope1EntryFormFields
                category={category}
                fuelOrGasType={fuelOrGasType}
                setFuelOrGasType={setFuelOrGasType}
                availableFuelOrGasTypes={availableFuelOrGasTypes}
                fugitiveType={fugitiveType}
                setFugitiveType={setFugitiveType}
                leakagePercent={leakagePercent}
                setLeakagePercent={setLeakagePercent}
                amount={amount}
                setAmount={setAmount}
                inventoryName={inventoryName}
                setInventoryName={setInventoryName}
                dataAcquisitionMethod={dataAcquisitionMethod}
                setDataAcquisitionMethod={setDataAcquisitionMethod}
                currentMatchingEF={currentMatchingEF}
              />
            </div>
          </div>
        </div>

        {/* Right Card: Inventory Source */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-wide border-b border-border pb-2.5 mb-4">
              Inventory Source
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Facility</label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className={inputClass}
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
                  <label className={labelClass}>Date from</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date to</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Proof of Documents if any (Invoices, SAP output, screenshoot etc.)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 bg-muted/20'
                  }`}
                >
                  {proofFile ? (
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                      <FileText className="w-5 h-5" />
                      <span>{proofFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        Click to upload <span className="font-normal text-muted-foreground">or drag and drop</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Allowed formats: JPEG, PNG, XLSX, PDF
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Comment & Approval Status */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Comment</label>
            <input
              type="text"
              placeholder="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Approval Status</label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className={inputClass}
            >
              <option value="">Select your option</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Save to Database Button */}
        <button
          onClick={onSaveToDatabase}
          disabled={saving || !canEdit}
          className="w-full bg-slate-400 hover:bg-slate-500 text-slate-800 disabled:opacity-50 font-bold text-xs py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save to Database
        </button>
      </div>
    </div>
  );
}

