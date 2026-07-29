export interface EmissionFactorItem {
  id: number | string;
  category: string;
  subCategory?: string;
  source: string;
  version?: string;
  fuelOrGasType: string;
  unit?: string;
  factor: number;
  formula?: string;
  gwpValue?: number;
  sourceUrl?: string;
  effectiveYear?: number;
  isActive?: boolean;
  createdOn?: string;
  [key: string]: any;
}
