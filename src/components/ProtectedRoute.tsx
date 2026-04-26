import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

/* ─── Soft interest banner ──────────────────────────────────────────────── */

const BANNER_DISMISSED_KEY = "maidan-banner-dismissed";

function SoftBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(BANNER_DISMISSED_KEY) === "1"
  );

  if (dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "1");
    setDismissed(true);
  }

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-2.5"
      style={{ background: "#0F1117", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="font-mono text-[11px]" style={{ color: "#9CA3AF" }}>
        Enjoying MaidanIQ?{" "}
        <span style={{ color: "#F0F0F0" }}>Season pass coming soon.</span>{" "}
        Full access for ₹499 one-time.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 transition-opacity hover:opacity-70"
        style={{ color: "#6B7280", fontSize: 16, lineHeight: 1, padding: "0 2px" }}
      >
        ×
      </button>
    </div>
  );
}

/* ─── Loading screen ────────────────────────────────────────────────────── */

function AuthLoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
        AUTHENTICATING…
      </span>
    </div>
  );
}

/* ─── ProtectedRoute ────────────────────────────────────────────────────── */

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isPaid } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return null;

  return (
    <>
      {!isPaid && <SoftBanner />}
      {children}
    </>
  );
}
