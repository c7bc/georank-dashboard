import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/websocket-context';

/**
 * Centralised WebSocket → React Query sync.
 * Mounted once in AuthenticatedLayout so invalidations happen regardless of
 * which page the user is on when the backend job completes.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { ws } = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handlers: Record<string, () => void> = {
      'competitor:analysis': () => {
        queryClient.invalidateQueries({ queryKey: ['competitors'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
      'geoscore:update': () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['keywords'] });
        queryClient.invalidateQueries({ queryKey: ['domains'] });
      },
      'mention:new': () => {
        queryClient.invalidateQueries({ queryKey: ['mentions'] });
        queryClient.invalidateQueries({ queryKey: ['keywords'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
      'report:complete': () => {
        queryClient.invalidateQueries({ queryKey: ['reports'] });
      },
    };

    for (const [event, handler] of Object.entries(handlers)) {
      ws.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        ws.off(event, handler);
      }
    };
  }, [ws, queryClient]);
}
