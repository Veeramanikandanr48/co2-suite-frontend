'use client';

import React, { useMemo } from 'react';
import { Database, X, Loader2 } from 'lucide-react';
import { EmissionFactorItem } from './emission-factors-view';
import { CATEGORY_OPTIONS } from '../constants/emission-factor-constants';
import { FormulaBuilderField } from './formula-builder-field';

interface EmissionFactorModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingItem: EmissionFactorItem | null;
  formData: {
    category: string;
    source: string;
    version: string;
    fuelOrGasType: string;
    unit: string;
    factor: string;
    formula: string;
    isActive: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      category: string;
      source: string;
      version: string;
      fuelOrGasType: string;
      unit: string;
      factor: string;
      formula: string;
      isActive: boolean;
    }>
  >;
  submitting: boolean;
  handleSubmitForm: (e: React.FormEvent) => void;
}

export function EmissionFactorModal({
  isModalOpen,
  setIsModalOpen,
  editingItem,
  formData,
  setFormData,
  submitting,
  handleSubmitForm,
}: EmissionFactorModalProps) {
  const handleInsertToken = (token: string) => {
    setFormData((prev) => {
      const current = prev.formula || '';
      const needsSpace = current.length > 0 && !current.endsWith(' ') && !current.endsWith('(');
      const updated = needsSpace ? `${current} ${token}` : `${current}${token}`;
      return { ...prev, formula: updated };
    });
  };

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
    } catch {
      return { valid: false, message: 'Syntax error in formula expression' };
    }
    return null;
  }, [formData.formula, formData.factor]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-foreground text-background">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">
              {editingItem ? 'Edit Emission Factor' : 'Add New Emission Factor'}
            </h3>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-background/60 hover:text-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-foreground">Category / Scope *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary"
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
              <label className="font-bold text-foreground">Fuel / Gas / Item Name *</label>
              <input
                type="text"
                placeholder="e.g. Natural Gas, Diesel, Grid Power"
                value={formData.fuelOrGasType}
                onChange={(e) => setFormData({ ...formData, fuelOrGasType: e.target.value })}
                className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Emission Factor Value */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Emission Factor Value *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 1.942"
                value={formData.factor}
                onChange={(e) => setFormData({ ...formData, factor: e.target.value })}
                className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary font-mono font-bold"
                required
              />
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Unit</label>
              <input
                type="text"
                placeholder="e.g. kg CO2e / liter, sm3, kWh"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Database Source */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Database Source *</label>
              <input
                type="text"
                placeholder="e.g. DEFRA, IPCC, EPA"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Version / Year */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Version / Year</label>
              <input
                type="text"
                placeholder="e.g. 2024, AR6"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isActiveToggle"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <label htmlFor="isActiveToggle" className="font-bold text-foreground cursor-pointer">
                Active Emission Factor
              </label>
            </div>

            {/* Calculation Formula Section */}
            <FormulaBuilderField
              category={formData.category}
              formula={formData.formula}
              setFormula={(formula) => setFormData({ ...formData, formula })}
              formulaPreview={formulaPreview}
              handleInsertToken={handleInsertToken}
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-muted hover:bg-accent text-muted-foreground font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingItem ? 'Save Changes' : 'Create Emission Factor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
