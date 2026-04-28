import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
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
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
