import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import type { PaginationParams, ReportDetailResponse } from '@/types';

export function useReports(params?: PaginationParams) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportsApi.list(params),
  });
}

export function useReport(id: number) {
  return useQuery<ReportDetailResponse>({
    queryKey: ['report', id],
    queryFn: () => reportsApi.getDetail(id),
    enabled: !!id,
  });
}

export function useReportSettings() {
  return useQuery({
    queryKey: ['reports', 'settings'],
    queryFn: () => reportsApi.getSettings(),
  });
}
