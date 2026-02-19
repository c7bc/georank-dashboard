import Cookies from 'js-cookie';
import type { APIError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

class APIClientError extends Error {
  status: number;
  data: APIError;

  constructor(message: string, status: number, data: APIError) {
    super(message);
    this.name = 'APIClientError';
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | undefined {
  return Cookies.get('access_token');
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    skipAuth = false,
  } = options;

  const token = getToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token && !skipAuth) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const startTime = performance.now();
  const response = await fetch(url, fetchOptions);
  const duration = Math.round(performance.now() - startTime);

  if (!response.ok) {
    let errorData: APIError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: 'unknown_error',
        message: response.statusText || 'An error occurred',
        status: response.status,
      };
    }
    console.log(`[API] ${method} ${endpoint} → ${response.status} (${duration}ms)`, errorData);
    throw new APIClientError(errorData.message, response.status, errorData);
  }

  if (response.status === 204) {
    console.log(`[API] ${method} ${endpoint} → 204 (${duration}ms)`);
    return {} as T;
  }

  const json = await response.json();

  const data = (json && typeof json === 'object' && 'success' in json && 'data' in json)
    ? json.data as T
    : json as T;

  console.log(`[API] ${method} ${endpoint} → ${response.status} (${duration}ms)`, data);
  return data;
}

export const api = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'PUT', body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export { APIClientError };
