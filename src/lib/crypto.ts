import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || 'CO2_SUITE_CLIENT_SECRET_2026';

/**
 * Encrypts data into AES-256 ciphertext string.
 */
export function encryptPayload(data: unknown): string {
  if (data === undefined || data === null) return '';
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
}

/**
 * Decrypts AES-256 ciphertext string back into original object or string.
 */
export function decryptPayload<T = any>(ciphertext: string): T {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext as unknown as T;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) return ciphertext as unknown as T;
    try {
      return JSON.parse(decryptedString) as T;
    } catch {
      return decryptedString as unknown as T;
    }
  } catch {
    return ciphertext as unknown as T;
  }
}

/**
 * Client-Side Encrypted Storage Helper
 * Ensures all tokens, sessions, and user data in LocalStorage are stored encrypted with AES-256.
 */
export const encryptedStorage = {
  setItem: (key: string, value: unknown): void => {
    if (typeof window === 'undefined') return;
    if (value === undefined || value === null) return;
    try {
      const encryptedValue = encryptPayload(value);
      if (encryptedValue) {
        localStorage.setItem(key, encryptedValue);
      }
    } catch (e) {
      console.error('Failed to set encrypted item', e);
    }
  },

  getItem: <T = unknown>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      // Handle legacy unencrypted values gracefully for backwards compatibility
      if (!item.startsWith('U2FsdGVkX1')) {
        try {
          return JSON.parse(item) as T;
        } catch {
          return item as unknown as T;
        }
      }
      return decryptPayload<T>(item);
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
