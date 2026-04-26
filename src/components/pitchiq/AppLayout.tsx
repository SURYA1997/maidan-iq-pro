import { type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { MobileTabBar } from "./MobileTabBar";
import { BottomBar } from "./BottomBar";

interface AppLayoutProps {
  children: ReactNode;
  /** kept for API compat — no longer used in header (navbar handles active state) */
  pageName?: string;
  isMatchLive?: boolean;
  matchLabel?: string;
}

/**
 * Shell for all app pages.
 * Desktop: sticky top navbar with 6 nav links
 * Mobile: same top navbar (links hidden) + bottom tab bar
 */
export function AppLayout({
  children,
  pageName: _pageName,
  isMatchLive = true,
  matchLabel = "Chennai vs Mumbai",
}: AppLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg)", color: "var(--text-primary)" }}
    >
      <AppHeader isMatchLive={isMatchLive} matchLabel={matchLabel} />

      <main className="flex-1">
        {children}
      </main>

      <BottomBar />

      <MobileTabBar isMatchLive={isMatchLive} />
    </div>
  );
}
