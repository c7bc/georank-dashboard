import { api } from './client';
import type {
  DashboardMetricsResponse,
  VisibilityResponse,
  RecentMentionsResponse,
  TopKeywordsResponse,
  CompetitorComparisonResponse,
} from '@/types';

export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetricsResponse> {
    return api.get<DashboardMetricsResponse>('/dashboard/metrics');
  },

  async getVisibility(days: number = 30): Promise<VisibilityResponse> {
    return api.get<VisibilityResponse>(`/dashboard/visibility?days=${days}`);
  },

  async getRecentMentions(limit: number = 10): Promise<RecentMentionsResponse> {
    return api.get<RecentMentionsResponse>(`/dashboard/mentions/recent?limit=${limit}`);
  },

  async getTopKeywords(limit: number = 5): Promise<TopKeywordsResponse> {
    return api.get<TopKeywordsResponse>(`/dashboard/keywords/top?limit=${limit}`);
  },

  async getCompetitorComparison(): Promise<CompetitorComparisonResponse> {
    return api.get<CompetitorComparisonResponse>('/dashboard/competitors/comparison');
  },
};
