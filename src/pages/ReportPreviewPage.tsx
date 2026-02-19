import { useState, useRef, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { generateReportPDF } from "@/lib/generate-report-pdf";
import {
  ArrowLeft,
  Download,
  BarChart2,
  Layers,
  Users,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Circle,
  CircleCheck,
  CircleX,
  Minus,
  Calendar,
  TrendingUp,
  Globe,
  ChevronRight,
  Target,
  Search,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { cn } from "@/lib/utils";
import { useReport } from "@/hooks/queries/use-reports";

// Icons rotated through for market trend cards
const TREND_ICONS = [TrendingUp, Users, Target, Search];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function aiPresenceSignal(presence: string): "green" | "yellow" | "red" {
  if (presence === "dominant" || presence === "strong") return "green";
  if (presence === "moderate") return "yellow";
  return "red";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
  accent,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  accent: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-6", accent)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    CRITICAL: "border-red-500/30 bg-red-500/10 text-red-500",
    HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-500",
    MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-600",
    LOW: "border-border bg-muted text-muted-foreground",
  };
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-bold uppercase tracking-wider px-2 h-5", styles[priority] ?? styles.LOW)}
    >
      {priority}
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95">
          <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReportPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data, isLoading, error } = useReport(Number(id));
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const autoDownloadFired = useRef(false);

  async function handleDownloadPDF() {
    if (!data || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const domain = data?.meta?.domain ?? data?.name ?? "report";
      const filename = `georank-${domain}-${data?.type ?? "report"}.pdf`;
      await generateReportPDF(data, filename);
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  useEffect(() => {
    if (
      searchParams.get("download") === "1" &&
      data &&
      !isGeneratingPDF &&
      !autoDownloadFired.current
    ) {
      autoDownloadFired.current = true;
      // Wait for the DOM to render the report content before capturing
      requestAnimationFrame(() => {
        setTimeout(() => {
          handleDownloadPDF();
        }, 100);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <>
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <p className="text-muted-foreground">Report not found or failed to load.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/reports">Back to Reports</Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const geoScore = data.meta?.geo_score ?? 0;
  const mentionRate = data.meta?.mention_rate ?? 0;
  const domain = data.meta?.domain ?? data.name ?? "—";
  const period = data.meta?.period ?? "—";
  const keywordsTracked = data.meta?.keyword_count ?? 0;
  const generatedAt = formatDate(data.generated_at);

  const executiveSummary =
    data.sections?.find((s) => s.section_type === "executive_summary")?.content ?? "";
  const performanceContent =
    data.sections?.find((s) => s.section_type === "performance_analysis")?.content ?? "";
  const competitiveContent =
    data.sections?.find((s) => s.section_type === "competitive_landscape")?.content ?? "";

  const platforms = data.platform_insights ?? [];
  const platformRates = data.meta?.platform_rates ?? {};

  // Competitors sorted by score descending
  const competitors = [...(data.meta?.competitors ?? [])].sort((a, b) => b.score - a.score);

  const risks = data.risks ?? [];
  const recommendations = data.recommendations ?? [];
  const siteOverview = data.site_overview;
  const benchmarks = data.benchmarks ?? [];
  const marketTrends = data.market_trends ?? [];
  const competitorIntel = data.competitor_intel ?? [];
  const citations = data.citations ?? [];

  const scoreColor =
    geoScore >= 70 ? "text-emerald-500" : geoScore >= 50 ? "text-amber-500" : "text-red-500";
  const scoreBg =
    geoScore >= 70 ? "bg-emerald-500" : geoScore >= 50 ? "bg-amber-500" : "bg-red-500";

  // Performance metrics cards — built from real data
  const performanceMetrics = [
    {
      label: "AI Mention Rate",
      value: `${mentionRate.toFixed(1)}%`,
      note: mentionRate >= 50 ? "Above benchmark" : "Below benchmark",
      color:
        mentionRate >= 50 ? "text-emerald-500" : mentionRate >= 30 ? "text-amber-500" : "text-red-500",
    },
    {
      label: "GEO Score",
      value: `${geoScore}/100`,
      note: geoScore >= 65 ? "Above industry avg" : "Below industry avg",
      color:
        geoScore >= 65 ? "text-emerald-500" : geoScore >= 45 ? "text-amber-500" : "text-red-500",
    },
    {
      label: "Keywords",
      value: String(keywordsTracked),
      note: "tracked keywords",
      color: "text-foreground" as const,
    },
    {
      label: "Platforms",
      value: String(platforms.length || 4),
      note: "AI platforms tracked",
      color: "text-foreground" as const,
    },
    ...(data.meta?.top_keywords?.[0]
      ? [
          {
            label: "Top Keyword",
            value: data.meta.top_keywords[0].keyword,
            note: `Score: ${data.meta.top_keywords[0].score}`,
            color: "text-emerald-500" as const,
          },
        ]
      : []),
    ...(data.meta?.worst_keywords?.[0]
      ? [
          {
            label: "Needs Work",
            value: data.meta.worst_keywords[0].keyword,
            note: `Score: ${data.meta.worst_keywords[0].score}`,
            color: "text-red-500" as const,
          },
        ]
      : []),
  ];

  // Platform table: cell status helpers
  const mentionRateValues = platforms.map((p) => platformRates[p.platform] ?? 0);
  const maxRate = mentionRateValues.length ? Math.max(...mentionRateValues) : 0;
  const minRate = mentionRateValues.length ? Math.min(...mentionRateValues) : 0;

  function rateCellStatus(rate: number): "best" | "neutral" | "bad" {
    if (rate === maxRate) return "best";
    if (rate === minRate && minRate < maxRate) return "bad";
    return "neutral";
  }

  function statusCellStatus(status: string): "best" | "neutral" | "bad" {
    if (status === "strong") return "best";
    if (status === "weak") return "bad";
    return "neutral";
  }

  // Chart colours for benchmarks
  const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-auto">
        {/* ── Sticky top bar ── */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Link to="/reports">
                  <ArrowLeft className="h-4 w-4" />
                  Reports
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm font-medium truncate max-w-xs">
                {domain} — {period}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize font-medium">
                {data.type}
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:block">{generatedAt}</span>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 ml-1"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {isGeneratingPDF ? "Generating…" : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div ref={contentRef} className="mx-auto max-w-4xl px-6 py-12">

          {/* ═══ Report header ═══ */}
          <div className="mb-2 rounded-2xl border border-border/50 bg-muted/20 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Domain
                </p>
                <h1 className="text-3xl font-bold tracking-tight">{domain}</h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {period}
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 shadow-xs self-start shrink-0"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isGeneratingPDF ? "Generating…" : "Download PDF"}
              </Button>
            </div>

            <Separator className="mb-8" />

            {/* GEO Score + key metrics */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="sm:w-48 sm:shrink-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  GEO Score
                </p>
                <p className={cn("text-4xl font-bold tabular-nums", scoreColor)}>{geoScore}</p>
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", scoreBg)}
                      style={{ width: `${geoScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{geoScore}% of 100</span>
                    <span>Benchmark: 45–65</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end divide-x divide-border/50">
                {[
                  {
                    label: "AI Mention Rate",
                    value: `${mentionRate.toFixed(1)}%`,
                    color: mentionRate >= 50 ? "text-emerald-500" : "text-amber-500",
                  },
                  { label: "Keywords", value: String(keywordsTracked), color: "text-foreground" },
                  {
                    label: "Platforms",
                    value: String(platforms.length || 4),
                    color: "text-foreground",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="px-6 first:pl-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      {label}
                    </p>
                    <p className={cn("text-3xl font-bold tabular-nums leading-none", color)}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ Sections ═══ */}
          <ul className="relative w-full">

            {/* 1. Executive Summary */}
            <li className="border-b py-10">
              <SectionLabel icon={Sparkles} label="Executive Summary" accent="text-primary" />
              <h2 className="text-3xl font-bold tracking-tight mb-1">
                GEO Score{" "}
                <span className={scoreColor}>{geoScore}</span>
                <span className="text-muted-foreground">/100</span>
              </h2>
              {executiveSummary ? (
                <p className="text-base leading-7 text-muted-foreground whitespace-pre-wrap mt-4">
                  {executiveSummary}
                </p>
              ) : null}
            </li>

            {/* Site Overview */}
            {(siteOverview?.pages?.length || siteOverview?.access_status) ? (
              <li className="border-b py-10">
                <SectionLabel icon={Globe} label="Site Overview" accent="text-[var(--chart-4)]" />

                {/* Crawler block banner */}
                {(siteOverview.access_status === "blocked" || siteOverview.access_status === "partial") && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>
                        Crawler {siteOverview.access_status === "blocked" ? "blocked" : "partially blocked"}
                        {siteOverview.block_reason
                          ? ` (${siteOverview.block_reason.replace(/_/g, " ")})`
                          : ""}
                        :
                      </strong>{" "}
                      {siteOverview.block_advice}
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {siteOverview.summary ||
                    `AI crawler analysis of ${domain} — pages discovered and evaluated during this report period.`}
                </p>

                {siteOverview.pages?.length > 0 && (
                  <div>
                    {siteOverview.pages.map((page) => (
                      <div key={page.path} className="border-b border-border/60 py-5 last:border-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold">{page.title}</h3>
                              <Badge variant="secondary" className="text-[10px] h-5">
                                {page.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 font-mono">{page.path}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{page.summary}</p>
                          </div>
                          <div className="flex sm:flex-col sm:items-end gap-3 sm:gap-2 sm:shrink-0">
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 gap-1 border-primary/20 bg-primary/5 text-primary w-fit"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              {page.ai_mentions} mentions
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ) : null}

            {/* 2. Performance Analysis */}
            <li className="border-b py-10">
              <SectionLabel icon={BarChart2} label="Performance Analysis" accent="text-[var(--chart-1)]" />
              <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
                {performanceMetrics.map(({ label, value, note, color }) => (
                  <div key={label} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className={cn("text-xl font-bold tabular-nums truncate", color)}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{note}</p>
                  </div>
                ))}
              </div>
              {performanceContent && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {performanceContent}
                </p>
              )}
            </li>

            {/* Industry Benchmarks */}
            {benchmarks.length > 0 && (
              <li className="border-b py-10">
                <SectionLabel icon={Target} label="Industry Benchmarks" accent="text-[var(--chart-5)]" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  How {domain} compares to industry averages and top performers.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {benchmarks.map(({ label, yours, industry, top }, i) => {
                    const color = CHART_COLORS[i % CHART_COLORS.length];
                    return (
                      <div key={label} className="rounded-xl border border-border/50 bg-muted/20 p-5">
                        <div className="flex justify-between items-baseline mb-4">
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xl font-bold tabular-nums" style={{ color }}>{yours}%</p>
                        </div>
                        <div className="space-y-2.5">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">You</span>
                              <span className="text-muted-foreground">{yours}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(yours, 100)}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Industry avg</span>
                              <span>{industry}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-muted-foreground/40"
                                style={{ width: `${Math.min(industry, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Top performer</span>
                              <span>{top}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-muted-foreground/20"
                                style={{ width: `${Math.min(top, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </li>
            )}

            {/* Platform Breakdown */}
            {platforms.length > 0 && (
              <li className="border-b py-10">
                <SectionLabel icon={Layers} label="Platform Breakdown" accent="text-[var(--chart-2)]" />
                <div className="relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm rounded-xl">
                  <div className="relative w-full overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="h-10 px-4 text-left align-middle font-semibold text-foreground">
                            Metric
                          </th>
                          {platforms.map((p) => (
                            <th
                              key={p.platform}
                              className="h-10 px-3 align-middle text-center font-semibold text-foreground"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <PlatformIcon platform={p.platform} size={16} />
                                {p.label}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Mention Rate row */}
                        <tr className="border-b border-border/30 transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                            Mention Rate
                          </td>
                          {platforms.map((p) => {
                            const rate = platformRates[p.platform] ?? 0;
                            const cs = rateCellStatus(rate);
                            return (
                              <td
                                key={p.platform}
                                className={cn(
                                  "px-3 py-3.5 text-center font-medium transition-all duration-300",
                                  cs === "best"
                                    ? "bg-green-50 text-green-600 dark:bg-green-950/20"
                                    : cs === "bad"
                                    ? "bg-red-50 text-red-600 dark:bg-red-950/20"
                                    : "bg-muted/50 text-foreground"
                                )}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  {cs === "best" ? (
                                    <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                                  ) : cs === "bad" ? (
                                    <CircleX className="h-3.5 w-3.5 shrink-0" />
                                  ) : (
                                    <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  )}
                                  <span>{rate.toFixed(1)}%</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        {/* AI Presence row */}
                        <tr className="border-b border-border/30 transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                            AI Presence
                          </td>
                          {platforms.map((p) => {
                            const cs = statusCellStatus(p.status);
                            return (
                              <td
                                key={p.platform}
                                className={cn(
                                  "px-3 py-3.5 text-center font-medium transition-all duration-300",
                                  cs === "best"
                                    ? "bg-green-50 text-green-600 dark:bg-green-950/20"
                                    : cs === "bad"
                                    ? "bg-red-50 text-red-600 dark:bg-red-950/20"
                                    : "bg-muted/50 text-foreground"
                                )}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  {cs === "best" ? (
                                    <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                                  ) : cs === "bad" ? (
                                    <CircleX className="h-3.5 w-3.5 shrink-0" />
                                  ) : (
                                    <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  )}
                                  <span className="capitalize">{p.status}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        {/* Insight row */}
                        <tr className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                            Insight
                          </td>
                          {platforms.map((p) => (
                            <td
                              key={p.platform}
                              className="px-3 py-3.5 text-center text-xs text-muted-foreground bg-muted/50"
                            >
                              {p.insight}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </li>
            )}

            {/* Market Trends */}
            {marketTrends.length > 0 && (
              <li className="border-b py-10">
                <SectionLabel icon={TrendingUp} label="Market Trends" accent="text-[var(--chart-2)]" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Industry trends in AI search shaping your competitive landscape.
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {marketTrends.map(({ title, description, bullets }, i) => {
                    const Icon = TREND_ICONS[i % TREND_ICONS.length];
                    return (
                      <div
                        key={title}
                        className="space-y-4 rounded-xl border border-border p-6 transition-shadow hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-muted p-2.5 shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold">{title}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                        {bullets?.length > 0 && (
                          <div className="space-y-1.5">
                            {bullets.map((b) => (
                              <div key={b} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-foreground/50 shrink-0" />
                                <span className="text-sm">{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            )}

            {/* Competitive Landscape */}
            {competitors.length > 0 && (
              <li className="border-b py-10">
                <SectionLabel icon={Users} label="Competitive Landscape" accent="text-[var(--chart-3)]" />
                <div className="overflow-hidden rounded-xl border border-border/50 bg-background mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/40">
                        <th className="px-4 py-3 text-left font-semibold text-foreground w-10">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Competitor</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">GEO Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((c, i) => (
                        <tr
                          key={c.domain}
                          className={cn(
                            "border-b border-border/30 last:border-0 transition-colors",
                            c.is_you ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/20"
                          )}
                        >
                          <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium", c.is_you && "text-primary")}>
                                {c.domain}
                              </span>
                              {c.is_you && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1.5 border-primary/30 text-primary bg-primary/5"
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    c.is_you ? "bg-primary" : "bg-muted-foreground/50"
                                  )}
                                  style={{ width: `${Math.min(c.score, 100)}%` }}
                                />
                              </div>
                              <span className="tabular-nums text-sm font-semibold">
                                {c.score.toFixed(0)}/100
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {competitiveContent && (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {competitiveContent}
                  </p>
                )}
              </li>
            )}

            {/* Competitor Web Research */}
            {competitorIntel.length > 0 && (
              <li className="border-b py-10">
                <SectionLabel icon={Search} label="Competitor Web Research" accent="text-[var(--chart-3)]" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Real-time intelligence on competitor web presence, content strategy, and AI visibility signals.
                </p>
                <div className="overflow-hidden rounded-xl border border-border/50 bg-background">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/40">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Competitor</th>
                        <th className="hidden md:table-cell px-4 py-3 text-left font-semibold text-foreground">
                          Founded
                        </th>
                        <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold text-foreground">
                          Trust Signals
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">AI Presence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorIntel.map((c) => {
                        const isYou = c.domain === domain;
                        const signal = aiPresenceSignal(c.ai_presence);
                        return (
                          <tr
                            key={c.domain}
                            className={cn(
                              "border-b border-border/30 last:border-0 transition-colors",
                              isYou ? "bg-primary/5" : "hover:bg-muted/20"
                            )}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={cn("font-medium text-sm", isYou && "text-primary")}>
                                      {c.name}
                                    </span>
                                    {isYou && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-4 px-1.5 border-primary/30 text-primary bg-primary/5"
                                      >
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{c.domain}</p>
                                </div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-4 py-3.5 text-xs text-muted-foreground">
                              {c.founded}
                            </td>
                            <td className="hidden lg:table-cell px-4 py-3.5 text-xs text-muted-foreground max-w-[180px] truncate">
                              {c.trust_signals}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                                  signal === "green" && "bg-emerald-500/10 text-emerald-500",
                                  signal === "yellow" && "bg-amber-500/10 text-amber-600",
                                  signal === "red" && "bg-red-500/10 text-red-500"
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full shrink-0",
                                    signal === "green" && "bg-emerald-500",
                                    signal === "yellow" && "bg-amber-500",
                                    signal === "red" && "bg-red-500"
                                  )}
                                />
                                <span className="capitalize">{c.ai_presence}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </li>
            )}

            {/* Risks & Recommendations */}
            {(risks.length > 0 || recommendations.length > 0) && (
              <li className="border-b py-10">
                <div className="grid gap-0 lg:grid-cols-2">

                  {/* ── Risks ── */}
                  <div>
                    <div className="flex items-center gap-2 py-3 border-b mb-1 lg:pr-6">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Risks & Threats
                      </span>
                    </div>
                    {risks.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 border-b border-border/60 py-2.5 lg:pr-6 last:border-0 transition-colors hover:bg-muted/30 cursor-default"
                      >
                        <Circle
                          className={cn(
                            "mt-0.5 size-5 shrink-0",
                            r.priority === "CRITICAL" && "text-red-500",
                            r.priority === "HIGH" && "text-orange-500",
                            r.priority === "MEDIUM" && "text-amber-500",
                            r.priority === "LOW" && "text-muted-foreground/50"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">{r.title}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <PriorityBadge priority={r.priority} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {r.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Recommendations ── */}
                  <div className="lg:pl-6">
                    <div className="flex items-center gap-2 py-3 border-b mb-1">
                      <Lightbulb className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Recommendations
                      </span>
                    </div>
                    {recommendations.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 border-b border-border/60 py-2.5 last:border-0 transition-colors hover:bg-muted/30 cursor-default"
                      >
                        <Circle
                          className={cn(
                            "mt-0.5 size-5 shrink-0",
                            r.priority === "HIGH" && "text-orange-500",
                            r.priority === "MEDIUM" && "text-amber-500",
                            r.priority === "LOW" && "text-muted-foreground/50"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">{r.title}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <PriorityBadge priority={r.priority} />
                            {r.impact && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                <TrendingUp className="h-3 w-3" />
                                {r.impact}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {r.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </li>
            )}

            {/* Citations */}
            {citations.length > 0 && (
              <li className="py-10">
                <SectionLabel icon={BookOpen} label="Sources & Citations" accent="text-muted-foreground" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Sources referenced by Perplexity AI during competitor research and industry analysis for this report.
                </p>
                <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
                  {citations.map(({ url, title, snippet }, i) => (
                    <a
                      key={i}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-1.5 rounded-lg p-4 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground group-hover:bg-background transition-colors">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1">
                            <p className="text-sm font-medium leading-snug flex-1">{title}</p>
                            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <p className="text-xs text-muted-foreground/70 font-mono truncate">{url}</p>
                        </div>
                      </div>
                      <p className="ml-8 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {snippet}
                      </p>
                    </a>
                  ))}
                </div>
              </li>
            )}

          </ul>
        </div>
      </main>
    </>
  );
}
