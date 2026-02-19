import { api } from './client';
import type {
  ReportListResponse,
  ReportResponse,
  ReportDetailResponse,
  ReportSettingsResponse,
  GenerateReportRequest,
  ReportSettingsRequest,
  PaginationParams,
} from '@/types';

export const reportsApi = {
  async list(params?: PaginationParams): Promise<ReportListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));

    const query = searchParams.toString();
    return api.get<ReportListResponse>(`/reports${query ? `?${query}` : ''}`);
  },

  async getDetail(id: number): Promise<ReportDetailResponse> {
    return api.get<ReportDetailResponse>(`/reports/${id}`);
  },

  async generate(data: GenerateReportRequest): Promise<ReportResponse> {
    return api.post<ReportResponse>('/reports/generate', data);
  },

  async getSettings(): Promise<ReportSettingsResponse> {
    return api.get<ReportSettingsResponse>('/reports/settings');
  },

  async updateSettings(data: ReportSettingsRequest): Promise<ReportSettingsResponse> {
    return api.put<ReportSettingsResponse>('/reports/settings', data);
  },

  async updateRecipients(data: { recipients: string[] }): Promise<void> {
    return api.put('/reports/recipients', data);
  },
};
