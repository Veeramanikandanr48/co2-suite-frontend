'use client';
 
import { CustomAxiosResponse } from '@/types';
import axiosInstance from './axios';
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
 
}
 
export const apiService = new ApiService();