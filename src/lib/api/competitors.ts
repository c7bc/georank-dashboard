import { api } from './client';
import type {
  CompetitorListResponse,
  CompetitorResponse,
  CompetitorAnalysisResponse,
  CreateCompetitorRequest,
} from '@/types';

export const competitorsApi = {
  async list(): Promise<CompetitorListResponse> {
    return api.get<CompetitorListResponse>('/competitors');
  },

  async create(data: CreateCompetitorRequest): Promise<CompetitorResponse> {
    return api.post<CompetitorResponse>('/competitors', data);
  },

  async delete(id: number): Promise<void> {
    return api.delete(`/competitors/${id}`);
  },

  async getAnalysis(id: number): Promise<CompetitorAnalysisResponse> {
    return api.get<CompetitorAnalysisResponse>(`/competitors/${id}/analysis`);
  },
};
