import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competitorsApi } from '@/lib/api';
import type { CreateCompetitorRequest } from '@/types';

export function useCreateCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompetitorRequest) => competitorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competitorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
