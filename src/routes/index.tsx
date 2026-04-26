import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Crosshair, Terminal, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "MaidanIQ — The Match Behind The Match" },
      {
        name: "description",
        content:
          "Real-time cricket intelligence for IPL 2026. AI that reads the game, not just the scoreboard. Pressure Index, Matchup Oracle, Degen Agent — every ball.",
      },
      { property: "og:title", content: "MaidanIQ — The Match Behind The Match" },
      {
        property: "og:description",
        content:
          "Real-time cricket intelligence. AI that reads the game, not just the scoreboard.",
      },
    ],
  }),
});

/* ─── Shared bits ───────────────────────────────────────────────────────── */

const COMMENTARY = [
  {
    ts: "14.3",
    text: "Bumrah to Dhoni. This isn't a game anymore. It's a hostage situation.",
  },
  {
    ts: "14.1",
    text: "Slower bouncer. Beats the bat. Crowd notices before the scoreboard does.",
  },
  {
    ts: "13.6",
    text: "Chennai +4% on win prob. The model doesn't panic. Should you?",
  },
];

function CTAButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      to="/live"
      className="inline-flex items-center gap-2 rounded-none px-6 py-3 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90"
      style={{ background: "var(--accent-primary)" }}
    >
      {children}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono text-[11px] font-medium uppercase tracking-[0.22em]"
      style={{ color: "var(--accent-primary)" }}
    >
      {children}
    </div>
  );
}

/* ─── Hero card ─────────────────────────────────────────────────────────── */

