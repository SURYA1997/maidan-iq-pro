import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { MetricTooltip } from "@/components/pitchiq/InfoTip";
import {
  getVenues,
  getVenueIntelligence,
  type VenueSummary,
  type VenueIntelligence,
} from "@/services/api";

export const Route = createFileRoute("/venues")({
  component: VenuesPage,
  head: () => ({ meta: [{ title: "MaidanIQ — Venues" }] }),
});

/* ─── Skeleton ──────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-none p-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="mb-2 h-4 w-2/3 rounded-none bg-white/5" />
      <div className="mb-4 h-3 w-1/3 rounded-none bg-white/5" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-none bg-white/5" />
        <div className="h-3 w-4/5 rounded-none bg-white/5" />
      </div>
    </div>
  );
}

/* ─── Stat label inside card ────────────────────────────────────────────── */

function Stat({ label, value, tip }: { label: string; value: string; tip?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <span className="label-mono">{label}</span>
        {tip && <MetricTooltip text={tip} />}
      </div>
      <div className="font-mono text-base font-bold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

/* ─── Venue card (with inline Deep Intel button) ────────────────────────── */

function VenueCard({
  venue,
  isExpanded,
  onToggle,
}: {
  venue: VenueSummary;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-none flex flex-col"
      style={{
        background: isExpanded ? "rgba(255,107,0,0.04)" : "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "2px solid var(--accent-primary)",
      }}
    >
      {/* Card body — stats */}
      <div className="flex-1 p-4">
        <div
          className="font-mono text-[13px] font-bold uppercase tracking-[0.06em] leading-tight"
          style={{ color: "var(--accent-primary)" }}
        >
          {venue.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.1em]">
          {venue.city}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat
            label="AVG 1ST"
            value={String(Math.round(venue.avg_first_innings_score))}
            tip="Mean first-innings total at this venue."
          />
          <Stat
            label="CHASE WIN"
            value={`${venue.chase_win_pct.toFixed(0)}%`}
            tip="Percentage of matches won by the chasing team."
          />
          <Stat
            label="MATCHES"
            value={String(venue.total_matches)}
          />
        </div>
      </div>

      {/* Deep intel button — always at bottom of card */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-white/[0.03]"
        style={{
          borderTop: "1px solid var(--border)",
          color: isExpanded ? "#6B7280" : "var(--accent-primary)",
        }}
      >
        {isExpanded ? "DEEP INTEL ↑" : "DEEP INTEL ↓"}
      </button>
    </div>
  );
}

/* ─── Deep intel panel (inline, full-width) ─────────────────────────────── */

function DeepIntelPanel({ venueName }: { venueName: string }) {
  const [intel, setIntel] = useState<VenueIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setIntel(null);
    setLoading(true);
    setUnavailable(false);
    getVenueIntelligence(venueName)
      .then(setIntel)
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, [venueName]);

  return (
    <div
      className="rounded-none"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "2px solid var(--accent-primary)",
      }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent-primary)" }}>
          {venueName}
        </span>
        <span className="ml-2 font-mono text-[10px]" style={{ color: "#6B7280" }}>
          // deep intelligence
        </span>
      </div>

      {loading && (
        <div className="flex gap-4 px-5 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 flex-1 animate-pulse rounded-none" style={{ background: "rgba(255,255,255,0.03)" }} />
          ))}
        </div>
      )}

      {(unavailable || (!loading && !intel)) && (
        <div className="px-5 py-4 font-mono text-[11px]" style={{ color: "#6B7280" }}>
          DEEP INTELLIGENCE NOT YET AVAILABLE FOR THIS VENUE
        </div>
      )}

      {intel && !loading && (
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">

          {/* A) Toss intelligence */}
          <div className="px-5 py-4" style={{ borderRight: "1px solid var(--border)" }}>
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
              TOSS INTELLIGENCE
            </div>
            {intel.toss_intelligence ? (
              <>
                <div className="flex gap-2 mb-3">
                  {(["bat_first", "bowl_first"] as const).map((side) => {
                    const pct = side === "bat_first"
                      ? intel.toss_intelligence!.bat_first_win_pct
                      : intel.toss_intelligence!.bowl_first_win_pct;
                    const isBetter = side === "bat_first"
                      ? intel.toss_intelligence!.bat_first_win_pct >= intel.toss_intelligence!.bowl_first_win_pct
                      : intel.toss_intelligence!.bowl_first_win_pct > intel.toss_intelligence!.bat_first_win_pct;
                    return (
                      <div
                        key={side}
                        className="flex-1 rounded-none p-2.5 text-center"
                        style={{
                          border: `1px solid ${isBetter ? "var(--accent-primary)" : "rgba(255,255,255,0.08)"}`,
                          background: "#0F1117",
                        }}
                      >
                        <div className="font-mono text-[18px] font-black" style={{ color: "var(--accent-primary)" }}>
                          {pct.toFixed(1)}%
                        </div>
                        <div className="font-mono text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: "#6B7280" }}>
                          {side === "bat_first" ? "BAT FIRST" : "BOWL FIRST"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="font-mono text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>
                  BEST CALL: {intel.toss_intelligence.best_decision?.toUpperCase() ?? "—"}
                </div>
              </>
            ) : (
              <div className="font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DATA</div>
            )}
          </div>

          {/* B) Home advantage */}
          <div className="px-5 py-4" style={{ borderRight: "1px solid var(--border)" }}>
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
              HOME ADVANTAGE
            </div>
            {intel.home_advantage?.length ? (
              intel.home_advantage.slice(0, 3).map((t) => (
                <div key={t.team} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="font-mono text-[12px] font-bold" style={{ color: "var(--accent-primary)" }}>
                    {t.team}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px] font-bold" style={{ color: "var(--accent-primary)" }}>
                      {t.venue_win_pct.toFixed(0)}%
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>
                      {t.matches_at_venue}M
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DATA</div>
            )}
          </div>

          {/* C) Venue kings */}
          <div className="px-5 py-4">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
              VENUE KINGS
            </div>
            {intel.venue_kings?.length ? (
              intel.venue_kings.slice(0, 5).map((k) => (
                <div key={k.player} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="font-mono text-[12px]" style={{ color: "#F0F0F0" }}>
                    {k.player}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[13px] font-bold" style={{ color: "var(--accent-primary)" }}>
                      {k.motm_count}
                    </span>
                    <span>🏆</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="font-mono text-[11px]" style={{ color: "#6B7280" }}>NO DATA</div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

const GRID_COLS = 3; // matches xl:grid-cols-3

function VenuesPage() {
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getVenues()
      .then((v) => { setVenues(v); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  function toggleExpanded(name: string) {
    setExpanded((prev) => (prev === name ? null : name));
  }

  /*
   * Row-break injection: find the expanded card's index, calculate which
   * grid row it sits in (assuming GRID_COLS columns), and insert the
   * full-width panel after the last card of that row.
   *
   * The panel element uses `grid-column: 1 / -1` to span all columns.
   * Because CSS grid auto-placement is sequential, inserting it right
   * after the last card of a row places it cleanly between rows.
   */
  const expandedIdx = venues.findIndex((v) => v.name === expanded);
  const panelAfterIdx =
    expandedIdx >= 0
      ? Math.min(
          Math.floor(expandedIdx / GRID_COLS) * GRID_COLS + GRID_COLS - 1,
          venues.length - 1,
        )
      : -1;

  return (
    <ProtectedRoute>
      <AppLayout pageName="VENUES">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-20 lg:pb-6">

          <div className="mb-6">
            <h1
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent-primary)" }}
            >
              VENUES
            </h1>
            <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
              {venues.length > 0 ? `${venues.length} grounds · all-time IPL data · click DEEP INTEL for analytics` : "loading…"}
            </p>
          </div>

          {error && (
            <p className="font-mono text-[11px] text-[var(--text-muted)]">DATA UNAVAILABLE</p>
          )}

          {/* Grid — cards + inline full-width panel injected after the row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading
              ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
              : venues.map((v, i) => (
                  <>
                    <VenueCard
                      key={v.name}
                      venue={v}
                      isExpanded={expanded === v.name}
                      onToggle={() => toggleExpanded(v.name)}
                    />
                    {i === panelAfterIdx && expanded !== null && (
                      <div key="__intel_panel__" style={{ gridColumn: "1 / -1" }}>
                        <DeepIntelPanel venueName={expanded} />
                      </div>
                    )}
                  </>
                ))}
          </div>

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
