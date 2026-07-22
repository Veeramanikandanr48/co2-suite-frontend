import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpStatus } from "@/enums/base-enum";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/components/reusables/toast-variant";
import { encryptedStorage } from "@/lib/crypto";
import { signAxiosRequest, SessionKey } from "@/lib/request-signer";

/**
 * Handles unauthorized access by clearing storage and redirecting to sign-in.
 * This is called when receiving 401/403 status codes from the API.
 */
function handleUnauthorized(): void {
  if (typeof window !== "undefined") {
    SessionKey.clear();
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
 * - withCredentials enabled for HttpOnly cookies
 * - Request/Response interceptors with HMAC request signing
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Skip-Toast': 'true',
  },
});

/**
 * Request Interceptor
 * Handles:
 * - Offline detection
 * - Token injection from storage (if set)
 * - HMAC Request Signing with AWS V4 specification
 */
axiosInstance.interceptors.request.use(
  async (config) => {
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

    // Sign request with HMAC-SHA256
    return await signAxiosRequest(config);
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