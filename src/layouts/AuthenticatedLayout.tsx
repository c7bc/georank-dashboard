import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useDelayedLoading } from '@/hooks/use-delayed-loading'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { WebSocketProvider } from '@/contexts/websocket-context'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/blocks/app-sidebar'
import { ThemeCustomizerWrapper } from '@/components/blocks/theme-customizer-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

function RealtimeSyncBridge() {
  useRealtimeSync();
  return null;
}

export function AuthenticatedLayout() {
  const { user, isLoading, fetchUser, logout } = useAuthStore()
  const { t } = useTranslation('translation', { keyPrefix: 'auth.sessionExpired' })

  const showSkeleton = useDelayedLoading(isLoading, 200)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Show skeleton if loading takes more than 200ms
  if (showSkeleton) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  // Still loading but under 200ms - render nothing to avoid flicker
  if (isLoading) {
    return null
  }

  // Done loading, no user - show session expired
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-medium">{t('title')}</p>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('button')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <WebSocketProvider>
      <RealtimeSyncBridge />
      <SidebarProvider data-variant="inset">
        <AppSidebar user={user} />
        <SidebarInset>
          <Outlet />
          <ThemeCustomizerWrapper />
        </SidebarInset>
      </SidebarProvider>
    </WebSocketProvider>
  )
}
