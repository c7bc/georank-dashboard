import { useTranslation } from "react-i18next";
import { useTeamMembers } from "@/hooks/queries/use-team";
import { useBillingPlan } from "@/hooks/queries/use-billing";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { UpgradeRequired } from "@/components/shared/upgrade-required";
import { FeatureInDevelopment } from "@/components/shared/feature-in-development";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { data: plan } = useBillingPlan();
  const { data: teamData, isLoading } = useTeamMembers();

  if (plan && !plan.team_enabled) {
    return (
      <>
        <DashboardHeader title={t("team")} />
        <UpgradeRequired
          icon="users"
          title={t("team")}
          subtitle="Manage team members and permissions"
          description="Invite team members, assign roles, and collaborate on your AI visibility strategy together."
          requiredPlan="Starter"
        />
      </>
    );
  }

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("team")} />
        <main className="flex-1 overflow-auto p-6">
          <TeamSkeleton />
        </main>
      </>
    );
  }

  if (isLoading) return null;

  void teamData;

  return (
    <>
      <DashboardHeader title={t("team")} />
      <FeatureInDevelopment
        title="Team Management"
        description="Invite team members, assign roles, and collaborate on your AI visibility strategy. This feature is coming in an upcoming release."
      />
    </>
  );
}

function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
}
