import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { extractMetricsFromAiText, stripMetricsFromAiText } from "@/lib/aiHtml";

interface Metric {
  label: string;
  before: number;
  after: number;
  unit: string;
}

export function stripMetricsBlock(text: string): string {
  return stripMetricsFromAiText(text);
}

const COLORS_BEFORE = "hsl(var(--muted-foreground) / 0.55)";
const COLORS_AFTER = "hsl(var(--primary))";

export function ResponseVisuals({ content }: { content: string }) {
  const metrics = useMemo<Metric[]>(() => extractMetricsFromAiText(content), [content]);

  if (metrics.length === 0) return null;

  const chartData = metrics.map((metric) => ({
    name: metric.label.length > 20 ? `${metric.label.slice(0, 18)}…` : metric.label,
    Before: metric.before,
    After: metric.after,
    unit: metric.unit,
  }));

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
        Performance Impact
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((metric, index) => {
          const improvement =
            metric.unit === "%"
              ? metric.after - metric.before
              : metric.before > 0
                ? ((metric.after - metric.before) / metric.before) * 100
                : 0;
          const isPositive = improvement > 0;

          return (
            <div key={index} className="rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{metric.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-foreground">{metric.after}{metric.unit}</span>
                <span className={`text-xs font-semibold ${isPositive ? "text-primary" : "text-destructive"}`}>
                  {isPositive ? "+" : ""}
                  {improvement.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">from {metric.before}{metric.unit}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 50)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={120} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string, payload: any) => [
                `${value}${payload?.payload?.unit ?? ""}`,
                name,
              ]}
            />
            <Bar dataKey="Before" fill={COLORS_BEFORE} radius={[0, 2, 2, 0]} barSize={14} />
            <Bar dataKey="After" radius={[0, 2, 2, 0]} barSize={14}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS_AFTER} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS_BEFORE }} />
            Before
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS_AFTER }} />
            After AI
          </span>
        </div>
      </div>
    </div>
  );
}
