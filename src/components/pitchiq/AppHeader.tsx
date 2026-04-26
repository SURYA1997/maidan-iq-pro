import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Radio,
  BookOpen,
  Users,
  Crosshair,
  MapPin,
  Zap,
} from "lucide-react";

interface AppHeaderProps {
  isMatchLive?: boolean;
  matchLabel?: string;
}

const NAV_ITEMS = [
  { label: "LIVE",    to: "/live",    icon: Radio },
  { label: "STORY",   to: "/story",   icon: BookOpen },
  { label: "SQUADS",  to: "/squads",  icon: Users },
  { label: "MATCHUP", to: "/matchup", icon: Crosshair },
  { label: "VENUES",  to: "/venues",  icon: MapPin },
  { label: "FANTASY", to: "/fantasy", icon: Zap },
] as const;

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
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left — logo (always visible) */}
      <Link
        to="/live"
        className="shrink-0 font-mono text-[13px] font-bold tracking-[0.25em]"
        style={{ color: "var(--accent-primary)" }}
        aria-label="MaidanIQ home"
      >
        MIQ
      </Link>

      {/* Center — nav links (hidden on mobile, shown md+) */}
      <nav
        className="hidden md:flex items-center gap-0"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ label, to }) => {
          const isActive =
            currentPath === to ||
            (to === "/live" && currentPath === "/terminal");
          return (
            <Link
              key={to}
              to={to}
              className="relative flex h-12 items-center px-4 font-mono text-[13px] font-medium uppercase tracking-[0.08em] transition-colors"
              style={{
                color: isActive ? "#FF6B00" : "#9CA3AF",
                borderBottom: isActive
                  ? "2px solid #FF6B00"
                  : "2px solid transparent",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right — live indicator + clock + avatar */}
      <div className="flex shrink-0 items-center gap-3">
        {isMatchLive ? (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="live-dot" aria-hidden />
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              {matchLabel}
            </span>
          </div>
        ) : (
          <span className="hidden font-mono text-[10px] text-[var(--text-muted)] sm:block">
            NO LIVE MATCH
          </span>
        )}
        <span className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">
          {time}
        </span>
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[10px] font-bold"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
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
