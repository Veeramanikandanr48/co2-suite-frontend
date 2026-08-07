/**
 * Bounded Context Classification:
 *
 * MASTER DATA — reusable reference data shared across all tenants
 * OPERATIONAL — tenant-owned business data (Supplier, Evidence, etc.)
 *
 * ADR: Supplier and Audit Evidence are NOT master data.
 * They are operational entities that belong to a specific organization/tenant.
 * They live in the Operations bounded context.
 */
export enum MasterItemType {
  // ── Master Data (Reusable across all tenants) ─────────────────────────────
  ORGANIZATION = 'ORGANIZATION',
  SCOPE = 'SCOPE',
  ACTIVITY_CATEGORY = 'ACTIVITY_CATEGORY',
  FUEL_TYPE = 'FUEL_TYPE',
  GAS_TYPE = 'GAS_TYPE',
  UNIT = 'UNIT',
  COUNTRY = 'COUNTRY',
  REGION = 'REGION',
  CURRENCY = 'CURRENCY',
  INDUSTRY = 'INDUSTRY',
  FACTOR_SOURCE = 'FACTOR_SOURCE',
  FACTOR_VERSION = 'FACTOR_VERSION',
  GWP_VERSION = 'GWP_VERSION',
  FORMULA = 'FORMULA',
  DATA_QUALITY = 'DATA_QUALITY',
  REPORTING_FRAMEWORK = 'REPORTING_FRAMEWORK',
}

export interface MasterItemTypeOption {
  value: string;
  label: string;
  description: string;
}

/**
 * MASTER_ITEM_TYPES: Only contains Master Data context entries.
 * Supplier and Audit Evidence belong to the Operations context — they are NOT listed here.
 */
export const MASTER_ITEM_TYPES: MasterItemTypeOption[] = [
  { value: 'ORGANIZATION', label: 'Organization (Tenant)', description: 'Enterprise organization boundaries & reporting defaults' },
  { value: 'SCOPE', label: 'GHG Scope', description: 'GHG Protocol Scopes (Scope 1, 2, 3)' },
  { value: 'ACTIVITY_CATEGORY', label: 'Activity Categories', description: 'Enterprise GHG activity classification & activity types' },
  { value: 'FUEL_TYPE', label: 'Fuel Types', description: 'Physical fuels, NCV/GCV, density & carbon content' },
  { value: 'GAS_TYPE', label: 'Gas Types', description: 'Greenhouse gases, formulas, CAS numbers & refrigerants' },
  { value: 'UNIT', label: 'Measurement Units', description: 'Volume, mass, energy, distance, currency units' },
  { value: 'UNIT_CONVERSIONS', label: 'Unit Conversion Matrix', description: 'Inter-unit physical conversion rules' },
  { value: 'COUNTRY', label: 'Countries', description: 'Global country ISO codes & timezones' },
  { value: 'REGION', label: 'Grid Regions', description: 'Sub-national electricity grid & regional subregions' },
  { value: 'CURRENCY', label: 'Currencies', description: 'Global financial currencies for Scope 3 spend method' },
  { value: 'INDUSTRY', label: 'Industry Sectors', description: 'NACE / NAICS industry classification sectors' },
  { value: 'FACTOR_SOURCE', label: 'Factor Sources', description: 'IPCC, DEFRA, US eGRID, CEA, IEA databases' },
  { value: 'FACTOR_VERSION', label: 'Factor Versions', description: 'AR6, AR5, 2025, 2024 version standards' },
  { value: 'GWP_VERSION', label: 'GWP Versions', description: 'Independent IPCC GWP assessment reports (AR4-AR7)' },
  { value: 'FORMULA', label: 'Calculation Formulas', description: 'Centralized calculation expression library' },
  { value: 'DATA_QUALITY', label: 'Data Quality Tiers', description: 'GHG Protocol Data Quality Tiers & confidence levels' },
  { value: 'REPORTING_FRAMEWORK', label: 'Reporting Frameworks', description: 'CSRD, PCAF, CBAM, SECR, GHG Protocol & ISO standards' },
  { value: 'MAPPINGS_CATEGORY_FUEL', label: 'Activity ↔ Fuel Mapping', description: 'Many-to-many activity to fuel supported pairs' },
  { value: 'MAPPINGS_FUEL_UNIT', label: 'Fuel ↔ Unit Mapping', description: 'Many-to-many fuel to valid unit pairs' },
  { value: 'EMISSION_FACTOR', label: 'Emission Factors', description: 'Emission factor values, formulas & breakdown' },
];

export interface ServiceOption {
  value: string;
  label: string;
}

export const MASTER_SERVICES: ServiceOption[] = [
  { value: 'CARBON', label: 'CO2 Suite Carbon' },
  { value: 'CBAM', label: 'CO2 Suite CBAM' },
  { value: 'PEF_TEXTILES', label: 'CO2 Suite PEF (Textiles)' },
  { value: 'LCA_PLASTICS', label: 'CO2 Suite LCA (Plastics)' },
  { value: 'LCA_METALS', label: 'CO2 Suite LCA (Metals)' },
  { value: 'ESG', label: 'CO2 Suite ESG' },
  { value: 'EPD_CABLES', label: 'CO2 Suite EPD (Cables)' },
];

export type MasterVisibility = 'GLOBAL' | 'DOMAIN' | 'TENANT';

export interface MasterItem {
  id: number | string;
  type: MasterItemType | string;
  code: string;
  name: string;
  description?: string;
  status?: string;
  serviceCode?: string;
  visibility?: MasterVisibility;
  sortOrder?: number;
  scope?: string;
  subType?: string;
  allowedUnits?: string[];
  parentId?: number;
  parent?: MasterItem;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  attributes?: Record<string, any>;
  customAttributes?: Record<string, any>;
}

export interface MasterItemFormData {
  type: string;
  code: string;
  name: string;
  description: string;
  serviceCode?: string;
  visibility?: MasterVisibility;
  sortOrder: number;
  scope?: string;
  subType?: string;
  allowedUnits?: string[];
  parentId?: number;
  isActive: boolean;
  attributes?: Record<string, any>;
  customAttributes?: Record<string, any>;
}
