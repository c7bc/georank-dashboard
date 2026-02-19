import { useTranslation } from "react-i18next";
import { useRecommendations } from "@/hooks/queries/use-recommendations";
import { useBillingPlan } from "@/hooks/queries/use-billing";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { RecommendationsClient } from "@/components/recommendations/recommendations-client";
import { UpgradeRequired } from "@/components/shared/upgrade-required";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { data: plan } = useBillingPlan();
  const { data: recData, isLoading } = useRecommendations();

  if (plan && !plan.recommendations_enabled) {
    return (
      <>
        <DashboardHeader title={t("recommendations")} />
        <UpgradeRequired
          icon="lightbulb"
          title={t("recommendations")}
          subtitle="AI-powered suggestions to improve your visibility"
          description="Get personalized AI recommendations to boost your brand's visibility across AI platforms."
          requiredPlan="First Movers"
        />
      </>
    );
  }

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("recommendations")} />
        <main className="flex-1 overflow-auto p-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </main>
      </>
    );
  }

  if (isLoading) return null;

  return (
    <>
      <DashboardHeader title={t("recommendations")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <RecommendationsClient initialRecommendations={recData?.recommendations || []} />
        </div>
      </main>
    </>
  );
}
