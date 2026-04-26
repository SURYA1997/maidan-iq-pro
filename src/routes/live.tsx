import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { MatchInfoCard } from "@/components/pitchiq/MatchInfoCard";
import { VenueInsightCard } from "@/components/pitchiq/VenueInsightCard";
import { LiveScorecard } from "@/components/pitchiq/LiveScorecard";
import { WinProbabilityBar } from "@/components/pitchiq/WinProbabilityBar";
import { MomentumGraph } from "@/components/pitchiq/MomentumGraph";
import { PressureIndex } from "@/components/pitchiq/PressureIndex";
import { MatchupOracle } from "@/components/pitchiq/MatchupOracle";
import { CommentaryFeed } from "@/components/pitchiq/CommentaryFeed";

export const Route = createFileRoute("/live")({
  component: LiveTerminal,
  head: () => ({
    meta: [
      { title: "MaidanIQ — Live Cricket Analytics Terminal" },
      {
        name: "description",
        content:
          "MaidanIQ live cricket analytics: win probability, pressure index, matchup oracle and AI commentary in real time.",
      },
    ],
  }),
});

/* ─── Mobile tab types ──────────────────────────────────────────────────── */

type MobileTab = "live" | "venue" | "matchup" | "agent";

const mobileTabs: Array<{ id: MobileTab; label: string }> = [
  { id: "live", label: "LIVE" },
  { id: "venue", label: "VENUE" },
  { id: "matchup", label: "MATCHUP" },
  { id: "agent", label: "AGENT" },
];

/* ─── Mobile sticky top bar ─────────────────────────────────────────────── */

function MobileLiveBar() {
  return (
    <div
      className="sticky top-12 z-20 flex items-center justify-between px-4 py-2 md:hidden"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="live-dot" aria-hidden />
        <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">
          CSK vs MI
        </span>
      </div>
      <span className="font-mono text-[10px] text-[var(--text-muted)]">Over 14.3</span>
    </div>
  );
}

/* ─── Mobile pill tab bar ───────────────────────────────────────────────── */

function MobilePillTabs({
  active,
  onChange,
}: {
  active: MobileTab;
  onChange: (t: MobileTab) => void;
}) {
  return (
    <div
      className="sticky top-[calc(3rem+37px)] z-20 flex gap-1 overflow-x-auto px-4 py-2 md:hidden"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        scrollbarWidth: "none",
      }}
    >
      {mobileTabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-shrink-0 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
            style={{
              background: isActive ? "var(--surface)" : "transparent",
              color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
              border: "1px solid",
              borderColor: isActive ? "var(--accent-primary)" : "var(--border)",
              borderBottom: isActive ? `2px solid var(--accent-primary)` : "1px solid var(--border)",
            }}
            aria-pressed={isActive}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Terminal page ─────────────────────────────────────────────────────── */

function LiveTerminal() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("live");
  const { isAuthenticated, isPaid, markMatchViewed } = useAuth();

  /* Track free match view once on mount for unpaid users */
  useEffect(() => {
    if (isAuthenticated && !isPaid) {
      markMatchViewed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount only

  return (
    <ProtectedRoute>
    <AppLayout pageName="LIVE" isMatchLive matchLabel="Chennai vs Mumbai">
      {/* Mobile: sticky match bar + pill tabs */}
      <MobileLiveBar />
      <MobilePillTabs active={mobileTab} onChange={setMobileTab} />

      {/*
        ─── Mobile layout (< 768px): single-column, tab-controlled ──────────
        ─── Tablet layout (768–1024px): 2-column grid ────────────────────────
        ─── Desktop layout (1024px+): 3-column grid ──────────────────────────
      */}
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 pb-20 md:pb-4">

        {/* ── DESKTOP / TABLET layout ─────────────────────────────────────── */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-4">

          {/* Left column */}
          <aside className="col-span-12 space-y-4 md:col-span-6 lg:col-span-3">
            <MatchInfoCard />
            <VenueInsightCard />
          </aside>

          {/* Center column */}
          <section className="col-span-12 space-y-4 md:col-span-6 lg:col-span-6">
            <LiveScorecard />
            <WinProbabilityBar />
            <MomentumGraph />
            <PressureIndex />
          </section>

          {/* Right column — stacks below on tablet */}
          <aside className="col-span-12 space-y-4 md:col-span-6 lg:col-span-3">
            <MatchupOracle />
            <CommentaryFeed />
          </aside>
        </div>

        {/* ── MOBILE layout: tab-controlled single column ─────────────────── */}
        <div className="space-y-4 md:hidden">
          {mobileTab === "live" && (
            <>
              <LiveScorecard />
              <WinProbabilityBar />
              <MomentumGraph />
              <PressureIndex />
            </>
          )}
          {mobileTab === "venue" && <VenueInsightCard />}
          {mobileTab === "matchup" && (
            <>
              <MatchInfoCard />
              <MatchupOracle />
            </>
          )}
          {mobileTab === "agent" && <CommentaryFeed />}
        </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
