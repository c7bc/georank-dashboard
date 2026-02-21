import { api } from './client';

export interface MeResponse {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  language: string;
  role: string;
  workspace_id: number;
  workspace: string;
  plan: string;
  query_email_enabled: boolean;
  recommendation_email_enabled: boolean;
}

export const authApi = {
  async me(): Promise<MeResponse> {
    return api.get<MeResponse>('/auth/me');
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
