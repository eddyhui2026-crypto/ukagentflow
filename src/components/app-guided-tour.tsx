"use client";

import {
  GUIDED_TOUR_TRACKS,
  type TourTrackId,
} from "@/lib/guided-tour/tracks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { dismissAppOnboardingIntroAction } from "@/app/(app)/onboarding-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAD = 8;
const Z_OVERLAY = 220;
const DIM_BG = "rgba(15, 15, 20, 0.72)";
const TOOLTIP_EST_HEIGHT = 210;
const TOOLTIP_GAP = 16;

function useIsMdBreakpoint(): boolean {
  const query = "(min-width: 768px)";
  const [isMd, setIsMd] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(query);
    setIsMd(mq.matches);
    const on = () => setIsMd(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mounted ? isMd : true;
}

/** Touch devices: skip spotlight motion (fewer repaints on iOS). */
function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setCoarse(mq.matches);
    const on = () => setCoarse(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return coarse;
}

type Hole = { t: number; l: number; w: number; h: number };

/**
 * Four solid panels instead of a 9999px box-shadow — much cheaper on Mobile Safari.
 * pointer-events only on dimmed strips; the hole stays click-through to the target.
 */
function SpotlightMask({
  hole,
  zIndex,
  transition,
}: {
  hole: Hole;
  zIndex: number;
  transition: string | undefined;
}) {
  const { t, l, w, h } = hole;
  const base: React.CSSProperties = {
    position: "fixed",
    backgroundColor: DIM_BG,
    zIndex,
    pointerEvents: "auto",
    transition,
  };

  return (
    <>
      <div style={{ ...base, top: 0, left: 0, right: 0, height: Math.max(0, t) }} />
      <div
        style={{
          ...base,
          top: t + h,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        style={{
          ...base,
          top: t,
          left: 0,
          width: Math.max(0, l),
          height: h,
        }}
      />
      <div
        style={{
          ...base,
          top: t,
          left: l + w,
          right: 0,
          height: h,
        }}
      />
      <div
        className="pointer-events-none rounded-lg ring-2 ring-white/20"
        style={{
          position: "fixed",
          top: t,
          left: l,
          width: w,
          height: h,
          zIndex: zIndex + 1,
          transition,
        }}
        aria-hidden
      />
    </>
  );
}

function computeTooltipStyle(rect: DOMRect | null): React.CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tw = Math.min(352, vw - 32);

  if (!rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: tw,
    };
  }

  const spaceBelow = vh - rect.bottom - TOOLTIP_GAP;
  const spaceAbove = rect.top - TOOLTIP_GAP;
  const bigBlock = rect.height > 200 || rect.bottom > vh * 0.52;

  let top: number;
  if ((bigBlock || spaceBelow < TOOLTIP_EST_HEIGHT) && spaceAbove >= TOOLTIP_EST_HEIGHT * 0.75) {
    top = Math.max(TOOLTIP_GAP, rect.top - TOOLTIP_EST_HEIGHT - TOOLTIP_GAP);
  } else if (spaceBelow >= TOOLTIP_GAP) {
    top = Math.min(rect.bottom + TOOLTIP_GAP, vh - TOOLTIP_EST_HEIGHT - TOOLTIP_GAP);
  } else {
    top = TOOLTIP_GAP;
  }

  let left = Math.max(TOOLTIP_GAP, Math.min(rect.left, vw - tw - TOOLTIP_GAP));

  const estBottom = top + TOOLTIP_EST_HEIGHT;
  const estRight = left + tw;
  const overlapsY = estBottom > rect.top && top < rect.bottom;
  const overlapsX = estRight > rect.left && left < rect.right;
  if (overlapsY && overlapsX) {
    const above = rect.top - TOOLTIP_EST_HEIGHT - TOOLTIP_GAP;
    if (above >= TOOLTIP_GAP) {
      top = above;
    } else {
      const rightOf = rect.right + TOOLTIP_GAP;
      if (rightOf + tw <= vw - TOOLTIP_GAP) {
        left = rightOf;
        top = Math.max(TOOLTIP_GAP, Math.min(rect.top, vh - TOOLTIP_EST_HEIGHT - TOOLTIP_GAP));
      } else {
        const leftOf = rect.left - tw - TOOLTIP_GAP;
        if (leftOf >= TOOLTIP_GAP) {
          left = leftOf;
          top = Math.max(TOOLTIP_GAP, Math.min(rect.top, vh - TOOLTIP_EST_HEIGHT - TOOLTIP_GAP));
        }
      }
    }
  }

  return { top, left, width: tw };
}

function renderBoldSegments(text: string): ReactNode[] {
  const parts = text.split("**");
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    if (i % 2 === 1) {
      out.push(
        <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-50">
          {parts[i]}
        </strong>,
      );
    } else {
      out.push(<span key={i}>{parts[i]}</span>);
    }
  }
  return out;
}

