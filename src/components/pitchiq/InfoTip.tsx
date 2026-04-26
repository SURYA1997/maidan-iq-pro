import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MetricTooltipProps {
  text: string;
  label?: string;
}

/**
 * Universal metric explainer. Dark surface, accent left border, sharp corners.
 * Use everywhere a [?] icon is needed. Alias: MetricTooltip = InfoTip.
 */
export function MetricTooltip({ text, label }: MetricTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex h-3 w-3 items-center justify-center text-[var(--text-muted)]/50 transition-colors hover:text-[var(--accent-primary)] focus:outline-none focus-visible:text-[var(--accent-primary)]"
        aria-label={label ? `Explain ${label}` : "Explain metric"}
      >
        <Info className="h-3 w-3" strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-auto max-w-[260px] rounded-none border-0 border-l-[3px] bg-[#1A1A1A] p-3 text-xs leading-relaxed shadow-none"
        style={{ borderLeftColor: "var(--accent-primary)" }}
      >
        {label && (
          <div
            className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.06em]"
            style={{ color: "var(--accent-primary)" }}
          >
            {label}
          </div>
        )}
        <p className="font-sans text-[12px] leading-relaxed text-[var(--text-primary)]/80">{text}</p>
      </PopoverContent>
    </Popover>
  );
}

/* Backward-compatible alias */
export { MetricTooltip as InfoTip };
