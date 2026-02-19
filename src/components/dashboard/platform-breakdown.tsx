import { Link } from "react-router-dom"
import { Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { platformLabels } from "@/lib/constants"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { cn } from "@/lib/utils"
import type { PlatformBreakdownItem } from "@/types"

const PLATFORMS = ["openai", "gemini", "grok", "deepseek", "anthropic", "perplexity"] as const

const PLATFORM_COLORS: Record<string, string> = {
  openai: "var(--chart-1)",
  gemini: "var(--chart-2)",
  grok: "var(--chart-3)",
  deepseek: "var(--chart-4)",
  anthropic: "var(--chart-5)",
  perplexity: "var(--chart-6)",
}

function isPlatformLocked(platform: string, plan: string): boolean {
  if (["free", "first_movers"].includes(plan)) {
    return !["openai", "gemini"].includes(platform)
  }
  if (plan === "starter") {
    return ["anthropic", "perplexity"].includes(platform)
  }
  return false
}

interface PlatformBreakdownProps {
  data: PlatformBreakdownItem[]
  plan: string
}

export function PlatformBreakdown({ data, plan }: PlatformBreakdownProps) {
  const dataMap = Object.fromEntries(data.map((d) => [d.platform, d]))

  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Platform Breakdown</CardTitle>
        <CardDescription className="text-xs">
          Mention rate and query count per AI platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-border">
          {PLATFORMS.map((platform) => {
            const item = dataMap[platform]
            const locked = isPlatformLocked(platform, plan)
            const score = item?.score ?? 0
            const mentions = item?.mentions ?? 0
            const label = platformLabels[platform] ?? platform

            return (
              <div
                key={platform}
                className={cn(
                  "flex items-center gap-4 py-3 first:pt-0 last:pb-0",
                  locked && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <PlatformIcon platform={platform} size={16} />
                  <span className="text-xs font-medium">{label}</span>
                </div>

                {locked ? (
                  <>
                    <div className="flex-1 h-1.5 rounded-full bg-muted" />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Link to="/settings/billing">Upgrade</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: PLATFORM_COLORS[platform],
                        }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">
                      {Math.round(score)}%
                    </span>
                    <span className="w-20 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                      {mentions} {mentions === 1 ? "mention" : "mentions"}
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
