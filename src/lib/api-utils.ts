/**
 * Reusable utility functions for normalizing API responses and error handling across the application.
 */

/**
 * Unwraps API response payloads to handle both direct data returns and wrapped Axios response objects ({ data: T }).
 */
export function unwrapApiResponse<T>(res: unknown): T {
  if (!res) return res as T;
  const wrapped = res as { data?: T };
  return wrapped.data !== undefined ? wrapped.data : (res as T);
}

/**
 * Safely extracts an array from API responses (handles direct arrays, wrapped Axios responses, or item wrappers).
 */
export function unwrapApiArray<T>(res: unknown): T[] {
  if (!res) return [];
  const raw = unwrapApiResponse<unknown>(res);
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && "items" in raw && Array.isArray((raw as { items: unknown[] }).items)) {
    return (raw as { items: T[] }).items;
  }
  return [];
}

/**
 * Extracts a user-friendly error message string from caught API errors.
 */
export function extractErrorMessage(error: unknown, fallback: string = "An unexpected error occurred"): string {
  if (!error) return fallback;
  const errObj = error as { response?: { data?: { message?: string } }; message?: string };
  return errObj?.response?.data?.message || errObj?.message || fallback;
}
