export interface CarbonCategoryEmission {
  category: string;
  scope: string;
  emission: number;
  percentage: number;
  count: number;
}

export interface CarbonFacilityEmission {
  facility: string;
  emission: number;
  percentage: number;
  count: number;
}

export interface CarbonEmissionsTrendItem {
  period: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface CarbonActivityItem {
  id: number;
  name: string;
  category: string;
  facility: string;
  amount: number;
  unit: string;
  ef: number;
  efSource?: string;
  emission: number;
  status: string;
  dateFrom?: string;
  dateTo?: string;
  createdOn?: string;
}

export interface CarbonSummaryData {
  serviceCode: string;
  unit: string;
  availableYears: string[];
  availableFacilities: string[];
  totalEntries: number;
  kpis: {
    totalEmissions: number;
    scope1Emissions: number;
    scope1Percentage: number;
    scope1CategoryCount: { recorded: number; total: number };
    scope2Emissions: number;
    scope2Percentage: number;
    scope2CategoryCount: { recorded: number; total: number };
    scope3Emissions: number;
    scope3Percentage: number;
    scope3CategoryCount: { recorded: number; total: number };
  };
  emissionsByCategory: CarbonCategoryEmission[];
  emissionsByFacility: CarbonFacilityEmission[];
  emissionsTrend: CarbonEmissionsTrendItem[];
  latestActivities: CarbonActivityItem[];
}
