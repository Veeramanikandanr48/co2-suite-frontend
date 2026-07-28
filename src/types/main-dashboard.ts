export interface FacilityDetailsItem {
  id: number;
  name: string;
  address: string;
  countryCode: string;
  postCode: string;
  unLocode: string;
  totalEmissions: number;
  entriesCount: number;
}

export interface SubscribedServiceSummary {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  demoUrl: string;
  daysLeft: number;
  isSubscribed: boolean;
  totalEmissions: number;
  subscriberCount?: number;
  entriesCount: number;
}

export interface OrganizationSummaryItem {
  id: number;
  name: string;
  code: string;
  contactEmail: string;
  industry: string;
  facilitiesCount: number;
  subscribedServicesCount: number;
  totalEmissions: number;
  entriesCount: number;
  facilities?: FacilityDetailsItem[];
}

export interface DashboardCategoryEmission {
  category: string;
  scope: string;
  emission: number;
  percentage: number;
  count: number;
}

export interface DashboardFacilityEmission {
  facility: string;
  emission: number;
  percentage: number;
  count: number;
}

export interface DashboardEmissionsTrendItem {
  period: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface DashboardRecentActivityItem {
  id: number;
  orgName?: string;
  name: string;
  serviceCode: string;
  category: string;
  facility: string;
  amount: number;
  unit: string;
  emission: number;
  status: string;
  createdOn?: string;
}

export interface MainDashboardSummaryData {
  isSuperAdmin?: boolean;
  unit: string;
  availableYears: string[];
  availableFacilities: string[];
  kpis: {
    totalEmissions: number;
    scope1Emissions: number;
    scope1Percentage: number;
    scope2Emissions: number;
    scope2Percentage: number;
    scope3Emissions: number;
    scope3Percentage: number;
    totalOrganizations?: number;
    totalUsers?: number;
    totalInventoryEntries: number;
    activeServicesCount: number;
    facilitiesCount: number;
    dataCompletenessPercent: number;
  };
  facilities?: FacilityDetailsItem[];
  organizationsSummary?: OrganizationSummaryItem[];
  subscribedServices: SubscribedServiceSummary[];
  emissionsByCategory: DashboardCategoryEmission[];
  emissionsByFacility?: DashboardFacilityEmission[];
  emissionsTrend: DashboardEmissionsTrendItem[];
  recentActivities: DashboardRecentActivityItem[];
}
