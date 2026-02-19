import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { platformLabels } from "@/lib/constants";
import { useRefreshKeywords } from "@/hooks/mutations/use-keyword-mutations";
import { useDailyQueryUsage } from "@/hooks/queries/use-billing";
import type { KeywordResponse } from "@/types";

interface DomainOption {
  id: number;
  name: string;
  url: string;
}

interface GenerateQueryDialogProps {
  keywords: KeywordResponse[];
  allowedPlatforms: string[];
  queriesUsed: number;
  queryLimit: number;
  domains?: DomainOption[];
}

export function GenerateQueryDialog({
  keywords,
  allowedPlatforms,
  queriesUsed,
  queryLimit,
  domains = [],
}: GenerateQueryDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "keywords.generateQuery" });
  const refreshKeywordsMutation = useRefreshKeywords();
  const { data: dailyUsage } = useDailyQueryUsage();

  const exhaustedPlatforms = useMemo(() => {
    const s = new Set<string>();
    const all = [
      ...(dailyUsage?.standard_models ?? []),
      ...(dailyUsage?.premium_models ?? []),
    ];
    for (const m of all) {
      if (m.limit > 0 && m.used >= m.limit) s.add(m.platform);
    }
    return s;
  }, [dailyUsage]);

  const [open, setOpen] = useState(false);
  // keyword_id -> selected platforms
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = Object.keys(selections).map(Number);
  const totalQueries = Object.values(selections).reduce((sum, platforms) => sum + platforms.length, 0);
  const remaining = queryLimit - queriesUsed;
  const canGenerate = totalQueries > 0 && totalQueries <= remaining;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Pre-fill based on keyword settings, excluding exhausted platforms
      const initial: Record<number, string[]> = {};
      const nonExhaustedAllowed = allowedPlatforms.filter((p) => !exhaustedPlatforms.has(p));
      for (const kw of keywords) {
        if (kw.auto_query !== false) {
          const platforms = (kw.platforms || []).filter(
            (p) => allowedPlatforms.includes(p) && !exhaustedPlatforms.has(p)
          );
          if (platforms.length > 0) {
            initial[kw.id] = platforms;
          } else if (nonExhaustedAllowed.length > 0) {
            initial[kw.id] = [...nonExhaustedAllowed];
          }
        }
      }
      setSelections(initial);
      setError(null);
    }
    setOpen(isOpen);
  };

  const toggleKeyword = (id: number) => {
    setSelections((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      const kw = keywords.find((k) => k.id === id);
      const platforms = (kw?.platforms || []).filter(
        (p) => allowedPlatforms.includes(p) && !exhaustedPlatforms.has(p)
      );
      const fallback = allowedPlatforms.filter((p) => !exhaustedPlatforms.has(p));
      return { ...prev, [id]: platforms.length > 0 ? platforms : fallback };
    });
  };

  const toggleAllKeywords = () => {
    if (selectedIds.length === keywords.length) {
      setSelections({});
    } else {
      const all: Record<number, string[]> = {};
      const fallback = allowedPlatforms.filter((p) => !exhaustedPlatforms.has(p));
      for (const kw of keywords) {
        const platforms = (kw.platforms || []).filter(
          (p) => allowedPlatforms.includes(p) && !exhaustedPlatforms.has(p)
        );
        all[kw.id] = platforms.length > 0 ? platforms : fallback;
      }
      setSelections(all);
    }
  };

  const togglePlatform = (keywordId: number, platform: string) => {
    setSelections((prev) => {
      const current = prev[keywordId];
      if (!current) return prev;
      const has = current.includes(platform);
      const updated = has ? current.filter((p) => p !== platform) : [...current, platform];
      // If no platforms left, remove the keyword
      if (updated.length === 0) {
        const next = { ...prev };
        delete next[keywordId];
        return next;
      }
      return { ...prev, [keywordId]: updated };
    });
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setError(null);

    const selectionsArray = Object.entries(selections).map(([id, platforms]) => ({
      keyword_id: Number(id),
      platforms,
    }));

    try {
      await refreshKeywordsMutation.mutateAsync({ selections: selectionsArray });
      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate queries";
      setError(message);
    }

    setIsSubmitting(false);
  };

  const usagePercent = queryLimit > 0 ? Math.round((queriesUsed / queryLimit) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Zap className="h-4 w-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("usageTitle")}</span>
              <span className="font-mono">
                {queriesUsed}/{queryLimit} {t("used")}
              </span>
            </div>
            <Progress value={usagePercent} />
          </div>

          <Separator />

          {/* Keywords with per-keyword platforms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t("keywordsSection")}</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={toggleAllKeywords}
              >
                {selectedIds.length === keywords.length
                  ? t("deselectAll")
                  : t("selectAll")}
              </button>
            </div>
            <div className="max-h-[240px] overflow-y-auto rounded-md border border-border divide-y divide-border">
              {domains.length > 1 ? (
                // Group keywords by domain
                (() => {
                  const domainMap = Object.fromEntries(domains.map((d) => [d.id, d]));
                  const groups: Record<string, KeywordResponse[]> = {};
                  for (const kw of keywords) {
                    const key = kw.domain_id ? String(kw.domain_id) : "none";
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(kw);
                  }
                  return Object.entries(groups).map(([domainKey, kws]) => {
                    const domain = domainKey !== "none" ? domainMap[Number(domainKey)] : null;
                    return (
                      <div key={domainKey}>
                        <div className="px-3 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground">
                          {domain ? domain.name || domain.url : "\u2014"}
                        </div>
                        {kws.map((kw) => (
                          <KeywordRow
                            key={kw.id}
                            kw={kw}
                            isSelected={!!selections[kw.id]}
                            selections={selections}
                            allowedPlatforms={allowedPlatforms}
                            exhaustedPlatforms={exhaustedPlatforms}
                            toggleKeyword={toggleKeyword}
                            togglePlatform={togglePlatform}
                          />
                        ))}
                      </div>
                    );
                  });
                })()
              ) : (
                keywords.map((kw) => (
                  <KeywordRow
                    key={kw.id}
                    kw={kw}
                    isSelected={!!selections[kw.id]}
                    selections={selections}
                    allowedPlatforms={allowedPlatforms}
                    exhaustedPlatforms={exhaustedPlatforms}
                    toggleKeyword={toggleKeyword}
                    togglePlatform={togglePlatform}
                  />
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="rounded-md bg-muted/50 p-3 space-y-1">
            <p className="text-sm font-medium">
              {selectedIds.length} keywords &times;{" "}
              <span className="font-mono">{totalQueries}</span> queries
            </p>
            {totalQueries > 0 && totalQueries <= remaining && (
              <p className="text-xs text-muted-foreground">
                {t("remaining", { count: remaining - totalQueries })}
              </p>
            )}
            {totalQueries > 0 && totalQueries > remaining && (
              <div className="flex items-start gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                  {remaining <= 0
                    ? t("quotaExhausted", { needed: totalQueries })
                    : t("overLimit", { needed: totalQueries, available: remaining })}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {t("generate")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KeywordRow({
  kw,
  isSelected,
  selections,
  allowedPlatforms,
  exhaustedPlatforms,
  toggleKeyword,
  togglePlatform,
}: {
  kw: KeywordResponse;
  isSelected: boolean;
  selections: Record<number, string[]>;
  allowedPlatforms: string[];
  exhaustedPlatforms: Set<string>;
  toggleKeyword: (id: number) => void;
  togglePlatform: (keywordId: number, platform: string) => void;
}) {
  return (
    <div className="px-3 py-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`kw-${kw.id}`}
          checked={isSelected}
          onCheckedChange={() => toggleKeyword(kw.id)}
        />
        <Label
          htmlFor={`kw-${kw.id}`}
          className="font-normal text-sm cursor-pointer truncate"
        >
          {kw.keyword}
        </Label>
      </div>
      {isSelected && (
        <div className="flex flex-wrap gap-1.5 pl-6">
          {allowedPlatforms.map((platform) => {
            const active = selections[kw.id]?.includes(platform);
            const isLastActive = active && (selections[kw.id]?.length ?? 0) === 1;
            const isExhausted = exhaustedPlatforms.has(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => !isLastActive && !isExhausted && togglePlatform(kw.id, platform)}
                disabled={isLastActive || isExhausted}
                title={isExhausted ? "Daily limit reached" : undefined}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs transition-colors ${
                  isExhausted
                    ? "border-border bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                    : active
                    ? isLastActive
                      ? "border-primary/50 bg-primary/10 text-primary opacity-60 cursor-not-allowed"
                      : "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/30"
                }`}
              >
                {platformLabels[platform] || platform}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
