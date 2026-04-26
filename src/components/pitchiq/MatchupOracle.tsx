import { Panel } from "./Panel";
import { MetricTooltip } from "./InfoTip";

const metrics: Array<{ label: string; value: string; tip: string }> = [
  {
    label: "Strike Rate",
    value: "142",
    tip: "Kohli's career strike rate against left-arm pace in T20s, sample of 612 balls faced.",
  },
  {
    label: "Dismissal %",
    value: "18%",
    tip: "Percentage of innings ended by left-arm pacers. Slightly above his overall T20 dismissal rate of 14%.",
  },
  {
    label: "Average",
    value: "54",
    tip: "Mean runs per dismissal versus left-arm pace. Strong vs the angle, vulnerable to the one shaping back in.",
  },
  {
    label: "Boundary %",
    value: "21%",
    tip: "Share of balls dispatched for four or six in this matchup.",
  },
];

export function MatchupOracle() {
  return (
    <Panel title="MATCHUP ORACLE" subtitle="// h2h">
      <div className="mb-3">
        <div className="font-mono text-sm font-semibold text-[var(--text-primary)]">V Kohli</div>
        <div
          className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em]"
          style={{ color: "var(--accent-primary)" }}
        >
          vs Left-Arm Pace
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-px"
        style={{ background: "var(--border)" }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-3"
            style={{ background: "var(--surface)" }}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="label-mono">{m.label}</span>
              <MetricTooltip label={m.label} text={m.tip} />
            </div>
            <div className="font-mono text-2xl font-black leading-none text-[var(--text-primary)]">
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
