import { api } from './client';
import type {
  IntegrationListResponse,
  IntegrationResponse,
  IntegrationType,
} from '@/types';

export const integrationsApi = {
  async list(): Promise<IntegrationListResponse> {
    return api.get<IntegrationListResponse>('/integrations');
  },

  async toggle(type: IntegrationType, enabled: boolean): Promise<IntegrationResponse> {
    return api.patch<IntegrationResponse>(`/integrations/${type}/toggle`, { enabled });
  },

  async saveConfig(type: IntegrationType, config: { webhook_url: string; secret?: string }): Promise<void> {
    return api.put(`/integrations/${type}/config`, config);
  },

  async testConnection(type: IntegrationType): Promise<void> {
    return api.post(`/integrations/${type}/test`);
  },
};
