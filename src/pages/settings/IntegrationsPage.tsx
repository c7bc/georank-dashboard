import { useTranslation } from "react-i18next";
import { useIntegrations } from "@/hooks/queries/use-integrations";
import { useBillingPlan } from "@/hooks/queries/use-billing";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { UpgradeRequired } from "@/components/shared/upgrade-required";
import { FeatureInDevelopment } from "@/components/shared/feature-in-development";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { data: plan, isLoading: isPlanLoading } = useBillingPlan();
  const { data: integrationsData, isLoading: isIntegrationsLoading } = useIntegrations();

  const isLoading = isPlanLoading || isIntegrationsLoading;

  const showSkeleton = useDelayedLoading(isLoading);

  if (plan && !plan.integrations_enabled) {
    return (
      <>
        <DashboardHeader title={t("integrations")} />
        <FeatureInDevelopment
          title="Integrations"
          description="Connect GeoRank with Slack, Discord, Zapier, webhooks, and more to automate your AI visibility workflow. Integrations are coming in an upcoming release."
        />
      </>
    );
  }

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("integrations")} />
        <main className="flex-1 overflow-auto p-6">
          <IntegrationsSkeleton />
        </main>
      </>
    );
  }

  if (isLoading) return null;

  void integrationsData;

  return (
    <>
      <DashboardHeader title={t("integrations")} />
      <FeatureInDevelopment
        title="Integrations"
        description="Connect GeoRank with Slack, Discord, Zapier, webhooks, and more to automate your AI visibility workflow. Integrations are coming in an upcoming release."
      />
    </>
  );
}

function IntegrationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[150px] w-full rounded-xl" />
    </div>
  );
}
