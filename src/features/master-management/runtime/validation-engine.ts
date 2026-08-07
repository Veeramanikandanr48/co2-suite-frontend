export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface ValidationSchemaSpec {
  required?: string[];
  rules?: Record<string, ValidationRule>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class ValidationEngine {
  static validate(
    schema: ValidationSchemaSpec | undefined,
    fields: Array<{ name: string; label: string; required?: boolean }>,
    values: Record<string, any>
  ): ValidationResult {
    const errors: Record<string, string> = {};

    // 1. Validate required fields from form fields
    for (const f of fields) {
      const val = values[f.name];
      const isMissing =
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0);

      if (f.required && isMissing) {
        errors[f.name] = `${f.label || f.name} is required`;
      }
    }

    // 2. Validate explicit schema required fields
    if (schema?.required) {
      for (const reqName of schema.required) {
        const val = values[reqName];
        if (val === undefined || val === null || val === '') {
          if (!errors[reqName]) {
            errors[reqName] = `${reqName} is required`;
          }
        }
      }
    }

    // 3. Validate specific rules (min, max, pattern)
    if (schema?.rules) {
      for (const [fieldName, rule] of Object.entries(schema.rules)) {
        const val = values[fieldName];
        if (val !== undefined && val !== null && val !== '') {
          if (typeof val === 'number') {
            if (rule.min !== undefined && val < rule.min) {
              errors[fieldName] = rule.message || `Minimum value is ${rule.min}`;
            }
            if (rule.max !== undefined && val > rule.max) {
              errors[fieldName] = rule.message || `Maximum value is ${rule.max}`;
            }
          }
          if (typeof val === 'string' && rule.pattern) {
            const regex = new RegExp(rule.pattern);
            if (!regex.test(val)) {
              errors[fieldName] = rule.message || `Invalid format`;
            }
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
