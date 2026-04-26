import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  getMatches,
  getMatchStory,
  getPlayers,
  type MatchSummary,
  type MatchStory,
  type PlayerSummary,
} from "@/services/api";

export const Route = createFileRoute("/story")({
  component: StoryPage,
  head: () => ({ meta: [{ title: "MaidanIQ — Story" }] }),
});

/* ─── City name mapping (reused from squads) ────────────────────────────── */

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
};

function city(name: string) {
  return TEAM_CITY[name] ?? name;
}

/* ─── Season list from data ─────────────────────────────────────────────── */

const ALL_SEASONS = [
  "2026","2025","2024","2023","2022","2021","2020/21",
  "2019","2018","2017","2016","2015","2014","2013",
  "2012","2011","2009/10","2009","2007/08",
];

/* ─── Match list row ────────────────────────────────────────────────────── */

function MatchRow({
  match,
  onClick,
  selected,
}: {
  match: MatchSummary;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-none px-4 py-3 text-left transition-colors"
      style={{
        background: selected ? "rgba(255,107,0,0.06)" : "transparent",
        borderBottom: "1px solid var(--border)",
        borderLeft: `2px solid ${selected ? "var(--accent-primary)" : "transparent"}`,
        outline: "none",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              {city(match.team1)}
            </span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">vs</span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              {city(match.team2)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-[var(--text-muted)]">{match.venue}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--accent-primary)" }}
          >
            {city(match.winner)} WON
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">{match.date}</div>
        </div>
      </div>
    </button>
  );
}

/* ─── Over table ────────────────────────────────────────────────────────── */

function OverTable({ innings }: { innings: MatchStory["innings_timeline"]["1"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["OVER", "RUNS", "WKT", "SCORE"].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)] first:text-left"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {innings.map((row) => (
            <tr
              key={row.over_number}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02]"
            >
              <td className="px-3 py-2 text-left text-[var(--text-muted)]">
                {row.over_number + 1}
              </td>
              <td className="px-3 py-2 text-right font-bold text-[var(--text-primary)]">
                {row.runs_that_over}
              </td>
              <td className="px-3 py-2 text-right">
                {row.wickets_that_over > 0 ? (
                  <span style={{ color: "var(--accent-primary)" }}>{row.wickets_that_over}</span>
                ) : (
                  <span className="text-[var(--text-muted)]">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-bold text-[var(--text-primary)]">
                {row.cumulative_score}/{row.cumulative_wickets}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Partnerships table ────────────────────────────────────────────────── */

function PartnershipTable({
  partnerships,
  nameOf,
}: {
  partnerships: MatchStory["partnerships"];
  nameOf: (id: string) => string;
}) {
  if (!partnerships.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["PARTNERSHIP", "RUNS", "BALLS"].map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)] first:text-left text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {partnerships.map((p, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02]"
            >
              <td className="px-3 py-2 text-left text-[var(--text-primary)]">
                {nameOf(p.batter1)} &amp; {nameOf(p.batter2)}
              </td>
              <td className="px-3 py-2 text-right font-bold text-[var(--text-primary)]">
                {p.runs}
              </td>
              <td className="px-3 py-2 text-right text-[var(--text-muted)]">
                {p.balls}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Wickets table ─────────────────────────────────────────────────────── */

function WicketsTable({
  wickets,
  nameOf,
}: {
  wickets: MatchStory["wickets"];
  nameOf: (id: string) => string;
}) {
  if (!wickets.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["PLAYER", "HOW", "OVER", "SCORE"].map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)] first:text-left text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wickets.map((w, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02]"
            >
              <td className="px-3 py-2 text-left text-[var(--text-primary)]">
                {nameOf(w.wicket_player_out)}
              </td>
              <td className="px-3 py-2 text-right capitalize text-[var(--text-muted)]">
                {w.wicket_kind}
              </td>
              <td className="px-3 py-2 text-right text-[var(--text-muted)]">
                {w.over_number + 1}.{w.ball_number}
              </td>
              <td className="px-3 py-2 text-right font-bold text-[var(--text-primary)]">
                {w.score_at_fall}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Story section wrapper ─────────────────────────────────────────────── */

function StorySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-none bg-[var(--surface)]"
      style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--accent-primary)" }}
    >
      <div
        className="px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ─── Match story detail ────────────────────────────────────────────────── */

function MatchStoryView({
  matchId,
  match,
  onClose,
}: {
  matchId: string;
  match: MatchSummary;
  onClose: () => void;
}) {
  const [story, setStory] = useState<MatchStory | null>(null);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState(false);
  const [innings, setInnings] = useState<"1" | "2">("1");

  useEffect(() => {
    setStory(null);
    setError(false);
    Promise.all([getMatchStory(matchId), getPlayers()])
      .then(([s, players]) => {
        setStory(s);
        setNameLookup(new Map(players.map((p) => [p.registry_id, p.name])));
      })
      .catch(() => setError(true));
  }, [matchId]);

  const nameOf = (id: string) => nameLookup.get(id) ?? id.slice(0, 8);

  const timeline = story?.innings_timeline[innings] ?? [];
  const partnerships = story?.partnerships.filter((p) => p.innings_number === Number(innings)) ?? [];
  const wickets = story?.wickets.filter((w) => w.innings_number === Number(innings)) ?? [];

  const availableInnings = story
    ? Object.keys(story.innings_timeline).sort() as ("1" | "2")[]
    : [];

  return (
    <div
      className="rounded-none bg-[var(--surface)]"
      style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--accent-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-wrap gap-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <span
            className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--accent-primary)" }}
          >
            {city(match.team1)} vs {city(match.team2)}
          </span>
          <div className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
            {match.date} · {match.venue}
          </div>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          CLOSE ×
        </button>
      </div>

      {error && (
        <div className="px-4 py-6 font-mono text-[11px] text-[var(--text-muted)]">
          DATA UNAVAILABLE
        </div>
      )}

      {!story && !error && (
        <div className="space-y-2 p-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 animate-pulse rounded-none bg-white/5" />
          ))}
        </div>
      )}

      {story && (
        <div className="p-4 space-y-4">
          {/* Innings selector */}
          {availableInnings.length > 1 && (
            <div className="flex gap-2">
              {availableInnings.map((n) => (
                <button
                  key={n}
                  onClick={() => setInnings(n)}
                  className="px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                  style={{
                    background: innings === n ? "var(--surface)" : "transparent",
                    color: innings === n ? "var(--accent-primary)" : "var(--text-muted)",
                    border: "1px solid",
                    borderColor: innings === n ? "var(--accent-primary)" : "var(--border)",
                    borderBottom: innings === n ? "2px solid var(--accent-primary)" : "1px solid var(--border)",
                  }}
                >
                  {n === "1" ? "1ST INNINGS" : "2ND INNINGS"}
                </button>
              ))}
            </div>
          )}

          {/* Over-by-over */}
          <StorySection title={`OVER-BY-OVER · ${innings === "1" ? "1ST" : "2ND"} INNINGS`}>
            <OverTable innings={timeline} />
          </StorySection>

          {/* Partnerships */}
          {partnerships.length > 0 && (
            <StorySection title="PARTNERSHIPS">
              <PartnershipTable partnerships={partnerships} nameOf={nameOf} />
            </StorySection>
          )}

          {/* Wickets */}
          {wickets.length > 0 && (
            <StorySection title="WICKETS">
              <WicketsTable wickets={wickets} nameOf={nameOf} />
            </StorySection>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function StoryPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState("2024");
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelectedMatch(null);
    getMatches(season)
      .then((m) => {
        setMatches(m);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [season]);

  return (
    <ProtectedRoute>
    <AppLayout pageName="STORY">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-20 lg:pb-6">

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent-primary)" }}
            >
              STORY
            </h1>
            <p className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
              {loading ? "loading…" : `${matches.length} matches · ${season}`}
            </p>
          </div>

          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="rounded-none bg-[var(--surface)] px-3 py-1.5 font-mono text-[11px] text-[var(--text-primary)] focus:outline-none"
            style={{ border: "1px solid var(--border)" }}
          >
            {ALL_SEASONS.map((s) => (
              <option key={s} value={s} style={{ background: "var(--surface)" }}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/*
          ── Layout ──────────────────────────────────────────────────────────
          Mobile  : single column — list on top, story detail below
          Desktop : 35 / 65 split, both panels fill the viewport height so
                    the list scrolls independently from the story panel
        */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

          {/* ── Match list (35%) ─────────────────────────────────────────── */}
          <div
            className="w-full rounded-none bg-[var(--surface)] lg:w-[35%] lg:shrink-0"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--accent-primary)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                MATCHES · {season}
              </span>
              {selectedMatch && (
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: "var(--accent-primary)" }}
                >
                  1 SELECTED
                </span>
              )}
            </div>

            {/* Scrollable list — caps at 75vh so the panel doesn't blow past the screen */}
            <div className="max-h-[75vh] overflow-y-auto lg:max-h-[calc(100vh-10rem)]">
              {loading ? (
                <div className="space-y-px">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    />
                  ))}
                </div>
              ) : matches.length === 0 ? (
                <div className="px-4 py-8 text-center font-mono text-[11px] text-[var(--text-muted)]">
                  NO MATCHES FOUND
                </div>
              ) : (
                matches.map((m) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    selected={selectedMatch?.id === m.id}
                    onClick={() =>
                      setSelectedMatch(selectedMatch?.id === m.id ? null : m)
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Story detail (65%) ───────────────────────────────────────── */}
          <div className="w-full lg:flex-1">
            {selectedMatch ? (
              <MatchStoryView
                matchId={selectedMatch.id}
                match={selectedMatch}
                onClose={() => setSelectedMatch(null)}
              />
            ) : (
              <div
                className="flex min-h-[200px] items-center justify-center rounded-none lg:min-h-[400px]"
                style={{ border: "1px solid var(--border)" }}
              >
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  SELECT A MATCH TO VIEW STORY
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
