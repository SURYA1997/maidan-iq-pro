import { Link, useRouterState } from "@tanstack/react-router";
import {
  Radio,
  BookOpen,
  Users,
  Crosshair,
  MapPin,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "LIVE", icon: Radio, to: "/live" },
  { label: "STORY", icon: BookOpen, to: "/story" },
  { label: "SQUADS", icon: Users, to: "/squads" },
  { label: "MATCHUP", icon: Crosshair, to: "/matchup" },
  { label: "VENUES", icon: MapPin, to: "/venues" },
  { label: "FANTASY", icon: Zap, to: "/fantasy" },
] as const;

export function AppSidebar({ isMatchLive = true }: { isMatchLive?: boolean }) {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  return (
    /*
     * Collapsed: 64px (w-16). Expands to 200px on hover.
     * overflow-hidden clips labels when collapsed.
     * group on the aside drives group-hover on child labels.
     */
    <aside
      className="group fixed bottom-0 left-0 top-12 z-30 hidden w-16 flex-col overflow-hidden transition-[width] duration-200 ease-in-out hover:w-[200px] lg:flex"
      style={{
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-12 shrink-0 items-center px-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link to="/live" aria-label="MaidanIQ" className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 font-mono text-[13px] font-bold tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            MIQ
          </span>
          <span
            className="whitespace-nowrap font-mono text-[11px] font-bold tracking-[0.18em] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            style={{ color: "var(--accent-primary)" }}
          >
            MAIDANIQ
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav
        className="flex flex-1 flex-col gap-0.5 py-3"
        aria-label="Main navigation"
      >
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive =
            currentPath === to || (to === "/live" && currentPath === "/terminal");
          return (
            <Link
              key={to}
              to={to}
              className="relative flex h-11 shrink-0 items-center gap-3 px-4 transition-colors"
              style={{
                borderLeft: isActive
                  ? "2px solid var(--accent-primary)"
                  : "2px solid transparent",
                color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                background: isActive ? "rgba(255,107,0,0.05)" : "transparent",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative shrink-0">
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.5} />
                {/* Pulsing green dot on LIVE item */}
                {label === "LIVE" && isMatchLive && (
                  <span
                    className="live-dot absolute -right-1 -top-1"
                    style={{ width: 5, height: 5 }}
                    aria-hidden
                  />
                )}
              </div>
              <span
                className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                style={{
                  color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user avatar */}
      <div
        className="flex shrink-0 items-center px-4 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[10px] font-bold"
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
    </aside>
  );
}
