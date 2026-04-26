import { Panel } from "./Panel";

const batsmen = [
  { name: "MS Dhoni", runs: 38, balls: 19, sr: 200.0, onStrike: true },
  { name: "R Jadeja", runs: 22, balls: 17, sr: 129.4, onStrike: false },
];

const bowler = { name: "J Bumrah", overs: "3.3", runs: 28, wkts: 1, econ: 8.0 };

export function LiveScorecard() {
  return (
    <Panel
      title="LIVE SCORECARD"
      subtitle="// 14.3 ov"
      right={
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black leading-none text-[var(--text-primary)]">
            142/4
          </span>
          <span className="font-mono text-[12px] text-[var(--text-muted)]">CRR 9.79</span>
        </div>
      }
    >
      {/* Batsmen */}
      <div className="mb-3">
        <div className="label-mono mb-2 grid grid-cols-12 gap-2">
          <span className="col-span-6">Batsman</span>
          <span className="col-span-2 text-right">R</span>
          <span className="col-span-2 text-right">B</span>
          <span className="col-span-2 text-right">SR</span>
        </div>
        {batsmen.map((b) => (
          <div
            key={b.name}
            className="grid grid-cols-12 items-center gap-2 py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="col-span-6 flex items-center gap-2 text-sm text-[var(--text-primary)]">
              {b.name}
              {b.onStrike && (
                <span
                  className="h-1.5 w-1.5 rounded-none"
                  style={{ background: "var(--accent-primary)" }}
                  aria-label="on strike"
                />
              )}
            </span>
            <span className="col-span-2 text-right font-mono text-base font-bold text-[var(--text-primary)]">
              {b.runs}
            </span>
            <span className="col-span-2 text-right font-mono text-sm text-[var(--text-muted)]">
              {b.balls}
            </span>
            <span className="col-span-2 text-right font-mono text-sm text-[var(--text-muted)]">
              {b.sr.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Bowler */}
      <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="label-mono mb-2 grid grid-cols-12 gap-2">
          <span className="col-span-6">Bowler</span>
          <span className="col-span-2 text-right">O</span>
          <span className="col-span-2 text-right">R/W</span>
          <span className="col-span-2 text-right">ECON</span>
        </div>
        <div className="grid grid-cols-12 items-center gap-2">
          <span className="col-span-6 text-sm text-[var(--text-primary)]">{bowler.name}</span>
          <span className="col-span-2 text-right font-mono text-sm">{bowler.overs}</span>
          <span className="col-span-2 text-right font-mono text-sm font-bold">
            {bowler.runs}/{bowler.wkts}
          </span>
          <span className="col-span-2 text-right font-mono text-sm text-[var(--text-muted)]">
            {bowler.econ.toFixed(2)}
          </span>
        </div>
      </div>
    </Panel>
  );
}
