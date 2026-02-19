import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useBillingPlan, useBillingUsage, useInvoices, usePaymentMethod } from "@/hooks/queries/use-billing";
import { useMe } from "@/hooks/queries/use-auth";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { BillingClient } from "@/components/settings/billing-client";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'billing' });
  const [searchParams] = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  const { data: plan, isLoading: isPlanLoading } = useBillingPlan();
  const { data: usage, isLoading: isUsageLoading } = useBillingUsage();
  const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices({ page: 1, per_page: 10 });
  const { data: me, isLoading: isMeLoading } = useMe();
  const { data: paymentMethod } = usePaymentMethod();

  const isLoading = isPlanLoading || isUsageLoading || isInvoicesLoading || isMeLoading;

  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <>
        <DashboardHeader title={t("title")} />
        <main className="flex-1 overflow-auto p-6">
          <BillingSkeleton />
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
          <BillingClient plan={plan || null} usage={usage || null} invoices={invoicesData?.invoices || []} userEmail={me?.email || ""} showSuccess={showSuccess} paymentMethod={paymentMethod ?? null} />
        </div>
      </main>
    </>
  );
}

function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
}
