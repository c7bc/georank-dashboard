import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid, LabelList } from "recharts";
import { Users, ArrowRight } from "lucide-react";

const chartConfig = {
  score: {
    label: "GEO Score",
    color: "var(--primary)",
  },
};

interface CompetitorData {
  name: string;
  score: number;
  isUser?: boolean;
  comparison?: "ahead" | "behind" | "tied";
  difference?: number;
  trendType?: "up" | "down" | "stable";
}

interface CompetitorComparisonProps {
  data?: CompetitorData[];
}

function getBarFill(item: CompetitorData) {
  if (item.isUser) return "var(--primary)";
  if (item.comparison === "ahead") return "var(--chart-5)";
  if (item.comparison === "behind") return "var(--chart-2)";
  return "var(--muted-foreground)";
}

function getBarOpacity(item: CompetitorData) {
  if (item.isUser) return 1;
  if (item.comparison === "ahead") return 0.65;
  if (item.comparison === "behind") return 0.55;
  return 0.25;
}

function CompetitorTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item: CompetitorData = payload[0]?.payload;

  const compLabel =
    item.isUser ? null
    : item.comparison === "ahead" ? `${item.difference}pts above you`
    : item.comparison === "behind" ? `${item.difference}pts below you`
    : "Tied with you";

  const compColor =
    item.comparison === "ahead" ? "var(--chart-5)"
    : item.comparison === "behind" ? "var(--chart-2)"
    : "var(--muted-foreground)";

  return (
    <div className="rounded-lg border border-border bg-background/95 px-3 py-2.5 shadow-md backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-semibold text-foreground">{item.name}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] text-muted-foreground">GEO Score</span>
          </div>
          <span className="text-[11px] font-mono font-semibold tabular-nums">{item.score}</span>
        </div>
        {compLabel && (
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: compColor }} />
              <span className="text-[11px] text-muted-foreground">vs you</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums" style={{ color: compColor }}>{compLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomYAxisTick(props: any) {
  const { x, y, payload, data } = props;
  const item: CompetitorData | undefined = data?.find((d: CompetitorData) => d.name === payload.value);

  const subtext =
    !item || item.isUser ? null
    : item.comparison === "ahead" ? `↑ ${item.difference}pts ahead`
    : item.comparison === "behind" ? `↓ ${item.difference}pts behind`
    : "Tied";

  const subtextColor =
    item?.comparison === "ahead" ? "var(--chart-5)"
    : "var(--chart-2)";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0}
        dy={subtext ? -3 : 4}
        textAnchor="end"
        fill="var(--foreground)"
        fontSize={12}
        fontWeight={500}
      >
        {payload.value}
      </text>
      {subtext && (
        <text
          x={0} y={0}
          dy={12}
          textAnchor="end"
          fill={subtextColor}
          fontSize={10}
        >
          {subtext}
        </text>
      )}
    </g>
  );
}

export function CompetitorComparison({ data = [] }: CompetitorComparisonProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'dashboard.competitors' });

  const chartHeight = Math.max(240, data.length * 56);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          to="/competitors"
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          {t("viewDetails")} <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs px-2 sm:px-6 pt-8 pb-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-50" />
            <p className="font-medium text-sm">{t("emptyTitle")}</p>
            <p className="text-xs">{t("emptyDescription")}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} style={{ height: chartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 80, right: 30 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tick={(tickProps) => <CustomYAxisTick {...tickProps} data={data} />}
                />
                <ChartTooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} content={<CompetitorTooltip />} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={22} animationDuration={1000}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={getBarFill(entry)}
                      opacity={getBarOpacity(entry)}
                      className="transition-all duration-300"
                    />
                  ))}
                  <LabelList
                    dataKey="score"
                    position="right"
                    offset={8}
                    style={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
