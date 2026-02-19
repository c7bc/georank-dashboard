import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { useDailyQueryUsage } from "@/hooks/queries/use-billing"
import type { ModelDailyUsage } from "@/types"

function parseResetsIn(resetsIn: string): number {
  const [h, m, s] = resetsIn.split(":").map(Number)
  return h * 3600 + m * 60 + s
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function ModelUsageRow({ item }: { item: ModelDailyUsage }) {
  const isUnlimited = item.limit === 0
  const pct = isUnlimited ? 0 : Math.min(100, (item.used / item.limit) * 100)

  return (
    <div className="flex items-center gap-3">
      <PlatformIcon platform={item.platform} size={14} className="shrink-0" />
      <span className="w-20 shrink-0 text-xs font-medium">{item.label}</span>
      {isUnlimited ? (
        <>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-0 rounded-full bg-primary/40" />
          </div>
          <span className="w-20 shrink-0 text-right text-[11px] text-muted-foreground">Unlimited</span>
        </>
      ) : (
        <>
          <div className="flex-1">
            <Progress value={pct} className="h-1.5" />
          </div>
          <span className="w-20 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
            {item.used}/{item.limit} per day
          </span>
        </>
      )}
    </div>
  )
}

export function DailyQueryLimits() {
  const { data } = useDailyQueryUsage()
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!data?.resets_in) return
    const initial = parseResetsIn(data.resets_in)
    setCountdown(initial)
    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [data?.resets_in])

  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Daily Query Limits</span>
        {countdown !== null && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Resets in {formatCountdown(countdown)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Standard Models</p>
        {data.standard_models.map((item) => (
          <ModelUsageRow key={item.platform} item={item} />
        ))}
      </div>

      {data.premium_models && data.premium_models.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Premium Models</p>
          {data.premium_models.map((item) => (
            <ModelUsageRow key={item.platform} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
