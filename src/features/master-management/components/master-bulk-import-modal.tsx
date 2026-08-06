'use client';

/**
 * MasterBulkImportModal — 4-step import wizard
 *
 * Step 1: Upload — drag & drop + template download
 * Step 2: Preview — first 20 parsed rows in mini-grid
 * Step 3: Validate — per-row error/warning list
 * Step 4: Confirm — diff summary (N new · M updated · K skipped) + Import
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle,
  ChevronRight, ChevronLeft, Loader2, Download, RotateCcw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  rowIndex: number;
  type: string;
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  [key: string]: unknown;
}

interface ValidationIssue {
  rowIndex: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ImportDiff {
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
}

type WizardStep = 1 | 2 | 3 | 4;

const STEPS = [
  { step: 1 as WizardStep, label: 'Upload' },
  { step: 2 as WizardStep, label: 'Preview' },
  { step: 3 as WizardStep, label: 'Validate' },
  { step: 4 as WizardStep, label: 'Import' },
];

const REQUIRED_COLS = ['type', 'code', 'name'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseXlsx(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        resolve(
          rows.map((row, i) => ({
            rowIndex: i + 2, // 1-indexed, row 1 = header
            type: String(row.type ?? row.Type ?? ''),
            code: String(row.code ?? row.Code ?? ''),
            name: String(row.name ?? row.Name ?? ''),
            description: row.description != null ? String(row.description) : undefined,
            sortOrder: row.sortOrder != null ? Number(row.sortOrder) : undefined,
            ...row,
          }))
        );
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

function validateRows(rows: ParsedRow[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();

  rows.forEach((row) => {
    REQUIRED_COLS.forEach((col) => {
      if (!row[col]) {
        issues.push({ rowIndex: row.rowIndex, field: col, message: `${col} is required`, severity: 'error' });
      }
    });

    const key = `${row.type}:${row.code}`;
    if (seen.has(key)) {
      issues.push({ rowIndex: row.rowIndex, field: 'code', message: `Duplicate code "${row.code}" for type "${row.type}"`, severity: 'warning' });
    }
    seen.add(key);

    if (row.sortOrder !== undefined && isNaN(Number(row.sortOrder))) {
      issues.push({ rowIndex: row.rowIndex, field: 'sortOrder', message: 'sortOrder must be a number', severity: 'warning' });
    }
  });

  return issues;
}

function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([
    { type: 'FUEL_TYPE', code: 'DIESEL', name: 'Diesel', description: 'Petroleum diesel fuel', sortOrder: 1 },
    { type: 'GAS_TYPE', code: 'CO2', name: 'Carbon Dioxide', description: 'CO₂ greenhouse gas', sortOrder: 1 },
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'MasterItems');
  XLSX.writeFile(wb, 'master_import_template.xlsx');
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MasterBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MasterBulkImportModal({ isOpen, onClose, onSuccess }: MasterBulkImportModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warnCount = issues.filter((i) => i.severity === 'warning').length;

  const diff: ImportDiff = {
    newCount: rows.filter((_, i) => !issues.some((iss) => iss.rowIndex === rows[i].rowIndex && iss.severity === 'error')).length,
    updatedCount: 0,
    skippedCount: errorCount,
    errorCount,
  };

  const reset = () => {
    setStep(1); setFile(null); setRows([]); setIssues([]); setIsDragging(false);
  };

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setIsParsing(true);
    try {
      const parsed = await parseXlsx(f);
      setRows(parsed);
      setIssues(validateRows(parsed));
      setStep(2);
    } catch {
      toast({ title: 'Parse error', description: 'Could not read the file. Use the template.', variant: 'destructive' });
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const validRows = rows.filter((row) => !issues.some((i) => i.rowIndex === row.rowIndex && i.severity === 'error'));
      await apiService.post(API_LIST.MASTERS_ITEMS_BULK_IMPORT, { items: validRows });
      toast({ title: 'Import complete', description: `${validRows.length} items imported successfully.` });
      reset();
      onSuccess();
    } catch {
      toast({ title: 'Import failed', description: 'Some rows could not be imported.', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-[var(--shadow-2xl)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Bulk Import Master Items</h3>
              <p className="text-xs text-muted-foreground">Upload Excel (.xlsx) to batch-import master data</p>
            </div>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 border-b border-border px-5 bg-muted/30">
          {STEPS.map(({ step: s, label }, idx) => (
            <React.Fragment key={s}>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors',
                step === s ? 'text-foreground' : step > s ? 'text-positive-600' : 'text-muted-foreground'
              )}>
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                  step === s ? 'bg-primary border-primary text-white' :
                  step > s ? 'bg-positive-500 border-positive-500 text-white' :
                  'border-border text-muted-foreground'
                )}>
                  {step > s ? '✓' : s}
                </span>
                {label}
              </div>
              {idx < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* ── Step 1: Upload ─────────────────────────────────── */}
              {step === 1 && (
                <div className="p-6">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer',
                      isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    )}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload className={cn('w-10 h-10 mx-auto mb-3', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                    <p className="text-sm font-semibold text-foreground">
                      {isParsing ? 'Parsing…' : 'Drop your Excel file here'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse · .xlsx files only</p>
                    <input
                      id="file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Download template</p>
                      <p className="text-[11px] text-muted-foreground">Use the official template to avoid format errors</p>
                    </div>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Template
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Preview ────────────────────────────────── */}
              {step === 2 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Preview</p>
                      <p className="text-xs text-muted-foreground">{rows.length} rows parsed · showing first 20</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{file?.name}</span>
                  </div>
                  <div className="overflow-auto rounded-xl border border-border max-h-72">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {['#', 'Type', 'Code', 'Name', 'Description'].map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {rows.slice(0, 20).map((row) => (
                          <tr key={row.rowIndex} className="hover:bg-muted/30">
                            <td className="px-3 py-2 text-muted-foreground tabular-nums">{row.rowIndex}</td>
                            <td className="px-3 py-2 font-mono">{row.type}</td>
                            <td className="px-3 py-2 font-mono font-medium">{row.code}</td>
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{row.description ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Step 3: Validate ───────────────────────────────── */}
              {step === 3 && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    {errorCount > 0 ? (
                      <div className="flex items-center gap-2 text-negative-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">{errorCount} errors</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-positive-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">No errors</span>
                      </div>
                    )}
                    {warnCount > 0 && (
                      <div className="flex items-center gap-2 text-warning-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-semibold">{warnCount} warnings</span>
                      </div>
                    )}
                  </div>

                  {issues.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <CheckCircle2 className="w-10 h-10 text-positive-500 mb-2" />
                      <p className="text-sm font-semibold text-foreground">All rows are valid</p>
                      <p className="text-xs text-muted-foreground mt-1">Ready to import {rows.length} items</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-custom">
                      {issues.map((issue, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex items-start gap-3 px-3 py-2 rounded-lg text-xs',
                            issue.severity === 'error'
                              ? 'bg-negative-50 dark:bg-negative-900/20 text-negative-700 dark:text-negative-400'
                              : 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400'
                          )}
                        >
                          {issue.severity === 'error'
                            ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          }
                          <div>
                            <span className="font-semibold">Row {issue.rowIndex} · {issue.field}:</span>{' '}
                            {issue.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 4: Confirm & Import ───────────────────────── */}
              {step === 4 && (
                <div className="p-6 space-y-4">
                  <p className="text-sm font-semibold text-foreground">Import Summary</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'To import', value: diff.newCount, color: 'text-positive-600 bg-positive-50 dark:bg-positive-900/20' },
                      { label: 'Skipped (errors)', value: diff.skippedCount, color: 'text-negative-600 bg-negative-50 dark:bg-negative-900/20' },
                      { label: 'Warnings', value: warnCount, color: 'text-warning-600 bg-warning-50 dark:bg-warning-900/20' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={cn('rounded-xl p-3 text-center', color)}>
                        <p className="text-2xl font-bold tabular-nums">{value}</p>
                        <p className="text-xs font-medium mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {errorCount > 0 && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-warning-50 dark:bg-warning-900/20 rounded-xl text-warning-700 dark:text-warning-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs">
                        {errorCount} rows with errors will be skipped. Only {diff.newCount} valid rows will be imported.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/30">
          <button
            onClick={() => { if (step > 1) setStep((s) => (s - 1) as WizardStep); else { reset(); onClose(); } }}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors text-muted-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as WizardStep)}
                disabled={step === 1 && rows.length === 0}
                className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleImport}
                disabled={isImporting || diff.newCount === 0}
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-lg bg-positive-600 text-white hover:bg-positive-700 disabled:opacity-50 transition-colors"
              >
                {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isImporting ? 'Importing…' : `Import ${diff.newCount} items`}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