function HeroTerminalCard() {
  const loop = [...COMMENTARY, ...COMMENTARY];

  return (
    <div
      className="rounded-none bg-[#0F1117]"
      style={{
        border: "1px solid var(--border)",
        borderLeft: "2px solid var(--accent-primary)",
      }}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-baseline gap-2">
          <span className="label-mono text-white/80">CHENNAI vs MUMBAI</span>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">// over 14.3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="live-dot" aria-hidden />
          <span
            className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ color: "var(--live)" }}
          >
            live
          </span>
        </div>
      </div>

      {/* body */}
      <div className="space-y-4 p-4">
        {/* win prob */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label-mono">Model Probability</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">live</span>
          </div>
          <div
            className="flex h-2 w-full overflow-hidden rounded-none"
            style={{ border: "1px solid var(--border)" }}
          >
            <div
              className="h-full"
              style={{ width: "62%", backgroundColor: "var(--accent-primary)" }}
            />
            <div className="h-full" style={{ width: "38%", backgroundColor: "#1A3A5C" }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono text-sm font-bold">
            <span style={{ color: "var(--accent-primary)" }}>CHE 62%</span>
            <span style={{ color: "#5B8FBF" }}>MUM 38%</span>
          </div>
        </div>

        {/* commentary auto-scroll */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label-mono">Degen Agent</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">streaming</span>
          </div>
          <div
            className="relative h-[140px] overflow-hidden bg-black/30"
            style={{ border: "1px solid var(--border)" }}
          >
            <ol className="scroll-up">
              {loop.map((l, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[40px_1fr] gap-3 px-3 py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span
                    className="font-mono text-[11px] tabular-nums"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {l.ts}
                  </span>
                  <span className="text-[12px] leading-relaxed text-white/90">{l.text}</span>
                </li>
              ))}
            </ol>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#0F1117] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#0F1117] to-transparent" />
          </div>
        </div>

        {/* pressure index */}
        <div
          className="flex items-end justify-between pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            <div className="label-mono mb-1">Pressure Index</div>
            <div className="font-mono text-[10px] text-[var(--text-muted)]">0—100 · live</div>
          </div>
          <div
            className="font-mono text-[64px] font-black leading-none tabular-nums"
            style={{ color: "var(--accent-primary)" }}
          >
            74
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sections ──────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      className="relative min-h-screen"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-10 lg:px-10">
        {/* left 60 */}
        <div className="lg:col-span-7">
          <SectionLabel>IPL 2026 · Live Analytics</SectionLabel>
          <h1 className="mt-6 text-[clamp(44px,7vw,88px)] font-bold leading-[0.95] tracking-tight text-[#F0F0F0]">
            The Match.
            <br />
            Behind The Match.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-[#6B7280]">
            Real-time cricket intelligence. AI that reads the game, not just the scoreboard.
          </p>
          <div className="mt-10">
            <CTAButton>
              Open Terminal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </CTAButton>
          </div>
        </div>

        {/* right 40 */}
        <div className="lg:col-span-5">
          <HeroTerminalCard />
        </div>
      </div>
    </section>
  );
}

function Features() {
  const blocks = [
    {
      Icon: Activity,
      title: "Pressure Index",
      body: "A real-time score that quantifies how much heat is on the batting side. Factors in required run rate, wickets lost, and historical venue data. Updated every ball.",
    },
    {
      Icon: Crosshair,
      title: "Matchup Oracle",
      body: "15 years of ball-by-ball data distilled into one view. See exactly how a batsman performs against a specific bowling type, at this venue, in this phase of the game.",
    },
    {
      Icon: Terminal,
      title: "Degen Agent",
      body: "An AI that watches the match with you and says what everyone's thinking. Sharp, analytical, occasionally ruthless. Refreshes every ball.",
    },
  ];

  return (
    <section className="bg-[var(--bg)]" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel>What MaidanIQ Reads</SectionLabel>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {blocks.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-none bg-[#0F1117] p-6"
              style={{
                border: "1px solid var(--border)",
                borderLeft: "2px solid var(--accent-primary)",
              }}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={1.5}
                style={{ color: "var(--accent-primary)" }}
              />
              <h3 className="mt-5 font-mono text-[15px] font-semibold uppercase tracking-[0.06em] text-[#F0F0F0]">
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TickerStrip() {
  const items = [
    "PRESSURE INDEX",
    "MATCHUP ORACLE",
    "DEGEN AGENT",
    "WIN PROBABILITY",
    "VENUE INTELLIGENCE",
    "BALL-BY-BALL ANALYSIS",
  ];
  const row = [...items, ...items, ...items, ...items];

  return (
    <section
      className="overflow-hidden"
      style={{ backgroundColor: "var(--accent-primary)", borderTop: "1px solid rgba(0,0,0,0.2)" }}
      aria-label="MaidanIQ ticker"
    >
      <div className="flex whitespace-nowrap py-3.5">
        <div className="marquee-x flex shrink-0">
          {row.map((t, i) => (
            <span
              key={i}
              className="px-6 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-black"
            >
              {t} <span className="opacity-60">·</span>
            </span>
          ))}
        </div>
        <div className="marquee-x flex shrink-0" aria-hidden>
          {row.map((t, i) => (
            <span
              key={i}
              className="px-6 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-black"
            >
              {t} <span className="opacity-60">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Mini card for terminal preview ───────────────────────────────────── */

function MiniCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-none bg-[#0F1117]"
      style={{
        border: "1px solid var(--border)",
        borderLeft: "2px solid var(--accent-primary)",
      }}
    >
      <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="label-mono text-white/80">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function TerminalPreviewMock() {
  return (
    <div
      className="rounded-none bg-[var(--bg)] p-4 lg:p-6"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* mock top bar */}
      <div
        className="mb-4 flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="font-mono text-[12px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--accent-primary)" }}
        >
          MAIDANIQ
        </span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          LIVE: CHENNAI vs MUMBAI — Over 14.3
        </span>
        <div className="flex items-center gap-1.5">
          <span className="live-dot" aria-hidden />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--live)" }}
          >
            LIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 min-w-[960px]">
        {/* LEFT */}
        <div className="col-span-3 space-y-3">
          <MiniCard title="MATCH">
            <dl className="space-y-1.5 font-mono text-[11px]">
              {[
                ["Teams", "CHE vs MUM"],
                ["Venue", "Chennai"],
                ["Toss", "MUM · bowl"],
                ["Innings", "1st"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{k}</span>
                  <span className="text-white/90">{v}</span>
                </div>
              ))}
            </dl>
          </MiniCard>
          <MiniCard title="VENUE">
            <dl className="space-y-1.5 font-mono text-[11px]">
              {[
                ["Avg 1st inns", "172"],
                ["Dew factor", "High"],
                ["Boundaries", "Large"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{k}</span>
                  <span className="text-white/90">{v}</span>
                </div>
              ))}
            </dl>
          </MiniCard>
        </div>

        {/* CENTER */}
        <div className="col-span-6 space-y-3">
          <MiniCard title="SCORECARD">
            <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="col-span-4 mb-1 text-[var(--text-muted)]">Batsmen</div>
              <div className="col-span-2 text-white/90">Dhoni*</div>
              <div className="text-right text-white/90">42 (28)</div>
              <div className="text-right font-bold" style={{ color: "var(--accent-primary)" }}>
                SR 150
              </div>
              <div className="col-span-2 text-white/90">Jadeja</div>
              <div className="text-right text-white/90">18 (14)</div>
              <div className="text-right font-bold" style={{ color: "var(--accent-primary)" }}>
                SR 128
              </div>
              <div className="col-span-4 mb-1 mt-2 text-[var(--text-muted)]">Bowler</div>
              <div className="col-span-2 text-white/90">Bumrah</div>
              <div className="text-right text-white/90">3.3—24</div>
              <div className="text-right text-white/90">1 W</div>
            </div>
          </MiniCard>
          <MiniCard title="WIN PROBABILITY">
            <div
              className="flex h-2 w-full overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="h-full"
                style={{ width: "62%", backgroundColor: "var(--accent-primary)" }}
              />
              <div className="h-full" style={{ width: "38%", backgroundColor: "#1A3A5C" }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-sm font-bold">
              <span style={{ color: "var(--accent-primary)" }}>CHE 62%</span>
              <span style={{ color: "#5B8FBF" }}>MUM 38%</span>
            </div>
          </MiniCard>
          <MiniCard title="MOMENTUM">
            <svg viewBox="0 0 300 80" className="h-20 w-full" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M30 0 L0 0 0 20"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="300" height="80" fill="url(#grid)" />
              <polyline
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.5"
                points="0,55 30,52 60,60 90,48 120,42 150,38 180,45 210,30 240,28 270,22 300,20"
              />
            </svg>
          </MiniCard>
        </div>

        {/* RIGHT */}
        <div className="col-span-3 space-y-3">
          <MiniCard title="MATCHUP ORACLE">
            <div className="mb-2 font-mono text-[11px] text-white/90">Dhoni vs Pace</div>
            <dl className="space-y-1.5 font-mono text-[11px]">
              {[
                ["SR", "142"],
                ["Dismissal %", "18%"],
                ["Avg", "54"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{k}</span>
                  <span className="font-bold" style={{ color: "var(--accent-primary)" }}>
                    {v}
                  </span>
                </div>
              ))}
            </dl>
          </MiniCard>
          <MiniCard title="DEGEN AGENT">
            <ol className="space-y-2">
              {COMMENTARY.map((l, i) => (
                <li key={i} className="grid grid-cols-[34px_1fr] gap-2">
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {l.ts}
                  </span>
                  <span className="text-[11px] leading-snug text-white/85">{l.text}</span>
                </li>
              ))}
            </ol>
          </MiniCard>
        </div>
      </div>
    </div>
  );
}

function TerminalPreviewSection() {
  return (
    <section className="bg-[var(--bg)]" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel>The Terminal</SectionLabel>
        <div
          className="saffron-top-glow mt-8 overflow-x-auto"
          style={{ borderTop: "2px solid var(--accent-primary)" }}
        >
          <TerminalPreviewMock />
        </div>
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Live during every IPL match.
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      className="flex min-h-screen items-center justify-center bg-[var(--bg)]"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="mx-auto w-full max-w-[820px] px-6 py-24 text-center lg:px-10">
        <h2 className="text-[clamp(36px,5.5vw,68px)] font-bold leading-[1.05] tracking-tight text-[#F0F0F0]">
          The game is already in motion.
        </h2>
        <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-relaxed text-[#6B7280]">
          Open the terminal. See what the scoreboard doesn't show you.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton>
            Open Terminal <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </CTAButton>
        </div>
        <p className="mt-6 font-mono text-[11px] tracking-wide text-[#6B7280]/80">
          No account needed to explore · Analytics only · Built for cricket, not casinos.
        </p>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-[var(--bg)]" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-3 px-6 py-5 font-mono text-[11px] text-[#6B7280] md:grid-cols-3 lg:px-10">
        <div className="md:text-left">MAIDANIQ · V0.1</div>
        <div className="text-center">
          AI analysis is for entertainment and informational purposes only. Not affiliated with
          BCCI or any cricket board.
        </div>
        <div />
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function LandingPage() {
  return (
    <div className="bg-[var(--bg)] text-[var(--text-primary)]">
      <Hero />
      <Features />
      <TickerStrip />
      <TerminalPreviewSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
