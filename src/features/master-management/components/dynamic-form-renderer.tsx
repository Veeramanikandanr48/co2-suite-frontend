'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { Loader2, AlertCircle } from 'lucide-react';
import { ComponentRegistry, FieldProps } from '../runtime/component-registry';
import { ValidationEngine } from '../runtime/validation-engine';

// ── Phase 1 Controls ────────────────────────────────────────────────────────
const TextboxControl: React.FC<FieldProps> = ({ label, value, onChange, required, placeholder }) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
  />
);

const TextareaControl: React.FC<FieldProps> = ({ value, onChange, placeholder }) => (
  <textarea
    rows={3}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
  />
);

const NumberControl: React.FC<FieldProps> = ({ value, onChange, placeholder }) => (
  <input
    type="number"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
    placeholder={placeholder}
    className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
  />
);

const SelectControl: React.FC<FieldProps> = ({ label, value, onChange, options = [] }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
  >
    <option value="">Select {label}...</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const CheckboxControl: React.FC<FieldProps> = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-2">
    <input
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-border text-primary focus:ring-primary"
    />
    <span>{label}</span>
  </label>
);

const DateControl: React.FC<FieldProps> = ({ value, onChange }) => (
  <input
    type="date"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
  />
);

// Register Phase 1 Controls
ComponentRegistry.register('textbox', TextboxControl);
ComponentRegistry.register('textarea', TextareaControl);
ComponentRegistry.register('number', NumberControl);
ComponentRegistry.register('select', SelectControl);
ComponentRegistry.register('checkbox', CheckboxControl);
ComponentRegistry.register('date', DateControl);
ComponentRegistry.register('lookup', SelectControl);
ComponentRegistry.register('country', TextboxControl);
ComponentRegistry.register('unit-selector', TextboxControl);

export const CURRENT_RUNTIME_VERSION = '1.0';

export enum RuntimeCompatibility {
  COMPATIBLE = 'COMPATIBLE',
  WARNING = 'WARNING',
  BLOCKED = 'BLOCKED',
}

export function parseSemver(ver: string): { major: number; minor: number; patch: number } {
  const parts = ver.split('.').map((p) => parseInt(p, 10) || 0);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

export type DiagnosticCode =
  | 'COMPATIBLE'
  | 'MIN_RUNTIME_NOT_MET'
  | 'MAX_RUNTIME_EXCEEDED'
  | 'INVALID_SCHEMA'
  | 'UNSUPPORTED_FEATURE';

export type DiagnosticSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface RuntimeDiagnostic {
  compatibility: RuntimeCompatibility;
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  metadata: {
    currentRuntime: string;
    requiredRuntime?: string;
    maxRuntime?: string;
    schemaVersion?: number;
    schemaCode?: string;
  };
  reason: string;
  suggestedAction?: string;
  supported: boolean;
}

export function compareVersions(v1: string, v2: string): -1 | 0 | 1 {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);
  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;
  return 0;
}

export function evaluateRuntimeDiagnostics(
  minRuntime?: string,
  maxRuntime?: string,
  schemaVersion?: number,
  schemaCode?: string
): RuntimeDiagnostic {
  const current = CURRENT_RUNTIME_VERSION;

  if (minRuntime) {
    const minSemver = parseSemver(minRuntime);
    const currSemver = parseSemver(current);
    if (minSemver.major > currSemver.major) {
      return {
        compatibility: RuntimeCompatibility.BLOCKED,
        code: 'MIN_RUNTIME_NOT_MET',
        severity: 'ERROR',
        metadata: { currentRuntime: current, requiredRuntime: minRuntime, schemaVersion, schemaCode },
        reason: `Schema requires major runtime version v${minRuntime}, but current system is on v${current}`,
        suggestedAction: `Upgrade platform runtime engine to v${minRuntime} or higher.`,
        supported: false,
      };
    }
    if (compareVersions(current, minRuntime) < 0) {
      return {
        compatibility: RuntimeCompatibility.WARNING,
        code: 'MIN_RUNTIME_NOT_MET',
        severity: 'WARNING',
        metadata: { currentRuntime: current, requiredRuntime: minRuntime, schemaVersion, schemaCode },
        reason: `Schema requires minimum runtime v${minRuntime}, current runtime v${current} may lack minor features`,
        suggestedAction: `Upgrade platform runtime engine to v${minRuntime} for full feature support.`,
        supported: true,
      };
    }
  }

  if (maxRuntime && compareVersions(current, maxRuntime) > 0) {
    return {
      compatibility: RuntimeCompatibility.WARNING,
      code: 'MAX_RUNTIME_EXCEEDED',
      severity: 'WARNING',
      metadata: { currentRuntime: current, maxRuntime, schemaVersion, schemaCode },
      reason: `Current runtime v${current} exceeds schema maximum supported runtime v${maxRuntime}`,
      suggestedAction: `Consider migrating schema v${schemaVersion || 1} to newer runtime specification.`,
      supported: true,
    };
  }

  return {
    compatibility: RuntimeCompatibility.COMPATIBLE,
    code: 'COMPATIBLE',
    severity: 'INFO',
    metadata: { currentRuntime: current, schemaVersion, schemaCode },
    reason: `Schema is fully compatible with runtime v${current}`,
    supported: true,
  };
}

