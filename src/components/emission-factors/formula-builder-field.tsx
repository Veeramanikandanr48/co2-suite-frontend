'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import { CATEGORY_VARIABLE_MAP } from './emission-factor-constants';

interface FormulaBuilderFieldProps {
  category: string;
  formula: string;
  setFormula: (v: string) => void;
  formulaPreview: { valid: boolean; value?: number; message?: string } | null;
  handleInsertToken: (token: string) => void;
}

export function FormulaBuilderField({
  category,
  formula,
  setFormula,
  formulaPreview,
  handleInsertToken,
}: FormulaBuilderFieldProps) {
  return (
    <div className="space-y-2 md:col-span-2 pt-1">
      <div className="flex items-center justify-between">
        <label className="font-bold text-neutral-700 text-xs">Calculation Formula</label>
        {formula && (
          <button
            type="button"
            onClick={() => setFormula('')}
            className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Input with Drop Zone & Live Result Indicator */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const token = e.dataTransfer.getData('text/plain');
          if (token) handleInsertToken(token);
        }}
        className="relative"
      >
        <input
          type="text"
          placeholder="e.g. (amount * factor) / 1000"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 pr-28 text-xs font-mono text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        {formulaPreview?.valid && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 pointer-events-none">
            = {formulaPreview.value} tCO₂e
          </span>
        )}
      </div>

      {/* Clean Drag/Click Pills & Math Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Variable Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(CATEGORY_VARIABLE_MAP[category] || [
            { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          ]).map((col) => (
            <span
              key={col.name}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', col.name);
              }}
              onClick={() => handleInsertToken(col.name)}
              className={`px-2 py-0.5 rounded border text-[11px] font-mono font-medium transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1 cursor-grab active:cursor-grabbing select-none ${col.color}`}
              title="Drag into formula field or click to insert"
            >
              <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0" />
              <span>{col.name}</span>
            </span>
          ))}
        </div>

        {/* Operators & Template Dropdown */}
        <div className="flex items-center gap-1">
          {['+', '-', '*', '/', '(', ')', '/ 1000'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => handleInsertToken(op)}
              className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-mono font-semibold border border-neutral-200 rounded text-xs transition-colors cursor-pointer"
            >
              {op}
            </button>
          ))}

          {/* Preset Template Select */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                setFormula(e.target.value);
                e.target.value = '';
              }
            }}
            className="bg-neutral-50 border border-neutral-200 text-[11px] font-medium text-neutral-600 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ml-1"
          >
            <option value="">Templates</option>
            <option value="(amount * factor) / 1000">(amount * factor) / 1000</option>
            <option value="amount * factor">amount * factor</option>
            <option value="(distance * amount * factor) / 1000">(distance * amount * factor) / 1000</option>
            <option value="(people * distance * factor) / 1000">(people * distance * factor) / 1000</option>
            <option value="(rooms * nights * factor) / 1000">(rooms * nights * factor) / 1000</option>
            <option value="(amount * (leakage / 100) * factor) / 1000">(amount * (leakage / 100) * factor) / 1000</option>
            <option value="(scope1 + scope2) * (equityShare / 100)">(scope1 + scope2) * (equityShare / 100)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
