import { useTranslation } from "react-i18next";
import { useApiKeys } from "@/hooks/queries/use-api-keys";
import { useBillingPlan } from "@/hooks/queries/use-billing";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { UpgradeRequired } from "@/components/shared/upgrade-required";
import { FeatureInDevelopment } from "@/components/shared/feature-in-development";
import { Skeleton } from "@/components/ui/skeleton";

export function ApiKeysPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { data: plan, isLoading: isPlanLoading } = useBillingPlan();
  const { data: apiKeysData, isLoading: isKeysLoading } = useApiKeys();

  const isLoading = isPlanLoading || isKeysLoading;

  const showSkeleton = useDelayedLoading(isLoading);

  if (plan && !plan.api_enabled) {
    return (
      <>
        <DashboardHeader title={t("apiKeys")} />
        <UpgradeRequired
          icon="key"
          title={t("apiKeys")}
          subtitle="Manage API keys for external integrations"
          description="Access the GeoRank API to integrate AI visibility data into your own tools and workflows."
          requiredPlan="Starter"
        />
      </>
    );
  }

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("apiKeys")} />
        <main className="flex-1 overflow-auto p-6">
          <APIKeysSkeleton />
        </main>
      </>
    );
  }

  if (isLoading) return null;

  void apiKeysData;

  return (
    <>
      <DashboardHeader title={t("apiKeys")} />
      <FeatureInDevelopment
        title="API Keys"
        description="Programmatic access to your GeoRank data via REST API. Generate and manage API keys to integrate AI visibility metrics into your own tools and workflows. Coming soon."
      />
    </>
  );
}

function APIKeysSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <Skeleton className="h-[150px] w-full rounded-xl" />
    </div>
  );
}
