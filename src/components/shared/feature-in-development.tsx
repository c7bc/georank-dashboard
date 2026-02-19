import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  description?: string;
}

export function FeatureInDevelopment({ title, description }: Props) {
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-6 max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border/50">
          <Wrench className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description ??
              "We're actively building this feature. It will be available in an upcoming release."}
          </p>
        </div>
      </div>
    </main>
  );
}
