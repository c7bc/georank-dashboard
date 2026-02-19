import { useTranslation } from "react-i18next";
import { useMe } from "@/hooks/queries/use-auth";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { PreferencesClient } from "@/components/settings/preferences-client";
import { Skeleton } from "@/components/ui/skeleton";

export function PreferencesPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { data: me, isLoading } = useMe();

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("preferences")} />
        <main className="flex-1 overflow-auto p-6">
          <PreferencesSkeleton />
        </main>
      </>
    );
  }

  if (isLoading || !me) {
    return null;
  }

  return (
    <>
      <DashboardHeader title={t("preferences")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <PreferencesClient
            currentLanguage={me.language || "en"}
            queryEmailEnabled={me.query_email_enabled ?? true}
            recommendationEmailEnabled={me.recommendation_email_enabled ?? true}
          />
        </div>
      </main>
    </>
  );
}

function PreferencesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Skeleton className="h-[200px] w-full max-w-md rounded-xl" />
    </div>
  );
}
