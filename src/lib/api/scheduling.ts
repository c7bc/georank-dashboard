import { api } from './client';
import type { SchedulingResponse, UpdateKeywordSchedulingRequest } from '@/types';

export const schedulingApi = {
  async get(): Promise<SchedulingResponse> {
    return api.get<SchedulingResponse>('/scheduling');
  },

  async updateReports(data: { auto_generate?: boolean; send_email?: boolean }): Promise<void> {
    return api.put('/scheduling/reports', data);
  },

  async updateRecommendations(data: { auto_generate?: boolean; send_email?: boolean }): Promise<void> {
    return api.put('/scheduling/recommendations', data);
  },

  async updateKeywords(data: UpdateKeywordSchedulingRequest): Promise<SchedulingResponse> {
    return api.put<SchedulingResponse>('/scheduling/keywords', data);
  },
};
