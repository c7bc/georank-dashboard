import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Download, Check, AlertCircle, Sparkles, ExternalLink, Clock, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { billingApi } from "@/lib/api";
import type { PlanResponse, UsageResponse, InvoiceResponse, PaymentMethodInfo } from "@/types";

const UPGRADE_PLANS = [
  {
    key: "first_movers",
    name: "First Movers",
    price: 5,
    annualPrice: 4,
    annualTotal: 48,
    badge: "Limited",
    popular: false,
    features: [
      "1 domain",
      "15 tracked keywords",
      "Weekly reports",
      "2 AI platforms (ChatGPT, Gemini)",
      "1 competitor",
      "AI recommendations",
      "120 queries/month",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: 49,
    annualPrice: 39,
    annualTotal: 468,
    badge: null,
    popular: false,
    features: [
      "2 domains",
      "50 tracked keywords",
      "Weekly reports",
      "4 AI platforms (ChatGPT, Gemini, DeepSeek, Grok)",
      "3 competitors",
      "AI recommendations",
      "API access (coming soon)",
      "3 team members (coming soon)",
      "800 queries/month",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 99,
    annualPrice: 79,
    annualTotal: 948,
    badge: "Most Popular",
    popular: true,
    features: [
      "5 domains",
      "200 tracked keywords",
      "Daily reports",
      "All 6 platforms incl. Claude & Perplexity",
      "2× more daily queries than Starter",
      "10 competitors",
      "AI recommendations",
      "API + Integrations (coming soon)",
      "10 team members (coming soon)",
      "36,000 queries/month",
    ],
  },
  {
    key: "agency",
    name: "Agency",
    price: 249,
    annualPrice: 199,
    annualTotal: 2388,
    badge: null,
    popular: false,
    features: [
      "15 domains",
      "500 tracked keywords",
      "Daily reports",
      "All 6 platforms incl. Claude & Perplexity",
      "6× more daily queries than Starter",
      "50 competitors",
      "AI recommendations",
      "API + Integrations (coming soon)",
      "50 team members (coming soon)",
      "90,000 queries/month",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: null,
    annualPrice: null,
    annualTotal: null,
    badge: null,
    popular: false,
    features: [
      "Custom domains & keywords",
      "All 6 AI platforms",
      "Custom daily query limits",
      "Custom competitors",
      "API + Custom integrations (coming soon)",
      "Custom team size (coming soon)",
      "Dedicated account manager",
      "Custom SLA",
    ],
  },
];

interface BillingClientProps {
  plan: PlanResponse | null;
  usage: UsageResponse | null;
  invoices: InvoiceResponse[];
  userEmail: string;
  showSuccess?: boolean;
  paymentMethod?: PaymentMethodInfo | null;
}

export function BillingClient({ plan, usage, invoices, userEmail, showSuccess, paymentMethod }: BillingClientProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'billing' });

  const [isLoading, setIsLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUpgrade = async (planKey: string) => {
    setIsLoading(true);
    try {
      const result = await billingApi.createCheckout(
        planKey,
        billingInterval,
        window.location.origin + "/settings/billing?success=true",
        window.location.origin + "/settings/billing?canceled=true",
      );
      window.location.href = result.url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      setIsLoading(false);
    }
  };

  const openStripePortal = async () => {
    setIsLoading(true);
    setPortalError(null);
    try {
      const result = await billingApi.createPortal(
        window.location.origin + "/settings/billing",
      );
      window.location.href = result.url;
    } catch (error) {
      // APIClientError wraps the backend response; the actual message is in .data.error.message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serverMsg: string = (error as any)?.data?.error?.message || (error as any)?.message || "";
      setPortalError(
        serverMsg.includes("no active subscription")
          ? "No active Stripe subscription found. Please upgrade your plan first to manage billing."
          : serverMsg || "Failed to open subscription portal. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const isDailyPlan = ['pro', 'agency', 'enterprise'].includes(plan?.name?.toLowerCase() ?? '');

  const domainsPercent = usage ? Math.round((usage.domains_used / Math.max(usage.domain_limit, 1)) * 100) : 0;
  const keywordsPercent = usage ? Math.round((usage.keywords_used / Math.max(usage.keyword_limit, 1)) * 100) : 0;
  const queriesPercent = usage && usage.query_limit > 0 ? Math.round((usage.queries_used / usage.query_limit) * 100) : 0;
  const competitorsPercent = usage && usage.competitor_limit > 0 ? Math.round((usage.competitors_used / usage.competitor_limit) * 100) : 0;
  const recommendationsPercent = usage && usage.recommendation_limit > 0 ? Math.round((usage.recommendation_runs_used / usage.recommendation_limit) * 100) : 0;
  const reportsPercent = usage && usage.report_limit > 0 ? Math.round((usage.reports_used / usage.report_limit) * 100) : 0;

  const showPricingTable = true;

  return (
    <div data-testid="billing-info" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {showSuccess && (
        <Alert className="border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" />
          <AlertDescription>
            {plan?.display_name
              ? `Welcome to the ${plan.display_name} plan! Your subscription is now active.`
              : "Your subscription is now active!"}
          </AlertDescription>
        </Alert>
      )}

      {portalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{portalError}</AlertDescription>
        </Alert>
      )}

      {plan?.cancel_at && (
        <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {"Your subscription will cancel on "}
            <strong>
              {new Date(plan.cancel_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
            {" To keep your plan, renew via "}
            <button className="underline font-medium" onClick={openStripePortal}>
              Manage Subscription
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-6 lg:grid-cols-2">
        {/* Current Plan */}
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>{t("currentPlan.title")}</CardTitle>
            <CardDescription>Your current subscription details</CardDescription>
            <CardAction>
              {plan && <Badge className="hero-gradient">{plan.display_name || plan.name}</Badge>}
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan ? (
              <>
                <div>
                  {plan.billing_interval === "year" && plan.annual_price ? (
                    <>
                      <p className="text-3xl font-bold font-mono">
                        ${plan.annual_price}
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Billed annually at ${plan.annual_price * 12}
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold font-mono">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/month</span>
                    </p>
                  )}
                </div>
            {usage ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("usage.domains")}</span>
                    <span className="font-mono">
                      {usage.domains_used}/{usage.domain_limit} {t("usage.used")}
                    </span>
                  </div>
                  <Progress value={domainsPercent} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("usage.keywords")}</span>
                    <span className="font-mono">
                      {usage.keywords_used}/{usage.keyword_limit} {t("usage.used")}
                    </span>
                  </div>
                  <Progress value={keywordsPercent} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t(isDailyPlan ? "usage.queries_daily" : "usage.queries")}</span>
                    <span className="font-mono">
                      {usage.queries_used}/{usage.query_limit} {t("usage.used")}
                    </span>
                  </div>
                  <Progress value={queriesPercent} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("usage.competitors")}</span>
                    <span className="font-mono">
                      {usage.competitors_used}/{usage.competitor_limit} {t("usage.used")}
                    </span>
                  </div>
                  <Progress value={competitorsPercent} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("usage.recommendations")}</span>
                    <span className="font-mono">
                      {usage.recommendation_runs_used}/{usage.recommendation_limit} {t("usage.used")}
                    </span>
                  </div>
                  <Progress value={recommendationsPercent} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t(isDailyPlan ? "usage.reports_daily" : "usage.reports")}</span>
                    <span className="font-mono">
                      {usage.reports_used}/{usage.report_limit} {t("usage.used")}
                    </span>
                  </div>
                  <Progress value={reportsPercent} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Usage data not available</p>
            )}
                <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-emerald" />
                    <span>Reports: {plan.report_frequency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-emerald" />
                    <span>AI Recommendations {plan.recommendations_enabled ? "enabled" : "disabled"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-emerald" />
                    <span>Up to {plan.team_member_limit} team members</span>
                  </div>
                  {plan.api_enabled && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-emerald" />
                      <span>API access</span>
                    </div>
                  )}
                  {plan.integrations_enabled && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-emerald" />
                      <span>Integrations</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 hero-gradient"
                    onClick={() => {
                      document.getElementById("billing-plans")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    disabled={isLoading}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {plan?.name === "free" ? t("currentPlan.upgrade") : "Change Plan"}
                  </Button>
                  {plan?.name !== "free" && (
                    <Button
                      variant="outline"
                      onClick={openStripePortal}
                      disabled={isLoading}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-muted-foreground">{t("currentPlan.noPlanTitle")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("currentPlan.noPlanDesc")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>{t("paymentMethod.title")}</CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-border/50 p-4 bg-muted/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                {paymentMethod ? (
                  <>
                    <p className="font-medium capitalize">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("paymentMethod.expires")} {paymentMethod.exp_month}/{paymentMethod.exp_year}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-muted-foreground">
                    No payment method configured
                  </p>
                )}
              </div>
            </div>
            {plan?.name !== "free" && (
              <Button variant="outline" className="w-full" onClick={openStripePortal} disabled={isLoading}>
                {t("paymentMethod.update")}
              </Button>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("paymentMethod.billingEmail")}
              </p>
              <p className="font-medium">{userEmail}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table — visible for free and first_movers plans */}
      {showPricingTable && (
        <div id="billing-plans" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Available Plans</h3>
              <p className="text-sm text-muted-foreground">Choose a plan that fits your needs</p>
            </div>
            {/* Billing interval toggle */}
            <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1 self-start sm:self-auto">
              <button
                onClick={() => setBillingInterval("month")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  billingInterval === "month"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("year")}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  billingInterval === "year"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {UPGRADE_PLANS.map((p) => {
              const isCurrent = plan?.name === p.key;
              const currentPlanIndex = UPGRADE_PLANS.findIndex(pl => pl.key === plan?.name);
              const thisPlanIndex = UPGRADE_PLANS.findIndex(pl => pl.key === p.key);
              const isDowngrade = currentPlanIndex > -1 && thisPlanIndex < currentPlanIndex;
              return (
                <Card
                  key={p.key}
                  className={
                    p.popular
                      ? "border-primary shadow-md relative from-primary/5 to-card dark:bg-card bg-gradient-to-t"
                      : "from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs"
                  }
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <span className="hero-gradient text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-5 flex flex-col gap-4 h-full">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base">{p.name}</span>
                        {p.badge && p.badge !== "Most Popular" && (
                          <Badge variant="secondary" className="text-xs">{p.badge}</Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="mt-3">
                        {p.price !== null ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold font-mono">
                                ${billingInterval === "year" && p.annualPrice !== null ? p.annualPrice : p.price}
                                <span className="text-sm font-normal text-muted-foreground">/mo</span>
                              </span>
                              {billingInterval === "year" && (
                                <span className="text-sm font-medium text-muted-foreground line-through">
                                  ${p.price}
                                </span>
                              )}
                            </div>
                            {billingInterval === "year" && p.annualTotal !== null ? (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Billed annually at ${p.annualTotal}
                              </p>
                            ) : (
                              <p className="mt-0.5 text-xs text-muted-foreground">Billed monthly</p>
                            )}
                          </>
                        ) : (
                          <span className="text-2xl font-bold">Custom</span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {p.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-accent-emerald mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-1">
                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : p.key === "enterprise" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <a href="mailto:sales@georank.site">Contact Sales</a>
                        </Button>
                      ) : (
                        <Button
                          className={p.popular ? "w-full hero-gradient" : "w-full"}
                          variant={p.popular ? "default" : "outline"}
                          onClick={() => handleUpgrade(p.key)}
                          disabled={isLoading}
                        >
                          <Sparkles className="mr-2 h-3.5 w-3.5" />
                          {isDowngrade ? "Downgrade" : "Upgrade"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice History */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{t("invoices.title")}</h3>
          <p className="text-sm text-muted-foreground">View your past invoices and payments</p>
        </div>
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("invoices.date")}</TableHead>
                <TableHead>{t("invoices.description")}</TableHead>
                <TableHead>{t("invoices.amount")}</TableHead>
                <TableHead>{t("invoices.status")}</TableHead>
                <TableHead>{t("invoices.download")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{formatDate(invoice.created_at)}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell className="font-mono">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {invoice.status === "paid" ? (
                      <Badge variant="outline" className="text-[11px] font-medium h-6 px-2 gap-1.5 border-green-500/20 bg-green-500/10 text-green-500 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        {t("invoices.paid")}
                      </Badge>
                    ) : invoice.status === "pending" ? (
                      <Badge variant="outline" className="text-[11px] font-medium h-6 px-2 gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-500 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px] font-medium h-6 px-2 gap-1.5 border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400">
                        <X className="h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice.pdf_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="font-medium">No invoices yet</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
