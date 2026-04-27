import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  getMatchDetail,
  getMatchStory,
  getPlayers,
  type MatchDetail,
  type MatchStory,
  type PlayerSummary,
} from "@/services/api";

export const Route = createFileRoute("/match/$matchId")({
  component: MatchDeepDivePage,
  head: () => ({ meta: [{ title: "MaidanIQ — Match Intelligence" }] }),
});

/* ─── Shared helpers ────────────────────────────────────────────────────── */

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

function city(t: string) { return CITY[t] ?? t; }
function accent(t: string) { return TEAM_ACCENT[t] ?? "#FF6B00"; }

function winResult(m: MatchDetail): string {
  if (m.win_by_wickets) {
    return `${city(m.winner)} won by ${m.win_by_wickets} wicket${m.win_by_wickets === 1 ? "" : "s"}`;
  }
  if (m.win_by_runs) {
    return `${city(m.winner)} won by ${m.win_by_runs} run${m.win_by_runs === 1 ? "" : "s"}`;
  }
  return `${city(m.winner)} won`;
}

/* ─── Section card wrapper ──────────────────────────────────────────────── */

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-none bg-[#0F1117]"
      style={{ border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}
    >
      <div className="flex items-baseline gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>
          {title}
        </span>
        {subtitle && (
          <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */

function Skeleton({ h = "h-32" }: { h?: string }) {
  return (
    <div
      className={`${h} animate-pulse rounded-none`}
      style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }}
    />
  );
}

/* ─── Innings tab ───────────────────────────────────────────────────────── */

function InningsTab({
  active,
  onChange,
}: {
  active: 1 | 2;
  onChange: (n: 1 | 2) => void;
}) {
  return (
    <div className="flex gap-1">
      {([1, 2] as const).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors"
          style={{
            background: active === n ? "var(--surface)" : "transparent",
            color: active === n ? "var(--accent-primary)" : "#6B7280",
            border: "1px solid",
            borderColor: active === n ? "var(--accent-primary)" : "rgba(255,255,255,0.08)",
            borderBottom: active === n ? "2px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {n === 1 ? "1ST INNINGS" : "2ND INNINGS"}
        </button>
      ))}
    </div>
  );
}

/* ─── SECTION 1: Match header ───────────────────────────────────────────── */

function MatchHeader({ match }: { match: MatchDetail }) {
  return (
    <div className="mb-6">
      {/* Back button */}
      <Link
        to="/matches"
        className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-opacity hover:opacity-70"
        style={{ color: "#6B7280" }}
      >
        ← MATCHES
      </Link>

      {/* Team names */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[28px] font-black leading-none" style={{ color: accent(match.team1) }}>
          {city(match.team1)}
        </span>
        <span className="font-mono text-[14px]" style={{ color: "#6B7280" }}>vs</span>
        <span className="font-mono text-[28px] font-black leading-none" style={{ color: accent(match.team2) }}>
          {city(match.team2)}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px]" style={{ color: "#6B7280" }}>
        <span>{match.venue}</span>
        <span>·</span>
        <span>{match.date}</span>
        <span>·</span>
        <span>{match.event_name}</span>
        <span>·</span>
        <span>{match.season}</span>
      </div>

      {/* Result banner */}
      {match.winner && (
        <div
          className="mt-3 inline-flex items-center px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{
            background: `${accent(match.winner)}15`,
            border: `1px solid ${accent(match.winner)}40`,
            color: accent(match.winner),
          }}
        >
          {winResult(match)}
        </div>
      )}

      {/* Innings summaries */}
      {match.innings_summary.length > 0 && (
        <div className="mt-4 flex gap-3">
          {match.innings_summary.map((s) => {
            const battingTeam = s.innings_number === 1 ? match.team1 : match.team2;
            return (
              <div
                key={s.innings_number}
                className="px-4 py-2.5 rounded-none"
                style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] mb-1" style={{ color: "#6B7280" }}>
                  {s.innings_number === 1 ? "1st" : "2nd"} · {city(battingTeam)}
                </div>
                <div className="font-mono text-2xl font-black" style={{ color: accent(battingTeam) }}>
                  {s.total_runs}/{s.wickets}
                </div>
                <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                  {s.overs_completed} overs
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── SECTION 2: Over-by-over timeline ─────────────────────────────────── */

function OverTimeline({
  story,
  innings,
  nameLookup,
}: {
  story: MatchStory;
  innings: 1 | 2;
  nameLookup: Map<string, string>;
}) {
  const overs = story.innings_timeline[String(innings)] ?? [];
  const name = (id: string) => nameLookup.get(id) ?? id.slice(0, 8);

  return (
    <SectionCard title="OVER BY OVER" subtitle={`// innings ${innings}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["OV", "RUNS", "WKT", "SCORE", "BATTER", "BOWLER"].map((h) => (
                <th key={h} className="px-3 py-2 text-left" style={{ color: "#6B7280", fontSize: 9, letterSpacing: "0.1em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overs.map((o) => (
              <tr
                key={o.over_number}
                className="hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <td className="px-3 py-2 font-bold" style={{ color: "#6B7280" }}>{o.over_number + 1}</td>
                <td className="px-3 py-2 font-bold" style={{ color: "#F0F0F0" }}>{o.runs_that_over}</td>
                <td className="px-3 py-2 font-bold" style={{ color: o.wickets_that_over > 0 ? "#EF4444" : "#6B7280" }}>
                  {o.wickets_that_over > 0 ? o.wickets_that_over : "—"}
                </td>
                <td className="px-3 py-2 font-bold" style={{ color: "#F0F0F0" }}>
                  {o.cumulative_score}/{o.cumulative_wickets}
                </td>
                <td className="px-3 py-2" style={{ color: "#9CA3AF" }}>{name(o.key_batter)}</td>
                <td className="px-3 py-2" style={{ color: "#9CA3AF" }}>{name(o.key_bowler)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ─── SECTION 3: Partnership map ───────────────────────────────────────── */

const CustomBarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sr = d.balls > 0 ? ((d.runs / d.balls) * 100).toFixed(1) : "—";
  return (
    <div
      className="rounded-none px-3 py-2 font-mono text-[11px]"
      style={{ background: "#1A1A1A", border: "none", borderLeft: "3px solid var(--accent-primary)", boxShadow: "none" }}
    >
      <div className="font-bold" style={{ color: "#F0F0F0" }}>{d.label}</div>
      <div style={{ color: "#9CA3AF" }}>{d.runs} runs off {d.balls} balls</div>
      <div style={{ color: "#9CA3AF" }}>SR: {sr}{d.wicketFell ? " · Wicket fell" : " · Not out"}</div>
    </div>
  );
};

function PartnershipMap({
  story,
  innings,
  nameLookup,
  teamColor,
}: {
  story: MatchStory;
  innings: 1 | 2;
  nameLookup: Map<string, string>;
  teamColor: string;
}) {
  const name = (id: string) => {
    const n = nameLookup.get(id);
    if (!n) return id.slice(0, 6);
    const parts = n.split(" ");
    return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : n;
  };

  const data = story.partnerships
    .filter((p) => p.innings_number === innings)
    .map((p, i) => ({
      label: `${name(p.batter1)} & ${name(p.batter2)}`,
      runs: p.runs,
      balls: p.balls,
      wicketFell: p.wicket_fell,
      idx: i + 1,
    }));

  const highest = data.reduce((max, p) => (p.runs > max.runs ? p : max), data[0] ?? { runs: 0, label: "—", balls: 0, wicketFell: false, idx: 0 });
  const avg = data.length ? Math.round(data.reduce((s, p) => s + p.runs, 0) / data.length) : 0;

  const chartHeight = Math.max(120, data.length * 44);

  return (
    <SectionCard title="PARTNERSHIP MAP" subtitle={`// innings ${innings} · ${data.length} stands`}>
      {data.length === 0 ? (
        <div className="px-5 py-6 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DATA</div>
      ) : (
        <>
          <div style={{ height: chartHeight }} className="px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data} margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis
                  type="number"
                  tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="runs" radius={0}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.idx}
                      fill={teamColor}
                      fillOpacity={entry.wicketFell ? 0.5 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div
            className="flex flex-wrap gap-6 px-5 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>PARTNERSHIPS</div>
              <div className="font-mono text-lg font-black" style={{ color: "#F0F0F0" }}>{data.length}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>HIGHEST</div>
              <div className="font-mono text-lg font-black" style={{ color: "var(--accent-primary)" }}>{highest.runs}</div>
              <div className="font-mono text-[9px]" style={{ color: "#6B7280" }}>{highest.label}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>AVERAGE</div>
              <div className="font-mono text-lg font-black" style={{ color: "#F0F0F0" }}>{avg}</div>
            </div>
          </div>
        </>
      )}
    </SectionCard>
  );
}

/* ─── SECTION 4: Wickets timeline ───────────────────────────────────────── */

function WicketsTimeline({
  story,
  innings,
  nameLookup,
}: {
  story: MatchStory;
  innings: 1 | 2;
  nameLookup: Map<string, string>;
}) {
  const wickets = story.wickets.filter((w) => w.innings_number === innings);
  const name = (id: string) => nameLookup.get(id) ?? id.slice(0, 8);

  return (
    <SectionCard title="WICKETS" subtitle={`// fall of wickets · innings ${innings}`}>
      {wickets.length === 0 ? (
        <div className="px-5 py-4 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO WICKETS</div>
      ) : (
        <div className="px-5 py-3 space-y-0">
          {wickets.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-2"
              style={{ borderBottom: i < wickets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[10px] font-bold"
                style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <span className="font-mono text-[13px] font-bold" style={{ color: "#F0F0F0" }}>
                  {name(w.wicket_player_out)}
                </span>
                <span className="ml-2 font-mono text-[11px] capitalize" style={{ color: "#9CA3AF" }}>
                  {w.wicket_kind}
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] font-bold" style={{ color: "#F0F0F0" }}>
                  {w.score_at_fall}
                </div>
                <div className="font-mono text-[9px]" style={{ color: "#6B7280" }}>
                  ov {w.over_number + 1}.{w.ball_number}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ─── Coming soon section ───────────────────────────────────────────────── */

function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="rounded-none bg-[#0F1117]"
      style={{ border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid rgba(255,107,0,0.3)" }}
    >
      <div className="flex items-baseline gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>
          {title}
        </span>
        <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{subtitle}</span>
      </div>
      <div className="px-5 py-6 text-center font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>
        INTELLIGENCE LOADING // COMING SOON
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function MatchDeepDivePage() {
  const { matchId } = Route.useParams();
  const [innings, setInnings] = useState<1 | 2>(1);

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [story, setStory] = useState<MatchStory | null>(null);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      getMatchDetail(matchId),
      getMatchStory(matchId),
      getPlayers(),
    ])
      .then(([m, s, p]) => {
        setMatch(m);
        setStory(s);
        setPlayers(p);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [matchId]);

  const nameLookup = useMemo(
    () => new Map(players.map((p) => [p.registry_id, p.name])),
    [players],
  );

  // Determine batting teams per innings
  const team1Color = match ? accent(match.team1) : "var(--accent-primary)";
  const team2Color = match ? accent(match.team2) : "var(--accent-primary)";
  const inningsTeamColor = innings === 1 ? team1Color : team2Color;

  return (
    <ProtectedRoute>
      <AppLayout pageName="MATCHES">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-20 lg:pb-6">

          {/* Error state */}
          {error && (
            <div className="py-16 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
                MATCH NOT FOUND
              </div>
              <Link
                to="/matches"
                className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.1em]"
                style={{ color: "var(--accent-primary)" }}
              >
                ← BACK TO MATCHES
              </Link>
            </div>
          )}

          {/* Loading state */}
          {loading && !error && (
            <div className="space-y-4">
              <Skeleton h="h-40" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Skeleton h="h-64" />
                <Skeleton h="h-64" />
              </div>
              <Skeleton h="h-48" />
            </div>
          )}

          {/* Content */}
          {!loading && !error && match && story && (
            <>
              {/* Header */}
              <MatchHeader match={match} />

              {/* Innings selector */}
              {story.innings_timeline["2"] && (
                <div className="mb-5">
                  <InningsTab active={innings} onChange={setInnings} />
                </div>
              )}

              {/* Two-column layout on desktop */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
                <OverTimeline story={story} innings={innings} nameLookup={nameLookup} />
                <WicketsTimeline story={story} innings={innings} nameLookup={nameLookup} />
              </div>

              {/* Partnership map — full width */}
              <div className="mb-4">
                <PartnershipMap
                  story={story}
                  innings={innings}
                  nameLookup={nameLookup}
                  teamColor={inningsTeamColor}
                />
              </div>

              {/* Coming soon sections */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
                <ComingSoon title="MATCH MVP" subtitle="// impact ranking" />
                <ComingSoon title="BOWLING INTELLIGENCE" subtitle="// match analysis" />
                <ComingSoon title="FIELDING INTELLIGENCE" subtitle="// match impact" />
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
