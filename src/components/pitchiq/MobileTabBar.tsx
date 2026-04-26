import { Link, useRouterState } from "@tanstack/react-router";
import {
  Radio,
  BookOpen,
  Users,
  Crosshair,
  MapPin,
  Zap,
} from "lucide-react";

const tabs = [
  { label: "LIVE", icon: Radio, to: "/live" },
  { label: "STORY", icon: BookOpen, to: "/story" },
  { label: "SQUADS", icon: Users, to: "/squads" },
  { label: "MATCHUP", icon: Crosshair, to: "/matchup" },
  { label: "VENUES", icon: MapPin, to: "/venues" },
  { label: "FANTASY", icon: Zap, to: "/fantasy" },
] as const;

export function MobileTabBar({ isMatchLive = true }: { isMatchLive?: boolean }) {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 lg:hidden"
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
      }}
      aria-label="Mobile navigation"
    >
      {tabs.map(({ label, icon: Icon, to }) => {
        const isActive = currentPath === to || (to === "/live" && currentPath === "/terminal");
        return (
          <Link
            key={to}
            to={to}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 pb-1"
            style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active underline */}
            {isActive && (
              <span
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "var(--accent-primary)" }}
              />
            )}
            <div className="relative">
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.5} />
              {/* Live dot on LIVE tab */}
              {label === "LIVE" && isMatchLive && (
                <span
                  className="live-dot absolute -right-1 -top-1"
                  style={{ width: 5, height: 5 }}
                  aria-hidden
                />
              )}
            </div>
            <span
              className="font-mono text-[8px] uppercase tracking-[0.1em]"
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
