import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  getLiveCurrentMatch,
  getMatches,
  getPointsTable,
  getTeamPersonalities,
  getMOTM,
  getAnalyticsOverview,
  type LiveMatchResponse,
  type MatchSummary,
  type PointsTableEntry,
  type TeamPersonality,
  type MOTMEntry,
  type AnalyticsOverview,
} from "@/services/api";

export const Route = createFileRoute("/matches")({
  component: MatchesPage,
  head: () => ({ meta: [{ title: "MaidanIQ — Matches" }] }),
});

/* ─── City name mapping ─────────────────────────────────────────────────── */

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

function city(name: string) {
  return CITY[name] ?? name;
}

const TEAM_ACCENT: Record<string, string> = {
  "Chennai Super Kings": "#F9CD05",
  "Mumbai Indians": "#004BA0",
  "Royal Challengers Bengaluru": "#E03131",
  "Royal Challengers Bangalore": "#E03131",
  "Kolkata Knight Riders": "#3A225D",
  "Sunrisers Hyderabad": "#F7A721",
  "Delhi Capitals": "#004C93",
  "Lucknow Super Giants": "#0057E7",
  "Gujarat Titans": "#D1AB3E",
  "Punjab Kings": "#D71920",
  "Rajasthan Royals": "#EA1A85",
};

function accent(name: string) {
  return TEAM_ACCENT[name] ?? "var(--accent-primary)";
}

/* ─── Section header ────────────────────────────────────────────────────── */

