import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardMetrics, useVisibility, useRecentMentions, useTopKeywords, useCompetitorComparison } from "@/hooks/queries/use-dashboard";
import { useMe } from "@/hooks/queries/use-auth";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { VisibilityChart } from "@/components/dashboard/visibility-chart";
import { RecentMentions } from "@/components/dashboard/recent-mentions";
import { TopKeywords } from "@/components/dashboard/top-keywords";
import { CompetitorComparison } from "@/components/dashboard/competitor-comparison";
import { PlatformBreakdown } from "@/components/dashboard/platform-breakdown";
import { UpgradeOverlay } from "@/components/dashboard/upgrade-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function DashboardPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'dashboard' });
  const { data: meData, isLoading: isMeLoading } = useMe();
  const { data: metricsData, isLoading: isMetricsLoading } = useDashboardMetrics();
  const [visibilityDays, setVisibilityDays] = useState(30);
  const { data: visibilityData, isLoading: isVisibilityLoading } = useVisibility(visibilityDays);
  const { data: mentionsData, isLoading: isMentionsLoading } = useRecentMentions();
  const { data: keywordsData, isLoading: isKeywordsLoading } = useTopKeywords();
  const { data: competitorData, isLoading: isCompetitorLoading } = useCompetitorComparison();

  const plan = meData?.plan || "free";
  const isFreePlan = plan === "free";

  const isInitialLoading = isMeLoading || isMetricsLoading;

  const showInitialSkeleton = useDelayedLoading(isInitialLoading);
  const showVisibilitySkeleton = useDelayedLoading(isVisibilityLoading);
  const showMentionsSkeleton = useDelayedLoading(isMentionsLoading);
  const showKeywordsSkeleton = useDelayedLoading(isKeywordsLoading);
  const showCompetitorSkeleton = useDelayedLoading(isCompetitorLoading);

  if (showInitialSkeleton) {
    return (
      <>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="@container/main space-y-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isInitialLoading) return null;

  const metrics = metricsData || {
    geo_score: 0, geo_score_change: 0, total_keywords: 0, keyword_limit: 3,
    total_mentions: 0, mentions_change: 0, average_position: 0, position_change: 0,
    platform_breakdown: [],
  };

  const fakeVisibilityData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    score: Math.round(40 + Math.sin(i / 4) * 20 + (i / 30) * 15),
  }));

  const fakeCompetitorData = [
    { name: "Your Brand", score: 72 },
    { name: "Competitor A", score: 85 },
    { name: "Competitor B", score: 61 },
    { name: "Competitor C", score: 48 },
    { name: "Competitor D", score: 35 },
  ];

  const visChartData = visibilityData?.data_points?.map((p) => ({
    date: new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    score: p.visibility,
    queries: p.mentions,
  })) || [];

  const mentionsList = mentionsData?.mentions?.slice(0, 5).map((m) => ({
    id: String(m.id),
    platform: m.platform as "chatgpt" | "claude" | "perplexity" | "gemini",
    query: m.keyword === "__deleted__" ? t("recentMentions.deletedKeyword") : m.keyword,
    result: m.result,
    position: m.position ?? null,
    time: m.time_ago,
  })) || [];

  const keywordsList = keywordsData?.keywords?.map((k) => ({
    id: String(k.id),
    keyword: k.keyword,
    score: k.score,
    trend: k.score_change,
    trendType: k.trend as "up" | "down" | "stable",
    status: (k.status || "not_ranking") as "ranking" | "improving" | "needs_work" | "not_ranking",
    position: null as number | null,
    mentions: k.mentions,
    visibility: k.visibility,
  })) || [];

  const competitorsList = competitorData ? [
    { name: "Your Brand", score: Math.round(competitorData.user_geo_score), isUser: true as const },
    ...competitorData.competitors.map((c) => ({
      name: c.name || c.domain,
      score: Math.round(c.geo_score),
      isUser: false as const,
      comparison: c.comparison as "ahead" | "behind" | "tied",
      difference: c.difference,
      trendType: c.trend_type as "up" | "down" | "stable",
      logo: c.logo,
    })),
  ] : [];

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title={t("geoScore")}
              value={metrics.geo_score || "\u2014"}
              suffix={metrics.geo_score ? "/100" : undefined}
              change={metrics.geo_score_change || 0}
              trendLabel={metrics.geo_score_change > 0 ? t("trendingUp") : metrics.geo_score_change < 0 ? t("trendingDown") : t("trendingStable")}
              contextLabel={t("geoScoreContext")}
            />
            <MetricCard
              title={t("aiMentions")}
              value={metrics.total_mentions}
              suffix={t("thisMonth")}
              change={metrics.mentions_change || 0}
              trendLabel={metrics.mentions_change > 0 ? t("trendingUp") : metrics.mentions_change < 0 ? t("trendingDown") : t("trendingStable")}
              contextLabel={t("mentionsContext")}
            />
            <MetricCard
              title={t("keywordsTracked")}
              value={metrics.total_keywords}
              suffix={`/ ${metrics.keyword_limit} ${t("limit")}`}
              trendLabel={t("trendingStable")}
              contextLabel={t("keywordsContext")}
            />
            <MetricCard
              title={t("bestRanking")}
              value={metrics.average_position ? `#${Math.round(metrics.average_position)}` : "\u2014"}
              suffix={metrics.average_position ? "avg position" : undefined}
              change={metrics.position_change || 0}
              trendLabel={metrics.position_change > 0 ? t("trendingUp") : metrics.position_change < 0 ? t("trendingDown") : t("trendingStable")}
              contextLabel={t("rankingContext")}
            />
          </div>

          <div className="min-h-[400px]">
            {showVisibilitySkeleton ? (
               <Skeleton className="h-[400px] w-full rounded-xl" />
            ) : isFreePlan ? (
              <UpgradeOverlay title={t("visibility.upgradeTitle")} description={t("visibility.upgradeDescription")}>
                <div className="[&_[data-slot=card]]:bg-none [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:border-transparent [&_[data-slot=card]]:shadow-none">
                  <VisibilityChart data={fakeVisibilityData} />
                </div>
              </UpgradeOverlay>
            ) : (
              <VisibilityChart data={visChartData} days={visibilityDays} onDaysChange={setVisibilityDays} />
            )}
          </div>

          <Separator className="opacity-50" />

          <div className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="min-w-0">
              {showMentionsSkeleton ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <RecentMentions data={mentionsList} />
              )}
              </div>
              <div className="min-w-0">
              {showKeywordsSkeleton ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <TopKeywords data={keywordsList} />
              )}
              </div>
            </div>

            <PlatformBreakdown
              data={metrics.platform_breakdown}
              plan={plan}
            />

            {showCompetitorSkeleton ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : isFreePlan ? (
              <UpgradeOverlay title={t("competitors.upgradeTitle")} description={t("competitors.upgradeDescription")}>
                <CompetitorComparison data={fakeCompetitorData} />
              </UpgradeOverlay>
            ) : (
              <CompetitorComparison data={competitorsList} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
