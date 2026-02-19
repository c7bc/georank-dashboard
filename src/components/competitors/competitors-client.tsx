import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  BarChart2,
  Trash2,
  Loader2,
  Users,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useCreateCompetitor, useDeleteCompetitor } from "@/hooks/mutations/use-competitor-mutations";
import { useCompetitorAnalysis } from "@/hooks/queries/use-competitors";
import { cn, cleanDomain } from "@/lib/utils";
import type { CompetitorResponse, PlatformBreakdownItem } from "@/types";

interface CompetitorsClientProps {
  initialCompetitors: CompetitorResponse[];
  userGeoScore: number;
  userPlatformBreakdown?: PlatformBreakdownItem[];
  competitorLimit: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  grok: "Grok",
  deepseek: "DeepSeek",
};

function platformLabel(p: string): string {
  return PLATFORM_LABELS[p] || p;
}

function positionBadgeClass(pos: number): string {
  if (pos <= 2) return "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400";
  if (pos <= 4) return "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
}

const radarChartConfig = {
  yourBrand: { label: "Your Brand", color: "var(--chart-1)" },
  competitor: { label: "Competitor", color: "var(--chart-2)" },
};

const barChartConfig = {
  you: { label: "You", color: "var(--chart-1)" },
  competitor: { label: "Competitor", color: "var(--chart-2)" },
};

