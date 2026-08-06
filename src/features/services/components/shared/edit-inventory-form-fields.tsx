'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, Loader2 } from 'lucide-react';
import { EditInventoryFormFieldsProps } from '@/types/components/services.types';
import { apiService } from '@/lib/api/api-service';

export function EditInventoryFormFields({
  item,
  name,
  setName,
  facility,
  setFacility,
  facilities,
  amount,
  setAmount,
  unit,
  setUnit,
  ef,
  setEf,
  efSource,
  setEfSource,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  approvalStatus,
  setApprovalStatus,
  comment,
  setComment,
  proofFile,
  setProofFile,
}: EditInventoryFormFieldsProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleAiAssist = async () => {
    if (!name.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const [unitRes, factorRes] = await Promise.all([
        apiService.getAiUnitSuggestion<{ amount: number; unit: string; confidence: number }>(name),
        apiService.getAiFactorRecommendation<{ recommendedSource: string; reason: string }>('Stationary Combustion', name, unit || 'kWh'),
      ]);

      if (unitRes?.data?.unit && !unit) {
        setUnit(unitRes.data.unit);
      }
      if (factorRes?.data?.recommendedSource && !efSource) {
        setEfSource(factorRes.data.recommendedSource);
      }
      setAiSuggestion(`AI Auto-filled: Unit "${unitRes?.data?.unit || unit}" & EF Source "${factorRes?.data?.recommendedSource || 'DEFRA 2026'}"`);
    } catch {
      setAiSuggestion('AI Assistant temporarily unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Entry Name with AI Assist */}
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-neutral-700">
            Entry / Activity Name <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAiAssist}
            disabled={aiLoading || !name.trim()}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
            ) : (
              <Sparkles className="w-3 h-3 text-purple-600" />
            )}
            <span>AI Auto-Suggest</span>
          </button>
        </div>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Natural Gas, Diesel Fleet, Purchased Electricity"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
        {aiSuggestion && (
          <p className="text-[10px] text-purple-600 font-medium mt-1 animate-pulse">
            ✨ {aiSuggestion}
          </p>
        )}
      </div>

      {/* Facility */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Facility</label>
        {facilities.length > 0 ? (
          <select
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
          >
            <option value="">Select Facility</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.name}>
                {fac.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            placeholder="e.g. Central HQ"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
          />
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="any"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
      </div>

      {/* Unit */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit</label>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g. sm3, kWh, kg, km, litre"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
      </div>

      {/* Emission Factor */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Emission Factor (EF)</label>
        <input
          type="number"
          step="any"
          value={ef}
          onChange={(e) => setEf(e.target.value)}
          placeholder="e.g. 1.942"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
        <div className="mt-1 flex items-center justify-between px-1">
          <span className="text-[10px] text-neutral-500 font-medium">Live Emission Calc:</span>
          <span className="text-[11px] font-bold text-[#059669]">
            {(() => {
              const amtVal = parseFloat(String(amount)) || 0;
              const efVal = parseFloat(String(ef)) || 0;
              const uLower = (unit || '').toLowerCase();
              if (uLower === 'tonne' || uLower === 'ton') {
                return efVal > 1.0 ? ((amtVal * efVal) / 1000).toFixed(3) : (amtVal * efVal).toFixed(3);
              }
              return ((amtVal * efVal) / 1000).toFixed(3);
            })()} t CO₂-e
          </span>
        </div>
      </div>

      {/* EF Source */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">EF Source</label>
        <input
          type="text"
          value={efSource}
          onChange={(e) => setEfSource(e.target.value)}
          placeholder="e.g. IPCC-AR6, DEFRA 2026"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
      </div>

      {/* Date From */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Date From</label>
        <input
          type="text"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="01.01.2026"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
      </div>

      {/* Date To */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Date To</label>
        <input
          type="text"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="31.12.2026"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        />
      </div>

      {/* Approval Status */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Approval Status</label>
        <select
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white"
        >
          <option value="Approved">Approved</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Comment */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Comments / Notes</label>
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add any notes or justification..."
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#00C9A7] focus:bg-white resize-none"
        />
      </div>

      {/* Document Proof */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-neutral-700 mb-1">Proof Document</label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors border border-neutral-200">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>{proofFile ? proofFile.name : 'Upload New Proof Document'}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProofFile(e.target.files[0]);
                }
              }}
            />
          </label>
          {item.documentPath && !proofFile && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate max-w-[200px]">{item.documentPath}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
