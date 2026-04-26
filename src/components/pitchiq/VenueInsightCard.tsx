import { Panel } from "./Panel";
import { MetricTooltip } from "./InfoTip";

const stats: Array<{ label: string; value: string; tip: string }> = [
  {
    label: "Avg 1st innings score",
    value: "172",
    tip: "Mean first-innings total at this venue across the last 30 T20 matches. A useful par baseline before factoring in conditions.",
  },
  {
    label: "Dew factor",
    value: "High",
    tip: "Likelihood of dew settling on the outfield in the second innings. High dew typically favours the chasing side because the ball skids on.",
  },
  {
    label: "Boundary dimensions",
    value: "Large",
    tip: "Average straight and square boundary lengths. Larger boundaries reduce six-hitting efficiency and reward bowlers who hit the deck hard.",
  },
  {
    label: "Spin assistance",
    value: "Moderate",
    tip: "Surface response to spin based on historical turn and bounce data. Moderate means useful grip from over 10 onwards.",
  },
];

export function VenueInsightCard() {
  return (
    <Panel title="VENUE" subtitle="// chepauk">
      <ul className="space-y-3">
        {stats.map((s, i) => (
          <li
            key={s.label}
            className="pb-3"
            style={{
              borderBottom: i < stats.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                <MetricTooltip label={s.label} text={s.tip} />
              </div>
              <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                {s.value}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
