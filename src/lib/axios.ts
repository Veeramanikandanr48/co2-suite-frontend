import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpStatus } from "@/enums/base-enum";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/components/reusables/toast-variant";
import { encryptedStorage } from "@/lib/crypto";

/**
 * Handles unauthorized access by clearing storage and redirecting to sign-in.
 * This is called when receiving 401/403 status codes from the API.
 */
function handleUnauthorized(): void {
  if (typeof window !== "undefined") {
    encryptedStorage.clear();
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
 * - Encrypted Client Storage for Auth Tokens
 * - Error handling & Toast notifications
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
 * - Token injection from encrypted storage
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
      const token = encryptedStorage.getItem<string>('access_token');
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

const handleHttpError = (error: AxiosError, skipToast: boolean) => {
  const status: number | undefined = error.response?.status;
  
  if (status === HttpStatus.CONNECTION_REFUSED) {
    showWarningToast("You are offline. Please check your internet connection and try again.");
    throw new Error("Connection Refused");
  }

  if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
    showErrorToast("You are not authorized to access this resource.");
    handleUnauthorized();
    throw new Error(status === HttpStatus.UNAUTHORIZED ? "Unauthorized" : "Forbidden");
  }

  if (status === HttpStatus.BAD_REQUEST) {
    const errorMessage = (error.response?.data as { message?: string })?.message ?? error.message ?? 'Bad Request';
    if (!skipToast) showErrorToast(errorMessage);
    return;
  }

  if (!skipToast) {
    showErrorToast(error.message || "An unexpected error occurred");
  }
};

const handleNetworkError = (error: AxiosError, skipToast: boolean) => {
  if (!skipToast && error.request) {
    showErrorToast("Please check your internet connection");
  }
};

/**
 * Response Interceptor
 * Handles:
 * - Standard JSON responses over HTTPS
 * - Success messages & Toast notifications
 * - Error handling with specific HTTP status codes
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const skipToast: boolean = response.config?.headers?.['X-Skip-Toast'] === 'true';
    const resData = response.data;

    if (!skipToast && resData?.message) {
      showSuccessToast(resData.message);
    }
    return resData;
  },
  (error: AxiosError) => {
    const skipToast: boolean = error.config?.headers?.['X-Skip-Toast'] === 'true';

    if (error?.response) {
      handleHttpError(error, skipToast);
    } else {
      handleNetworkError(error, skipToast);
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