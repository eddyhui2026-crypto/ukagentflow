import { cn } from "@/lib/utils";

/** Fictional demo agency lockup for marketing samples — not the UKAgentFlow product legal name. */
export function UkAgent4Logo({
  className,
  variant = "full",
}: {
  className?: string;
  /** `full`: wordmark + badge; `icon`: square mark only */
  variant?: "full" | "icon";
}) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 48 48"
        className={cn("shrink-0", className)}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="48" height="48" rx="12" className="fill-slate-900 dark:fill-zinc-100" />
        <text
          x="24"
          y="33"
          textAnchor="middle"
          className="fill-white dark:fill-zinc-900"
          style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif", fontSize: 22, fontWeight: 800 }}
        >
          4
        </text>
      </svg>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 48 48" className="size-10 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="48" height="48" rx="12" className="fill-slate-900 dark:fill-zinc-100" />
        <text
          x="24"
          y="33"
          textAnchor="middle"
          className="fill-white dark:fill-zinc-900"
          style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif", fontSize: 22, fontWeight: 800 }}
        >
          4
        </text>
      </svg>
      <div className="min-w-0 text-left leading-tight">
        <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">UK Agent</div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          Sales &amp; lettings
        </div>
      </div>
    </div>
  );
}
