/**
 * Client Storage Helper
 * Provides a clean API for reading/writing non-sensitive UI state to LocalStorage.
 * Sensitive tokens (access_token, session signing keys) MUST NOT be stored here.
 */
export const encryptedStorage = {
  setItem: (key: string, value: unknown): void => {
    if (typeof window === 'undefined') return;
    if (value === undefined || value === null) return;
    try {
      const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, jsonString);
    } catch (e) {
      console.error('Failed to set storage item', e);
    }
  },

  getItem: <T = unknown>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch {
      return null;
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};
