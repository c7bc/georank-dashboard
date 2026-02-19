import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportsApi } from '@/lib/api';
import type { GenerateReportRequest, ReportSettingsRequest } from '@/types';

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateReportRequest) => reportsApi.generate(data),
    onSuccess: () => {
      toast('Generating report', { description: 'Your report is being prepared. You\'ll be notified when done.' });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'usage'] });
    },
  });
}

export function useUpdateReportSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportSettingsRequest) => reportsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'settings'] });
    },
  });
}

export function useUpdateReportRecipients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { recipients: string[] }) => reportsApi.updateRecipients(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
