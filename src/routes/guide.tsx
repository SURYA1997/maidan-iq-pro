import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/pitchiq/AppLayout";
import {
  Activity,
  BarChart2,
  Terminal,
  Crosshair,
  MapPin,
  Users,
  Zap,
  GitBranch,
} from "lucide-react";

export const Route = createFileRoute("/guide")({
  component: GuidePage,
  head: () => ({ meta: [{ title: "MaidanIQ — Intelligence Guide" }] }),
});

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface GuideCardData {
  name: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  summary: string;
  howToRead: string;
  howToUse: string;
  example: string;
}

interface FaqItem {
  q: string;
  a: string;
}

/* ─── Data ──────────────────────────────────────────────────────────────── */

const GUIDE_CARDS: GuideCardData[] = [
  {
    name: "PRESSURE INDEX",
    Icon: Activity,
    summary: "A 0–100 score measuring how much pressure the batting side is under right now.",
    howToRead:
      "Below 40: batting team is comfortable. 40–65: pressure building. 65–85: elevated — expect wickets or big overs. 85+: critical — match on the line.",
    howToUse:
      "If Pressure Index spikes suddenly, something just changed. Check the scorecard — a wicket fell or the required rate jumped.",
    example:
      "Chennai chasing 180. Over 15, score 98/3. Pressure Index: 78. The model sees danger before the commentators do.",
  },
  {
    name: "WIN PROBABILITY",
    Icon: BarChart2,
    summary: "The probability each team wins this match, updated every ball.",
    howToRead:
      "50/50 = anyone's game. 70/30 = one team has clear advantage. 90/10 = match is effectively over unless something dramatic happens.",
    howToUse:
      "Watch how it moves. A sudden 10% swing means a key moment just happened. Use it to gauge whether the match is worth watching.",
    example:
      "Mumbai 65% at over 12. Bumrah takes two wickets in over 13. Mumbai 84%. That's the match changing in real time.",
  },
  {
    name: "DEGEN AGENT",
    Icon: Terminal,
    summary:
      "An AI analyst watching the match with you, saying what the data actually means.",
    howToRead:
      "Each entry is one sharp insight about the current moment. Timestamps show the over and ball. Read top to bottom for the match narrative.",
    howToUse:
      "When you see a number change on screen, the Degen Agent explains why. It references historical context you won't find anywhere else.",
    example:
      "'Bumrah at Wankhede in the death: 6.2 economy historically. Tonight: 11.4. The model noticed before the crowd did.'",
  },
  {
    name: "MATCHUP ORACLE",
    Icon: Crosshair,
    summary:
      "15 years of ball-by-ball data showing how specific batsmen perform against specific bowling types.",
    howToRead:
      "Strike Rate shows scoring speed. Dismissal % shows how often they get out. Boundary % shows aggression. Dot Ball % shows how much they're dominated.",
    howToUse:
      "Before a key battle — check the Oracle. If a batsman has 28% dismissal rate against left-arm pace, and a left-arm pacer is bowling, expect a wicket.",
    example:
      "Kohli vs Left-Arm Pace at Chepauk: SR 142, Dismissal 18%, Boundary 21%. He scores freely but falls occasionally.",
  },
  {
    name: "VENUE INTELLIGENCE",
    Icon: MapPin,
    summary:
      "The statistical personality of each ground — what the data says about how this pitch behaves.",
    howToRead:
      "Average 1st innings score tells you what's par. Chase win % tells you if bowling first is the right call. Dew factor affects evening matches.",
    howToUse:
      "Check venue stats before the toss. If chase win % is 65% and it's an evening match with high dew factor, the team winning the toss should bowl first.",
    example:
      "Wankhede: avg 1st innings 166, chase win 51%. Balanced ground. Toss matters less here than at other venues.",
  },
  {
    name: "STRENGTH INTELLIGENCE",
    Icon: Users,
    summary:
      "MaidanIQ's contextual ratings for every player and team — based on performance when it matters, not career averages.",
    howToRead:
      "Higher score = performs better in high-pressure situations at key venues. A player with low overall average but high Strength score performs above expectations when the match is on the line.",
    howToUse:
      "Don't just look at career averages. Check Strength scores to find players who rise under pressure — they're the ones who win matches.",
    example:
      "A batsman averages 28 overall but has Strength score 84. He averages 47 in chases over 170. That's who you want at the crease.",
  },
  {
    name: "FANTASY INTELLIGENCE",
    Icon: Zap,
    summary:
      "Pre-match pick analysis for Dream11 and other fantasy platforms, powered by MaidanIQ's data.",
    howToRead:
      "Fantasy Value Score ranks players by predicted impact on tonight's specific match. SAFE = consistent performer. DIFFERENTIAL = high upside, some risk. AVOID = poor matchup tonight.",
    howToUse:
      "Use it 30 minutes before the match. Focus on DIFFERENTIAL picks for captain — they score big when they work. Build your core XI from SAFE picks.",
    example:
      "Bumrah: Fantasy Value 87, SAFE. 'At Chepauk historically: 2.1 wickets per game, economy 8.2. Take him every time.'",
  },
  {
    name: "MATCH STORY VIEW",
    Icon: GitBranch,
    summary:
      "The full visual narrative of any completed innings — who scored, when, against whom, and how the game evolved.",
    howToRead:
      "Read left to right — that's time. Each band is a partnership. Wicket markers show exactly when the innings changed. Over-by-over view shows scoring rate per over.",
    howToUse:
      "After a match, open Story View to understand what actually happened. Why did the innings collapse? When did the chase get away? The answer is in the timeline.",
    example:
      "Chennai lost by 8 runs. Story View shows: over 14 partnership of 67 ended with a run out. That's where the match was lost.",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "Is MaidanIQ affiliated with BCCI or IPL?",
    a: "No. MaidanIQ is an independent analytics platform. All analysis is for entertainment and informational purposes only.",
  },
  {
    q: "Where does the data come from?",
    a: "Historical data from Cricsheet.org (open licensed). Live data from Entity Sports API. AI commentary powered by Claude (Anthropic).",
  },
  {
    q: "How accurate is the Win Probability?",
    a: "The model is trained on 1,193 IPL matches spanning 15 years. It's directionally accurate but not a guarantee. Cricket surprises everyone, including the model.",
  },
  {
    q: "What is the Pressure Index based on?",
    a: "Required Run Rate vs Current Run Rate, wickets lost, balls remaining, and historical venue averages. It's a composite score, not just RRR.",
  },
  {
    q: "Can I use MaidanIQ for betting?",
    a: "MaidanIQ is for cricket analysis and entertainment only. We don't facilitate, encourage, or endorse betting of any kind.",
  },
];

