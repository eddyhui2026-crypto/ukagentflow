"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { dismissAppOnboardingIntroAction } from "@/app/(app)/onboarding-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAD = 8;
const Z_OVERLAY = 220;

function isPropertyDetailPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "properties" && parts[1] !== "new";
}

function isViewingsNewPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return (
    parts.length === 4 &&
    parts[0] === "properties" &&
    parts[2] === "viewings" &&
    parts[3] === "new"
  );
}

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

function stepFromPath(pathname: string, listingSale: boolean): number {
  if (isViewingsNewPath(pathname)) return 5;
  if (isPropertyDetailPath(pathname)) return 4;
  if (pathname === "/properties/new") return 3;
  if (pathname === "/properties" && listingSale) return 2;
  return 1;
}

const STEP_COPY: Record<
  number,
  { title: string; body: string; desktopSelector: string; mobileSelector: string }
> = {
  1: {
    title: "Open your sales listings",
    desktopSelector: '[data-tour="onboarding-nav-for-sale"]',
    mobileSelector: '[data-tour="onboarding-mobile-menu"]',
    body: "Under **Properties**, click **For sale**. On your phone, open the menu (☰) first, then tap **For sale**.",
  },
  2: {
    title: "Add a property",
    desktopSelector: '[data-tour="onboarding-add-property"]',
    mobileSelector: '[data-tour="onboarding-add-property"]',
    body: "Click **+ Add property** to create an instruction. You’ll enter address, postcode, vendor, and whether it’s for sale or to let.",
  },
  3: {
    title: "Fill in the instruction",
    desktopSelector: '[data-tour="onboarding-property-form"]',
    mobileSelector: '[data-tour="onboarding-property-form"]',
    body: "Complete the form and save. You’ll land on the property page — that’s where viewings and feedback links live.",
  },
  4: {
    title: "Book a viewing",
    desktopSelector: '[data-tour="onboarding-schedule-viewing"]',
    mobileSelector: '[data-tour="onboarding-schedule-viewing"]',
    body: "Click **+ Schedule viewing** to add a date, buyers, and choose automatic invite emails or your own copy-paste drafts.",
  },
  5: {
    title: "Send feedback links",
    desktopSelector: '[data-tour="onboarding-viewing-form"]',
    mobileSelector: '[data-tour="onboarding-viewing-form"]',
    body: "Add buyer names and emails, pick how links are delivered, then save. Buyers get personal links to leave structured feedback after the viewing.",
  },
};

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
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listingSale = searchParams.get("listing") !== "letting";
  const isMd = useIsMdBreakpoint();
  const [step, setStep] = useState(1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const target = stepFromPath(pathname, listingSale);
    setStep((s) => Math.max(s, target));
  }, [open, pathname, listingSale]);

  const meta = STEP_COPY[Math.min(Math.max(step, 1), 5)] ?? STEP_COPY[1];
  const selector = isMd ? meta.desktopSelector : meta.mobileSelector;

  useLayoutEffect(() => {
    if (!open || step >= 6) {
      setRect(null);
      return;
    }
    const node = document.querySelector(selector);
    if (!node || !(node instanceof HTMLElement)) {
      setRect(null);
      return;
    }
    setRect(node.getBoundingClientRect());
  }, [open, step, selector, pathname, isMd]);

  const updateRect = useCallback(() => {
    if (!open || step >= 6) return;
    const node = document.querySelector(selector);
    if (!node || !(node instanceof HTMLElement)) {
      setRect(null);
      return;
    }
    setRect(node.getBoundingClientRect());
  }, [open, step, selector]);

  useEffect(() => {
    if (!open || step >= 6) return;
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open, step, updateRect]);

  useEffect(() => {
    if (!open || step >= 6) return;
    const node = document.querySelector(selector);
    if (!node || !(node instanceof HTMLElement)) return;
    const ro = new ResizeObserver(updateRect);
    ro.observe(node);
    return () => ro.disconnect();
  }, [open, step, selector, updateRect]);

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

  const bodyRich = renderBoldSegments(meta.body);

  return createPortal(
    <>
      {step < 6 && rect ? (
        <div
          className={cn(
            "pointer-events-none fixed rounded-lg",
            reduceMotion ? "" : "transition-[top,left,width,height] duration-200 ease-out",
          )}
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(15, 15, 20, 0.72)",
            zIndex: Z_OVERLAY,
          }}
          aria-hidden
        />
      ) : step < 6 ? (
        <div
          className="fixed inset-0 bg-zinc-950/70"
          style={{ zIndex: Z_OVERLAY - 1 }}
          aria-hidden
        />
      ) : null}

      {step < 6 ? (
        <div
          className="pointer-events-auto fixed z-[225] w-[min(22rem,calc(100vw-2rem))]"
          style={
            rect
              ? {
                  top: Math.min(rect.bottom + PAD * 2, window.innerHeight - 160),
                  left: Math.min(
                    Math.max(16, rect.left),
                    window.innerWidth - 16 - Math.min(352, window.innerWidth - 32),
                  ),
                }
              : {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="guided-tour-title"
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-600 dark:bg-zinc-900">
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
              {step === 5 ? (
                <Button type="button" size="sm" onClick={() => setStep(6)}>
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
              You can restart this tour any time from <strong className="font-medium text-zinc-800 dark:text-zinc-200">Guided tour</strong> in the top bar.
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
