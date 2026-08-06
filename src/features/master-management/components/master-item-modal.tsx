'use client';

/**
 * MasterItemModal — Create Only
 *
 * ADR-v1.0 UX pattern: Modals are for CREATE. EDIT lives in the Detail Drawer.
 * This component is fully self-contained: it fetches its own dependent lists
 * and manages its own form state, so the parent stays thin.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { MasterItemFormData, MASTER_ITEM_TYPES } from '@/types/master-management.types';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MasterItemModalProps {
  isOpen: boolean;
  editingItem: null; // Always null — this modal is Create-only
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: string;
}

const INITIAL_FORM: MasterItemFormData = {
  type: 'FUEL_TYPE',
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  isActive: true,
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-muted-foreground mb-1">
      {children}{required && <span className="ml-0.5 text-negative-500">*</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, mono, ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  [key: string]: unknown;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full h-9 px-3 text-sm bg-background border border-input rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground',
        mono && 'font-mono'
      )}
      {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );
}

export function MasterItemModal({ isOpen, onClose, onSuccess, defaultType }: MasterItemModalProps) {
  const [form, setForm] = useState<MasterItemFormData>({
    ...INITIAL_FORM,
    type: defaultType ?? INITIAL_FORM.type,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset when reopened
  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, type: defaultType ?? INITIAL_FORM.type });
      setErrors({});
    }
  }, [isOpen, defaultType]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.type) e.type = 'Type is required';
    if (!form.code.trim()) e.code = 'Code is required';
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await apiService.post(API_LIST.MASTERS_ITEMS, {
        ...form,
        code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
        name: form.name.trim(),
        description: form.description?.trim(),
      });
      toast({ title: 'Created', description: `${form.name} added to ${form.type.replace(/_/g, ' ')}` });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create item';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-2xl)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Add Master Item</h3>
                <p className="text-xs text-muted-foreground">New entry in the master data registry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
            <div className="px-5 py-4 space-y-4">
              {/* Type */}
              <div>
                <FieldLabel required>Type</FieldLabel>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className={cn(
                    'w-full h-9 px-3 text-sm bg-background border rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.type ? 'border-negative-400' : 'border-input'
                  )}
                >
                  {MASTER_ITEM_TYPES.filter(
                    (t) => !['UNIT_CONVERSIONS', 'MAPPINGS_CATEGORY_FUEL', 'MAPPINGS_FUEL_UNIT', 'EMISSION_FACTOR'].includes(t.value)
                  ).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className="text-xs text-negative-500 mt-1">{errors.type}</p>}
              </div>

              {/* Code */}
              <div>
                <FieldLabel required>Code</FieldLabel>
                <TextInput
                  value={form.code}
                  onChange={(v) => setForm((f) => ({ ...f, code: v }))}
                  placeholder="e.g. DIESEL, SCOPE_1"
                  mono
                />
                {errors.code && <p className="text-xs text-negative-500 mt-1">{errors.code}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">Will be uppercased and spaces replaced with underscores.</p>
              </div>

              {/* Name */}
              <div>
                <FieldLabel required>Display Name</FieldLabel>
                <TextInput
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="e.g. Diesel, Scope 1"
                />
                {errors.name && <p className="text-xs text-negative-500 mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description for this master item"
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Sort order */}
              <div>
                <FieldLabel>Sort Order</FieldLabel>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full h-9 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="create-isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="create-isActive" className="text-sm font-medium text-foreground">
                  Active (Published)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border bg-muted/30 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {submitting ? 'Creating…' : 'Create item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