/* ─── Guide card ─────────────────────────────────────────────────────────── */

function GuideCard({ card }: { card: GuideCardData }) {
  return (
    <div
      className="rounded-none bg-[#0F1117]"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: "2px solid var(--accent-primary)",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span style={{ color: "var(--accent-primary)" }}>
          <card.Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        </span>
        <h2
          className="font-mono text-[14px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--accent-primary)" }}
        >
          {card.name}
        </h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Summary */}
        <p className="text-[14px] leading-relaxed" style={{ color: "#F0F0F0" }}>
          {card.summary}
        </p>

        {/* How to read */}
        <div>
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "#6B7280" }}>
            HOW TO READ IT
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "#D1D5DB" }}>
            {card.howToRead}
          </p>
        </div>

        {/* How to use */}
        <div>
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "#6B7280" }}>
            HOW TO USE IT
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "#D1D5DB" }}>
            {card.howToUse}
          </p>
        </div>

        {/* Example */}
        <div
          className="px-3 py-2.5"
          style={{ background: "rgba(255,107,0,0.05)", borderLeft: "2px solid var(--accent-primary)" }}
        >
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "var(--accent-primary)" }}>
            EXAMPLE
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "#F0F0F0" }}>
            {card.example}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ accordion ──────────────────────────────────────────────────────── */

function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {faqs.map((f, i) => (
        <div
          key={i}
          className="rounded-none"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-white/[0.02]"
          >
            <span className="font-mono text-[13px] font-medium" style={{ color: "#F0F0F0" }}>
              {f.q}
            </span>
            <span
              className="ml-4 shrink-0 font-mono text-[16px] transition-transform"
              style={{
                color: "#6B7280",
                transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-4 pb-4">
              <p className="text-[13px] leading-relaxed" style={{ color: "#9CA3AF" }}>
                {f.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

function GuidePage() {
  return (
    <AppLayout pageName="GUIDE">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-8 pb-20 lg:pb-8">

        {/* Header */}
        <div className="mb-10">
          <h1
            className="font-mono text-[28px] font-black uppercase tracking-[0.06em] leading-tight"
            style={{ color: "#F0F0F0" }}
          >
            INTELLIGENCE GUIDE
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed" style={{ color: "#6B7280" }}>
            Everything MaidanIQ shows you, explained. No cricket analytics experience needed.
          </p>
        </div>

        {/* Guide cards grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {GUIDE_CARDS.map((card) => (
            <GuideCard key={card.name} card={card} />
          ))}
        </div>

        {/* FAQ section */}
        <div className="mt-12">
          <h2
            className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            FREQUENTLY ASKED
          </h2>
          <div
            className="rounded-none bg-[#0F1117]"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "2px solid var(--accent-primary)",
            }}
          >
            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