function SectionHeader({
  title,
  subtitle,
  live,
}: {
  title: string;
  subtitle?: string;
  live?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          {live && <span className="live-dot" aria-hidden />}
          <h2
            className="font-mono text-[13px] font-bold uppercase tracking-[0.12em]"
            style={{ color: live ? "var(--live)" : "var(--accent-primary)" }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "#6B7280" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Card shell ────────────────────────────────────────────────────────── */

function Card({
  children,
  accentColor,
  className = "",
}: {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-none bg-[#0F1117] ${className}`}
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `2px solid ${accentColor ?? "var(--accent-primary)"}`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section 1: Live Now ───────────────────────────────────────────────── */

function LiveNowSection() {
  const [match, setMatch] = useState<LiveMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveCurrentMatch()
      .then(setMatch)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isLive = match && !match.note;

  return (
    <section className="mb-8">
      <SectionHeader title="LIVE NOW" live={isLive ?? false} />

      {loading && (
        <div
          className="h-28 animate-pulse rounded-none"
          style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }}
        />
      )}

      {!loading && !match && (
        <Card>
          <div className="px-5 py-6 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>
            NO LIVE MATCH RIGHT NOW
          </div>
        </Card>
      )}

      {!loading && match && (
        <Card accentColor={isLive ? "var(--live)" : "var(--accent-primary)"}>
          <div className="px-5 py-5">
            {/* Badge */}
            <div className="mb-3 flex items-center gap-2">
              {isLive ? (
                <>
                  <span className="live-dot" aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--live)" }}>
                    LIVE NOW
                  </span>
                </>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
                  MOST RECENT · {match.date}
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-black" style={{ color: accent(match.team1) }}>
                {city(match.team1)}
              </span>
              <span className="font-mono text-[11px]" style={{ color: "#6B7280" }}>vs</span>
              <span className="font-mono text-2xl font-black" style={{ color: accent(match.team2) }}>
                {city(match.team2)}
              </span>
            </div>

            {/* Venue */}
            <div className="mt-1.5 font-mono text-[11px]" style={{ color: "#6B7280" }}>
              {match.venue}
            </div>

            {/* Winner if completed */}
            {match.winner && !isLive && (
              <div className="mt-2 font-mono text-[11px]" style={{ color: accent(match.winner) }}>
                {city(match.winner)} WON
              </div>
            )}

            {/* CTAs */}
            <div className="mt-4 flex gap-3">
              {isLive && (
                <Link
                  to="/live"
                  className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
                  style={{ background: "var(--live)" }}
                >
                  WATCH LIVE →
                </Link>
              )}
              {match.id && (
                <Link
                  to="/match/$matchId"
                  params={{ matchId: match.id }}
                  className="inline-flex items-center px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition-opacity hover:opacity-80"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "#9CA3AF",
                  }}
                >
                  DEEP DIVE →
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

/* ─── Section 2: Recent Results ─────────────────────────────────────────── */

function RecentResultsSection({ matches }: { matches: MatchSummary[] }) {
  const recent = matches.slice(0, 5);

  return (
    <section className="mb-8">
      <SectionHeader title="RECENT RESULTS" subtitle="IPL 2026" />

      <div className="space-y-2">
        {recent.map((m) => (
          <Link
            key={m.id}
            to="/match/$matchId"
            params={{ matchId: m.id }}
            className="block transition-opacity hover:opacity-80"
          >
            <Card>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[13px] font-bold" style={{ color: "#F0F0F0" }}>
                      {city(m.team1)}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>vs</span>
                    <span className="font-mono text-[13px] font-bold" style={{ color: "#F0F0F0" }}>
                      {city(m.team2)}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px]" style={{ color: "#6B7280" }}>
                    {m.venue} · {m.date}
                  </div>
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <div
                    className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: accent(m.winner) }}
                  >
                    {city(m.winner)} WON
                  </div>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#6B7280" }}>
                    DEEP DIVE →
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Section 3: All 2026 Matches ───────────────────────────────────────── */

function AllMatchesSection({ matches }: { matches: MatchSummary[] }) {
  return (
    <section className="mb-8">
      <SectionHeader title="IPL 2026" subtitle="ALL MATCHES" />

      <Card>
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>TEAMS</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>VENUE</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-right" style={{ color: "#6B7280" }}>RESULT</span>
        </div>

        <div className="max-h-[480px] overflow-y-auto">
          {matches.map((m, i) => (
            <Link
              key={m.id}
              to="/match/$matchId"
              params={{ matchId: m.id }}
              className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
              style={{ borderBottom: i < matches.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "grid" }}
            >
              <div>
                <span className="font-mono text-[12px]" style={{ color: "#F0F0F0" }}>
                  {city(m.team1)} <span style={{ color: "#6B7280" }}>vs</span> {city(m.team2)}
                </span>
                <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{m.date}</div>
              </div>
              <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                {m.city}
              </div>
              <div
                className="text-right font-mono text-[11px] font-semibold whitespace-nowrap"
                style={{ color: accent(m.winner) }}
              >
                {city(m.winner)}
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </section>
  );
}

/* ─── Section 4: Points Table ───────────────────────────────────────────── */

function nrrColor(nrr: number): string {
  if (nrr > 0.1) return "#4CAF50";
  if (nrr < -0.1) return "#EF5350";
  return "#F0F0F0";
}

function FormPill({ result }: { result: string }) {
  const isWin = result === "W";
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center font-mono text-[9px] font-bold"
      style={{
        background: isWin ? "var(--accent-primary)" : "#1E1E2E",
        color: isWin ? "#000" : "#6B7280",
      }}
    >
      {result}
    </span>
  );
}

function PointsTableSection() {
  const [table, setTable] = useState<PointsTableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    getPointsTable()
      .then((res) => {
        setTable(res.table);
        setUpdatedAt(res.updated_at.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-8">
      <SectionHeader title="IPL 2026" subtitle="STANDINGS" />

      <Card>
        {/* Header row */}
        <div
          className="grid gap-2 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em]"
          style={{
            gridTemplateColumns: "28px 1fr 32px 28px 28px 36px 72px 64px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#6B7280",
          }}
        >
          <span>#</span>
          <span>TEAM</span>
          <span className="text-right">M</span>
          <span className="text-right">W</span>
          <span className="text-right">L</span>
          <span className="text-right">PTS</span>
          <span className="text-right">NRR</span>
          <span className="text-right">FORM</span>
        </div>

        {loading ? (
          <div className="space-y-px">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
            ))}
          </div>
        ) : (
          table.map((row) => {
            const isPlayoff = row.position <= 4;
            return (
              <div
                key={row.team}
                className="grid items-center gap-2 px-3 py-2.5 hover:bg-white/[0.02]"
                style={{
                  gridTemplateColumns: "28px 1fr 32px 28px 28px 36px 72px 64px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  borderLeft: isPlayoff ? "2px solid var(--accent-primary)" : "2px solid transparent",
                }}
              >
                <span className="font-mono text-[11px]" style={{ color: "#6B7280" }}>
                  {row.position}
                </span>
                <span className="font-mono text-[12px] font-bold truncate" style={{ color: accent(row.full_name) }}>
                  {row.team}
                </span>
                <span className="text-right font-mono text-[12px]" style={{ color: "#9CA3AF" }}>{row.matches_played}</span>
                <span className="text-right font-mono text-[12px]" style={{ color: "#9CA3AF" }}>{row.wins}</span>
                <span className="text-right font-mono text-[12px]" style={{ color: "#9CA3AF" }}>{row.losses}</span>
                <span className="text-right font-mono text-[13px] font-black" style={{ color: "#F0F0F0" }}>{row.points}</span>
                <span className="text-right font-mono text-[11px] font-bold tabular-nums" style={{ color: nrrColor(row.nrr) }}>
                  {row.nrr >= 0 ? "+" : ""}{row.nrr.toFixed(3)}
                </span>
                <div className="flex justify-end gap-0.5">
                  {row.form.slice(-5).map((r, i) => (
                    <FormPill key={i} result={r} />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {!loading && updatedAt && (
          <div className="px-3 py-2 font-mono text-[9px]" style={{ color: "#6B7280", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            Updated from match results · {updatedAt}
          </div>
        )}
      </Card>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

/* ─── Section 5: Analytics Overview (Season Pulse) ─────────────────────── */

function SeasonPulseSection() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    getAnalyticsOverview().then(setData).catch(() => {});
  }, []);

  const s = data?.season_2026;
  const ff = data?.fun_facts;

  const stats = s
    ? [
        { label: "MATCHES", value: s.total_matches.toLocaleString() },
        { label: "RUNS", value: s.total_runs.toLocaleString() },
        { label: "WICKETS", value: s.total_wickets.toLocaleString() },
        { label: "SIXES", value: s.total_sixes.toLocaleString() },
        { label: "HIGHEST SCORE", value: String(s.highest_team_score.score) },
        { label: "FOURS", value: s.total_fours.toLocaleString() },
      ]
    : [];

  return (
    <section className="mb-6">
      <SectionHeader title="IPL 2026" subtitle="// SEASON PULSE" />

      {/* Stats bar */}
      <div
        className="mb-3 overflow-x-auto rounded-none"
        style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}
      >
        <div className="flex min-w-max gap-0">
          {!data
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center px-6 py-4" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="h-7 w-16 animate-pulse rounded-none bg-white/10 mb-2" />
                  <div className="h-3 w-14 animate-pulse rounded-none bg-white/5" />
                </div>
              ))
            : stats.map((st, i) => (
                <div key={st.label} className="flex flex-col items-center px-6 py-4" style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div className="font-mono text-[22px] font-black tabular-nums" style={{ color: "var(--accent-primary)" }}>
                    {st.value}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
                    {st.label}
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Fun fact cards */}
      {ff && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-none p-4" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}>
            <div className="label-mono mb-2" style={{ color: "var(--accent-primary)", fontSize: 9, letterSpacing: "0.14em" }}>CLOSEST FINISH</div>
            <div className="font-mono text-[13px] font-bold" style={{ color: "#F0F0F0" }}>
              {ff.closest_match.winner} won by {ff.closest_match.margin} run
            </div>
            <div className="mt-0.5 font-mono text-[10px]" style={{ color: "#6B7280" }}>{ff.closest_match.match}</div>
          </div>
          <div className="rounded-none p-4" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}>
            <div className="label-mono mb-2" style={{ color: "var(--accent-primary)", fontSize: 9, letterSpacing: "0.14em" }}>BIGGEST WIN</div>
            <div className="font-mono text-[13px] font-bold" style={{ color: "#F0F0F0" }}>
              {ff.biggest_win.winner} won by {ff.biggest_win.margin} runs
            </div>
            <div className="mt-0.5 font-mono text-[10px]" style={{ color: "#6B7280" }}>{ff.biggest_win.match}</div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Section 6: Team Personalities ─────────────────────────────────────── */

const PERSONALITY_STYLE: Record<string, { bg: string; text: string }> = {
  Dominant:         { bg: "var(--accent-primary)", text: "#000" },
  "Chase Masters":  { bg: "#2196F3",               text: "#fff" },
  "Powerplay Kings":{ bg: "#4CAF50",               text: "#fff" },
  Clinical:         { bg: "#607D8B",               text: "#fff" },
  Scrappy:          { bg: "#455A64",               text: "#fff" },
};

function personalityStyle(p: string) {
  return PERSONALITY_STYLE[p] ?? { bg: "#374151", text: "#9CA3AF" };
}

function preferredMethodLabel(m: TeamPersonality["preferred_method"]): string {
  if (m === "batting_first") return "Prefers batting first";
  if (m === "chasing")       return "Prefers chasing";
  return "Balanced approach";
}

function TeamPersonalitiesSection() {
  const [teams, setTeams] = useState<TeamPersonality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamPersonalities()
      .then((r) => setTeams(r.teams))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-6">
      <SectionHeader title="TEAM PERSONALITIES" subtitle="// how each team wins" />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-none" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {teams.map((t) => {
            const ps = personalityStyle(t.personality);
            return (
              <div
                key={t.team}
                className="rounded-none p-4"
                style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `2px solid ${accent(t.full_name)}` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono text-[15px] font-black" style={{ color: accent(t.full_name) }}>
                      {t.team}
                    </div>
                    <span
                      className="mt-1 inline-block font-mono text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5"
                      style={{ background: ps.bg, color: ps.text }}
                    >
                      {t.personality}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[22px] font-black" style={{ color: "var(--accent-primary)" }}>
                      {t.win_pct.toFixed(0)}%
                    </div>
                    <div className="font-mono text-[9px]" style={{ color: "#6B7280" }}>WIN RATE</div>
                  </div>
                </div>
                <div className="flex gap-4 font-mono text-[11px] mb-2">
                  <span style={{ color: "#9CA3AF" }}>BAT FIRST <span style={{ color: "#F0F0F0", fontWeight: 700 }}>{t.wins_batting_first}W</span></span>
                  <span style={{ color: "#9CA3AF" }}>CHASE <span style={{ color: "#F0F0F0", fontWeight: 700 }}>{t.wins_chasing}W</span></span>
                </div>
                <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                  → {preferredMethodLabel(t.preferred_method)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ─── Section 7: MOTM Leaderboard ───────────────────────────────────────── */

function MOTMRow({ entry, rank }: { entry: MOTMEntry; rank: number }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span className="w-6 font-mono text-[16px] font-black shrink-0 tabular-nums" style={{ color: "rgba(255,255,255,0.15)" }}>
        {rank}
      </span>
      <Link
        to="/player/$playerName"
        params={{ playerName: encodeURIComponent(entry.player) }}
        className="flex-1 font-mono text-[13px] font-bold transition-opacity hover:opacity-70"
        style={{ color: "#F0F0F0" }}
      >
        {entry.player}
      </Link>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-mono text-[18px] font-black tabular-nums" style={{ color: "var(--accent-primary)" }}>
          {entry.motm_count}
        </span>
        <span style={{ fontSize: 14 }}>🏆</span>
      </div>
    </div>
  );
}

function MOTMLeaderboardSection() {
  const [data, setData] = useState<{ current: MOTMEntry[]; allTime: MOTMEntry[] } | null>(null);
  const [allTimeOpen, setAllTimeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMOTM()
      .then((r) => setData({ current: r.current_season.slice(0, 10), allTime: r.all_time.slice(0, 20) }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-6">
      <SectionHeader title="MATCH WINNERS" subtitle="// IPL 2026 player of the match" />

      <div className="rounded-none" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}>
        <div className="px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#6B7280" }}>
          2026 SEASON
        </div>

        {loading ? (
          <div className="space-y-px p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-none bg-white/[0.02]" />
            ))}
          </div>
        ) : !data?.current.length ? (
          <div className="px-4 py-6 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DATA YET</div>
        ) : (
          data.current.map((e, i) => <MOTMRow key={e.player} entry={e} rank={i + 1} />)
        )}

        {/* All-time accordion */}
        {data && data.allTime.length > 0 && (
          <>
            <button
              onClick={() => setAllTimeOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
                ALL TIME LEADERS
              </span>
              <span className="font-mono text-[12px]" style={{ color: "#6B7280" }}>
                {allTimeOpen ? "▲" : "▼"}
              </span>
            </button>
            {allTimeOpen && data.allTime.map((e, i) => <MOTMRow key={e.player} entry={e} rank={i + 1} />)}
          </>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function MatchesPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches("2026")
      .then(setMatches)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <AppLayout pageName="MATCHES">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-20 lg:pb-6">

          {/* Season Pulse — full width at top */}
          <SeasonPulseSection />

          {/* 2-column: left (live + recent) right (standings) */}
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
            <div>
              <LiveNowSection />
              {!loading && matches.length > 0 && (
                <RecentResultsSection matches={matches} />
              )}
              {loading && (
                <section className="mb-8">
                  <SectionHeader title="RECENT RESULTS" subtitle="IPL 2026" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 animate-pulse rounded-none"
                        style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }} />
                    ))}
                  </div>
                </section>
              )}
            </div>
            <div>
              <PointsTableSection />
            </div>
          </div>

          {/* Full-width: Team Personalities + MOTM */}
          <TeamPersonalitiesSection />
          <MOTMLeaderboardSection />

          {/* Full-width: all matches */}
          {!loading && matches.length > 0 && (
            <AllMatchesSection matches={matches} />
          )}

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
