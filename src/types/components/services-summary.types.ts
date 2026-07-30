import { CarbonSummaryData } from '@/types/carbon-summary';

export interface ServiceSummaryViewProps {
  summaryData: CarbonSummaryData | null;
  loadingSummary: boolean;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedFacility: string;
  setSelectedFacility: (fac: string) => void;
  fetchCarbonSummary: () => void;
}

export interface SummaryChartsGridProps {
  summaryData: CarbonSummaryData | null;
}

export interface SummaryCategoryBreakdownProps {
  summaryData: CarbonSummaryData | null;
}

export interface SummaryActivityTableProps {
  summaryData: CarbonSummaryData | null;
}
