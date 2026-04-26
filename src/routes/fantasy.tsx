import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/pitchiq/AppLayout";

export const Route = createFileRoute("/fantasy")({
  component: FantasyPage,
  head: () => ({
    meta: [{ title: "MaidanIQ — Fantasy" }],
  }),
});

function FantasyPage() {
  return (
    <ProtectedRoute>
      <AppLayout pageName="FANTASY">
        <PlaceholderContent title="FANTASY" />
      </AppLayout>
    </ProtectedRoute>
  );
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col items-center justify-center px-4">
      <div
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-primary)" }}
      >
        {title}
      </div>
      <div
        className="mt-4 font-mono text-[13px] uppercase tracking-[0.18em]"
        style={{ color: "var(--text-muted)" }}
      >
        INTELLIGENCE LOADING // COMING SOON
      </div>
    </div>
  );
}
