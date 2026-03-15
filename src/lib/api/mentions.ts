import { api } from './client';
import type { AIRecommendation, QueryInsight, MentionListResponse, PaginationParams } from '@/types';

export const mentionsApi = {
  async list(params?: PaginationParams & { platform?: string; result?: string; keyword_id?: number }): Promise<MentionListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.platform) query.set('platform', params.platform);
    if (params?.result) query.set('result', params.result);
    if (params?.keyword_id) query.set('keyword_id', String(params.keyword_id));
    const qs = query.toString();
    return api.get<MentionListResponse>(`/mentions${qs ? `?${qs}` : ''}`);
  },

  async getRecommendations(mentionId: number): Promise<AIRecommendation[]> {
    return api.get<AIRecommendation[]>(`/mentions/${mentionId}/recommendations`);
  },

  async getInsights(mentionId: number): Promise<QueryInsight> {
    return api.get<QueryInsight>(`/mentions/${mentionId}/insights`);
  },

  async getLatestKeywordMention(keywordId: number): Promise<{ mention_id: number }> {
    return api.get<{ mention_id: number }>(`/keywords/${keywordId}/mentions/latest`);
  },

  async getKeywordMentions(keywordId: number): Promise<Array<{ id: number; platform: string; position: number | null; result: string; created_at: string }>> {
    return api.get<Array<{ id: number; platform: string; position: number | null; result: string; created_at: string }>>(`/keywords/${keywordId}/mentions`);
  },
};
