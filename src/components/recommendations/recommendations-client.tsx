import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Link,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  LucideIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useUpdateRecommendationStatus, useGenerateRecommendations } from "@/hooks/mutations/use-recommendation-mutations";
import { useDomains } from "@/hooks/queries/use-domains";
import type {
  RecommendationResponse,
  RecommendationStatus,
  RecommendationCategory,
  Priority,
} from "@/types";

interface RecommendationsClientProps {
  initialRecommendations: RecommendationResponse[];
}

const priorityColors: Record<Priority, string> = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-success",
};

const categoryIcons: Record<RecommendationCategory, LucideIcon> = {
  content: FileText,
  authority: Link,
  faq: MessageCircle,
  technical: TrendingUp,
};

export function RecommendationsClient({
  initialRecommendations,
}: RecommendationsClientProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'recommendations' });
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const { data: domainsData } = useDomains();
  const domains = domainsData?.items ?? [];
  const [selectedDomainId, setSelectedDomainId] = useState<number | undefined>(undefined);

  const updateStatusMutation = useUpdateRecommendationStatus();
  const generateRecommendationsMutation = useGenerateRecommendations();

  const completedCount = recommendations.filter(
    (r) => r.status === "completed"
  ).length;
  const totalCount = recommendations.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Calculate potential impact from remaining recommendations
  const potentialImpact = recommendations
    .filter((r) => r.status !== "completed")
    .reduce((acc, r) => {
      // Parse impact string like "Could improve GEO Score by 8-12 points"
      const match = r.impact.match(/(\d+)-?(\d+)?/);
      if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        return { min: acc.min + min, max: acc.max + max };
      }
      return acc;
    }, { min: 0, max: 0 });

  const handleStatusUpdate = async (
    id: number,
    newStatus: RecommendationStatus
  ) => {
    setLoadingId(id);
    try {
      const result = await updateStatusMutation.mutateAsync({ id, status: newStatus });
      if (result) {
        setRecommendations((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: result.status } : r
          )
        );
      }
    } catch {
      // Error handled by mutation
    } finally {
      setLoadingId(null);
    }
  };

  const getNextStatus = (
    currentStatus: RecommendationStatus
  ): RecommendationStatus => {
    switch (currentStatus) {
      case "pending":
        return "in_progress";
      case "in_progress":
        return "completed";
      default:
        return currentStatus;
    }
  };

  const getButtonLabel = (status: RecommendationStatus): string => {
    switch (status) {
      case "pending":
        return t("actions.start");
      case "in_progress":
        return t("actions.markComplete");
      default:
        return "";
    }
  };

  const handleGenerate = async () => {
    setGenerateModalOpen(false);
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await generateRecommendationsMutation.mutateAsync(selectedDomainId);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate recommendations");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setGenerateModalOpen(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t("generate")}
            </Button>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("potentialImpact")}</p>
            <p className="text-2xl font-bold text-gradient">
              {potentialImpact.min > 0
                ? `+${potentialImpact.min}-${potentialImpact.max} pts`
                : t("allComplete")}
            </p>
          </div>
        </div>
      </div>

      {generateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generateError}</AlertDescription>
        </Alert>
      )}

      {/* Generate Recommendations Modal */}
      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("generate")}</DialogTitle>
            <DialogDescription>
              {domains.length > 1
                ? "Choose which domain to generate recommendations for, or generate workspace-wide recommendations."
                : "Generate AI-powered recommendations for your workspace."}
            </DialogDescription>
          </DialogHeader>
          {domains.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain</label>
              <Select
                value={selectedDomainId ? String(selectedDomainId) : "all"}
                onValueChange={(v) => setSelectedDomainId(v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger className="w-full">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name || d.url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Overview */}
      <Card className="@container/card from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("progress.title")}
              </p>
              <p className="text-2xl font-bold">
                {completedCount} {t("progress.of")} {totalCount}
              </p>
            </div>
            <Progress value={progressPercent} className="w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4" data-testid="recommendations-list">
        {recommendations.map((rec) => {
          const priority = rec.priority.toLowerCase() as Priority;
          const category = rec.category.toLowerCase() as RecommendationCategory;
          const Icon = categoryIcons[category] || Lightbulb;
          const isLoading = loadingId === rec.id && updateStatusMutation.isPending;

          return (
            <Card
              key={rec.id}
              className={cn(
                "from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs",
                rec.status === "completed" && "opacity-60"
              )}
              data-testid={`recommendation-${rec.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={priorityColors[priority]}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                      <Badge variant="secondary">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                      {rec.status === "completed" && (
                        <Badge className="badge-success">{t("status.completed")}</Badge>
                      )}
                      {rec.status === "in_progress" && (
                        <Badge className="badge-warning">{t("status.inProgress")}</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold">{rec.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                    <p className="mt-2 text-sm text-accent-emerald">
                      {rec.impact}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-accent-emerald" />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() =>
                          handleStatusUpdate(rec.id, getNextStatus(rec.status))
                        }
                        data-testid="recommendation-status-toggle"
                      >
                        {isLoading ? t("actions.updating") : getButtonLabel(rec.status)}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card className="border-dashed shadow-xs border-border/50">
          <CardContent className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lightbulb className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
            <p className="mt-2 text-muted-foreground">{t("empty.description")}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
