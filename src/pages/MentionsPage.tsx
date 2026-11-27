import { useSearchParams } from "react-router-dom";
import { useMentions } from "@/hooks/queries/use-mentions";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { MentionsTable } from "@/components/mentions/mentions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { readPageNumber } from "@/lib/pagination";

export function MentionsPage() {
  const [searchParams] = useSearchParams();
  const page = readPageNumber(searchParams.get("page"));

  const { data, isLoading } = useMentions({
    page,
    per_page: 20,
    platform: searchParams.get("platform") || undefined,
    result: searchParams.get("result") || undefined,
  });

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-[160px]" />
              <Skeleton className="h-9 w-[160px]" />
            </div>
            <div className="rounded-md border bg-background p-4">
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
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
        <MentionsTable
          mentions={data?.mentions || []}
          total={data?.total || 0}
          page={page}
          totalPages={data?.total_pages || 1}
        />
      </main>
    </>
  );
}
