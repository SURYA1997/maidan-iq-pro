import { useEffect, useState } from "react";

export function TopBar() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="hairline-b sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-5">
        {/* Left — logo */}
        <div className="flex items-center gap-3">
          <div
            className="h-2.5 w-2.5 rotate-45"
            style={{ background: "var(--accent-primary)" }}
            aria-hidden
          />
          <span className="font-mono text-sm tracking-[0.25em] text-[var(--text-primary)]">
            PITCH&nbsp;IQ
          </span>
          <span className="label-mono ml-2 hidden md:inline">v0.1 · terminal</span>
        </div>

        {/* Center — live match */}
        <div className="hairline flex items-center gap-3 rounded-sm px-3 py-1">
          <span className="label-mono" style={{ color: "var(--accent-primary)" }}>
            LIVE
          </span>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            CSK <span className="text-muted">vs</span> MI
          </span>
          <span className="text-muted">·</span>
          <span className="font-mono text-xs text-muted">Over 14.3</span>
        </div>

        {/* Right — live dot + clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="live-dot" aria-hidden />
            <span className="label-mono">LIVE</span>
          </div>
          <span className="font-mono text-xs text-muted tabular-nums">{time}</span>
        </div>
      </div>
    </header>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour12: false });
}
