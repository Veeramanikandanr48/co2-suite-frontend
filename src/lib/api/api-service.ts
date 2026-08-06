'use client';

import { CustomAxiosResponse } from '@/types';
import axiosInstance from './axios-client';
import { API_LIST } from './endpoints';
import type { AxiosRequestConfig } from 'axios';

/**
 * ApiService Class
 * Provides typed helper methods for all CO2 Suite API endpoints.
 */
class ApiService {
  async get<T>(endpoint: string, queryParams?: Record<string, string>, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(endpoint, { ...config, params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }

  async getById<T>(endpoint: string, id: string | number, queryParams?: Record<string, string>, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(`${endpoint}/${id}`, { ...config, params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(endpoint, data, config) as Promise<CustomAxiosResponse<T>>;
  }

  async put<T>(endpoint: string, id: string | number, data?: unknown, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.put<T>(`${endpoint}/${id}`, data, config) as Promise<CustomAxiosResponse<T>>;
  }

  async delete<T>(endpoint: string, id?: string | number, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    const url = id !== undefined ? `${endpoint}/${id}` : endpoint;
    return axiosInstance.delete<T>(url, config) as Promise<CustomAxiosResponse<T>>;
  }

  // Dashboard & Scope Methods
  async getCarbonSummary<T>(serviceCode: string, queryParams?: { year?: string; facility?: string }): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(`services/${serviceCode}/summary`, { params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }

  async getMainDashboardSummary<T>(queryParams?: { year?: string; facility?: string }): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>('dashboard/summary', { params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }

  async getScopeActivityResult<T>(
    scope: string,
    activity: string,
    queryParams?: { based_option?: string; facility?: string; year?: string },
  ): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(`services/result/${scope}/${activity}`, {
      params: queryParams,
    }) as Promise<CustomAxiosResponse<T>>;
  }

  async getFactorSignature<T>(
    scope: string,
    activity: string,
    basedOption?: string,
  ): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>('services/factor-signature', {
      params: { scope, activity, based_option: basedOption || 'activity' },
    }) as Promise<CustomAxiosResponse<T>>;
  }

  // ============================================================================
  // MASTER CONFIGURATION HELPERS
  // ============================================================================
  async getGasTypes<T>(): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.MASTERS_GAS_TYPES) as Promise<CustomAxiosResponse<T>>;
  }

  async getGwpVersions<T>(): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.MASTERS_GWP_VERSIONS) as Promise<CustomAxiosResponse<T>>;
  }

  async getFactorSets<T>(): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.MASTERS_FACTOR_SETS) as Promise<CustomAxiosResponse<T>>;
  }

  async getFormulas<T>(): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.MASTERS_FORMULAS) as Promise<CustomAxiosResponse<T>>;
  }

  async getPolicies<T>(organizationId?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.MASTERS_POLICIES, {
      params: { organizationId },
    }) as Promise<CustomAxiosResponse<T>>;
  }

  async getSupplementaryFields<T>(category?: string): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.MASTERS_SUPPLEMENTARY_FIELDS, {
      params: { category },
    }) as Promise<CustomAxiosResponse<T>>;
  }

  // ============================================================================
  // DATA QUALITY HELPERS
  // ============================================================================
  async validateDataQuality<T>(entryId: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(`${API_LIST.DATA_QUALITY_VALIDATE}/${entryId}`) as Promise<CustomAxiosResponse<T>>;
  }

  async getDataQualityResults<T>(entryId: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(`${API_LIST.DATA_QUALITY_RESULTS}/${entryId}`) as Promise<CustomAxiosResponse<T>>;
  }

  // ============================================================================
  // AI PLATFORM HELPERS
  // ============================================================================
  async getAiCategorySuggestion<T>(description: string): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(API_LIST.AI_SUGGEST_CATEGORY, { description }) as Promise<CustomAxiosResponse<T>>;
  }

  async getAiUnitSuggestion<T>(text: string): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(API_LIST.AI_SUGGEST_UNIT, { text }) as Promise<CustomAxiosResponse<T>>;
  }

  async getAiFactorRecommendation<T>(category: string, fuelType: string, unit: string): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(API_LIST.AI_SUGGEST_FACTOR, { category, fuelType, unit }) as Promise<CustomAxiosResponse<T>>;
  }

  async aiChat<T>(message: string, context?: any): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(API_LIST.AI_CHAT, { message, context }) as Promise<CustomAxiosResponse<T>>;
  }

  // ============================================================================
  // REPORTING & ANALYTICS HELPERS
  // ============================================================================
  async getReportDefinitions<T>(organizationId?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.REPORTS_DEFINITIONS, { params: { organizationId } }) as Promise<CustomAxiosResponse<T>>;
  }

  async executeReport<T>(definitionId: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(`${API_LIST.REPORTS_EXECUTE}/${definitionId}`) as Promise<CustomAxiosResponse<T>>;
  }

  async getAnalyticsTrends<T>(organizationId?: number, year?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.ANALYTICS_TRENDS, { params: { organizationId, year } }) as Promise<CustomAxiosResponse<T>>;
  }

  async getAnalyticsForecast<T>(organizationId?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.ANALYTICS_FORECAST, { params: { organizationId } }) as Promise<CustomAxiosResponse<T>>;
  }

  async runAnalyticsSimulation<T>(organizationId: number, dieselReductionPercent: number, electricityReductionPercent: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(API_LIST.ANALYTICS_SIMULATE, { organizationId, dieselReductionPercent, electricityReductionPercent }) as Promise<CustomAxiosResponse<T>>;
  }

  async getAnalyticsCost<T>(organizationId?: number, carbonPrice?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.ANALYTICS_COST, { params: { organizationId, carbonPrice } }) as Promise<CustomAxiosResponse<T>>;
  }

  async getAnalyticsHotspots<T>(organizationId?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.ANALYTICS_HOTSPOTS, { params: { organizationId } }) as Promise<CustomAxiosResponse<T>>;
  }

  async getAnalyticsTargets<T>(organizationId?: number): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(API_LIST.ANALYTICS_TARGETS, { params: { organizationId } }) as Promise<CustomAxiosResponse<T>>;
  }
}

export const apiService = new ApiService();