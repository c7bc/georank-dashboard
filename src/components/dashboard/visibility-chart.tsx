import React from "react"
import { useTranslation } from "react-i18next"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { TrendingUp } from "lucide-react"

const chartConfig = {
  score: {
    label: "Visibility",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface VisibilityDataPoint {
  date: string
  score: number
  queries?: number
}

interface VisibilityChartProps {
  data?: VisibilityDataPoint[]
  days?: number
  onDaysChange?: (days: number) => void
}

function VisibilityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const score = Math.round(Number(payload[0]?.value ?? 0))
  const queries: number = payload[0]?.payload?.queries ?? 0

  return (
    <div className="rounded-lg border border-border bg-background/95 px-3 py-2.5 shadow-md backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-semibold text-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] text-muted-foreground">Visibility</span>
          </div>
          <span className="text-[11px] font-mono font-semibold tabular-nums">{score}%</span>
        </div>
        {queries > 0 && (
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground">Queries run</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{queries}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function VisibilityChart({ data = [], days = 30, onDaysChange }: VisibilityChartProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'dashboard.visibility' })

  const timeRange = days === 7 ? "7d" : days === 90 ? "90d" : "30d"
  const setTimeRange = (val: string) => {
    const map: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
    onDaysChange?.(map[val] ?? 30)
  }

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs" data-testid="visibility-chart">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              {t("subtitle")}
            </span>
            <span className="@[540px]/card:hidden">{timeRange === "30d" ? "Last 30 days" : timeRange === "7d" ? "Last 7 days" : "Last 90 days"}</span>
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">90D</ToggleGroupItem>
            <ToggleGroupItem value="30d">30D</ToggleGroupItem>
            <ToggleGroupItem value="7d">7D</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-24 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">90 Days</SelectItem>
              <SelectItem value="30d" className="rounded-lg">30 Days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="mb-2 h-8 w-8 opacity-50" />
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="text-sm">{t("emptyDescription")}</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} hide />
              <ChartTooltip cursor={false} content={<VisibilityTooltip />} />
              <Area
                dataKey="score"
                type="basis"
                fill="url(#fillScore)"
                stroke="var(--primary)"
                strokeWidth={2}
                animationDuration={1500}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
