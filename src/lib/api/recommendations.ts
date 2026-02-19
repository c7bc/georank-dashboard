import { api } from './client';
import type {
  RecommendationListResponse,
  RecommendationResponse,
  RecommendationStatus,
  PaginationParams,
} from '@/types';

export const recommendationsApi = {
  async list(params?: PaginationParams & { status?: RecommendationStatus; priority?: string }): Promise<RecommendationListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);

    const query = searchParams.toString();
    return api.get<RecommendationListResponse>(`/recommendations${query ? `?${query}` : ''}`);
  },

  async updateStatus(id: number, status: RecommendationStatus): Promise<RecommendationResponse> {
    return api.patch<RecommendationResponse>(`/recommendations/${id}/status`, { status });
  },

  async generate(domain_id?: number): Promise<RecommendationListResponse> {
    return api.post<RecommendationListResponse>('/recommendations/generate', domain_id ? { domain_id } : {});
  },
};
