import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, X, MessageSquare } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { MentionDetailSheet } from "@/components/mentions/mention-detail-sheet";
import { platformLabels } from "@/lib/constants";
import type { Mention, Platform } from "@/types";

interface MentionsTableProps {
  mentions: Mention[];
  total: number;
  page: number;
  totalPages: number;
}

export function MentionsTable({ mentions, total, page, totalPages }: MentionsTableProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'mentions' });
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedMention, setSelectedMention] = useState<Mention | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const platform = searchParams.get("platform") || "";
  const result = searchParams.get("result") || "";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  const handleRowClick = (mention: Mention) => {
    setSelectedMention(mention);
    setSheetOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("pageSubtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={platform || "all"} onValueChange={(v) => setFilter("platform", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("allPlatforms")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPlatforms")}</SelectItem>
            {Object.entries(platformLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={result || "all"} onValueChange={(v) => setFilter("result", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("allResults")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allResults")}</SelectItem>
            <SelectItem value="mentioned">{t("mentioned")}</SelectItem>
            <SelectItem value="not_mentioned">{t("notMentioned")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[200px]">{t("keyword")}</TableHead>
              <TableHead className="w-[130px]">{t("platform")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("query")}</TableHead>
              <TableHead className="w-[140px]">{t("result")}</TableHead>
              <TableHead className="w-[80px] text-center">{t("position")}</TableHead>
              <TableHead className="w-[140px] text-right">{t("date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="font-medium">{t("empty")}</p>
                </TableCell>
              </TableRow>
            ) : (
              mentions.map((mention) => (
                <TableRow
                  key={mention.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(mention)}
                >
                  <TableCell>
                    <div className="font-medium truncate max-w-[200px]">
                      {mention.keyword?.keyword || `#${mention.keyword_id}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 font-mono text-xs">
                      <PlatformIcon platform={mention.platform} size={12} />
                      {platformLabels[mention.platform] || mention.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground truncate block max-w-[300px]">
                      {mention.query}
                    </span>
                  </TableCell>
                  <TableCell>
                    {mention.result === "mentioned" ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10 gap-1">
                        <Check className="h-3 w-3" />
                        {t("mentioned")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-muted-foreground">
                        <X className="h-3 w-3" />
                        {t("notMentioned")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {mention.position != null ? (
                      <span className="font-mono text-sm">#{mention.position}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(mention.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("showing", { count: mentions.length, total })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      {selectedMention && (
        <MentionDetailSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          mentionId={selectedMention.id}
          keyword={selectedMention.keyword?.keyword || `#${selectedMention.keyword_id}`}
          platform={selectedMention.platform as Platform}
          result={selectedMention.result}
          position={selectedMention.position}
          time={formatDate(selectedMention.created_at)}
        />
      )}
    </div>
  );
}