export function CompetitorsClient({
  initialCompetitors,
  userGeoScore,
  userPlatformBreakdown,
  competitorLimit,
}: CompetitorsClientProps) {
  const { t } = useTranslation("translation", { keyPrefix: "competitors" });

  const createCompetitorMutation = useCreateCompetitor();
  const deleteCompetitorMutation = useDeleteCompetitor();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCompetitorId, setSelectedCompetitorId] = useState<number>(
    initialCompetitors[0]?.id || 0
  );

  const selectedCompetitorData = initialCompetitors.find(c => c.id === selectedCompetitorId);
  const selectedCompetitorLabel = selectedCompetitorData?.name || selectedCompetitorData?.domain || "";

  const { data: analysis, isLoading: isLoadingAnalysis } = useCompetitorAnalysis(selectedCompetitorId);

  const radarData = useMemo(() => {
    if (!analysis?.platforms?.length) return [];
    const userMap = new Map((userPlatformBreakdown || []).map(p => [p.platform, p.score]));
    return analysis.platforms.map(p => ({
      axis: platformLabel(p.platform),
      yourBrand: Math.round(userMap.get(p.platform) ?? 0),
      competitor: Math.round(p.score),
    }));
  }, [analysis, userPlatformBreakdown]);

  const platformBarData = useMemo(() => {
    if (!analysis?.platforms?.length) return [];
    const userMap = new Map((userPlatformBreakdown || []).map(p => [p.platform, p.mentions]));
    return analysis.platforms.map(p => ({
      platform: platformLabel(p.platform),
      you: userMap.get(p.platform) ?? 0,
      competitor: p.mentions,
      avgPos: p.avg_pos.toFixed(1),
    }));
  }, [analysis, userPlatformBreakdown]);

  const insights = useMemo(() => {
    if (!selectedCompetitorData) return [];

    const ins: { icon: React.ElementType; iconColorClass: string; bgColorClass: string; title: string; description: string }[] = [];

    const scoreGap = selectedCompetitorData.difference;
    // "ahead" = competitor is ahead of you; "behind" = competitor is behind you
    const youAreAhead = selectedCompetitorData.comparison === "behind";
    ins.push({
      icon: youAreAhead ? TrendingUp : TrendingDown,
      iconColorClass: youAreAhead ? "text-green-500" : "text-red-500",
      bgColorClass: youAreAhead
        ? "bg-green-500/10 border-green-500/20"
        : "bg-red-500/10 border-red-500/20",
      title: youAreAhead ? `You're ${scoreGap} points ahead` : `You're ${scoreGap} points behind`,
      description: youAreAhead
        ? `Your GEO score of ${Math.round(userGeoScore)} surpasses ${selectedCompetitorLabel}. Keep optimizing to maintain this lead.`
        : `${selectedCompetitorLabel} scores ${Math.round(selectedCompetitorData.geo_score)}. Focus on content quality and platform presence to close the gap.`,
    });

    if (analysis?.platforms?.length) {
      const top = analysis.platforms[0];
      ins.push({
        icon: BarChart2,
        iconColorClass: "text-primary",
        bgColorClass: "bg-primary/10 border-primary/20",
        title: `Strongest on ${platformLabel(top.platform)}`,
        description: `${selectedCompetitorLabel} appears in ${top.mentions} mentions on ${platformLabel(top.platform)} with avg. position ${top.avg_pos.toFixed(1)}.`,
      });
    }

    const analysisText = analysis?.analysis || selectedCompetitorData.last_analysis;
    if (analysisText) {
      ins.push({
        icon: FileText,
        iconColorClass: "text-primary",
        bgColorClass: "bg-primary/10 border-primary/20",
        title: "AI Analysis",
        description: analysisText,
      });
    }

    return ins;
  }, [selectedCompetitorData, analysis, userGeoScore, selectedCompetitorLabel]);

  const handleAddCompetitor = async () => {
    if (!newDomain.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createCompetitorMutation.mutateAsync({ domain: cleanDomain(newDomain) });
      setIsAddOpen(false);
      setNewDomain("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add competitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompetitor = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deleteCompetitorMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {initialCompetitors.length}/{competitorLimit} {t("usage")}
          </Badge>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 shadow-xs"
                disabled={initialCompetitors.length >= competitorLimit}
              >
                <Plus className="h-4 w-4" />
                {t("addCompetitor")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addModal.title")}</DialogTitle>
                <DialogDescription>
                  Add a competitor domain to track and compare their AI
                  visibility.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="domain">{t("addModal.label")}</Label>
                  <Input
                    id="domain"
                    placeholder={t("addModal.placeholder")}
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    {t("addModal.helper")}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t("addModal.cancel")}
                </Button>
                <Button onClick={handleAddCompetitor} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    t("addModal.add")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty State */}
      {initialCompetitors.length === 0 && (
        <Card className="border-dashed shadow-xs border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Competitor Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialCompetitors.map((competitor, index) => (
          <motion.div
            key={competitor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={
              createCompetitorMutation.isPending ||
              deleteCompetitorMutation.isPending
                ? "opacity-50"
                : ""
            }
          >
            <Card className="@container/card from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
              <CardHeader>
                <CardTitle className="text-base">{competitor.name}</CardTitle>
                <CardDescription>{competitor.domain}</CardDescription>
                <CardAction>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono">
                      {Math.round(competitor.geo_score)}
                    </p>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {competitor.comparison === "ahead" ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/20 bg-green-500/10 text-green-500 dark:text-green-400"
                    >
                      {competitor.difference} {t("pointsAhead")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400"
                    >
                      {competitor.difference} {t("pointsBehind")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Badge
                    variant="outline"
                    className="font-medium px-1.5 py-0 h-5 border-border/50 text-muted-foreground gap-1"
                  >
                    {competitor.trend_type === "up" && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                    {competitor.trend_type === "down" && (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    {competitor.trend_type === "stable" && (
                      <Minus className="h-3 w-3" />
                    )}
                    <span
                      className={cn(
                        competitor.trend > 0
                          ? "text-green-600 dark:text-green-400"
                          : competitor.trend < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                      )}
                    >
                      {competitor.trend > 0 ? "+" : ""}
                      {competitor.trend} {t("thisWeek")}
                    </span>
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {competitor.keywords_ranking} {t("keywordsRanking")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    {competitor.mentions} {t("mentions")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCompetitorId(competitor.id);
                      document
                        .getElementById("head-to-head")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t("viewAnalysis")} →
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(competitor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              {competitor.last_analyzed_at && (
                <CardFooter className="text-[11px] text-muted-foreground/70 pt-0">
                  Last analyzed{" "}
                  {new Date(competitor.last_analyzed_at).toLocaleDateString()}
                </CardFooter>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Head-to-Head Comparison */}
      {initialCompetitors.length > 0 && (
        <Card
          className="@container/card from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs"
          id="head-to-head"
        >
          <CardHeader>
            <CardTitle>{t("headToHead.title")}</CardTitle>
            <CardDescription>{t("headToHead.subtitle")}</CardDescription>
            <CardAction>
              <Select
                value={String(selectedCompetitorId)}
                onValueChange={v => setSelectedCompetitorId(Number(v))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("headToHead.compareWith")} />
                </SelectTrigger>
                <SelectContent>
                  {initialCompetitors.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name || c.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent>
            {isLoadingAnalysis ? (
              <div className="mx-auto h-[300px] w-full max-w-lg flex items-center justify-center">
                <div className="w-full space-y-3">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-[240px] w-[240px] rounded-full mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              </div>
            ) : radarData.length > 0 ? (
              <ChartContainer
                config={radarChartConfig}
                className="mx-auto h-[300px] w-full max-w-lg"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Radar
                      name="Your Brand"
                      dataKey="yourBrand"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={selectedCompetitorLabel}
                      dataKey="competitor"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12 text-sm">
                No platform data yet. Analysis will appear after the next
                scheduled query run.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Details — Platform Breakdown + Keywords Presence */}
      {initialCompetitors.length > 0 && (
        <Card className="@container/card from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
            <CardDescription>
              Platform breakdown and keyword presence for{" "}
              {selectedCompetitorLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="platforms">
              <TabsList className="mb-4">
                <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
                <TabsTrigger value="keywords">Keywords Presence</TabsTrigger>
              </TabsList>

              {/* Platform Breakdown Tab */}
              <TabsContent value="platforms">
                {isLoadingAnalysis ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : platformBarData.length > 0 ? (
                  <ChartContainer
                    config={barChartConfig}
                    className="h-[220px] w-full"
                  >
                    <BarChart
                      data={platformBarData}
                      layout="vertical"
                      margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                    >
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        type="category"
                        dataKey="platform"
                        width={80}
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 11,
                        }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="you"
                        name="You"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="competitor"
                        name="Competitor"
                        fill="var(--chart-2)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No platform data yet.
                  </p>
                )}
              </TabsContent>

              {/* Keywords Presence Tab */}
              <TabsContent value="keywords">
                {isLoadingAnalysis ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : analysis?.keywords?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-center w-32">
                          Best Position
                        </TableHead>
                        <TableHead className="text-right w-28">
                          Appearances
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysis.keywords.map(kw => (
                        <TableRow key={kw.keyword}>
                          <TableCell className="font-medium">
                            {kw.keyword}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "tabular-nums font-mono",
                                positionBadgeClass(kw.best_pos)
                              )}
                            >
                              #{kw.best_pos}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums">
                            {kw.count}×
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No keyword data yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {t("insights.title", { competitor: selectedCompetitorLabel })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("insights.subtitle")}
          </p>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs mt-4 grid gap-4 md:grid-cols-3">
            {insights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <Card
                  key={i}
                  className="@container/card transition-all hover:bg-muted/50"
                >
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border",
                        insight.bgColorClass
                      )}
                    >
                      <Icon
                        className={cn("h-5 w-5", insight.iconColorClass)}
                      />
                    </div>
                    <h4 className="mt-4 font-semibold text-sm">
                      {insight.title}
                    </h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Competitor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this competitor? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompetitor}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
