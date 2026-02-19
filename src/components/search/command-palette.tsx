import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Hash, Globe, Target } from "lucide-react";
import { searchApi } from "@/lib/api/search";
import type { SearchResult } from "@/lib/api/search";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchApi.search({ q, limit: 5 });
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  const handleNavigate = (type: string, id: number) => {
    onOpenChange(false);
    switch (type) {
      case "keyword":
        navigate("/keywords");
        break;
      case "competitor":
        navigate("/competitors");
        break;
      case "domain":
        navigate("/keywords");
        break;
    }
  };

  const hasResults = results && (
    results.keywords.length > 0 ||
    results.competitors.length > 0 ||
    results.domains.length > 0
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t("search.placeholder")}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("search.typeToSearch")}
          </div>
        )}
        {!isLoading && query.length >= 2 && !hasResults && (
          <CommandEmpty>{t("search.noResults")}</CommandEmpty>
        )}
        {!isLoading && query.length < 2 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("search.typeToSearch")}
          </div>
        )}

        {results && results.keywords.length > 0 && (
          <CommandGroup heading={t("search.keywords")}>
            {results.keywords.map((item) => (
              <CommandItem
                key={`kw-${item.id}`}
                onSelect={() => handleNavigate("keyword", item.id)}
                className="cursor-pointer"
              >
                <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.name}</span>
                {item.status && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.status}
                  </Badge>
                )}
                <span className="ml-2 text-xs text-muted-foreground">
                  {item.score}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results && results.competitors.length > 0 && (
          <CommandGroup heading={t("search.competitors")}>
            {results.competitors.map((item) => (
              <CommandItem
                key={`comp-${item.id}`}
                onSelect={() => handleNavigate("competitor", item.id)}
                className="cursor-pointer"
              >
                <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {item.score}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results && results.domains.length > 0 && (
          <CommandGroup heading={t("search.domains")}>
            {results.domains.map((item) => (
              <CommandItem
                key={`dom-${item.id}`}
                onSelect={() => handleNavigate("domain", item.id)}
                className="cursor-pointer"
              >
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {item.score}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
