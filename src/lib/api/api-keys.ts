import { api } from './client';
import type {
  APIKeyListResponse,
  APIKeyCreatedResponse,
  CreateAPIKeyRequest,
} from '@/types';

export const apiKeysApi = {
  async list(): Promise<APIKeyListResponse> {
    return api.get<APIKeyListResponse>('/api-keys');
  },

  async create(data: CreateAPIKeyRequest): Promise<APIKeyCreatedResponse> {
    return api.post<APIKeyCreatedResponse>('/api-keys', data);
  },

  async delete(id: number): Promise<void> {
    return api.delete(`/api-keys/${id}`);
  },
};
