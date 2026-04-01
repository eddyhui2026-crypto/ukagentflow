import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  /** If set, shows primary CTA */
  ctaHref?: string;
  ctaLabel?: string;
};

export function FeedbackEmptyState({ title, description, ctaHref, ctaLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="mb-6 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 text-zinc-700 dark:from-sky-950/40 dark:to-violet-950/40 dark:text-zinc-200"
        aria-hidden
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20"
        >
          <path
            d="M24 88V44l20-16 16 12 20-16 16 12v52H24z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="opacity-85"
          />
          <rect x="52" y="56" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M44 96c12-18 20-18 32 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-6"
          />
          <circle cx="88" cy="34" r="14" stroke="currentColor" strokeWidth="2" className="opacity-7" />
          <path
            d="M82 34h12M88 28v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-7"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className={cn(buttonVariants({ variant: "default", size: "default" }), "mt-6")}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
