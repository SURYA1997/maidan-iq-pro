export function BottomBar() {
  return (
    <footer
      className="mb-16 lg:mb-0"
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="flex h-8 items-center justify-center px-5">
        <p className="font-mono text-[10px] tracking-wide text-[var(--text-muted)]">
          AI predictions are for entertainment and analytical purposes only.
        </p>
      </div>
    </footer>
  );
}
