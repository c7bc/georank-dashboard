import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { keywordsApi } from '@/lib/api';
import type { CreateKeywordRequest, UpdateKeywordRequest } from '@/types';

export function useCreateKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKeywordRequest) => keywordsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => keywordsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateKeywordRequest }) => keywordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRefreshKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { selections: Array<{ keyword_id: number; platforms: string[] }> }) => keywordsApi.refresh(params),
    onSuccess: () => {
      toast('Analysis in progress', { description: 'Your keywords are being analysed. You\'ll be notified when done.' });
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'usage'] });
    },
  });
}

export function useBulkCreateKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { keywords: CreateKeywordRequest[] }) => keywordsApi.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
