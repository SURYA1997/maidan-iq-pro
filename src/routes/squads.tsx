import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { MetricTooltip } from "@/components/pitchiq/InfoTip";
import {
  getTeams,
  getTeamStrength,
  getPlayers,
  getPlayer,
  type TeamSummary,
  type TeamStrength,
  type PlayerSummary,
  type PlayerDetail,
} from "@/services/api";

export const Route = createFileRoute("/squads")({
  component: SquadsPage,
  head: () => ({ meta: [{ title: "MaidanIQ — Squads" }] }),
});

/* ─── City name mapping ─────────────────────────────────────────────────── */

const TEAM_CITY: Record<string, string> = {
  "Chennai Super Kings": "Chennai",
  "Mumbai Indians": "Mumbai",
  "Royal Challengers Bengaluru": "Bengaluru",
  "Royal Challengers Bangalore": "Bengaluru",
  "Kolkata Knight Riders": "Kolkata",
  "Sunrisers Hyderabad": "Hyderabad",
  "Delhi Capitals": "Delhi",
  "Delhi Daredevils": "Delhi",
  "Lucknow Super Giants": "Lucknow",
  "Gujarat Titans": "Ahmedabad",
  "Punjab Kings": "Punjab",
  "Kings XI Punjab": "Punjab",
  "Rajasthan Royals": "Rajasthan",
  "Rising Pune Supergiant": "Pune",
  "Rising Pune Supergiants": "Pune",
  "Kochi Tuskers Kerala": "Kochi",
  "Deccan Chargers": "Hyderabad",
};

function cityName(teamName: string) {
  return TEAM_CITY[teamName] ?? teamName;
}

/* ─── Team color theme key ──────────────────────────────────────────────── */

const TEAM_ACCENT: Record<string, string> = {
  "Chennai Super Kings": "#F9CD05",
  "Mumbai Indians": "#004BA0",
  "Royal Challengers Bengaluru": "#E03131",
  "Royal Challengers Bangalore": "#E03131",
  "Kolkata Knight Riders": "#3A225D",
  "Sunrisers Hyderabad": "#F7A721",
  "Delhi Capitals": "#004C93",
  "Delhi Daredevils": "#004C93",
  "Lucknow Super Giants": "#0057E7",
  "Gujarat Titans": "#D1AB3E",
  "Punjab Kings": "#D71920",
  "Kings XI Punjab": "#D71920",
  "Rajasthan Royals": "#EA1A85",
};

function teamAccent(teamName: string) {
  return TEAM_ACCENT[teamName] ?? "var(--accent-primary)";
}

/* ─── Team card ─────────────────────────────────────────────────────────── */

