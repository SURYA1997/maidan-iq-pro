import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  getLiveCurrentMatch,
  getMatches,
  getPointsTable,
  type LiveMatchResponse,
  type MatchSummary,
  type PointsTableEntry,
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

          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">

            {/* Main column */}
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
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-none"
                        style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Side column */}
            <div>
              <PointsTableSection />
            </div>
          </div>

          {/* Full-width matches table below */}
          {!loading && matches.length > 0 && (
            <AllMatchesSection matches={matches} />
          )}

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
