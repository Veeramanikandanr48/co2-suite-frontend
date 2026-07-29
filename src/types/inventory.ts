export type Scope1CategoryType =
  | 'Stationary Combustion'
  | 'Mobile Combustion'
  | 'Fugitive Emissions'
  | 'Process Emissions';

export type Scope2CategoryType = 'electricity' | 'heat' | 'Purchased Electricity' | 'Purchased Heating & Steam';

export type Scope3CategoryType =
  | 'Purchased Goods and Services'
  | 'Capital Goods'
  | 'Energy and Fuel Related Activities'
  | 'Upstream Transportation'
  | 'Waste Generated in Operations'
  | 'Business Travel'
  | 'Employee Commuting'
  | 'Downstream Transportation'
  | 'Processing of Sold Products'
  | 'Use of Sold Products'
  | 'EOL Treatment of Sold Products'
  | 'Franchise'
  | 'Investments';

export interface Scope2CategoryConfig {
  title: string;
  categoryTag: string;
  subType: string;
  defaultUnit: string;
  formulaLabel: string;
  descriptionText: string;
  noteText: string;
}

export interface Scope3CategoryConfig {
  title: string;
  categoryTag: string;
  subType: string;
  defaultUnit: string;
  formulaLabel: string;
  descriptionText: string;
  noteText: string;
}

export interface DBEmissionFactor {
  id: number;
  category: string;
  source: string;
  version: string;
  fuelOrGasType: string;
  unit: string;
  factor: number;
  formula: string;
}

export interface InventoryItem {
  id: number | string;
  name: string;
  category?: string;
  amount?: number | string;
  unit?: string;
  ef?: number | string;
  efSource?: string;
  formula?: string;
  dateFrom?: string;
  dateTo?: string;
  from?: string;
  to?: string;
  facility?: string;
  emission?: number | string;
  status?: string;
  comment?: string;
  approvalStatus?: string;
  documentPath?: string;
  [key: string]: any;
}

export type EditModalItem = InventoryItem;
