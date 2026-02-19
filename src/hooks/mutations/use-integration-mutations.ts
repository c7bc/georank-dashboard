import { useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '@/lib/api';
import type { IntegrationType } from '@/types';

export function useToggleIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, enabled }: { type: IntegrationType; enabled: boolean }) => integrationsApi.toggle(type, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useSaveIntegrationConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, config }: { type: IntegrationType; config: { webhook_url: string; secret?: string } }) => integrationsApi.saveConfig(type, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
