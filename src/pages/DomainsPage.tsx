import { useTranslation } from "react-i18next";
import { useDomains } from "@/hooks/queries/use-domains";
import { useBillingPlan } from "@/hooks/queries/use-billing";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { DomainsClient } from "@/components/domains/domains-client";
import { Skeleton } from "@/components/ui/skeleton";

export function DomainsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'domains' });
  const { data: domainsData, isLoading } = useDomains();
  const { data: plan } = useBillingPlan();

  let domains = [];
  if (domainsData) {
    domains = Array.isArray(domainsData) ? domainsData : (domainsData as any).items || [];
  }
  const domainLimit = (plan as any)?.domain_limit || 1;

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="@container/main space-y-6">
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
                <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isLoading) return null;

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <DomainsClient initialDomains={domains} domainLimit={domainLimit} />
        </div>
      </main>
    </>
  );
}
