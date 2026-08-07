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

  async getAiUnitSuggestion<T>(_text: string): Promise<CustomAxiosResponse<T>> {
    return Promise.resolve({ success: true, message: 'OK', data: null, status: 200 } as unknown as CustomAxiosResponse<T>);
  }

  async getAiFactorRecommendation<T>(_category: string, _fuelType: string, _unit: string): Promise<CustomAxiosResponse<T>> {
    return Promise.resolve({ success: true, message: 'OK', data: null, status: 200 } as unknown as CustomAxiosResponse<T>);
  }
}

export const apiService = new ApiService();