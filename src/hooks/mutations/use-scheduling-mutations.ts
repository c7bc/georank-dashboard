import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi } from '@/lib/api';
import type { UpdateKeywordSchedulingRequest } from '@/types';

export function useUpdateReportScheduling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { auto_generate?: boolean; send_email?: boolean }) => schedulingApi.updateReports(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] });
    },
  });
}

export function useUpdateRecommendationScheduling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { auto_generate?: boolean }) => schedulingApi.updateRecommendations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] });
    },
  });
}

export function useUpdateKeywordScheduling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateKeywordSchedulingRequest) => schedulingApi.updateKeywords(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] });
    },
  });
}
