import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKeywords } from "@/hooks/queries/use-keywords";
import { useBillingUsage, useBillingPlan } from "@/hooks/queries/use-billing";
import { useDomains } from "@/hooks/queries/use-domains";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { KeywordsTable } from "@/components/keywords/keywords-table";
import { Skeleton } from "@/components/ui/skeleton";

export function KeywordsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'keywords' });
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data: keywordsData, isLoading: isKeywordsLoading } = useKeywords({
    page,
    per_page: 10,
    status: searchParams.get("status") || undefined,
    search: searchParams.get("search") || undefined,
    platform: searchParams.get("platform") || undefined,
    sort: searchParams.get("sort") || undefined,
    domain_id: searchParams.get("domain_id") || undefined,
  });

  const { data: usage, isLoading: isUsageLoading } = useBillingUsage();
  const { data: plan, isLoading: isPlanLoading } = useBillingPlan();
  const { data: domainsData, isLoading: isDomainsLoading } = useDomains();

  const isLoading = isKeywordsLoading || isUsageLoading || isPlanLoading || isDomainsLoading;
  const domainsArray = Array.isArray(domainsData) ? domainsData : ((domainsData as any)?.items ?? []);
  const domains = domainsArray.map((d: { id: number; name: string; url: string }) => ({ id: d.id, name: d.name, url: d.url }));

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
              </div>
              <div className="flex gap-2">
                 <Skeleton className="h-9 w-32" />
                 <Skeleton className="h-9 w-32" />
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4">
              <Skeleton className="h-9 w-[350px]" />
              <Skeleton className="h-9 w-[150px]" />
              <Skeleton className="h-9 w-[150px]" />
            </div>

            {/* Table */}
            <div className="rounded-md border bg-background p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <Skeleton className="h-4 w-[20%]" />
                   <Skeleton className="h-4 w-[10%]" />
                   <Skeleton className="h-4 w-[20%]" />
                   <Skeleton className="h-4 w-[15%]" />
                   <Skeleton className="h-4 w-[10%]" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="flex items-center justify-between py-2">
                       <Skeleton className="h-8 w-full" />
                   </div>
                ))}
              </div>
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
        <KeywordsTable
          initialKeywords={keywordsData?.keywords || []}
          total={keywordsData?.total || 0}
          page={page}
          totalPages={keywordsData?.total_pages || 1}
          initialSearch={searchParams.get("search") || undefined}
          initialPlatform={searchParams.get("platform") || undefined}
          initialStatus={searchParams.get("status") || undefined}
          initialSort={searchParams.get("sort") || undefined}
          initialDomainId={searchParams.get("domain_id") || undefined}
          allowedPlatforms={plan?.allowed_models ?? []}
          queriesUsed={usage?.queries_used ?? 0}
          queryLimit={usage?.query_limit ?? 0}
          domains={domains}
        />
      </main>
    </>
  );
}
