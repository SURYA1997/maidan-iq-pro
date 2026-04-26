import { Panel } from "./Panel";

const rows: Array<[string, string]> = [
  ["Match", "IPL · League Stage"],
  ["Teams", "CSK vs MI"],
  ["Venue", "MA Chidambaram, Chennai"],
  ["Toss", "MI won · chose to bowl"],
  ["Innings", "1st · CSK batting"],
  ["Conditions", "Clear · 28°C"],
];

export function MatchInfoCard() {
  return (
    <Panel title="MATCH" subtitle="// info">
      <dl className="space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="label-mono shrink-0">{k}</dt>
            <dd className="truncate text-right font-mono text-xs text-[var(--text-primary)]">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