export function AppGuidedTour({
  open,
  track,
  onClose,
}: {
  open: boolean;
  track: TourTrackId;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMd = useIsMdBreakpoint();
  const coarsePointer = useCoarsePointer();
  const [step, setStep] = useState(1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [, startTransition] = useTransition();

  const def = GUIDED_TOUR_TRACKS[track];
  const doneStep = def.doneStep;
  const lastContentStep = def.lastContentStep;

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    if (!open) {
      setStep(1);
      return;
    }
    const t = GUIDED_TOUR_TRACKS[track].stepFromPath(pathname, searchParams);
    setStep((s) => Math.max(s, t));
  }, [open, pathname, searchParams, track]);

  const meta = def.steps[Math.min(Math.max(step, 1), lastContentStep)] ?? def.steps[1];
  const selector = isMd ? meta.desktopSelector : meta.mobileSelector;

  useLayoutEffect(() => {
    if (!open || step >= doneStep) {
      setRect(null);
      return;
    }
    const node = document.querySelector(selector);
    if (!node || !(node instanceof HTMLElement)) {
      setRect(null);
      return;
    }
    setRect(node.getBoundingClientRect());
  }, [open, step, selector, pathname, isMd, doneStep]);

  const updateRect = useCallback(() => {
    if (!open || step >= doneStep) return;
    const node = document.querySelector(selector);
    if (!node || !(node instanceof HTMLElement)) {
      setRect(null);
      return;
    }
    setRect(node.getBoundingClientRect());
  }, [open, step, selector, doneStep]);

  useEffect(() => {
    if (!open || step >= doneStep) return;
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open, step, updateRect, doneStep]);

  useEffect(() => {
    if (!open || step >= doneStep) return;
    const node = document.querySelector(selector);
    if (!node || !(node instanceof HTMLElement)) return;
    const ro = new ResizeObserver(updateRect);
    ro.observe(node);
    return () => ro.disconnect();
  }, [open, step, selector, updateRect, doneStep]);

  const tooltipStyle = useMemo(() => computeTooltipStyle(rect), [rect]);

  function skipTour() {
    startTransition(async () => {
      await dismissAppOnboardingIntroAction();
      router.refresh();
    });
    onClose();
  }

  function finishTour() {
    startTransition(async () => {
      await dismissAppOnboardingIntroAction();
      router.refresh();
    });
    onClose();
  }

  if (!open || !portalEl) return null;

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const spotlightTransition =
    reduceMotion || coarsePointer
      ? undefined
      : "top 200ms ease-out, left 200ms ease-out, width 200ms ease-out, height 200ms ease-out";

  const hole: Hole | null = rect
    ? {
        t: rect.top - PAD,
        l: rect.left - PAD,
        w: rect.width + PAD * 2,
        h: rect.height + PAD * 2,
      }
    : null;

  const bodyRich = renderBoldSegments(meta.body);

  return createPortal(
    <>
      {step < doneStep && hole ? (
        <SpotlightMask hole={hole} zIndex={Z_OVERLAY} transition={spotlightTransition} />
      ) : step < doneStep ? (
        <div
          className="fixed inset-0"
          style={{ zIndex: Z_OVERLAY - 1, backgroundColor: DIM_BG }}
          aria-hidden
        />
      ) : null}

      {step < doneStep ? (
        <div
          className="pointer-events-auto fixed z-[225] max-h-[min(42vh,320px)] touch-manipulation overflow-y-auto overscroll-y-contain rounded-xl shadow-xl"
          style={tooltipStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-title"
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-600 dark:bg-zinc-900">
            <h2 id="guided-tour-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {meta.title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
              {bodyRich}
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={skipTour}>
                Skip tour
              </Button>
              {step === lastContentStep ? (
                <Button type="button" size="sm" onClick={() => setStep(doneStep)}>
                  Continue
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="pointer-events-auto fixed inset-0 z-[225] flex items-center justify-center bg-zinc-950/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-done-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-600 dark:bg-zinc-900">
            <h2
              id="guided-tour-done-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
            >
              You&apos;re set
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Choose another topic from <strong className="font-medium text-zinc-800 dark:text-zinc-200">Guided tour</strong> any time.
            </p>
            <div className="mt-6 flex justify-end">
              <Button type="button" size="sm" onClick={finishTour}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>,
    portalEl,
  );
}
