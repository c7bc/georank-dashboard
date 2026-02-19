import Cookies from 'js-cookie';
import type { NotificationListResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function clientFetch<T>(endpoint: string, options?: { method?: string }): Promise<T> {
  const token = Cookies.get('access_token');
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const json = await res.json();
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const notificationsApi = {
  list(params?: { page?: number; limit?: number }): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return clientFetch<NotificationListResponse>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  getUnreadCount(): Promise<{ count: number }> {
    return clientFetch<{ count: number }>('/notifications/unread-count');
  },

  markRead(id: number): Promise<void> {
    return clientFetch<void>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllRead(): Promise<void> {
    return clientFetch<void>('/notifications/read-all', { method: 'POST' });
  },
};
