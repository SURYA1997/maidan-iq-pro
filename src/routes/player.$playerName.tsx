import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getPlayerProfile, type PlayerProfile } from "@/services/api";

export const Route = createFileRoute("/player/$playerName")({
  component: PlayerProfilePage,
  head: ({ params }) => ({
    meta: [{ title: `MaidanIQ — ${decodeURIComponent(params.playerName)}` }],
  }),
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const CITY_MAP: Record<string, string> = {
  "Chennai Super Kings": "Chennai", "Mumbai Indians": "Mumbai",
  "Royal Challengers Bengaluru": "Bengaluru", "Royal Challengers Bangalore": "Bengaluru",
  "Kolkata Knight Riders": "Kolkata", "Sunrisers Hyderabad": "Hyderabad",
  "Delhi Capitals": "Delhi", "Rajasthan Royals": "Rajasthan",
  "Punjab Kings": "Punjab", "Kings XI Punjab": "Punjab",
  "Lucknow Super Giants": "Lucknow", "Gujarat Titans": "Ahmedabad",
};
const teamCity = (t: string) => CITY_MAP[t] ?? t;

const ROLE_STYLE = {
  Batsman: { label: "BAT", color: "#2196F3" },
  Bowler: { label: "BOWL", color: "#E65100" },
  "All-Rounder": { label: "ALL", color: "#4CAF50" },
} as const;

function srColor(sr: number) {
  if (sr >= 140) return "#4CAF50";
  if (sr <= 110) return "#EF4444";
  return "#F0F0F0";
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function SkeletonBlock({ h = "h-20" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-none`} style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }} />;
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({ label, value, sub }: { label: string; value: string | number | null; sub?: string }) {
  return (
    <div className="px-5 py-4 rounded-none" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}>
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] mb-1" style={{ color: "#6B7280" }}>{label}</div>
      <div className="font-mono text-2xl font-black" style={{ color: "var(--accent-primary)" }}>{value ?? "—"}</div>
      {sub && <div className="font-mono text-[9px] mt-0.5" style={{ color: "#6B7280" }}>{sub}</div>}
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-none" style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "2px solid var(--accent-primary)" }}>
      <div className="flex items-baseline gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#6B7280" }}>{title}</span>
        {subtitle && <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

/* ─── Page component ─────────────────────────────────────────────────────── */

function PlayerProfilePage() {
  const { playerName } = Route.useParams();
  const decoded = decodeURIComponent(playerName);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getPlayerProfile(decoded)
      .then(setProfile)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [decoded]);

  return (
    <ProtectedRoute>
      <AppLayout pageName="PLAYERS">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-20 lg:pb-6">

          {/* Back */}
          <button
            onClick={() => navigate({ to: "/matches" })}
            className="mb-5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-opacity hover:opacity-70"
            style={{ color: "#6B7280" }}
          >
            ← MATCHES
          </button>

          {/* Error */}
          {error && (
            <div className="py-16 text-center">
              <div className="font-mono text-[14px] uppercase tracking-[0.14em] mb-2" style={{ color: "#6B7280" }}>PLAYER NOT FOUND</div>
              <div className="font-mono text-[11px]" style={{ color: "#6B7280" }}>No data for "{decoded}"</div>
              <Link to="/matches" className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--accent-primary)" }}>
                ← BACK TO MATCHES
              </Link>
            </div>
          )}

          {/* Loading */}
          {loading && !error && (
            <div className="space-y-4">
              <SkeletonBlock h="h-32" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
                <div className="space-y-4"><SkeletonBlock h="h-48" /><SkeletonBlock h="h-36" /><SkeletonBlock h="h-48" /></div>
                <div className="space-y-4"><SkeletonBlock h="h-48" /><SkeletonBlock h="h-36" /><SkeletonBlock h="h-36" /></div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && profile && <ProfileContent profile={profile} />}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

/* ─── Profile content ────────────────────────────────────────────────────── */

function ProfileContent({ profile }: { profile: PlayerProfile }) {
  const role = ROLE_STYLE[profile.primary_role] ?? ROLE_STYLE.Batsman;
  const isBatter = profile.primary_role !== "Bowler";
  const isBowler = profile.primary_role !== "Batsman";
  const bat = profile.batting;
  const bowl = profile.bowling;

  const phases = ["powerplay", "middle", "death"] as const;
  const PHASE_LABEL = { powerplay: "POWERPLAY", middle: "MIDDLE", death: "DEATH" };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="font-mono text-[28px] font-black leading-none" style={{ color: "#F0F0F0" }}>
            {profile.full_name}
          </h1>
          <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase" style={{ background: `${role.color}20`, color: role.color }}>
            {role.label}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: "#6B7280" }}>
          <span>{profile.total_matches} matches</span>
          <span>·</span>
          <span>{profile.total_motm} MOTM</span>
          <span>·</span>
          <span>{profile.seasons_played.length} seasons</span>
        </div>
      </div>

      {/* Career stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {isBatter && <>
          <StatCard label="RUNS" value={bat.total_runs} />
          <StatCard label="STRIKE RATE" value={bat.career_strike_rate} />
          <StatCard label="AVERAGE" value={bat.career_average} />
          <StatCard label="HIGHEST" value={bat.highest_score} sub={`${bat.fifties} fifties · ${bat.hundreds} 100s`} />
        </>}
        {isBowler && <>
          <StatCard label="WICKETS" value={bowl.total_wickets} />
          <StatCard label="ECONOMY" value={bowl.career_economy} />
          <StatCard label="AVERAGE" value={bowl.career_average} />
          <StatCard label="BEST" value={bowl.best_figures} sub={`${bowl.five_wicket_hauls} five-fors`} />
        </>}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Season by season */}
          <Section title="SEASON BY SEASON" subtitle="// career progression">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["SEASON", "M", "RUNS", "SR", "AVG", "WKTS", "ECON"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left" style={{ color: "#6B7280", fontSize: 9, letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...profile.season_stats].reverse().map((s) => (
                    <tr key={s.season}
                      className="hover:bg-white/[0.02]"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: s.season === "2026" ? "rgba(255,107,0,0.04)" : undefined,
                      }}
                    >
                      <td className="px-3 py-2 font-bold" style={{ color: s.season === "2026" ? "var(--accent-primary)" : "#9CA3AF" }}>{s.season}</td>
                      <td className="px-3 py-2" style={{ color: "#6B7280" }}>{s.matches}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: "#F0F0F0" }}>{s.batting.runs}</td>
                      <td className="px-3 py-2" style={{ color: srColor(s.batting.strike_rate) }}>{s.batting.strike_rate}</td>
                      <td className="px-3 py-2" style={{ color: "#9CA3AF" }}>{s.batting.average ?? "—"}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: "#F0F0F0" }}>{s.bowling.wickets}</td>
                      <td className="px-3 py-2" style={{ color: "#9CA3AF" }}>{s.bowling.economy || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Phase intelligence */}
          <Section title="PHASE INTELLIGENCE" subtitle="// powerplay · middle · death">
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {phases.map((ph) => {
                const p = profile.phase_stats[ph];
                if (!p) return null;
                return (
                  <div key={ph} className="px-4 py-4">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] mb-3" style={{ color: "#6B7280" }}>{PHASE_LABEL[ph]}</div>
                    {isBatter && (
                      <div className="mb-3">
                        <div className="font-mono text-[10px] mb-1" style={{ color: "#6B7280" }}>BATTING</div>
                        <div className="font-mono text-lg font-black" style={{ color: srColor(p.batting.strike_rate) }}>{p.batting.strike_rate}</div>
                        <div className="font-mono text-[10px]" style={{ color: "#9CA3AF" }}>{p.batting.runs}r · {p.batting.balls}b</div>
                      </div>
                    )}
                    {isBowler && (
                      <div>
                        <div className="font-mono text-[10px] mb-1" style={{ color: "#6B7280" }}>BOWLING</div>
                        <div className="font-mono text-lg font-black" style={{ color: "var(--accent-primary)" }}>{p.bowling.economy}</div>
                        <div className="font-mono text-[10px]" style={{ color: "#9CA3AF" }}>{p.bowling.wickets}w · {p.bowling.overs}ov</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Recent form */}
          <Section title="RECENT FORM" subtitle="// last 10 matches">
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {profile.recent_form.map((m, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3">
                  <div className="shrink-0 w-20">
                    <div className="font-mono text-[10px]" style={{ color: "#9CA3AF" }}>{m.date}</div>
                    <div className="font-mono text-[9px] truncate" style={{ color: "#6B7280" }}>{m.venue?.split(",")[0]}</div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {m.batting && (
                      <div className="font-mono text-[11px]" style={{ color: "#F0F0F0" }}>
                        <span className="font-bold">{m.batting.runs}r</span>
                        <span style={{ color: "#6B7280" }}> ({m.batting.balls}b) SR: </span>
                        <span style={{ color: srColor(m.batting.strike_rate) }}>{m.batting.strike_rate}</span>
                      </div>
                    )}
                    {m.bowling && (
                      <div className="font-mono text-[11px]" style={{ color: "#F0F0F0" }}>
                        <span className="font-bold">{m.bowling.wickets}w</span>
                        <span style={{ color: "#6B7280" }}> Econ: {m.bowling.economy}</span>
                      </div>
                    )}
                    {!m.batting && !m.bowling && (
                      <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {/* Head to head */}
          <Section title="HEAD TO HEAD" subtitle={isBatter ? "// vs bowlers" : "// vs batsmen"}>
            <div className="divide-y px-5" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {profile.head_to_head.map((h, i) => {
                const opponent = h.bowler ?? h.batsman ?? "Unknown";
                const balls = h.balls_faced ?? h.balls_bowled ?? 0;
                const runs = h.runs ?? h.runs_conceded ?? 0;
                const metric = isBatter ? `SR: ${h.strike_rate}` : `Econ: ${h.economy}`;
                const isGoodForPlayer = isBatter ? (h.strike_rate ?? 0) > 130 : (h.economy ?? 99) < 8;
                return (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div>
                      <Link
                        to="/player/$playerName"
                        params={{ playerName: encodeURIComponent(opponent) }}
                        className="font-mono text-[12px] font-bold transition-opacity hover:opacity-70"
                        style={{ color: "#F0F0F0" }}
                      >
                        {opponent}
                      </Link>
                      <div className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                        {balls}b · {runs}r · {h.dismissals} dis
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-bold" style={{ color: isGoodForPlayer ? "#4CAF50" : "#EF4444" }}>
                      {metric}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Venue stats */}
          <Section title="VENUE FORM" subtitle="// ground by ground">
            <div className="divide-y px-5" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {profile.venue_stats.map((v, i) => (
                <div key={i} className="py-2.5">
                  <div className="font-mono text-[11px] font-bold mb-1 truncate" style={{ color: "#F0F0F0" }}>
                    {v.venue.split(",")[0]}
                  </div>
                  <div className="flex gap-4 font-mono text-[10px]" style={{ color: "#9CA3AF" }}>
                    {isBatter && <span>{v.batting.runs}r · SR {v.batting.strike_rate}</span>}
                    {isBowler && <span>{v.bowling.wickets}w · Econ {v.bowling.economy}</span>}
                    <span style={{ color: "#6B7280" }}>{v.matches}m</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Milestones */}
          <Section title="MILESTONES" subtitle="// career highlights">
            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              {isBatter && <>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>FOURS</div>
                  <div className="font-mono text-xl font-black" style={{ color: "#F0F0F0" }}>{bat.total_fours}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>SIXES</div>
                  <div className="font-mono text-xl font-black" style={{ color: "#F0F0F0" }}>{bat.total_sixes}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>FIFTIES</div>
                  <div className="font-mono text-xl font-black" style={{ color: "#F0F0F0" }}>{bat.fifties}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>HUNDREDS</div>
                  <div className="font-mono text-xl font-black" style={{ color: "var(--accent-primary)" }}>{bat.hundreds}</div>
                </div>
              </>}
              {isBowler && <>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>4-FORS</div>
                  <div className="font-mono text-xl font-black" style={{ color: "#F0F0F0" }}>{bowl.four_wicket_hauls}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>5-FORS</div>
                  <div className="font-mono text-xl font-black" style={{ color: "var(--accent-primary)" }}>{bowl.five_wicket_hauls}</div>
                </div>
              </>}
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>MOTM</div>
                <div className="font-mono text-xl font-black" style={{ color: "var(--accent-primary)" }}>{profile.total_motm}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "#6B7280" }}>DOT %</div>
                <div className="font-mono text-xl font-black" style={{ color: "#F0F0F0" }}>{isBatter ? bat.dot_ball_pct : bowl.dot_ball_pct}%</div>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </>
  );
}
