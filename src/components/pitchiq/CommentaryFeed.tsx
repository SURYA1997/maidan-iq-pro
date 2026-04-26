import { useEffect, useRef, useState } from "react";
import { getDemoCommentary, type CommentaryEntry } from "@/services/api";
import { Panel } from "./Panel";

const CITY: Record<string, string> = {
  "Mumbai Indians": "Mumbai",
  "Chennai Super Kings": "Chennai",
  "Royal Challengers Bengaluru": "Bengaluru",
  "Royal Challengers Bangalore": "Bengaluru",
  "Kolkata Knight Riders": "Kolkata",
  "Sunrisers Hyderabad": "Hyderabad",
  "Lucknow Super Giants": "Lucknow",
  "Gujarat Titans": "Ahmedabad",
  "Punjab Kings": "Punjab",
  "Kings XI Punjab": "Punjab",
  "Rajasthan Royals": "Rajasthan",
  "Delhi Capitals": "Delhi",
  "Delhi Daredevils": "Delhi",
};

function shortenMatch(match: string): string {
  const parts = match.split(" vs ");
  if (parts.length !== 2) return match.slice(0, 20);
  const a = CITY[parts[0].trim()] ?? parts[0].trim();
  const b = CITY[parts[1].trim()] ?? parts[1].trim();
  const label = `${a} vs ${b}`;
  return label.length > 20 ? label.slice(0, 19) + "…" : label;
}

const POLL_MS = 5 * 60 * 1000; // 5 minutes

function SkeletonRow() {
  return (
    <li className="grid grid-cols-[44px_1fr] gap-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 32, height: 14, borderRadius: 3, background: "var(--border)", opacity: 0.5 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ width: "85%", height: 12, borderRadius: 3, background: "var(--border)", opacity: 0.5 }} />
        <div style={{ width: "55%", height: 10, borderRadius: 3, background: "var(--border)", opacity: 0.3 }} />
      </div>
    </li>
  );
}

export function CommentaryFeed() {
  const [entries, setEntries] = useState<(CommentaryEntry & { match?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchDemoCommentary() {
    try {
      const data = await getDemoCommentary();
      if (data.entries?.length) {
        setEntries(data.entries);
      }
    } catch {
      // keep stale entries on failure
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDemoCommentary();
    timerRef.current = setInterval(fetchDemoCommentary, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Panel
      title="DEGEN AGENT"
      subtitle="// live commentary"
      right={
        <span className="flex items-center gap-1.5">
          <span className="live-dot" aria-hidden />
          <span
            className="font-mono text-[11px] uppercase tracking-[0.08em]"
            style={{ color: "var(--live)" }}
          >
            STREAMING
          </span>
        </span>
      }
    >
      <ol className="max-h-[420px] overflow-y-auto pr-1">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : entries.length === 0 ? (
          <li
            className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.1em]"
            style={{ color: "var(--text-secondary)" }}
          >
            No commentary available
          </li>
        ) : (
          entries.map((e, i) => (
            <li
              key={i}
              className="grid grid-cols-[44px_1fr] gap-3 py-2.5"
              style={{
                borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Timestamp + match label */}
              <div className="flex flex-col gap-0.5 pt-px">
                <span
                  className="font-mono text-[12px] font-semibold tabular-nums leading-none"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {e.timestamp}
                </span>
                {e.match && (
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.06em] leading-tight"
                    style={{ color: "var(--text-secondary)", opacity: 0.65 }}
                  >
                    {shortenMatch(e.match)}
                  </span>
                )}
              </div>

              {/* Commentary text */}
              <span
                className="text-[12.5px] leading-relaxed"
                style={{ color: "var(--text-primary)", opacity: 0.92 }}
              >
                {e.commentary}
              </span>
            </li>
          ))
        )}
      </ol>
    </Panel>
  );
}