function TeamCard({
  team,
  selected,
  onClick,
}: {
  team: TeamSummary;
  selected: boolean;
  onClick: () => void;
}) {
  const accent = teamAccent(team.team_name);
  return (
    <button
      onClick={onClick}
      className="w-full rounded-none p-4 text-left transition-colors"
      style={{
        background: selected ? `${accent}10` : "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `2px solid ${accent}`,
        outline: "none",
      }}
    >
      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: accent }}>
        {cityName(team.team_name)}
      </div>
      <div className="mt-0.5 font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {team.team_name}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <div className="label-mono">WIN %</div>
          <div className="font-mono text-xl font-black text-[var(--text-primary)]">
            {team.win_pct.toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="label-mono">MATCHES</div>
          <div className="font-mono text-xl font-black text-[var(--text-primary)]">
            {team.total_matches}
          </div>
        </div>
        <div>
          <div className="label-mono">SEASONS</div>
          <div className="font-mono text-xl font-black text-[var(--text-primary)]">
            {team.seasons_played}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Team strength panel ───────────────────────────────────────────────── */

function TeamStrengthPanel({
  teamName,
  onClose,
}: {
  teamName: string;
  onClose: () => void;
}) {
  const [strength, setStrength] = useState<TeamStrength | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setStrength(null);
    setError(false);
    getTeamStrength(teamName)
      .then(setStrength)
      .catch(() => setError(true));
  }, [teamName]);

  const accent = teamAccent(teamName);

  return (
    <div
      className="rounded-none bg-[var(--surface)]"
      style={{ border: "1px solid var(--border)", borderLeft: `2px solid ${accent}` }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
          {cityName(teamName)} · STRENGTH ANALYSIS
        </span>
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          CLOSE ×
        </button>
      </div>
      <div className="p-4">
        {error && <p className="font-mono text-[11px] text-[var(--text-muted)]">DATA UNAVAILABLE</p>}
        {!strength && !error && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 animate-pulse rounded-none bg-white/5" />
            ))}
          </div>
        )}
        {strength && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StrengthStat label="CHASE WIN %" value={`${strength.chase_win_pct.toFixed(1)}%`}
              tip="Win rate when batting second across all IPL seasons." />
            <StrengthStat label="DEFEND WIN %" value={`${strength.defend_win_pct.toFixed(1)}%`}
              tip="Win rate when batting first and defending a total." />
            <StrengthStat label="AVG 1ST INNINGS" value={String(Math.round(strength.avg_first_innings_score))}
              tip="Average total scored when batting first." />
            <StrengthStat label="AVG POWERPLAY" value={String(Math.round(strength.avg_powerplay_runs_batting))}
              tip="Average runs scored in overs 1–6 when batting." />
            <StrengthStat label="DEATH ECONOMY" value={strength.avg_death_economy_bowling.toFixed(2)}
              tip="Bowling economy rate in overs 17–20. Lower is better." />
            <StrengthStat label="OVERALL WIN %" value={`${strength.overall_win_pct.toFixed(1)}%`}
              tip="Overall win percentage across all IPL matches." />
          </div>
        )}
      </div>
    </div>
  );
}

