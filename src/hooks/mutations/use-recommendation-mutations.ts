import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recommendationsApi } from '@/lib/api';
import type { RecommendationStatus } from '@/types';

export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RecommendationStatus }) => recommendationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useGenerateRecommendations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId?: number) => recommendationsApi.generate(domainId),
    onSuccess: () => {
      toast('Generating recommendations', { description: 'Your recommendations are being prepared. You\'ll be notified when done.' });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
