import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terminal")({
  loader: () => {
    throw redirect({ to: "/live" });
  },
  component: () => null,
  head: () => ({
    meta: [{ title: "MaidanIQ — Redirecting..." }],
  }),
});
