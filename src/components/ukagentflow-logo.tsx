import { cn } from "@/lib/utils";

type UkAgentFlowLogoProps = {
  variant: "icon" | "wordmark" | "lockup";
  className?: string;
};

/** Rounded mark with flow curves — matches sky-600 actions in the app. */
function UkAgentFlowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-sky-600" />
      <path
        fill="none"
        stroke="white"
        strokeWidth="1.65"
        strokeLinecap="round"
        d="M7 20.5c4-2.5 7.5-2.2 11-.2.8.4 1.6.9 2.5 1.3 2.5 1.2 5.2 1.5 7.5-.3"
      />
      <path
        fill="none"
        stroke="white"
        strokeWidth="1.65"
        strokeLinecap="round"
        d="M7 14.5c3.8-2 7-1.5 10.2.6 1 .6 2 1.2 3.1 1.7 2.8 1.3 5.8 1.4 8.7-.3"
      />
      <path
        fill="none"
        stroke="white"
        strokeWidth="1.65"
        strokeLinecap="round"
        d="M7 8.5c3.5-1.5 6.5-1 9.5 1 1.1.7 2.2 1.4 3.4 1.9 3 1.2 6.2 1.1 9.1-1"
      />
    </svg>
  );
}

function UkAgentFlowWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-bold tracking-tight text-zinc-900 dark:text-zinc-50",
        className,
      )}
    >
      UKAgent<span className="text-zinc-500 dark:text-zinc-400">Flow</span>
    </span>
  );
}

export function UkAgentFlowLogo({ variant, className }: UkAgentFlowLogoProps) {
  if (variant === "icon") {
    return <UkAgentFlowIcon className={className} />;
  }
  if (variant === "wordmark") {
    return <UkAgentFlowWordmark className={className} />;
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <UkAgentFlowIcon className="size-9" />
      <UkAgentFlowWordmark className="text-xl tracking-tight" />
    </span>
  );
}
