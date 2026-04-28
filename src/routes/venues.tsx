import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { MetricTooltip } from "@/components/pitchiq/InfoTip";
import { getVenues, getVenue, getVenueIntelligence, type VenueSummary, type VenueDetail, type VenueIntelligence } from "@/services/api";

export const Route = createFileRoute("/venues")({
  component: VenuesPage,
  head: () => ({ meta: [{ title: "MaidanIQ — Venues" }] }),
});

/* ─── Skeleton ──────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-none bg-[var(--surface)] p-4"
      style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--border)" }}
    >
      <div className="mb-2 h-4 w-2/3 rounded-none bg-white/5" />
      <div className="mb-4 h-3 w-1/3 rounded-none bg-white/5" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-none bg-white/5" />
        <div className="h-3 w-4/5 rounded-none bg-white/5" />
        <div className="h-3 w-3/5 rounded-none bg-white/5" />
      </div>
    </div>
  );
}

/* ─── Venue list card ───────────────────────────────────────────────────── */

function VenueCard({
  venue,
  onClick,
  selected,
}: {
  venue: VenueSummary;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-none bg-[var(--surface)] p-4 transition-colors"
      style={{
        border: "1px solid var(--border)",
        borderLeft: `2px solid ${selected ? "var(--accent-primary)" : "var(--accent-primary)"}`,
        background: selected ? "rgba(255,107,0,0.06)" : "var(--surface)",
        outline: "none",
      }}
    >
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
        <Stat label="AVG 1ST" value={String(Math.round(venue.avg_first_innings_score))} />
        <Stat label="CHASE WIN" value={`${venue.chase_win_pct.toFixed(0)}%`} />
        <Stat label="MATCHES" value={String(venue.total_matches)} />
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="font-mono text-base font-bold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

/* ─── Venue detail panel ────────────────────────────────────────────────── */

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

  if (loading) {
    return (
      <div className="space-y-2 px-4 py-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded-none bg-white/5" />)}
      </div>
    );
  }

  if (unavailable || !intel) {
    return (
      <div className="px-4 py-4 font-mono text-[11px]" style={{ color: "#6B7280" }}>
        DEEP INTELLIGENCE NOT YET AVAILABLE FOR THIS VENUE
      </div>
    );
  }

  const batFirst = intel.toss.bat_first_win_pct;
  const bowlFirst = intel.toss.bowl_first_win_pct;
  const bestCall = bowlFirst > batFirst ? "BOWL FIRST" : "BAT FIRST";

  return (
    <div className="divide-y px-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      {/* Toss intelligence */}
      <div className="py-4">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>TOSS INTELLIGENCE</div>
        <div className="flex gap-3 mb-2">
          <div className="flex-1 rounded-none p-3 text-center"
            style={{ border: `1px solid ${batFirst >= bowlFirst ? "var(--accent-primary)" : "rgba(255,255,255,0.08)"}`, background: "#0F1117" }}>
            <div className="font-mono text-[18px] font-black" style={{ color: "var(--accent-primary)" }}>{batFirst.toFixed(1)}%</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] mt-1" style={{ color: "#6B7280" }}>BAT FIRST</div>
          </div>
          <div className="flex-1 rounded-none p-3 text-center"
            style={{ border: `1px solid ${bowlFirst > batFirst ? "var(--accent-primary)" : "rgba(255,255,255,0.08)"}`, background: "#0F1117" }}>
            <div className="font-mono text-[18px] font-black" style={{ color: "var(--accent-primary)" }}>{bowlFirst.toFixed(1)}%</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] mt-1" style={{ color: "#6B7280" }}>BOWL FIRST</div>
          </div>
        </div>
        <div className="font-mono text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>BEST CALL: {bestCall}</div>
      </div>

      {/* Home advantage */}
      {intel.home_teams?.length > 0 && (
        <div className="py-4">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>HOME ADVANTAGE // top teams</div>
          {intel.home_teams.slice(0, 3).map((t) => (
            <div key={t.team} className="flex items-center justify-between py-1.5">
              <span className="font-mono text-[12px] font-bold" style={{ color: "var(--accent-primary)" }}>{t.team}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>{t.win_pct.toFixed(0)}%</span>
                <span className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{t.matches}M</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Venue kings */}
      {intel.venue_kings?.length > 0 && (
        <div className="py-4">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>VENUE KINGS // MOTM leaders</div>
          {intel.venue_kings.slice(0, 5).map((k, i) => (
            <div key={k.player} className="flex items-center justify-between py-1.5">
              <span className="font-mono text-[12px]" style={{ color: "#F0F0F0" }}>{k.player}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[13px] font-bold" style={{ color: "var(--accent-primary)" }}>{k.motm_count}</span>
                <span>🏆</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VenueDetailPanel({ venueName, onClose }: { venueName: string; onClose: () => void }) {
  const [detail, setDetail] = useState<VenueDetail | null>(null);
  const [error, setError] = useState(false);
  const [showDeepIntel, setShowDeepIntel] = useState(false);

  useEffect(() => {
    setDetail(null);
    setError(false);
    setShowDeepIntel(false);
    getVenue(venueName)
      .then(setDetail)
      .catch(() => setError(true));
  }, [venueName]);

  return (
    <div
      className="rounded-none bg-[var(--surface)]"
      style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--accent-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <div
            className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--accent-primary)" }}
          >
            {venueName}
          </div>
        </div>
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
        {detail && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DetailStat
              label="AVG 1ST INNINGS"
              value={String(Math.round(detail.avg_first_innings_score))}
              tip="Mean first-innings total across all matches at this venue."
            />
            <DetailStat
              label="AVG 2ND INNINGS"
              value={String(Math.round(detail.avg_second_innings_score))}
              tip="Mean second-innings total. Compare with 1st innings to gauge chase difficulty."
            />
            <DetailStat
              label="CHASE WIN %"
              value={`${detail.chase_win_pct.toFixed(1)}%`}
              tip="Percentage of matches won by the chasing team at this ground."
            />
            <DetailStat
              label="HIGHEST SCORE"
              value={String(detail.highest_score)}
              tip="Highest total ever recorded at this venue in T20 cricket."
            />
            <DetailStat
              label="LOWEST SCORE"
              value={String(detail.lowest_score)}
              tip="Lowest completed innings at this venue — the floor teams defend to."
            />
            <DetailStat
              label="AVG POWERPLAY"
              value={String(Math.round(detail.avg_powerplay_score))}
              tip="Average runs scored in the first 6 overs at this ground."
            />
            <DetailStat
              label="TOTAL MATCHES"
              value={String(detail.total_matches)}
              tip="Total IPL matches played at this venue in the dataset."
            />
          </div>
        )}

        {/* Deep intel toggle */}
        {detail && (
          <div className="mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <button
              onClick={() => setShowDeepIntel((v) => !v)}
              className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition-opacity hover:opacity-70"
              style={{ color: showDeepIntel ? "#6B7280" : "var(--accent-primary)" }}
            >
              {showDeepIntel ? "HIDE INTEL ×" : "DEEP INTEL →"}
            </button>
          </div>
        )}
      </div>

      {/* Deep intel section */}
      {showDeepIntel && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <DeepIntelPanel venueName={venueName} />
        </div>
      )}
    </div>
  );
}

function DetailStat({
  label,
  value,
  tip,
}: {
  label: string;
  value: string;
  tip: string;
}) {
  return (
    <div
      className="p-3"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
    >
      <div className="mb-1 flex items-center gap-1">
        <span className="label-mono">{label}</span>
        <MetricTooltip text={tip} />
      </div>
      <div className="font-mono text-xl font-black text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function VenuesPage() {
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getVenues()
      .then((v) => {
        setVenues(v);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <ProtectedRoute>
    <AppLayout pageName="VENUES">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-20 lg:pb-6">
        {/* Page heading */}
        <div className="mb-6">
          <h1
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-primary)" }}
          >
            VENUES
          </h1>
          <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
            {venues.length > 0 ? `${venues.length} grounds · all-time IPL data` : "loading…"}
          </p>
        </div>

        {error && (
          <p className="font-mono text-[11px] text-[var(--text-muted)]">DATA UNAVAILABLE</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
            : venues.map((v) => (
                <VenueCard
                  key={v.name}
                  venue={v}
                  selected={selected === v.name}
                  onClick={() => setSelected(selected === v.name ? null : v.name)}
                />
              ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="mt-6">
            <VenueDetailPanel venueName={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
