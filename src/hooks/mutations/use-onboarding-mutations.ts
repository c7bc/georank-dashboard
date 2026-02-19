import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/lib/api';

export function useSubmitDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => onboardingApi.submitDomain(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
  });
}

export function useSubmitKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keywords: string[]) => onboardingApi.submitKeywords(keywords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });
}

export function useSubmitCompetitors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domains: string[]) => onboardingApi.submitCompetitors(domains),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
  });
}
