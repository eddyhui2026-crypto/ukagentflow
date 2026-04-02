"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { dismissAppOnboardingIntroAction } from "@/app/(app)/onboarding-actions";
import { Button } from "@/components/ui/button";

export function AppOnboardingIntroHint({
  onStartTour,
}: {
  onStartTour: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function dismiss() {
    startTransition(async () => {
      await dismissAppOnboardingIntroAction();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 border-t border-blue-100 bg-blue-50/90 px-3 py-2 text-xs text-blue-950 sm:px-5 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100">
      <p className="min-w-0 leading-snug">
        <span className="font-medium">New here?</span> Tap{" "}
        <button
          type="button"
          className="font-semibold underline decoration-blue-600 underline-offset-2 hover:no-underline dark:decoration-blue-400"
          onClick={() => onStartTour()}
        >
          Guided tour
        </button>{" "}
        for a walkthrough — add a property, then book a viewing and send feedback links.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-blue-900 hover:bg-blue-100 dark:text-blue-100 dark:hover:bg-blue-900/60"
        aria-label="Dismiss"
        disabled={pending}
        onClick={() => dismiss()}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
