"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useLayoutEffect,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import {
  interactiveOnboardingCreateSampleAction,
  interactiveOnboardingFinishAction,
} from "@/app/(app)/interactive-onboarding-actions";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const Z_BACKDROP = 6100;
const Z_CARD = 6110;

type SamplePayload = {
  propertyId: string;
  feedbackId: string;
  feedbackUrl: string;
  vendorPortalUrl: string;
};

function useBodyPortalEl(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setEl(document.body);
  }, []);
  return el;
}

export function InteractiveOnboardingWizard({ session }: { session: Session }) {
  const portalEl = useBodyPortalEl();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sample, setSample] = useState<SamplePayload | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const agentEmail = session.user.email ?? "";

  const finishAndRefresh = useCallback(() => {
    startTransition(async () => {
      await interactiveOnboardingFinishAction();
      router.refresh();
    });
  }, [router]);

  const onCreateSample = useCallback(() => {
    setCreateError(null);
    startTransition(async () => {
      const r = await interactiveOnboardingCreateSampleAction();
      if (!r.ok) {
        setCreateError(r.error);
        return;
      }
      setSample({
        propertyId: r.propertyId,
        feedbackId: r.feedbackId,
        feedbackUrl: r.feedbackUrl,
        vendorPortalUrl: r.vendorPortalUrl,
      });
      setStep(3);
    });
  }, []);

  const onOpenFeedbackTab = useCallback(() => {
    if (!sample) {
      return;
    }
    router.push(
      `/properties/${sample.propertyId}?tab=feedback&feedback=${encodeURIComponent(sample.feedbackId)}`,
    );
    setStep(5);
  }, [router, sample]);

  if (!portalEl) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center p-4 sm:items-center sm:p-6"
      style={{ zIndex: Z_BACKDROP }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interactive-onboarding-title"
    >
      <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-[2px]" aria-hidden />

      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl",
          "dark:border-zinc-700 dark:bg-zinc-900",
        )}
        style={{ zIndex: Z_CARD }}
      >
        <div className="max-h-[min(32rem,85dvh)] overflow-y-auto px-5 py-5 sm:max-h-[min(36rem,90dvh)] sm:px-6 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Quick tour · Step {step} of 5
          </p>
          <h2
            id="interactive-onboarding-title"
            className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {step === 1 ? "Welcome" : null}
            {step === 2 ? "Demo instruction" : null}
            {step === 3 ? "Buyer invite (simulated)" : null}
            {step === 4 ? "Vendor snapshot & your view" : null}
            {step === 5 ? "You’re ready" : null}
          </h2>

          {step === 1 ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>
                Hi — here&apos;s a fast way to see how you can collect viewing feedback{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-100">
                  without chasing calls
                </strong>
                . We&apos;ll walk through a tiny demo on your own account (about a minute).
              </p>
              <Button type="button" className="mt-2 w-full sm:w-auto" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>
                Next, we&apos;ll add a{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-100">
                  sample instruction
                </strong>{" "}
                at <strong className="font-medium text-zinc-800 dark:text-zinc-100">12 Sample Mews</strong>{" "}
                with one viewing and feedback already in place — so the links below are real, not a video.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                When you list real stock, you&apos;ll use{" "}
                <strong className="font-medium text-zinc-600 dark:text-zinc-300">+ Add property</strong> on{" "}
                <strong className="font-medium text-zinc-600 dark:text-zinc-300">For sale</strong> (same idea,
                your details).
              </p>
              {createError ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {createError}
                </p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button type="button" onClick={onCreateSample} disabled={isPending}>
                  {isPending ? "Working…" : "Add demo property"}
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 && sample ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>
                After a viewing, buyers get a short form link. For this demo we haven&apos;t sent a real email
                — here&apos;s what the message looks like. The stand-in buyer uses{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-100">your login email</strong>{" "}
                ({agentEmail}) so everything stays in one place.
              </p>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950">
                <div className="font-medium text-zinc-800 dark:text-zinc-100">From: UKAgentFlow</div>
                <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                  To: {agentEmail || "your inbox"}
                </div>
                <div className="mt-2 font-medium text-zinc-800 dark:text-zinc-100">
                  Subject: How was your viewing — 12 Sample Mews?
                </div>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  …tap below to leave brief feedback (about a minute).
                </p>
                <div className="mt-2 break-all rounded border border-dashed border-zinc-300 bg-white px-2 py-2 font-mono text-[11px] text-blue-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-blue-400">
                  {sample.feedbackUrl}
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  You can open it: the demo submission is already saved, so the form will show as used — that&apos;s
                  expected.
                </p>
              </div>
              <Button type="button" className="w-full sm:w-auto" onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          ) : null}

          {step === 4 && sample ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>
                Vendors can follow progress on a simple snapshot page (no login). Your demo link:
              </p>
              <div className="break-all rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
                {sample.vendorPortalUrl}
              </div>
              <p>
                In the app, open the property&apos;s{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-100">Feedback</strong> tab and use
                <strong className="font-medium text-zinc-800 dark:text-zinc-100"> Full feedback</strong> beside the
                buyer email for the full detail drawer.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button type="button" onClick={onOpenFeedbackTab}>
                  Open Feedback tab
                </Button>
                <Link
                  href={sample.vendorPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Open vendor snapshot
                </Link>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>
                That&apos;s the loop: invite buyers, read structured feedback, share a vendor-friendly view. When
                you&apos;re ready, add a{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-100">real instruction</strong> and
                run it end-to-end — you can delete <strong className="font-medium">12 Sample Mews</strong> anytime.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tip: use <strong className="font-medium text-zinc-600 dark:text-zinc-300">Guided tour</strong> in the
                header for click-through help on screens.
              </p>
              <Button type="button" className="w-full sm:w-auto" onClick={finishAndRefresh}>
                Done
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800 sm:px-6">
          {step < 5 ? (
            <button
              type="button"
              className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
              onClick={finishAndRefresh}
            >
              Skip tour
            </button>
          ) : (
            <span />
          )}
          {step > 1 && step < 5 ? (
            <button
              type="button"
              className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>,
    portalEl,
  );
}
