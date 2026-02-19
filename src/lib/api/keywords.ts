import { api } from './client';
import type {
  KeywordListResponse,
  KeywordResponse,
  CreateKeywordRequest,
  UpdateKeywordRequest,
  BulkCreateKeywordsRequest,
  PaginationParams,
} from '@/types';

export const keywordsApi = {
  async list(params?: PaginationParams & { status?: string; category?: string; search?: string; platform?: string; sort?: string; domain_id?: string }): Promise<KeywordListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.domain_id) searchParams.set('domain_id', params.domain_id);

    const query = searchParams.toString();
    return api.get<KeywordListResponse>(`/keywords${query ? `?${query}` : ''}`);
  },

  async get(id: number): Promise<KeywordResponse> {
    return api.get<KeywordResponse>(`/keywords/${id}`);
  },

  async create(data: CreateKeywordRequest): Promise<KeywordResponse> {
    return api.post<KeywordResponse>('/keywords', data);
  },

  async bulkCreate(data: BulkCreateKeywordsRequest): Promise<{ created: number; keywords: KeywordResponse[] }> {
    return api.post('/keywords/bulk', data);
  },

  async update(id: number, data: UpdateKeywordRequest): Promise<KeywordResponse> {
    return api.put<KeywordResponse>(`/keywords/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return api.delete(`/keywords/${id}`);
  },

  async refresh(params?: { selections: Array<{ keyword_id: number; platforms: string[] }> }): Promise<{ message: string; queries_enqueued?: number }> {
    return api.post('/keywords/refresh', params);
  },
};
