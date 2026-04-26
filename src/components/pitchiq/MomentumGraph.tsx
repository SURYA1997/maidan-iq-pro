import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "./Panel";
import { MetricTooltip } from "./InfoTip";

const data = [
  { over: 5, win: 50 },
  { over: 6, win: 48 },
  { over: 7, win: 52 },
  { over: 8, win: 55 },
  { over: 9, win: 51 },
  { over: 10, win: 47 },
  { over: 11, win: 53 },
  { over: 12, win: 58 },
  { over: 13, win: 60 },
  { over: 14, win: 62 },
];

export function MomentumGraph() {
  return (
    <Panel
      title="MOMENTUM"
      subtitle="// last 10 overs"
      right={
        <MetricTooltip
          label="Momentum"
          text="Win-probability trajectory across the most recent overs. Steep slopes indicate phase shifts — wickets, boundary clusters, or required-rate jumps."
        />
      }
    >
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="2 4"
              vertical={false}
            />
            <XAxis
              dataKey="over"
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[30, 80]}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,107,0,0.25)", strokeWidth: 1 }}
              contentStyle={{
                background: "#1A1A1A",
                border: "none",
                borderLeft: "3px solid var(--accent-primary)",
                borderRadius: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "6px 10px",
                boxShadow: "none",
              }}
              labelStyle={{ color: "var(--text-muted)", fontSize: 10 }}
              itemStyle={{ color: "var(--text-primary)" }}
              formatter={(v) => [`${v}%`, "Win"]}
              labelFormatter={(l) => `Over ${l}`}
            />
            <Line
              type="monotone"
              dataKey="win"
              stroke="var(--accent-primary)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3, fill: "var(--accent-primary)", stroke: "none" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
