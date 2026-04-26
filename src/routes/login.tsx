import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — MaidanIQ" },
      {
        name: "description",
        content:
          "Sign in to MaidanIQ to claim 2 free match passes. Cricket analytics terminal for IPL 2026.",
      },
      { property: "og:title", content: "Sign In — MaidanIQ" },
      {
        property: "og:description",
        content: "Access the terminal. Sign in to get your 2 free match passes.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, skip to live
  if (isAuthenticated) {
    navigate({ to: "/live" });
    return null;
  }

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    const credential = credentialResponse.credential;
    if (!credential) {
      setError("No credential received from Google. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(credential);
      navigate({ to: "/live" });
    } catch (e) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setError("Login failed. Please try again.");
  }

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Top-left logo */}
      <div className="absolute left-5 top-5 z-10">
        <Link
          to="/"
          className="font-mono text-sm font-bold tracking-[0.25em]"
          style={{ color: "var(--accent-primary)" }}
        >
          MAIDANIQ
        </Link>
      </div>

      {/* Centered card */}
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <div
          className="w-full max-w-[400px] p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "2px solid var(--accent-primary)",
          }}
        >
          {/* Label */}
          <div className="label-mono mb-4">AUTHENTICATION // SECURE</div>

          {/* Divider */}
          <div className="mb-6" style={{ height: 1, background: "var(--border)" }} />

          {/* Headline */}
          <h1 className="text-2xl font-bold leading-tight text-[var(--text-primary)]">
            Access the Terminal.
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>
            Sign in to get your 2 free match passes. No credit card needed to start.
          </p>

          {/* Error */}
          {error && (
            <p className="mt-4 font-mono text-[11px]" style={{ color: "#EF4444" }}>
              {error}
            </p>
          )}

          {/* Google sign-in */}
          <div className="mt-6">
            {loading ? (
              <div
                className="flex w-full items-center justify-center py-3 font-mono text-[11px]"
                style={{ color: "#6B7280", border: "1px solid var(--border)" }}
              >
                AUTHENTICATING…
              </div>
            ) : (
              /*
               * GoogleLogin renders Google's own button.
               * We override the visual style below to match the terminal aesthetic.
               * The `theme="filled_black"` gets us close; we can't fully override
               * Google's button styles due to their iframe isolation.
               */
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="rectangular"
                  text="continue_with"
                  logo_alignment="left"
                  width="352"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-6" style={{ height: 1, background: "var(--border)" }} />

          {/* Disclaimer */}
          <p className="text-center text-xs leading-relaxed" style={{ color: "#6B7280" }}>
            By signing in you agree to our terms. Analytics only. Not affiliated with BCCI.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 pb-8">
        <p className="text-center font-mono text-[10px]" style={{ color: "#6B7280" }}>
          AI analysis is for entertainment and informational purposes only.
        </p>
      </footer>
    </div>
  );
}
