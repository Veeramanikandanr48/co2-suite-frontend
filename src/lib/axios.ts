import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpStatus } from "@/enums/base-enum";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/components/reusables/toast-variant";

/**
 * Handles unauthorized access by clearing storage and redirecting to sign-in.
 * This is called when receiving 401/403 status codes from the API.
 */
function handleUnauthorized(): void {
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/sign-in";
  }
}

/**
 * Checks if the client is currently offline.
 * @returns {boolean} True if offline, false if online
 */
const isOffline = (): boolean => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};

/**
 * Axios instance with predefined configuration.
 * Includes:
 * - Base URL from environment
 * - Default headers
 * - Request/Response interceptors
 * - Error handling
 * - Toast notifications
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Skip-Toast': 'true',
  },
});

/**
 * Request Interceptor
 * Handles:
 * - Offline detection
 * - Token injection
 * - Security headers
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Check offline status before making request
    if (isOffline()) {
      showWarningToast("You are offline. Please check your internet connection and try again.");
      return Promise.reject(new Error("No Internet Connection"));
    }

    // Add auth token if available and not explicitly skipped
    const skipAuth = config.headers?.['X-Skip-Auth'] === 'true';
    if (!skipAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Security headers
    config.headers['X-Frame-Options'] = 'DENY';
    return config;
  },
  (error) => Promise.reject(new Error(error))
);

/**
 * Response Interceptor
 * Handles:
 * - Success messages
 * - Error handling with specific HTTP status codes
 * - Toast notifications
 * - Network errors
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const skipToast = response.config?.headers?.['X-Skip-Toast'] === 'true';
    
    if (!skipToast && response.data?.message) {
      showSuccessToast(response.data.message);
    }
    return response.data;
  },
  (error: AxiosError) => {
    const skipToast = error.config?.headers?.['X-Skip-Toast'] === 'true';

    if (error?.response) {
      switch (error.response.status) {
        case HttpStatus.CONNECTION_REFUSED:
          showWarningToast("You are offline. Please check your internet connection and try again.");
          throw new Error("Connection Refused");

        case HttpStatus.UNAUTHORIZED:
        case HttpStatus.FORBIDDEN:
          showErrorToast("You are not authorized to access this resource.");
          handleUnauthorized();
          throw new Error(error.response.status === HttpStatus.UNAUTHORIZED ? "Unauthorized" : "Forbidden");

          case HttpStatus.BAD_REQUEST: {
            if (error instanceof AxiosError) {
              const errorMessage = (error.response?.data as { message?: string })?.message ?? error.message ?? 'Bad Request';
              if (!skipToast) {
                showErrorToast(errorMessage);
              }
            } else {
              if (!skipToast) {
                showErrorToast('Bad Request');
              }
            }
            break;
          }
        default:
          if (!skipToast) {
            showErrorToast(error.message || "An unexpected error occurred");
          }
      }
    } else if (!skipToast && error.request) {
      showErrorToast("Please check your internet connection");
    }

    return Promise.reject(error);
  }
);

// Global offline event listener
if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    showWarningToast("You are offline. Please check your internet connection.");
  });
}

export default axiosInstance; 