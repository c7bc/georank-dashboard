import Cookies from 'js-cookie';
import type { APIError } from '@/types';
import { apiFailure, unwrapResponse } from './response';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  signal?: AbortSignal;
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
    signal,
  } = options;

  const token = getToken();

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token && !skipAuth) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
    signal,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const failure = apiFailure(await response.json().catch(() => null), response.status);
    throw new APIClientError(failure.message, response.status, failure);
  }
  if (response.status === 204) return {} as T;
  return unwrapResponse(await response.json()) as T;
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
