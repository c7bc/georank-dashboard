import { useTranslation } from "react-i18next";
import { useScheduling } from "@/hooks/queries/use-scheduling";
import { useKeywords } from "@/hooks/queries/use-keywords";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { SchedulingClient } from "@/components/scheduling/scheduling-client";
import { Skeleton } from "@/components/ui/skeleton";

import { SchedulingResponse } from "@/types";

export function SchedulingPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'scheduling' });
  const { data: scheduling, isLoading: isSchedulingLoading } = useScheduling();
  const { data: keywordsData, isLoading: isKeywordsLoading } = useKeywords({ per_page: 100 });

  const isLoading = isSchedulingLoading || isKeywordsLoading;

  const showSkeleton = useDelayedLoading(isLoading);

  const defaultScheduling: SchedulingResponse = {
    plan: "free",
    reports: { auto_generate: true, send_email: false, frequency: "monthly", cron_description: "", used: 0, limit: 1, owner_email: "", recipients: [] as string[] },
    recommendations: { auto_generate: true, send_email: false, enabled: false, frequency: "none", cron_description: "", used: 0, limit: 0 },
    keywords: { frequency: "monthly", cron_description: "", used: 0, limit: 6, auto_query_count: 0, total_keywords: 0, allowed_platforms: ["openai", "gemini"], send_email: false },
  };

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("title")} />
        <main className="flex-1 overflow-auto p-6">
          <SchedulingSkeleton />
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
          <SchedulingClient
            scheduling={scheduling || defaultScheduling}
            keywords={keywordsData?.keywords || []}
          />
        </div>
      </main>
    </>
  );
}

function SchedulingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    </div>
  );
}