function StrengthStat({ label, value, tip }: { label: string; value: string; tip: string }) {
  return (
    <div className="p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
      <div className="mb-1 flex items-center gap-1">
        <span className="label-mono">{label}</span>
        <MetricTooltip text={tip} />
      </div>
      <div className="font-mono text-xl font-black text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

/* ─── Player search ─────────────────────────────────────────────────────── */

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function PlayerSearch({
  onSelect,
}: {
  onSelect: (p: PlayerSummary) => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    getPlayers(debouncedQuery)
      .then((r) => {
        setResults(r.slice(0, 15));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search player name…"
        className="w-full rounded-none bg-[var(--surface)] px-3 py-2.5 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
        style={{ border: "1px solid var(--border)" }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent-primary)")
        }
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
      {(results.length > 0 || loading) && query && (
        <div
          className="absolute z-20 mt-1 w-full max-h-[280px] overflow-y-auto rounded-none bg-[var(--surface)]"
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
                setQuery(p.name);
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

/* ─── Player detail panel ───────────────────────────────────────────────── */

function PlayerDetailPanel({
  player,
  onClose,
}: {
  player: PlayerSummary;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<PlayerDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setDetail(null);
    setError(false);
    getPlayer(player.registry_id)
      .then(setDetail)
      .catch(() => setError(true));
  }, [player.registry_id]);

  const b = detail?.batting;
  const w = detail?.bowling;
  const hasBowling = w && w.total_balls_bowled > 0;

  return (
    <div
      className="rounded-none bg-[var(--surface)]"
      style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--accent-primary)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--accent-primary)" }}
        >
          {player.name}
        </span>
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          CLOSE ×
        </button>
      </div>

      <div className="p-4">
        {error && (
          <p className="font-mono text-[11px] text-[var(--text-muted)]">DATA UNAVAILABLE</p>
        )}
        {!detail && !error && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 animate-pulse rounded-none bg-white/5" />
            ))}
          </div>
        )}
        {detail && b && (
          <>
            {/* Batting */}
            <div className="mb-2 label-mono" style={{ color: "var(--accent-primary)" }}>BATTING</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
              <PlayerStat label="RUNS" value={String(b.total_runs)}
                tip="Total T20 runs in the dataset." />
              <PlayerStat label="BALLS" value={String(b.total_balls)}
                tip="Total balls faced." />
              <PlayerStat label="STRIKE RATE" value={b.strike_rate.toFixed(1)}
                tip="Overall T20 strike rate: runs per 100 balls." />
              <PlayerStat label="AVG" value={b.avg_runs_per_innings.toFixed(1)}
                tip="Average runs per innings." />
              <PlayerStat label="BOUNDARY %" value={`${b.boundary_pct.toFixed(1)}%`}
                tip="Percentage of balls hit for 4 or 6." />
              <PlayerStat label="POWERPLAY SR" value={b.powerplay_sr.toFixed(1)}
                tip="Strike rate in overs 1–6." />
              <PlayerStat label="MIDDLE SR" value={b.pressure_sr.toFixed(1)}
                tip="Strike rate in overs 7–15 (middle phase)." />
              <PlayerStat label="DEATH SR" value={b.death_sr.toFixed(1)}
                tip="Strike rate in overs 16–20." />
            </div>

            {/* Bowling — only if they bowl */}
            {hasBowling && (
              <>
                <div className="mb-2 label-mono" style={{ color: "var(--accent-primary)" }}>BOWLING</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <PlayerStat label="WICKETS" value={String(w.total_wickets)}
                    tip="Total wickets taken." />
                  <PlayerStat label="ECONOMY" value={w.economy?.toFixed(2) ?? "—"}
                    tip="Overall economy rate: runs per over." />
                  <PlayerStat label="POWERPLAY ECON" value={w.powerplay_economy?.toFixed(2) ?? "—"}
                    tip="Economy rate in overs 1–6." />
                  <PlayerStat label="DEATH ECON" value={w.death_economy?.toFixed(2) ?? "—"}
                    tip="Economy rate in overs 16–20." />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlayerStat({ label, value, tip }: { label: string; value: string; tip: string }) {
  return (
    <div className="p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
      <div className="mb-1 flex items-center gap-1">
        <span className="label-mono">{label}</span>
        <MetricTooltip text={tip} />
      </div>
      <div className="font-mono text-xl font-black text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function SquadsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null);

  useEffect(() => {
    getTeams()
      .then((t) => {
        // Only keep IPL-active teams (10+ matches to filter historic defunct teams)
        setTeams(t.filter((t) => t.total_matches >= 30));
        setTeamsLoading(false);
      })
      .catch(() => setTeamsLoading(false));
  }, []);

  return (
    <ProtectedRoute>
    <AppLayout pageName="SQUADS">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-20 lg:pb-6 space-y-8">

        {/* ── Teams ───────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent-primary)" }}
            >
              TEAMS
            </h2>
            <p className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
              all-time IPL win rates
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {teamsLoading
              ? [...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-none bg-[var(--surface)]"
                    style={{ border: "1px solid var(--border)" }}
                  />
                ))
              : teams.map((t) => (
                  <TeamCard
                    key={t.team_name}
                    team={t}
                    selected={selectedTeam === t.team_name}
                    onClick={() =>
                      setSelectedTeam(selectedTeam === t.team_name ? null : t.team_name)
                    }
                  />
                ))}
          </div>

          {selectedTeam && (
            <div className="mt-4">
              <TeamStrengthPanel
                teamName={selectedTeam}
                onClose={() => setSelectedTeam(null)}
              />
            </div>
          )}
        </section>

        {/* ── Players ─────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent-primary)" }}
            >
              PLAYERS
            </h2>
            <p className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
              search 946 players · click for full stats
            </p>
          </div>

          <div className="max-w-md">
            <PlayerSearch
              onSelect={(p) => setSelectedPlayer(p)}
            />
          </div>

          {selectedPlayer && (
            <div className="mt-4">
              <PlayerDetailPanel
                player={selectedPlayer}
                onClose={() => setSelectedPlayer(null)}
              />
            </div>
          )}
        </section>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
