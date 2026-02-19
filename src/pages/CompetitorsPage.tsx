import { useTranslation } from "react-i18next";
import { useCompetitors } from "@/hooks/queries/use-competitors";
import { useDashboardMetrics } from "@/hooks/queries/use-dashboard";
import { useBillingPlan } from "@/hooks/queries/use-billing";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { CompetitorsClient } from "@/components/competitors/competitors-client";
import { UpgradeRequired } from "@/components/shared/upgrade-required";
import { Skeleton } from "@/components/ui/skeleton";

export function CompetitorsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'competitors' });
  const { data: plan } = useBillingPlan();
  const { data: competitorsData, isLoading } = useCompetitors();
  const { data: metricsData } = useDashboardMetrics();

  if (plan && !plan.competitors_enabled) {
    return (
      <>
        <DashboardHeader title={t("title")} />
        <UpgradeRequired
          icon="swords"
          title={t("title")}
          subtitle={t("subtitle")}
          description="Track and compare your AI visibility against competitors. See how you rank across different AI platforms."
          requiredPlan="First Movers"
        />
      </>
    );
  }

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("title")} />
        <main className="flex-1 overflow-auto p-6">
          <div className="@container/main space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="mt-2 h-4 w-64" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-10 w-40 rounded-lg" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isLoading) return null;

  return (
    <>
      <DashboardHeader title={t("title")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <CompetitorsClient
            initialCompetitors={competitorsData?.competitors || []}
            userGeoScore={metricsData?.geo_score || 0}
            userPlatformBreakdown={metricsData?.platform_breakdown}
            competitorLimit={plan?.competitor_limit ?? 0}
          />
        </div>
      </main>
    </>
  );
}
