"use client";

import { FeedbackFullDetail, type FeedbackFullDetailProps } from "@/components/feedback-full-detail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Z_BACKDROP = 7100;
const Z_PANEL = 7101;

export function FeedbackDetailDrawerTrigger({
  defaultOpen = false,
  subtitle,
  triggerLabel = "Full feedback",
  triggerClassName,
  /** After close, optionally replace history (e.g. strip ?feedback= for deep links). */
  replaceHrefOnClose,
  ...detailProps
}: FeedbackFullDetailProps & {
  defaultOpen?: boolean;
  subtitle?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  replaceHrefOnClose?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const close = useCallback(() => {
    setOpen(false);
    if (replaceHrefOnClose) {
      router.replace(replaceHrefOnClose, { scroll: false });
    }
  }, [replaceHrefOnClose, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex text-left text-xs font-medium text-blue-600 underline decoration-blue-600/80 underline-offset-2 hover:no-underline dark:text-blue-400 dark:decoration-blue-400/80",
          triggerClassName,
        )}
      >
        {triggerLabel}
      </button>
      {mounted && open
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close feedback panel"
                className="fixed inset-0 bg-zinc-950/55"
                style={{ zIndex: Z_BACKDROP }}
                onClick={close}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-drawer-title"
                className="fixed inset-y-0 left-0 flex w-full max-w-[min(100vw,28rem)] flex-col border-r border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:max-w-lg"
                style={{ zIndex: Z_PANEL }}
              >
                <header className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] dark:border-zinc-800">
                  <div className="min-w-0">
                    <h2
                      id="feedback-drawer-title"
                      className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50"
                    >
                      Full feedback
                    </h2>
                    {subtitle ? (
                      <p className="mt-1.5 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    aria-label="Close"
                    onClick={close}
                  >
                    <X className="size-5" aria-hidden />
                  </Button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
                  <FeedbackFullDetail
                    {...detailProps}
                    variant="comfortable"
                    className="border-0 bg-transparent px-0 py-0 dark:bg-transparent"
                  />
                </div>
                <footer className="shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800 dark:bg-zinc-950/90">
                  <Button type="button" variant="outline" className="w-full touch-manipulation" onClick={close}>
                    Close
                  </Button>
                </footer>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
