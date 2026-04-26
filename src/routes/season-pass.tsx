import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/season-pass")({
  component: SeasonPassPage,
  head: () => ({
    meta: [
      { title: "Season Pass — MaidanIQ" },
      {
        name: "description",
        content:
          "One-time ₹499 IPL 2026 Season Pass. Full access to Pressure Index, Matchup Oracle and Degen Agent. No subscription, no renewal.",
      },
      { property: "og:title", content: "Season Pass — MaidanIQ" },
      {
        property: "og:description",
        content:
          "Pay once. Watch every IPL 2026 match through the MaidanIQ terminal.",
      },
    ],
  }),
});

/* ------------------------------ shared bits ----------------------------- */

const SECTION_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-primary)]";

const INCLUDED: string[] = [
  "Full access to all remaining IPL 2026 matches",
  "Live Pressure Index — updated every ball",
  "Matchup Oracle — 15 years of ball-by-ball data",
  "Degen Agent — AI commentary, live",
  "Venue Intelligence — dew, pitch, dimensions",
  "Season expires: May 26, 2026",
];

const UPCOMING: { name: string }[] = [
  { name: "ICC T20 World Cup 2026" },
  { name: "Asia Cup 2026" },
  { name: "India Home Series" },
];

/* --------------------------------- top bar ------------------------------ */

function TopBar() {
  return (
    <header className="hairline-b sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-5">
        <Link
          to="/"
          className="font-mono text-[13px] font-semibold tracking-[0.18em] text-[var(--accent-primary)]"
        >
          MAIDANIQ
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[11px] text-muted sm:inline">
            user@maidaniq.in
          </span>
          <div className="flex h-7 w-7 items-center justify-center border border-[var(--border)] bg-[#0F1117] font-mono text-[11px] text-[var(--text-primary)]">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

/* -------------------------- 1. current season --------------------------- */

function CurrentSeasonSection() {
  return (
    <section className="mx-auto w-full max-w-[1100px] px-5 pt-16 pb-20 md:pt-24">
      <div className={SECTION_LABEL}>ACTIVE SEASON // IPL 2026</div>

      <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] md:text-6xl">
        Your Pass to the Terminal.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        Full access to every IPL 2026 match. Pressure Index, Matchup Oracle,
        Degen Agent — live, every ball.
      </p>

      {/* Free pass card */}
      <div
        className="mt-10 border border-[var(--border)] bg-[#0F1117] p-5 md:p-6"
        style={{ borderLeftColor: "#22C55E", borderLeftWidth: "2px" }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#22C55E]">
          FREE PASS // INCLUDED
        </div>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-sm text-[var(--text-primary)]/85">
            2 matches included with every account. No payment needed.
          </p>
          <div className="font-mono text-2xl tracking-tight text-[var(--text-primary)] md:text-3xl">
            2 OF 2 REMAINING
          </div>
        </div>
      </div>

      {/* Season pass card */}
      <div
        className="mt-5 border border-[var(--border)] bg-[#0F1117]"
        style={{ borderLeftColor: "var(--accent-primary)", borderLeftWidth: "2px" }}
      >
        <div className="p-6 md:p-8">
          <div className={SECTION_LABEL}>IPL 2026 SEASON PASS</div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-6xl font-bold leading-none tracking-tight text-[var(--text-primary)] md:text-7xl">
              ₹499
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">
            One-time · No subscription · No renewal
          </p>
        </div>

        <div className="hairline-t" />

        <ul className="space-y-3 p-6 md:p-8">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--accent-primary)" }}
                strokeWidth={2.25}
              />
              <span className="text-[14px] leading-relaxed text-[var(--text-primary)]/90">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="hairline-t" />

        <div className="p-6 md:p-8">
          <button
            type="button"
            className="w-full rounded-none bg-[var(--accent-primary)] px-6 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90"
          >
            GET SEASON PASS — ₹499
          </button>
          <p className="mt-3 text-center font-mono text-[11px] text-muted">
            Secured by Razorpay · INR · UPI accepted
          </p>
          <p className="mt-1 text-center font-mono text-[10px] tracking-wide text-muted/70">
            Powered by Razorpay
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- 2. upcoming seasons -------------------------- */

function UpcomingSeasonsSection() {
  return (
    <section className="mx-auto w-full max-w-[1100px] px-5 py-16">
      <div className={SECTION_LABEL}>ON THE HORIZON</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {UPCOMING.map((u) => (
          <div
            key={u.name}
            className="flex flex-col border border-[var(--border)] bg-[#0F1117] p-5"
            style={{ borderLeftColor: "#374151", borderLeftWidth: "2px" }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              COMING SOON
            </div>
            <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
              {u.name}
            </h3>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
              Season pass pricing announced closer to tournament.
            </p>
            <button
              type="button"
              className="mt-5 self-start rounded-none border border-[var(--accent-primary)] bg-transparent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary)] hover:text-black"
            >
              NOTIFY ME
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[13px] text-muted">
        Each tournament gets its own season pass. Fresh access, fresh price. No
        auto-renewals ever.
      </p>
    </section>
  );
}

/* ------------------------ 3. free pass explainer ------------------------ */

function FreePassExplainerSection() {
  return (
    <section className="hairline-t hairline-b w-full bg-[#0F1117]">
      <div className="mx-auto max-w-[1100px] px-5 py-12 md:py-16">
        <div className={`${SECTION_LABEL} text-center`}>HOW FREE PASSES WORK</div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
          <div className="text-center md:text-left">
            <div
              className="font-mono text-7xl font-bold leading-none tracking-tight md:text-8xl"
              style={{ color: "var(--accent-primary)" }}
            >
              2
            </div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-primary)]">
              Free matches included
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Every account gets 2 full match experiences at no cost. Full
              terminal access, no features locked.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div
              className="font-mono text-7xl font-bold leading-none tracking-tight md:text-8xl"
              style={{ color: "var(--accent-primary)" }}
            >
              1
            </div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-primary)]">
              Season pass, one time
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              After your free passes, one payment unlocks every remaining match
              this season. Pay once, watch everything.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- footer -------------------------------- */

function Footer() {
  return (
    <footer className="hairline-t bg-[var(--bg)]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-2 px-5 py-4 text-center md:grid-cols-3 md:text-left">
        <div className="font-mono text-[10px] tracking-wide text-muted">
          MAIDANIQ · V0.1
        </div>
        <div className="font-mono text-[10px] tracking-wide text-muted md:text-center">
          Not affiliated with BCCI or any cricket board. AI analysis for
          entertainment and informational purposes only.
        </div>
        <div />
      </div>
    </footer>
  );
}

/* ---------------------------------- page -------------------------------- */

function SeasonPassPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <TopBar />
      <main className="flex-1">
        <CurrentSeasonSection />
        <UpcomingSeasonsSection />
        <FreePassExplainerSection />
      </main>
      <Footer />
    </div>
  );
}
