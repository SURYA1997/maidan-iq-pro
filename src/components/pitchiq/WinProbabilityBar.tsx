import { Panel } from "./Panel";
import { MetricTooltip } from "./InfoTip";

const teamA = { name: "CSK", pct: 62, color: "var(--team-a)" };
const teamB = { name: "MI", pct: 38, color: "var(--team-b)" };

export function WinProbabilityBar() {
  return (
    <Panel
      title="MODEL PROBABILITY"
      subtitle="// win %"
      right={
        <MetricTooltip
          label="Model Probability"
          text="Real-time win probability from our gradient-boosted model. Inputs: balls remaining, wickets in hand, run rate required, venue baseline, and matchup history. Updated ball-by-ball."
        />
      }
    >
      <div className="space-y-2">
        <div className="flex items-baseline justify-between font-mono text-sm font-bold">
          <span style={{ color: teamA.color }}>
            {teamA.name}{" "}
            <span className="text-xl font-black text-[var(--text-primary)]">{teamA.pct}%</span>
          </span>
          <span style={{ color: teamB.color }}>
            <span className="text-xl font-black text-[var(--text-primary)]">{teamB.pct}%</span>{" "}
            {teamB.name}
          </span>
        </div>

        <div
          className="relative h-2 overflow-hidden bg-black/40"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-700"
            style={{ width: `${teamA.pct}%`, background: teamA.color }}
          />
          <div
            className="absolute inset-y-0 right-0 transition-[width] duration-700"
            style={{ width: `${teamB.pct}%`, background: teamB.color, opacity: 0.85 }}
          />
          <div
            className="absolute inset-y-0"
            style={{ left: `${teamA.pct}%`, width: 1, background: "var(--bg)" }}
          />
        </div>
      </div>
    </Panel>
  );
}
