import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { MetricTooltip } from "@/components/pitchiq/InfoTip";
import {
  getPlayers,
  getVenues,
  getMatchup,
  type PlayerSummary,
  type VenueSummary,
  type TeamMatchup,
} from "@/services/api";

export const Route = createFileRoute("/matchup")({
  component: MatchupPage,
  head: () => ({ meta: [{ title: "MaidanIQ — Matchup" }] }),
});

/* ─── Debounce hook ─────────────────────────────────────────────────────── */

function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

/* ─── Phase selector ────────────────────────────────────────────────────── */

const PHASES = [
  { id: "", label: "ALL" },
  { id: "powerplay", label: "POWERPLAY" },
  { id: "middle", label: "MIDDLE" },
  { id: "death", label: "DEATH" },
] as const;

type PhaseId = typeof PHASES[number]["id"];

/* ─── Player search input ───────────────────────────────────────────────── */

function PlayerSearchInput({
  value,
  onSelect,
  onClear,
}: {
  value: PlayerSummary | null;
  onSelect: (p: PlayerSummary) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (value) {
      setQuery(value.name);
      setResults([]);
    }
  }, [value]);

  useEffect(() => {
    if (!debouncedQuery.trim() || (value && debouncedQuery === value.name)) {
      setResults([]);
      return;
    }
    setLoading(true);
    getPlayers(debouncedQuery)
      .then((r) => {
        setResults(r.slice(0, 12));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <label className="label-mono mb-1.5 block">PLAYER</label>
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onClear();
          }}
          placeholder="Search player…"
          className="flex-1 rounded-none bg-[var(--surface)] px-3 py-2.5 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          style={{ border: "1px solid var(--border)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        {value && (
          <button
            onClick={() => {
              onClear();
              setQuery("");
            }}
            className="px-3 font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            style={{ border: "1px solid var(--border)", borderLeft: "none" }}
          >
            ×
          </button>
        )}
      </div>

      {(results.length > 0 || loading) && query && !value && (
        <div
          className="absolute z-20 mt-0.5 w-full max-h-[240px] overflow-y-auto rounded-none bg-[var(--surface)]"
          style={{ border: "1px solid var(--border)" }}
        >
          {loading && (
            <div className="px-3 py-2 font-mono text-[10px] text-[var(--text-muted)]">
              SEARCHING…
            </div>
          )}
          {results.map((p) => (
            <button
              key={p.registry_id}
              onClick={() => {
                onSelect(p);
                setResults([]);
              }}
              className="flex w-full items-center px-3 py-2 text-left hover:bg-white/5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="font-mono text-sm text-[var(--text-primary)]">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Results display ───────────────────────────────────────────────────── */

const RESULT_METRICS: Array<{
  key: keyof TeamMatchup;
  label: string;
  format: (v: number) => string;
  tip: string;
}> = [
  {
    key: "total_balls",
    label: "BALLS FACED",
    format: (v) => String(v),
    tip: "Total balls faced in this batter–context combination.",
  },
  {
    key: "strike_rate",
    label: "STRIKE RATE",
    format: (v) => v.toFixed(1),
    tip: "Runs scored per 100 balls in this specific context.",
  },
  {
    key: "dismissal_pct",
    label: "DISMISSAL %",
    format: (v) => `${v.toFixed(1)}%`,
    tip: "Percentage of balls that resulted in the batter's dismissal.",
  },
  {
    key: "boundary_pct",
    label: "BOUNDARY %",
    format: (v) => `${v.toFixed(1)}%`,
    tip: "Share of balls dispatched for 4 or 6.",
  },
  {
    key: "dot_pct",
    label: "DOT BALL %",
    format: (v) => `${v.toFixed(1)}%`,
    tip: "Percentage of balls where no run was scored — a measure of pressure absorbed.",
  },
];

function ResultCard({ data }: { data: TeamMatchup }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {RESULT_METRICS.map((m) => {
        const raw = data[m.key];
        const value = typeof raw === "number" ? m.format(raw) : "—";
        return (
          <div
            key={m.key}
            className="p-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--accent-primary)",
            }}
          >
            <div className="mb-1 flex items-center gap-1">
              <span className="label-mono">{m.label}</span>
              <MetricTooltip text={m.tip} />
            </div>
            <div className="font-mono text-2xl font-black leading-none text-[var(--text-primary)]">
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function MatchupPage() {
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null);
  const [phase, setPhase] = useState<PhaseId>("");
  const [venue, setVenue] = useState("");
  const [result, setResult] = useState<TeamMatchup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  /* Load venue list once */
  useEffect(() => {
    getVenues().then(setVenues).catch(() => {});
  }, []);

  /* Fetch matchup whenever any param changes */
  useEffect(() => {
    if (!selectedPlayer) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(false);
    getMatchup(selectedPlayer.registry_id, phase || undefined, venue || undefined)
      .then((r) => {
        setResult(r);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [selectedPlayer, phase, venue]);

  return (
    <ProtectedRoute>
    <AppLayout pageName="MATCHUP">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 pb-20 lg:pb-6">

        {/* Heading */}
        <div className="mb-6">
          <h1
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-primary)" }}
          >
            MATCHUP ORACLE
          </h1>
          <p className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
            batter performance in context · 15 years of ball-by-ball data
          </p>
        </div>

        {/* Query controls */}
        <div
          className="rounded-none bg-[var(--surface)] p-4 space-y-4"
          style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--accent-primary)" }}
        >
          {/* Player */}
          <PlayerSearchInput
            value={selectedPlayer}
            onSelect={setSelectedPlayer}
            onClear={() => {
              setSelectedPlayer(null);
              setResult(null);
            }}
          />

          {/* Phase + Venue in a row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Phase */}
            <div>
              <label className="label-mono mb-1.5 block">PHASE</label>
              <div className="flex flex-wrap gap-1">
                {PHASES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPhase(p.id)}
                    className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                    style={{
                      background: phase === p.id ? "var(--accent-primary)" : "transparent",
                      color: phase === p.id ? "#000" : "var(--text-muted)",
                      border: "1px solid",
                      borderColor: phase === p.id ? "var(--accent-primary)" : "var(--border)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="label-mono mb-1.5 block">VENUE</label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full rounded-none bg-[var(--surface)] px-3 py-2.5 font-mono text-[11px] text-[var(--text-primary)] focus:outline-none"
                style={{ border: "1px solid var(--border)" }}
              >
                <option value="" style={{ background: "var(--surface)" }}>
                  ALL VENUES
                </option>
                {venues.map((v) => (
                  <option key={v.name} value={v.name} style={{ background: "var(--surface)" }}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-5">
          {!selectedPlayer && (
            <div
              className="flex min-h-[160px] items-center justify-center rounded-none"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                SELECT A PLAYER TO BEGIN ANALYSIS
              </span>
            </div>
          )}

          {selectedPlayer && loading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-none bg-[var(--surface)]"
                  style={{ border: "1px solid var(--border)" }}
                />
              ))}
            </div>
          )}

          {selectedPlayer && error && (
            <div
              className="flex min-h-[100px] items-center justify-center rounded-none"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="font-mono text-[11px] text-[var(--text-muted)]">DATA UNAVAILABLE</span>
            </div>
          )}

          {result && selectedPlayer && !loading && !error && (
            <>
              {/* Context label */}
              <div className="mb-3 font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.1em]">
                {selectedPlayer.name}
                {phase ? ` · ${phase.toUpperCase()}` : " · ALL PHASES"}
                {venue ? ` · ${venue}` : " · ALL VENUES"}
                {" "}— {result.total_balls} balls
              </div>
              <ResultCard data={result} />
            </>
          )}
        </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
