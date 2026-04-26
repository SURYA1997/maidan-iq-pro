import { type ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Terminal card surface. Sharp corners, 1px border, 2px saffron left accent.
 * No glassmorphism, no shadows, no gradients.
 */
export function Panel({ title, subtitle, right, children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-none bg-[var(--surface)] ${className}`}
      style={{
        border: "1px solid var(--border)",
        borderLeft: "2px solid var(--accent-primary)",
      }}
    >
      {(title || right) && (
        <header
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-baseline gap-2">
            {title && (
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#6B7280" }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <span className="font-mono text-[11px] tracking-[0.06em]" style={{ color: "#9CA3AF" }}>{subtitle}</span>
            )}
          </div>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
