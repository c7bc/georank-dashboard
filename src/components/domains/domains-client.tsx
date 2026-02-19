import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Globe, Pencil, Trash2, Loader2, AlertCircle, Search } from "lucide-react";
import { useCreateDomain, useUpdateDomain, useDeleteDomain } from "@/hooks/mutations/use-domain-mutations";
import { cleanDomain } from "@/lib/utils";
import type { DomainResponse } from "@/lib/api/domains";

interface DomainsClientProps {
  initialDomains: DomainResponse[];
  domainLimit: number;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "\u2014";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function DomainsClient({ initialDomains, domainLimit }: DomainsClientProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'domains' });

  const createDomainMutation = useCreateDomain();
  const updateDomainMutation = useUpdateDomain();
  const deleteDomainMutation = useDeleteDomain();

  const isPending = createDomainMutation.isPending || updateDomainMutation.isPending || deleteDomainMutation.isPending;

  // Add dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editDomain, setEditDomain] = useState<DomainResponse | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editName, setEditName] = useState("");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddDomain = async () => {
    if (!newUrl.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createDomainMutation.mutateAsync({ url: cleanDomain(newUrl), name: newName.trim() || undefined });
      setIsAddOpen(false);
      setNewUrl("");
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDomain = async () => {
    if (!editDomain) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateDomainMutation.mutateAsync({
        id: editDomain.id,
        data: {
          url: editUrl ? cleanDomain(editUrl) : undefined,
          name: editName.trim() || undefined,
        },
      });
      setEditDomain(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update domain");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDomain = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);

    try {
      await deleteDomainMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (domain: DomainResponse) => {
    setEditDomain(domain);
    setEditUrl(domain.url);
    setEditName(domain.name);
    setError(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-semibold px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            {initialDomains.length}/{domainLimit} {t("usage")}
          </Badge>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setError(null); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-xs" disabled={initialDomains.length >= domainLimit}>
                <Plus className="h-4 w-4" />
                {t("addDomain")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addModal.title")}</DialogTitle>
                <DialogDescription>{t("addModal.subtitle")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="url">{t("addModal.urlLabel")}</Label>
                  <Input
                    id="url"
                    placeholder={t("addModal.urlPlaceholder")}
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("addModal.nameLabel")}</Label>
                  <Input
                    id="name"
                    placeholder={t("addModal.namePlaceholder")}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t("addModal.cancel")}
                </Button>
                <Button onClick={handleAddDomain} disabled={isSubmitting || !newUrl.trim()}>
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
      {initialDomains.length === 0 && (
        <Card className="border-dashed shadow-xs border-border/50 bg-gradient-to-t from-primary/5 to-card dark:bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold">{t("empty.title")}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
              {t("empty.description")}
            </p>
            <Button className="mt-6 gap-2" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("addDomain")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Domain Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialDomains.map((domain) => (
          <div
            key={domain.id}
            className={isPending ? "opacity-50" : ""}
          >
            <Card className="@container/card from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
              <CardHeader>
                <CardTitle className="text-base">{domain.name || domain.url}</CardTitle>
                <CardDescription>{domain.url}</CardDescription>
                <CardAction>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-primary">{domain.geo_score || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">GEO SCORE</p>
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Search className="h-3 w-3" />
                    {domain.keywords_count ?? 0} {t("keywords")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    {t("lastScanned")}: {domain.last_scanned ? timeAgo(domain.last_scanned) : t("never")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(domain)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeleteId(domain.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDomain} onOpenChange={(open) => { if (!open) { setEditDomain(null); setError(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editModal.title")}</DialogTitle>
            <DialogDescription>{t("editModal.subtitle")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-url">{t("addModal.urlLabel")}</Label>
              <Input
                id="edit-url"
                placeholder={t("addModal.urlPlaceholder")}
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("addModal.nameLabel")}</Label>
              <Input
                id="edit-name"
                placeholder={t("addModal.namePlaceholder")}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDomain(null)}>
              {t("addModal.cancel")}
            </Button>
            <Button onClick={handleEditDomain} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("addModal.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDomain}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
