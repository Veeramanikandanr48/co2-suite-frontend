'use client';

/**
 * MasterItemModal — Create Only
 *
 * Integrated with Low-Code DynamicFormRenderer.
 * Dynamic fields, validation rules, and events load live from GET /masters/types/:code/schema
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { DynamicFormRenderer } from './dynamic-form-renderer';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { toast } from '@/hooks/use-toast';

interface MasterItemModalProps {
  isOpen: boolean;
  editingItem: null;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: string;
  defaultServiceCode?: string;
}

export function MasterItemModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'FUEL_TYPE',
  defaultServiceCode = 'CARBON',
}: MasterItemModalProps) {
  if (!isOpen) return null;

  const handleDynamicSubmit = async (formData: Record<string, any>) => {
    try {
      await apiService.post(API_LIST.MASTERS_ITEMS, {
        type: defaultType,
        serviceCode: defaultServiceCode,
        ...formData,
        code: (formData.code || '').trim().toUpperCase().replace(/\s+/g, '_'),
        name: (formData.name || '').trim(),
        description: (formData.description || '').trim(),
      });
      toast({ title: 'Created', description: `${formData.name || 'Item'} added to ${defaultType}` });
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save master item';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

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
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">New Master Entry</h3>
                <p className="text-[11px] text-muted-foreground">Workspace: {defaultServiceCode}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body with Dynamic Form Renderer */}
          <div className="p-5 overflow-y-auto">
            <DynamicFormRenderer
              typeCode={defaultType}
              initialValues={{ serviceCode: defaultServiceCode }}
              onSubmit={handleDynamicSubmit}
              onCancel={onClose}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
