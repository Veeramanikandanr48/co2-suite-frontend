import { InternalAxiosRequestConfig } from 'axios';

let _sessionSigningKey: string | null = null;

export const SessionKey = {
  set: (key: string | null) => {
    _sessionSigningKey = key;
  },
  get: (): string | null => _sessionSigningKey,
  clear: () => {
    _sessionSigningKey = null;
  },
};

/**
 * Deterministic JSON stringify with recursively sorted keys
 */
export function canonicalJsonStringify(data: any): string {
  if (data === undefined || data === null) return '';
  if (typeof data !== 'object') return JSON.stringify(data);
  if (Array.isArray(data)) {
    return '[' + data.map((item) => canonicalJsonStringify(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(data).sort();
  const parts: string[] = [];
  for (const key of sortedKeys) {
    if (data[key] !== undefined) {
      parts.push(JSON.stringify(key) + ':' + canonicalJsonStringify(data[key]));
    }
  }
  return '{' + parts.join(',') + '}';
}

/**
 * Computes SHA-256 hex string using Web Crypto API
 */
async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes HMAC-SHA256 hex string using Web Crypto API
 */
async function hmacSha256Hex(keyHex: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBytes = new Uint8Array(
    keyHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(message)
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Signs outbound Axios request with HMAC-SHA256 signature
 */
export async function signAxiosRequest(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
  if (typeof window === 'undefined') return config;

  const timestamp = Date.now().toString();
  const nonce = window.crypto.randomUUID();
  const requestId = window.crypto.randomUUID();

  config.headers['X-Request-Timestamp'] = timestamp;
  config.headers['X-Request-Nonce'] = nonce;
  config.headers['X-Request-ID'] = requestId;

  const key = _sessionSigningKey;
  if (!key) {
    // Return unsigned request if key is not yet present
    return config;
  }

  const method = (config.method || 'GET').toUpperCase();
  const baseUrl = config.baseURL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1';
  const rawUrl = config.url || '';
  const fullUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `${baseUrl.replace(/\/+$/, '')}/${rawUrl.replace(/^\/+/, '')}`;
  const urlObj = new URL(fullUrl);
  const path = urlObj.pathname;

  // Build canonical query string (sorted)
  const queryKeys = Array.from(urlObj.searchParams.keys()).sort();
  const canonicalQuery = queryKeys
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(urlObj.searchParams.get(k) || '')}`
    )
    .join('&');

  // Build canonical body hash
  const canonicalBody =
    config.data && Object.keys(config.data).length > 0
      ? canonicalJsonStringify(config.data)
      : '';
  const bodyHash = await sha256Hex(canonicalBody);

  // AWS Signature V4 canonical message format
  const message = [method, path, canonicalQuery, timestamp, nonce, bodyHash].join('\n');

  const signature = await hmacSha256Hex(key, message);
  config.headers['X-Request-Signature'] = signature;

  return config;
}
