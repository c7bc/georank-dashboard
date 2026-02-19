import { useTranslation } from "react-i18next";
import { useReports } from "@/hooks/queries/use-reports";
import { useScheduling } from "@/hooks/queries/use-scheduling";
import { useMe } from "@/hooks/queries/use-auth";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { ReportsClient } from "@/components/reports/reports-client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'reports' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'common.errorStates' });
  const { data: reportsData, isLoading, isError, refetch } = useReports();
  const { data: schedulingData } = useScheduling();
  const { data: meData } = useMe();

  const plan = meData?.plan || "free";
  const teamEnabled = ["starter", "pro", "agency", "enterprise"].includes(plan);

  const reportScheduling = schedulingData?.reports || {
    auto_generate: true, send_email: false, frequency: "monthly",
    cron_description: "", used: 0, limit: 1, owner_email: "", recipients: [],
  };

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("title")} />
        <main className="flex-1 overflow-auto p-6">
          <ReportsSkeleton />
        </main>
      </>
    );
  }

  if (isLoading) return null;

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">{tCommon("genericTitle")}</h2>
        <p className="mt-2 text-muted-foreground">
          {tCommon("genericDescription")}
        </p>
        <Button onClick={() => refetch()} className="mt-6">
          {tCommon("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader title={t("title")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <ReportsClient
            initialReports={reportsData?.reports || []}
            reportScheduling={reportScheduling}
            canAddRecipients={teamEnabled}
          />
        </div>
      </main>
    </>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
