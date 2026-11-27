import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout'
import { Skeleton } from '@/components/ui/skeleton'
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const KeywordsPage = lazy(() => import('@/pages/KeywordsPage').then(module => ({ default: module.KeywordsPage })))
const CompetitorsPage = lazy(() => import('@/pages/CompetitorsPage').then(module => ({ default: module.CompetitorsPage })))
const DomainsPage = lazy(() => import('@/pages/DomainsPage').then(module => ({ default: module.DomainsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(module => ({ default: module.ReportsPage })))
const ReportPreviewPage = lazy(() => import('@/pages/ReportPreviewPage').then(module => ({ default: module.ReportPreviewPage })))
const MentionsPage = lazy(() => import('@/pages/MentionsPage').then(module => ({ default: module.MentionsPage })))
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage').then(module => ({ default: module.RecommendationsPage })))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })))
const SettingsIndexPage = lazy(() => import('@/pages/settings/SettingsIndexPage').then(module => ({ default: module.SettingsIndexPage })))
const ProfilePage = lazy(() => import('@/pages/settings/ProfilePage').then(module => ({ default: module.ProfilePage })))
const PreferencesPage = lazy(() => import('@/pages/settings/PreferencesPage').then(module => ({ default: module.PreferencesPage })))
const SchedulingPage = lazy(() => import('@/pages/settings/SchedulingPage').then(module => ({ default: module.SchedulingPage })))
const TeamPage = lazy(() => import('@/pages/settings/TeamPage').then(module => ({ default: module.TeamPage })))
const BillingPage = lazy(() => import('@/pages/settings/BillingPage').then(module => ({ default: module.BillingPage })))
const ApiKeysPage = lazy(() => import('@/pages/settings/ApiKeysPage').then(module => ({ default: module.ApiKeysPage })))
const IntegrationsPage = lazy(() => import('@/pages/settings/IntegrationsPage').then(module => ({ default: module.IntegrationsPage })))

export default function App() {
  return (
    <BrowserRouter basename="/dashboard">
      <Suspense fallback={<Skeleton aria-busy="true" className="mx-auto my-12 h-12 w-2/3" />}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/keywords" element={<KeywordsPage />} />
            <Route path="/mentions" element={<MentionsPage />} />
            <Route path="/competitors" element={<CompetitorsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportPreviewPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/settings" element={<SettingsIndexPage />} />
            <Route path="/settings/profile" element={<ProfilePage />} />
            <Route path="/settings/preferences" element={<PreferencesPage />} />
            <Route path="/settings/scheduling" element={<SchedulingPage />} />
            <Route path="/settings/team" element={<TeamPage />} />
            <Route path="/settings/billing" element={<BillingPage />} />
            <Route path="/settings/api-keys" element={<ApiKeysPage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  )
}
