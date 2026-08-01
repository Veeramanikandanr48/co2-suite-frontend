'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/lib/api/api-service';
import { CarbonSummaryData } from '@/types/carbon-summary';
import { ServiceSummaryView } from '../service-summary-view';

export default function SummaryPage() {
  const params = useParams();
  const rawCode = (params.code as string) || 'carbon';
  const code = rawCode.toLowerCase();

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [summaryData, setSummaryData] = useState<CarbonSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const fetchCarbonSummary = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingSummary(true);
      const apiParams: Record<string, string> = {};
      if (selectedYear && selectedYear !== 'all') apiParams.year = selectedYear;
      if (selectedFacility && selectedFacility !== 'all') apiParams.facility = selectedFacility;
      const response = await apiService.getCarbonSummary<CarbonSummaryData>(code, apiParams);
      const data = (response as any)?.data ?? response;
      if (data && typeof data === 'object') setSummaryData(data);
    } catch {
      if (!isSilent) setSummaryData(null);
    } finally {
      if (!isSilent) setLoadingSummary(false);
    }
  }, [code, selectedYear, selectedFacility]);

  useEffect(() => {
    fetchCarbonSummary(false);
  }, [fetchCarbonSummary]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCarbonSummary(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchCarbonSummary]);

  return (
    <ServiceSummaryView
      summaryData={summaryData}
      loadingSummary={loadingSummary}
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      selectedFacility={selectedFacility}
      setSelectedFacility={setSelectedFacility}
      fetchCarbonSummary={() => fetchCarbonSummary(false)}
    />
  );
}

