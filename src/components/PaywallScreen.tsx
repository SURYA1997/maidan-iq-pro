import { useAuth } from "@/context/AuthContext";
import { initiateSeasonPass } from "@/services/payment";
import { useState } from "react";

export function PaywallScreen() {
  const { user, setIsPaid } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGetPass() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await initiateSeasonPass(user.email, user.name, () => setIsPaid(true));
    } catch (e) {
      setError("Payment could not be initiated. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "#0A0A0A" }}
    >
      <div
        className="w-full max-w-[420px]"
        style={{
          background: "#0F1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "2px solid #FF6B00",
        }}
      >
        {/* Top */}
        <div className="px-8 pt-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#6B7280" }}>
            FREE PASSES USED
          </div>

          <h1 className="mt-3 font-mono text-2xl font-black leading-tight text-[#F0F0F0]">
            Your 2 free matches are up.
          </h1>

          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#6B7280" }}>
            Get full access to every remaining IPL 2026 match. One payment. No subscription.
          </p>

          {/* Price */}
          <div className="mt-6">
            <div
              className="font-mono text-6xl font-black leading-none tabular-nums"
              style={{ color: "#FF6B00" }}
            >
              ₹499
            </div>
            <div className="mt-1.5 font-mono text-[11px]" style={{ color: "#6B7280" }}>
              One-time · Season expires May 24, 2026
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 mt-6" style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

        {/* CTA */}
        <div className="px-8 py-6">
          {error && (
            <p className="mb-3 font-mono text-[11px]" style={{ color: "#EF4444" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleGetPass}
            disabled={loading}
            className="w-full py-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#FF6B00" }}
          >
            {loading ? "OPENING CHECKOUT…" : "GET SEASON PASS"}
          </button>

          <p className="mt-2.5 text-center font-mono text-[10px]" style={{ color: "#6B7280" }}>
            Secured by Razorpay · UPI accepted
          </p>

          {/* Divider */}
          <div className="my-5" style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

          <p className="text-center font-mono text-[10px]" style={{ color: "#6B7280" }}>
            Already paid?{" "}
            <a
              href="mailto:support@maidaniq.com"
              className="underline hover:opacity-80"
              style={{ color: "#9CA3AF" }}
            >
              Contact support@maidaniq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
