import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  getMatchDetail,
  getMatchStory,
  getMatchBowling,
  getMatchFielding,
  getMatchImpact,
  getMatchBatting,
  getPlayers,
  type MatchDetail,
  type MatchStory,
  type MatchBowling,
  type MatchFielding,
  type MatchImpact,
  type MatchBatting,
  type BatsmanEntry,
  type BowlerEntry,
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

function PlayerLink({ name, style }: { name: string; style?: React.CSSProperties }) {
  if (!name || name.length <= 8) return <span style={style}>{name}</span>;
  return (
    <Link
      to="/player/$playerName"
      params={{ playerName: encodeURIComponent(name) }}
      className="transition-opacity hover:opacity-70"
      style={style}
    >
      {name}
    </Link>
  );
}

function winResult(m: MatchDetail): string {
  if (m.win_by_wickets) return `${city(m.winner)} won by ${m.win_by_wickets} wicket${m.win_by_wickets === 1 ? "" : "s"}`;
  if (m.win_by_runs) return `${city(m.winner)} won by ${m.win_by_runs} run${m.win_by_runs === 1 ? "" : "s"}`;
  return `${city(m.winner)} won`;
}

/* ─── Section card ───────────────────────────────────────────────────────── */

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-none bg-[#0F1117]" style={{ border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}>
      <div className="flex items-baseline gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>{title}</span>
        {subtitle && <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ h = "h-32" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-none`} style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }} />;
}

/* ─── Innings tab ────────────────────────────────────────────────────────── */

function InningsTab({ active, onChange }: { active: 1 | 2; onChange: (n: 1 | 2) => void }) {
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

/* ─── Match header ───────────────────────────────────────────────────────── */

function MatchHeader({ match }: { match: MatchDetail }) {
  return (
    <div className="mb-6">
      <Link to="/matches" className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-opacity hover:opacity-70" style={{ color: "#6B7280" }}>
        ← MATCHES
      </Link>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[28px] font-black leading-none" style={{ color: accent(match.team1) }}>{city(match.team1)}</span>
        <span className="font-mono text-[14px]" style={{ color: "#6B7280" }}>vs</span>
        <span className="font-mono text-[28px] font-black leading-none" style={{ color: accent(match.team2) }}>{city(match.team2)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px]" style={{ color: "#6B7280" }}>
        <span>{match.venue}</span><span>·</span><span>{match.date}</span><span>·</span><span>{match.event_name}</span><span>·</span><span>{match.season}</span>
      </div>
      {match.winner && (
        <div className="mt-3 inline-flex items-center px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{ background: `${accent(match.winner)}15`, border: `1px solid ${accent(match.winner)}40`, color: accent(match.winner) }}>
          {winResult(match)}
        </div>
      )}
      {match.innings_summary.length > 0 && (
        <div className="mt-4 flex gap-3">
          {match.innings_summary.map((s) => {
            const battingTeam = s.innings_number === 1 ? match.team1 : match.team2;
            return (
              <div key={s.innings_number} className="px-4 py-2.5 rounded-none" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] mb-1" style={{ color: "#6B7280" }}>{s.innings_number === 1 ? "1st" : "2nd"} · {city(battingTeam)}</div>
                <div className="font-mono text-2xl font-black" style={{ color: accent(battingTeam) }}>{s.total_runs}/{s.wickets}</div>
                <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{s.overs_completed} overs</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Over timeline ──────────────────────────────────────────────────────── */

function OverTimeline({ story, innings, nameLookup }: { story: MatchStory; innings: 1 | 2; nameLookup: Map<string, string> }) {
  const overs = story.innings_timeline[String(innings)] ?? [];
  const name = (id: string) => nameLookup.get(id) ?? id.slice(0, 8);
  return (
    <SectionCard title="OVER BY OVER" subtitle={`// innings ${innings}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["OV", "RUNS", "WKT", "SCORE", "BATTER", "BOWLER"].map((h) => (
                <th key={h} className="px-3 py-2 text-left" style={{ color: "#6B7280", fontSize: 9, letterSpacing: "0.1em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overs.map((o) => (
              <tr key={o.over_number} className="hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-3 py-2 font-bold" style={{ color: "#6B7280" }}>{o.over_number + 1}</td>
                <td className="px-3 py-2 font-bold" style={{ color: "#F0F0F0" }}>{o.runs_that_over}</td>
                <td className="px-3 py-2 font-bold" style={{ color: o.wickets_that_over > 0 ? "#EF4444" : "#6B7280" }}>{o.wickets_that_over > 0 ? o.wickets_that_over : "—"}</td>
                <td className="px-3 py-2 font-bold" style={{ color: "#F0F0F0" }}>{o.cumulative_score}/{o.cumulative_wickets}</td>
                <td className="px-3 py-2"><PlayerLink name={name(o.key_batter)} style={{ color: "#9CA3AF" }} /></td>
                <td className="px-3 py-2"><PlayerLink name={name(o.key_bowler)} style={{ color: "#9CA3AF" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ─── Partnership map ────────────────────────────────────────────────────── */

const CustomBarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sr = d.balls > 0 ? ((d.runs / d.balls) * 100).toFixed(1) : "—";
  return (
    <div className="rounded-none px-3 py-2 font-mono text-[11px]" style={{ background: "#1A1A1A", borderLeft: "3px solid var(--accent-primary)", boxShadow: "none" }}>
      <div className="font-bold" style={{ color: "#F0F0F0" }}>{d.label}</div>
      <div style={{ color: "#9CA3AF" }}>{d.runs} runs off {d.balls} balls · SR: {sr}</div>
      <div style={{ color: "#9CA3AF" }}>{d.wicketFell ? "Wicket fell" : "Not out"}</div>
    </div>
  );
};

function PartnershipMap({ story, innings, nameLookup, teamColor }: { story: MatchStory; innings: 1 | 2; nameLookup: Map<string, string>; teamColor: string }) {
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

  return (
    <SectionCard title="PARTNERSHIP MAP" subtitle={`// innings ${innings} · ${data.length} stands`}>
      {data.length === 0 ? (
        <div className="px-5 py-6 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DATA</div>
      ) : (
        <>
          <div style={{ height: Math.max(120, data.length * 44) }} className="px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data} margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" width={130} tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="runs" radius={0} fill={teamColor} fillOpacity={0.65} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-6 px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
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

/* ─── Wickets timeline ───────────────────────────────────────────────────── */

function WicketsTimeline({ story, innings, nameLookup }: { story: MatchStory; innings: 1 | 2; nameLookup: Map<string, string> }) {
  const wickets = story.wickets.filter((w) => w.innings_number === innings);
  const name = (id: string) => nameLookup.get(id) ?? id.slice(0, 8);
  return (
    <SectionCard title="WICKETS" subtitle={`// fall of wickets · innings ${innings}`}>
      {wickets.length === 0 ? (
        <div className="px-5 py-4 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO WICKETS</div>
      ) : (
        <div className="px-5 py-3">
          {wickets.map((w, i) => (
            <div key={i} className="flex items-center gap-4 py-2" style={{ borderBottom: i < wickets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>{i + 1}</div>
              <div className="flex-1">
                <PlayerLink name={name(w.wicket_player_out)} style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: "bold", color: "#F0F0F0" }} />
                <span className="ml-2 font-mono text-[11px] capitalize" style={{ color: "#9CA3AF" }}>{w.wicket_kind}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] font-bold" style={{ color: "#F0F0F0" }}>{w.score_at_fall}</div>
                <div className="font-mono text-[9px]" style={{ color: "#6B7280" }}>ov {w.over_number + 1}.{w.ball_number}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ─── BATTING INTELLIGENCE ──────────────────────────────────────────────── */

function ballStyle(ball: import("@/services/api").BallEntry): { bg: string; text: string; label: string } {
  if (ball.is_wicket) return { bg: "#EF5350", text: "#fff", label: "W" };
  if (ball.extras > 0)  return { bg: "#607D8B", text: "#fff", label: "+" };
  if (ball.runs === 6)  return { bg: "#FF6B00", text: "#000", label: "6" };
  if (ball.runs === 4)  return { bg: "#2196F3", text: "#fff", label: "4" };
  if (ball.runs === 0)  return { bg: "#1E1E2E", text: "#4B5563", label: "·" };
  return { bg: "#2D2D3A", text: "#F0F0F0", label: String(ball.runs) };
}

function BallByBallGrid({ batsman }: { batsman: BatsmanEntry }) {
  const byOver = batsman.ball_by_ball.reduce<Record<number, typeof batsman.ball_by_ball>>((acc, b) => {
    (acc[b.over] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--accent-primary)" }}>
        BALL BY BALL // {batsman.name}
      </div>
      <div className="space-y-2">
        {Object.entries(byOver).sort(([a], [b]) => Number(a) - Number(b)).map(([over, balls]) => (
          <div key={over}>
            <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: "#6B7280" }}>OV {over}</div>
            <div className="flex flex-wrap gap-1">
              {balls.map((ball, i) => {
                const s = ballStyle(ball);
                return (
                  <div
                    key={i}
                    title={`Over ${ball.over}.${ball.ball}: ${ball.runs} runs${ball.is_wicket ? " (W)" : ""}${ball.extras > 0 ? " (extra)" : ""}`}
                    className="flex h-8 w-8 items-center justify-center font-mono text-[11px] font-bold"
                    style={{ background: s.bg, color: s.text, borderRadius: "50%" }}
                  >
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BattingIntelligence({ data, innings }: { data: MatchBatting; innings: 1 | 2 }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedBatsman, setSelectedBatsman] = useState<BatsmanEntry | null>(null);

  const inn = innings === 1 ? data.innings_1 : data.innings_2;

  useEffect(() => {
    const top = inn?.batsmen?.[0] ?? null;
    setSelectedBatsman(top);
    setExpanded(null);
  }, [innings, inn]);

  if (!inn?.batsmen?.length) {
    return (
      <SectionCard title="BATTING INTELLIGENCE" subtitle="// match analysis">
        <div className="px-5 py-6 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO BATTING DATA</div>
      </SectionCard>
    );
  }

  const maxImpact = Math.max(...inn.batsmen.map((b) => b.impact_score), 1);

  return (
    <SectionCard title="BATTING INTELLIGENCE" subtitle={`// ${city(inn.team)} batting`}>
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {inn.batsmen.map((b, idx) => {
          const isExpanded = expanded === b.name;
          const isSelected = selectedBatsman?.name === b.name;
          return (
            <div key={b.name}>
              <button
                onClick={() => {
                  setExpanded(isExpanded ? null : b.name);
                  setSelectedBatsman(b);
                }}
                className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <span className="w-6 shrink-0 font-mono text-[18px] font-black leading-none tabular-nums" style={{ color: "rgba(255,255,255,0.12)" }}>
                    {idx + 1}
                  </span>
                  {/* Center */}
                  <div className="flex-1 min-w-0">
                    <PlayerLink name={b.name} style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: "bold", color: accent(inn.team) }} />
                    <div className="mt-0.5 font-mono text-[11px] tabular-nums" style={{ color: "#9CA3AF" }}>
                      {b.stats.runs}r ({b.stats.balls}b) &nbsp;SR: {b.stats.strike_rate.toFixed(1)}
                    </div>
                    <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                      4s: {b.stats.fours} &nbsp; 6s: {b.stats.sixes} &nbsp; DOT%: {b.stats.dot_ball_pct.toFixed(0)}%
                    </div>
                  </div>
                  {/* Impact */}
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#6B7280" }}>IMPACT</div>
                    <div className="font-mono text-[18px] font-black leading-none" style={{ color: "var(--accent-primary)" }}>
                      {Math.round(b.impact_score)}
                    </div>
                    <div className="mt-1 h-1 w-16 rounded-none" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-1 rounded-none" style={{ width: `${(b.impact_score / maxImpact) * 100}%`, background: "var(--accent-primary)" }} />
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Phase breakdown */}
                  <div>
                    <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>PHASE BREAKDOWN</div>
                    <table className="w-full font-mono text-xs border-collapse">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {["PHASE", "R", "B", "SR"].map((h) => (
                            <th key={h} className="py-1 text-left" style={{ color: "#6B7280", fontSize: 9, letterSpacing: "0.1em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(["powerplay", "middle", "death"] as const).map((phase) => {
                          const p = b.phase_breakdown[phase];
                          return (
                            <tr key={phase} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td className="py-1 font-bold uppercase" style={{ color: "#9CA3AF", fontSize: 9, letterSpacing: "0.08em" }}>{phase}</td>
                              <td className="py-1 font-bold" style={{ color: "#F0F0F0" }}>{p.runs}</td>
                              <td className="py-1" style={{ color: "#9CA3AF" }}>{p.balls}</td>
                              <td className="py-1 font-bold" style={{ color: "#F0F0F0" }}>{p.strike_rate.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Dismissal */}
                  {b.dismissal ? (
                    <div className="font-mono text-[11px]" style={{ color: "#9CA3AF" }}>
                      <span style={{ color: "#EF5350" }}>out:</span> {b.dismissal.how_out}
                      {b.dismissal.dismissed_by && <span> · bowled by {b.dismissal.dismissed_by}</span>}
                      {b.dismissal.fielder && <span> · fielded by {b.dismissal.fielder}</span>}
                    </div>
                  ) : (
                    <div className="font-mono text-[11px]" style={{ color: "#4CAF50" }}>not out</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ball-by-ball grid for selected batsman */}
      {selectedBatsman && selectedBatsman.ball_by_ball.length > 0 && (
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <BallByBallGrid batsman={selectedBatsman} />
        </div>
      )}
    </SectionCard>
  );
}

/* ─── Bowling heatmap cell ───────────────────────────────────────────────── */

function heatColor(runs: number): { bg: string; text: string } {
  if (runs <= 5) return { bg: "#1B5E20", text: "#A5D6A7" };
  if (runs <= 7) return { bg: "#388E3C", text: "#C8E6C9" };
  if (runs <= 9) return { bg: "#F9A825", text: "#1A1A1A" };
  if (runs <= 11) return { bg: "#E65100", text: "#FFE0B2" };
  return { bg: "#B71C1C", text: "#FFCDD2" };
}

/* ─── BOWLING INTELLIGENCE ───────────────────────────────────────────────── */

function BowlingIntelligence({ data, innings }: { data: MatchBowling; innings: 1 | 2 }) {
  const inn = innings === 1 ? data.innings_1 : data.innings_2;
  const [selectedBowler, setSelectedBowler] = useState<BowlerEntry | null>(null);
  const bowler = selectedBowler ?? inn.bowlers[0] ?? null;
  const maxImpact = Math.max(...inn.bowlers.map((b) => b.impact_score), 1);

  const [expanded, setExpanded] = useState<string | null>(null);

  // Reset selection when innings changes
  useEffect(() => { setSelectedBowler(null); setExpanded(null); }, [innings]);

  if (!inn.bowlers.length) return (
    <SectionCard title="BOWLING INTELLIGENCE" subtitle="// match analysis">
      <div className="px-5 py-6 font-mono text-[11px]" style={{ color: "#6B7280" }}>NO BOWLING DATA</div>
    </SectionCard>
  );

  return (
    <SectionCard title="BOWLING INTELLIGENCE" subtitle={`// ${city(inn.team)} bowling`}>
      {/* Bowler hierarchy */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {inn.bowlers.map((b, i) => {
          const isExpanded = expanded === b.name;
          const isSelected = bowler?.name === b.name;
          return (
            <div key={b.name}>
              <div
                className="flex cursor-pointer items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                style={{ background: isSelected ? "rgba(255,107,0,0.04)" : undefined }}
                onClick={() => {
                  setSelectedBowler(b);
                  setExpanded(isExpanded ? null : b.name);
                }}
              >
                {/* Rank */}
                <span className="mt-0.5 w-5 shrink-0 font-mono text-[20px] font-black leading-none tabular-nums" style={{ color: "rgba(255,255,255,0.1)" }}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  {/* Name + impact */}
                  <div className="flex items-baseline justify-between gap-2">
                    <PlayerLink name={b.name} style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: "bold", color: "#F0F0F0" }} />
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#6B7280" }}>IMPACT</div>
                      <div className="font-mono text-[15px] font-black" style={{ color: "var(--accent-primary)" }}>{b.impact_score.toFixed(0)}</div>
                    </div>
                  </div>
                  {/* Impact bar */}
                  <div className="my-1.5 h-1 rounded-none" style={{ background: "rgba(255,107,0,0.15)", width: "100%" }}>
                    <div className="h-1" style={{ background: "var(--accent-primary)", width: `${(b.impact_score / maxImpact) * 100}%`, opacity: 0.7 }} />
                  </div>
                  {/* Stats row */}
                  <div className="flex flex-wrap gap-3 font-mono text-[11px]" style={{ color: "#9CA3AF" }}>
                    <span>{b.stats.overs}ov</span>
                    <span>{b.stats.runs}r</span>
                    <span style={{ color: b.stats.wickets > 0 ? "#EF4444" : "#9CA3AF" }}>{b.stats.wickets}w</span>
                    <span>Econ: {b.stats.economy}</span>
                    <span>DOT%: {b.stats.dot_ball_pct}%</span>
                  </div>
                </div>
              </div>
              {/* Expanded phase breakdown */}
              {isExpanded && (
                <div className="grid grid-cols-3 gap-px px-5 pb-3 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {(["powerplay", "middle", "death"] as const).map((ph) => {
                    const p = b.phase_breakdown[ph];
                    return (
                      <div key={ph} className="py-2 text-center">
                        <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: "#6B7280" }}>{ph}</div>
                        <div className="font-mono text-[11px]" style={{ color: "#F0F0F0" }}>{p.overs}ov {p.runs}r {p.wickets}w</div>
                        <div className="font-mono text-[10px]" style={{ color: "#9CA3AF" }}>Econ {p.economy}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      {bowler && (
        <div className="px-5 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>
            OVER BY OVER // {bowler.name}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 20 }, (_, i) => {
              const ov = bowler.over_by_over.find((o) => o.over_number === i);
              const colors = ov ? heatColor(ov.runs_conceded) : { bg: "#1A1A2E", text: "#4B5563" };
              return (
                <div
                  key={i}
                  title={ov ? `Ov ${i + 1}: ${ov.runs_conceded}r ${ov.wickets}w` : `Ov ${i + 1}: not bowled`}
                  className="relative flex flex-col items-center justify-center"
                  style={{ width: 44, height: 44, background: colors.bg, flexShrink: 0 }}
                >
                  {ov ? (
                    <>
                      <span className="font-mono text-[13px] font-bold" style={{ color: colors.text }}>{ov.runs_conceded}</span>
                      <span className="font-mono text-[8px]" style={{ color: colors.text, opacity: 0.7 }}>ov{i + 1}</span>
                      {ov.wickets > 0 && (
                        <span className="absolute right-0.5 top-0.5 font-mono text-[8px] font-bold" style={{ color: "#fff" }}>W</span>
                      )}
                      {ov.is_maiden && (
                        <span className="absolute left-0.5 top-0.5 font-mono text-[8px] font-bold" style={{ color: "#fff" }}>M</span>
                      )}
                    </>
                  ) : (
                    <span className="font-mono text-[9px]" style={{ color: "#4B5563" }}>{i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ─── FIELDING INTELLIGENCE ──────────────────────────────────────────────── */

const DISMISSAL_COLORS: Record<string, string> = {
  caught: "#FF6B00",
  bowled: "#2196F3",
  lbw: "#9C27B0",
  run_out: "#F44336",
  stumped: "#4CAF50",
  caught_and_bowled: "#FF9800",
  other: "#607D8B",
};

const DISMISSAL_LABELS: Record<string, string> = {
  caught: "Caught",
  bowled: "Bowled",
  lbw: "LBW",
  run_out: "Run Out",
  stumped: "Stumped",
  caught_and_bowled: "C&B",
  other: "Other",
};

function FieldingIntelligence({ data }: { data: MatchFielding }) {
  const pieData = Object.entries(data.dismissal_breakdown)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: DISMISSAL_LABELS[k] ?? k, value: v, fill: DISMISSAL_COLORS[k] ?? "#607D8B" }));

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <SectionCard title="FIELDING INTELLIGENCE" subtitle="// match impact">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* Left — heroes */}
        <div className="px-5 py-3" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>FIELDING HEROES</div>
          {data.fielding_heroes.length === 0 ? (
            <div className="font-mono text-[11px]" style={{ color: "#6B7280" }}>NO FIELDING DATA</div>
          ) : (
            <div className="space-y-0">
              {data.fielding_heroes.map((h, i) => (
                <div key={h.name} className="flex items-center gap-3 py-2" style={{ borderBottom: i < data.fielding_heroes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span className="w-4 shrink-0 font-mono text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <PlayerLink name={h.name} style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: "bold", color: accent(h.team) || "#F0F0F0" }} />
                    <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                      C:{h.catches} RO:{h.run_outs} St:{h.stumpings}{h.caught_and_bowled > 0 ? ` C&B:${h.caught_and_bowled}` : ""}
                    </div>
                  </div>
                  <span className="font-mono text-[13px] font-black shrink-0" style={{ color: "var(--accent-primary)" }}>{h.fielding_score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — dismissal donut */}
        <div className="flex flex-col items-center px-5 py-3">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>DISMISSAL BREAKDOWN</div>
          {total > 0 ? (
            <>
              <PieChart width={180} height={180}>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} />
              </PieChart>
              {/* Legend */}
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.fill }} />
                    <span className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>{d.name} {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DISMISSALS</div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

/* ─── MATCH MVP ──────────────────────────────────────────────────────────── */

const ROLE_STYLE: Record<string, { label: string; color: string }> = {
  batsman:    { label: "BAT",  color: "#2196F3" },
  bowler:     { label: "BOWL", color: "#E65100" },
  allrounder: { label: "ALL",  color: "#4CAF50" },
};

function MatchMVP({ data, match }: { data: MatchImpact; match: MatchDetail }) {
  const top5 = data.mvp_ranking.slice(0, 5);
  return (
    <SectionCard title="MATCH MVP" subtitle="// impact ranking">
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {top5.map((p, i) => {
          const role = ROLE_STYLE[p.role] ?? ROLE_STYLE.batsman;
          const isTop = i === 0;
          return (
            <div
              key={p.name}
              className="flex items-start gap-3 px-5 py-3"
              style={{ boxShadow: isTop ? "inset 0 0 0 1px rgba(255,107,0,0.2)" : undefined, background: isTop ? "rgba(255,107,0,0.03)" : undefined }}
            >
              <span className="mt-0.5 shrink-0 font-mono text-[26px] font-black leading-none tabular-nums" style={{ color: "var(--accent-primary)" }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <PlayerLink name={p.name} style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: "bold", color: accent(p.team) }} />
                  <span className="px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase" style={{ background: `${role.color}20`, color: role.color }}>
                    {role.label}
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[10px]" style={{ color: "#6B7280" }}>
                  BAT: {p.batting_impact.toFixed(1)} · BOWL: {p.bowling_impact.toFixed(1)} · FLD: {p.fielding_impact.toFixed(1)}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-[22px] font-black" style={{ color: "#F0F0F0" }}>{p.total_impact.toFixed(0)}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color: "#6B7280" }}>PTS</div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

function MatchDeepDivePage() {
  const { matchId } = Route.useParams();
  const [innings, setInnings] = useState<1 | 2>(1);

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [story, setStory] = useState<MatchStory | null>(null);
  const [batting, setBatting] = useState<MatchBatting | null>(null);
  const [bowling, setBowling] = useState<MatchBowling | null>(null);
  const [fielding, setFielding] = useState<MatchFielding | null>(null);
  const [impact, setImpact] = useState<MatchImpact | null>(null);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      getMatchDetail(matchId),
      getMatchStory(matchId),
      getMatchBatting(matchId),
      getMatchBowling(matchId),
      getMatchFielding(matchId),
      getMatchImpact(matchId),
      getPlayers(),
    ])
      .then(([m, s, bat, b, f, imp, p]) => {
        setMatch(m);
        setStory(s);
        setBatting(bat);
        setBowling(b);
        setFielding(f);
        setImpact(imp);
        setPlayers(p);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [matchId]);

  const nameLookup = useMemo(() => new Map(players.map((p) => [p.registry_id, p.name])), [players]);

  const team1Color = match ? accent(match.team1) : "var(--accent-primary)";
  const team2Color = match ? accent(match.team2) : "var(--accent-primary)";
  const inningsTeamColor = innings === 1 ? team1Color : team2Color;

  return (
    <ProtectedRoute>
      <AppLayout pageName="MATCHES">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-20 lg:pb-6">

          {error && (
            <div className="py-16 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>MATCH NOT FOUND</div>
              <Link to="/matches" className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--accent-primary)" }}>
                ← BACK TO MATCHES
              </Link>
            </div>
          )}

          {loading && !error && (
            <div className="space-y-4">
              <Skeleton h="h-40" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Skeleton h="h-64" /><Skeleton h="h-64" /></div>
              <Skeleton h="h-48" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Skeleton h="h-80" /><Skeleton h="h-80" /><Skeleton h="h-80" /></div>
            </div>
          )}

          {!loading && !error && match && story && (
            <>
              <MatchHeader match={match} />

              {story.innings_timeline["2"] && (
                <div className="mb-5">
                  <InningsTab active={innings} onChange={setInnings} />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
                <OverTimeline story={story} innings={innings} nameLookup={nameLookup} />
                <WicketsTimeline story={story} innings={innings} nameLookup={nameLookup} />
              </div>

              <div className="mb-4">
                <PartnershipMap story={story} innings={innings} nameLookup={nameLookup} teamColor={inningsTeamColor} />
              </div>

              {/* Batting intelligence */}
              <div className="mb-4">
                {batting ? (
                  <BattingIntelligence data={batting} innings={innings} />
                ) : (
                  <Skeleton h="h-96" />
                )}
              </div>

              {/* Intelligence sections */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                {impact && match ? <MatchMVP data={impact} match={match} /> : <Skeleton h="h-80" />}
                {bowling ? <BowlingIntelligence data={bowling} innings={innings} /> : <Skeleton h="h-80" />}
                {fielding ? <FieldingIntelligence data={fielding} /> : <Skeleton h="h-80" />}
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
