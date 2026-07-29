'use client';
 
import { CustomAxiosResponse } from '@/types';
import axiosInstance from './axios-client';

import type { AxiosRequestConfig } from 'axios';
 
/**
 * API Service Class
 * Provides a wrapper around axios for making HTTP requests.
 * Includes typed methods for common HTTP operations.
 */
class ApiService {
  /**
   * Performs a GET request to fetch data
   * @param endpoint - The API endpoint to call
   * @param queryParams - Optional query parameters
   * @param config - Optional axios configuration
   * @returns Promise with the response data
   * @example
   * const users = await apiService.get<User[]>('/users');
   */
  async get<T>(endpoint: string, queryParams?: Record<string, string>, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(endpoint, { ...config, params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }
 
  /**
   * Performs a GET request to fetch a single item by ID
   * @param endpoint - The base API endpoint
   * @param id - The ID of the item to fetch
   * @param queryParams - Optional query parameters
   * @param config - Optional axios configuration
   * @returns Promise with the response data
   * @example
   * const user = await apiService.getById<User>('/users', 123);
   */
  async getById<T>(endpoint: string, id: string | number, queryParams?: Record<string, string>, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(`${endpoint}/${id}`, { ...config, params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }
 
  /**
   * Performs a POST request to create new data
   * @param endpoint - The API endpoint
   * @param data - The data to send
   * @param config - Optional axios configuration
   * @returns Promise with the response data
   * @example
   * const newUser = await apiService.post<User>('/users', { name: 'John' });
   */
  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.post<T>(endpoint, data, config) as Promise<CustomAxiosResponse<T>>;
  }
 
  /**
   * Performs a PUT request to update existing data
   * @param endpoint - The base API endpoint
   * @param id - The ID of the item to update
   * @param data - The updated data
   * @param config - Optional axios configuration
   * @returns Promise with the response data
   * @example
   * await apiService.put<User>('/users', 123, { name: 'Updated' });
   */
  async put<T>(endpoint: string, id: string | number, data?: unknown, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.put<T>(`${endpoint}/${id}`, data, config) as Promise<CustomAxiosResponse<T>>;
  }
 
  /**
   * Performs a DELETE request to remove or deactivate data
   * @param endpoint - The base API endpoint
   * @param id - Optional ID of the item to delete
   * @param config - Optional axios configuration
   * @returns Promise with the response data
   * @example
   * await apiService.delete<void>('/users', 123);
   */
  async delete<T>(endpoint: string, id?: string | number, config?: AxiosRequestConfig): Promise<CustomAxiosResponse<T>> {
    const url = id !== undefined ? `${endpoint}/${id}` : endpoint;
    return axiosInstance.delete<T>(url, config) as Promise<CustomAxiosResponse<T>>;
  }

  /**
   * Fetches dynamic overall carbon summary from database
   */
  async getCarbonSummary<T>(serviceCode: string, queryParams?: { year?: string; facility?: string }): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>(`services/${serviceCode}/summary`, { params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }

  /**
   * Fetches dynamic main executive dashboard summary from database
   */
  async getMainDashboardSummary<T>(queryParams?: { year?: string; facility?: string }): Promise<CustomAxiosResponse<T>> {
    return axiosInstance.get<T>('dashboard/summary', { params: queryParams }) as Promise<CustomAxiosResponse<T>>;
  }
}
 
export const apiService = new ApiService();