export interface FormFieldSchema {
  name: string;
  label: string;
  component: 'textbox' | 'textarea' | 'number' | 'select' | 'country' | 'unit-selector' | 'checkbox' | 'date' | 'lookup';
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface MasterTypeSchemaResponse {
  id?: number;
  code: string;
  name: string;
  category?: string;
  features?: Record<string, boolean>;
  masterTypeSchema?: {
    version?: number;
    runtimeVersion?: string;
    minimumRuntimeVersion?: string;
    events?: Array<{
      condition?: { field: string; operator: string; value: any };
      conditions?: Array<{ field: string; operator: string; value: any }>;
      logic?: 'AND' | 'OR';
      actions: Array<{ type: 'show' | 'hide' | 'required' | 'readonly' | 'setValue'; field: string; value?: any }>;
    }>;
  };
  formSchema?: { fields: FormFieldSchema[] };
  validationSchema?: any;
  gridSchema?: Record<string, any>;
  permissions?: Record<string, boolean>;
}

interface DynamicFormRendererProps {
  typeCode: string;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

export function DynamicFormRenderer({
  typeCode,
  initialValues = {},
  onSubmit,
  onCancel,
}: DynamicFormRendererProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [schema, setSchema] = useState<MasterTypeSchemaResponse | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [diagnostic, setDiagnostic] = useState<RuntimeDiagnostic | null>(null);

  useEffect(() => {
    async function loadSchema() {
      setLoading(true);
      try {
        const endpoint = API_LIST.MASTERS_TYPE_SCHEMA.replace(':code', typeCode);
        const res = await apiService.get<MasterTypeSchemaResponse>(endpoint);
        const fetchedSchema = res?.data || res;
        setSchema(fetchedSchema);

        const diag = evaluateRuntimeDiagnostics(
          fetchedSchema?.masterTypeSchema?.minimumRuntimeVersion,
          (fetchedSchema?.masterTypeSchema as any)?.maximumRuntimeVersion,
          fetchedSchema?.masterTypeSchema?.version,
          typeCode
        );
        setDiagnostic(diag);

        const defaults: Record<string, any> = { ...initialValues };
        if (fetchedSchema?.formSchema?.fields) {
          for (const field of fetchedSchema.formSchema.fields) {
            if (defaults[field.name] === undefined && field.defaultValue !== undefined) {
              defaults[field.name] = field.defaultValue;
            }
          }
        }
        setFormData(defaults);
      } catch (err) {
        console.error('Failed to load schema', err);
      } finally {
        setLoading(false);
      }
    }
    if (typeCode) {
      loadSchema();
    }
  }, [typeCode, initialValues]);

  const handleChange = (name: string, value: any) => {
    let updatedVal = value;
    if (name === 'code' && typeof value === 'string') {
      updatedVal = value.toUpperCase().replace(/\s+/g, '_');
    }
    setFormData((prev) => ({ ...prev, [name]: updatedVal }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = schema?.formSchema?.fields || [];
    const validationResult = ValidationEngine.validate(schema?.validationSchema, fields, formData);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading schema for {typeCode}...</span>
      </div>
    );
  }

  if (diagnostic?.compatibility === RuntimeCompatibility.BLOCKED) {
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Runtime Blocked</span>
        </div>
        <p>{diagnostic.reason}</p>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-destructive text-white rounded text-xs font-semibold mt-2 cursor-pointer"
        >
          Close
        </button>
      </div>
    );
  }

  const fields = schema?.formSchema?.fields || [
    { name: 'code', label: 'Code', component: 'textbox', required: true },
    { name: 'name', label: 'Name', component: 'textbox', required: true },
  ];
  const events = schema?.masterTypeSchema?.events || [];
  const isFieldVisible = (fieldName: string): boolean => {
    for (const ev of events) {
      const action = ev.actions?.find((a) => a.field === fieldName && a.type === 'show');
      if (action && ev.condition) {
        const condVal = formData[ev.condition.field];
        if (ev.condition.operator === 'equals' && condVal !== ev.condition.value) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Entry: <span className="text-primary">{schema?.name || typeCode}</span>
        </h3>
        <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {schema?.category || 'Reference Data'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          if (!isFieldVisible(field.name)) return null;

          const compKey = field.multiline ? 'textarea' : field.component || 'textbox';
          const ControlComponent = ComponentRegistry.get(compKey) || TextboxControl;
          const val = formData[field.name];
          const fieldError = errors[field.name];

          return (
            <div key={field.name} className={field.multiline ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </label>

              <ControlComponent
                name={field.name}
                label={field.label}
                value={val}
                onChange={(v) => handleChange(field.name, v)}
                required={field.required}
                placeholder={field.placeholder}
                options={field.options}
                error={fieldError}
              />

              {fieldError && (
                <p className="flex items-center gap-1 text-[11px] text-destructive mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldError}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Save Master Item</span>
        </button>
      </div>
    </form>
  );
}
