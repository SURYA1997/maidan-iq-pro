import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Radio, Calendar, BookOpen, Users, Crosshair, MapPin, Zap, HelpCircle,
} from "lucide-react";
import { searchPlayers, type PlayerSearchResult } from "@/services/api";

interface AppHeaderProps {
  isMatchLive?: boolean;
  matchLabel?: string;
}

const NAV_ITEMS = [
  { label: "LIVE",    to: "/live",    icon: Radio },
  { label: "MATCHES", to: "/matches", icon: Calendar },
  { label: "STORY",   to: "/story",   icon: BookOpen },
  { label: "SQUADS",  to: "/squads",  icon: Users },
  { label: "MATCHUP", to: "/matchup", icon: Crosshair },
  { label: "VENUES",  to: "/venues",  icon: MapPin },
  { label: "FANTASY", to: "/fantasy", icon: Zap },
  { label: "GUIDE",   to: "/guide",   icon: HelpCircle },
] as const;

/* ─── Player search ──────────────────────────────────────────────────────── */

function PlayerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 3) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const t = setTimeout(() => {
      searchPlayers(query)
        .then((r) => { setResults(r); setOpen(true); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function pick(name: string) {
    setQuery("");
    setOpen(false);
    navigate({ to: "/player/$playerName", params: { playerName: encodeURIComponent(name) } });
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="SEARCH PLAYER..."
        className="w-40 lg:w-48 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] outline-none transition-all"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          caretColor: "var(--accent-primary)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px]" style={{ color: "#6B7280" }}>…</div>
      )}
      {open && results.length > 0 && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden"
          style={{ background: "#0F1117", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
        >
          {results.map((r) => (
            <button
              key={r.registry_id}
              onClick={() => pick(r.name)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div>
                <div className="font-mono text-[12px] font-bold" style={{ color: "#F0F0F0" }}>{r.name}</div>
                <div className="font-mono text-[9px]" style={{ color: "#6B7280" }}>
                  {r.matches}m · {r.batting_runs}r · {r.bowling_wickets}w
                </div>
              </div>
              <span className="font-mono text-[9px]" style={{ color: "var(--accent-primary)" }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────────── */

export function AppHeader({
  isMatchLive = true,
  matchLabel = "Chennai vs Mumbai",
}: AppHeaderProps) {
  const [time, setTime] = useState(() => formatTime(new Date()));
  const { location } = useRouterState();
  const currentPath = location.pathname;

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex h-12 items-center justify-between px-4 gap-4"
      style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Left — logo */}
      <Link
        to="/live"
        className="shrink-0 font-mono text-[13px] font-bold tracking-[0.25em]"
        style={{ color: "var(--accent-primary)" }}
        aria-label="MaidanIQ home"
      >
        MIQ
      </Link>

      {/* Center — nav links (hidden on mobile) */}
      <nav className="hidden lg:flex items-center gap-0 overflow-x-auto" aria-label="Main navigation">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const isActive = currentPath === to || (to === "/live" && currentPath === "/terminal");
          const isGuide = label === "GUIDE";
          return (
            <Link
              key={to}
              to={to}
              className="relative flex h-12 items-center gap-1.5 px-3 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition-colors whitespace-nowrap"
              style={{
                color: isActive ? "#FF6B00" : "#9CA3AF",
                borderBottom: isActive ? "2px solid #FF6B00" : "2px solid transparent",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {isGuide && (
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={isActive ? 2 : 1.5} style={{ color: isActive ? "#FF6B00" : "#9CA3AF" }} />
              )}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right — search + live + clock + avatar */}
      <div className="flex shrink-0 items-center gap-3">
        <PlayerSearch />
        {isMatchLive ? (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="live-dot" aria-hidden />
            <span className="font-mono text-[10px] text-[var(--text-muted)]">{matchLabel}</span>
          </div>
        ) : (
          <span className="hidden font-mono text-[10px] text-[var(--text-muted)] sm:block">NO LIVE MATCH</span>
        )}
        <span className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">{time}</span>
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[10px] font-bold"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          aria-label="User avatar"
        >
          U
        </div>
      </div>
    </header>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour12: false });
}
