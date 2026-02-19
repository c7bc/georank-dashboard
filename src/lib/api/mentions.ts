import Cookies from 'js-cookie';
import type { AIRecommendation, QueryInsight } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function clientFetch<T>(endpoint: string): Promise<T> {
  const token = Cookies.get('access_token');
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json = await res.json();
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const mentionsApi = {
  getRecommendations(mentionId: number): Promise<AIRecommendation[]> {
    return clientFetch<AIRecommendation[]>(`/mentions/${mentionId}/recommendations`);
  },

  getInsights(mentionId: number): Promise<QueryInsight> {
    return clientFetch<QueryInsight>(`/mentions/${mentionId}/insights`);
  },

  getLatestKeywordMention(keywordId: number): Promise<{ mention_id: number }> {
    return clientFetch<{ mention_id: number }>(`/keywords/${keywordId}/mentions/latest`);
  },

  getKeywordMentions(keywordId: number): Promise<Array<{ id: number; platform: string; position: number | null; result: string; created_at: string }>> {
    return clientFetch<Array<{ id: number; platform: string; position: number | null; result: string; created_at: string }>>(`/keywords/${keywordId}/mentions`);
  },
};
