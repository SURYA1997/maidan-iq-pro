import { Panel } from "./Panel";
import { MetricTooltip } from "./InfoTip";

const value = 74;

export function PressureIndex() {
  return (
    <Panel
      title="PRESSURE INDEX"
      subtitle="// real-time"
      right={
        <MetricTooltip
          label="Pressure Index"
          text="Composite 0–100 score reflecting situational stress on the batting side. Inputs: required run rate vs current, wickets lost, recent dot-ball ratio, and bowler matchup difficulty."
        />
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          {/* The number must be massive and commanding */}
          <div
            className="font-mono text-8xl font-black leading-none tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </div>
          <div
            className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em]"
            style={{ color: "#6B7280" }}
          >
            ELEVATED · BATTING SIDE
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[12px]" style={{ color: "#6B7280" }}>Δ +6 last over</div>
          <div className="font-mono text-[12px]" style={{ color: "#6B7280" }}>peak 81 · over 12</div>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="mt-4">
        <div
          className="relative h-1.5 overflow-hidden bg-black/40"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${value}%`, background: "var(--accent-primary)" }}
          />
          <div
            className="absolute top-0 h-full w-px"
            style={{ left: `${value}%`, background: "var(--text-primary)", opacity: 0.4 }}
          />
        </div>
        <div
          className="mt-1 flex justify-between font-mono text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </Panel>
  );
}
