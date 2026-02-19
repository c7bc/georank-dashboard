import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { KeywordsPage } from '@/pages/KeywordsPage'
import { CompetitorsPage } from '@/pages/CompetitorsPage'
import { DomainsPage } from '@/pages/DomainsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ReportPreviewPage } from '@/pages/ReportPreviewPage'
import { RecommendationsPage } from '@/pages/RecommendationsPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { SettingsIndexPage } from '@/pages/settings/SettingsIndexPage'
import { ProfilePage } from '@/pages/settings/ProfilePage'
import { PreferencesPage } from '@/pages/settings/PreferencesPage'
import { SchedulingPage } from '@/pages/settings/SchedulingPage'
import { TeamPage } from '@/pages/settings/TeamPage'
import { BillingPage } from '@/pages/settings/BillingPage'
import { ApiKeysPage } from '@/pages/settings/ApiKeysPage'
import { IntegrationsPage } from '@/pages/settings/IntegrationsPage'

export default function App() {
  return (
    <BrowserRouter basename="/dashboard">
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/keywords" element={<KeywordsPage />} />
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
      <Toaster />
    </BrowserRouter>
  )
}
