import { useTranslation } from "react-i18next";
import { useMe } from "@/hooks/queries/use-auth";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { ProfileClient } from "@/components/settings/profile-client";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePage() {
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });
  const { data: user, isLoading } = useMe();

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("title")} />
        <main className="flex-1 overflow-auto p-6">
          <ProfileSkeleton />
        </main>
      </>
    );
  }

  if (isLoading || !user) {
    return null;
  }

  return (
    <>
      <DashboardHeader title={t("title")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <ProfileClient user={user} />
        </div>
      </main>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    </div>
  );
}
