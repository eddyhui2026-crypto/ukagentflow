"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { Map, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { dismissAppOnboardingIntroAction } from "@/app/(app)/onboarding-actions";
import { signOutAction } from "@/app/(app)/actions";
import { AppGuidedTour } from "@/components/app-guided-tour";
import { AppHeaderGreeting } from "@/components/app-header-greeting";
import { AppHeaderTicker } from "@/components/app-header-ticker";
import { AppOnboardingIntroHint } from "@/components/app-onboarding-intro-hint";
import { AppSidebar } from "@/components/app-sidebar";
import { ReportProblemControl } from "@/components/report-problem-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppChrome({
  session,
  sidebarRecent24hCount = 0,
  showIntroHint = false,
  children,
}: {
  session: Session;
  /** Feedback + pre-viewing submissions in the last 24h (live listings) — Dashboard nav badge */
  sidebarRecent24hCount?: number;
  /** First session: show one-time hint that Guided tour exists */
  showIntroHint?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [guidedTourOpen, setGuidedTourOpen] = useState(false);
  const [, startTransition] = useTransition();

  function startGuidedTour() {
    startTransition(async () => {
      await dismissAppOnboardingIntroAction();
      router.refresh();
    });
    setGuidedTourOpen(true);
  }

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="hidden shrink-0 md:flex">
        <Suspense
          fallback={
            <aside className="w-52 border-r border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/50" />
          }
        >
          <AppSidebar sidebarRecent24hCount={sidebarRecent24hCount} />
        </Suspense>
      </div>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[45] bg-zinc-950/40 backdrop-blur-[1px] md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            id="app-mobile-nav"
            className={cn(
              "fixed inset-y-0 left-0 z-[50] flex w-[min(18rem,88vw)] flex-col shadow-xl md:hidden",
              "border-r border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900",
            )}
          >
            <div className="flex h-14 shrink-0 items-center justify-end border-b border-zinc-200 px-3 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-zinc-600 dark:text-zinc-300"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Suspense fallback={null}>
                <AppSidebar
                  sidebarRecent24hCount={sidebarRecent24hCount}
                  onNavigate={() => setMobileNavOpen(false)}
                  hideBrandHeader
                />
              </Suspense>
            </div>
          </div>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-col border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="shrink-0 md:hidden"
                data-tour="onboarding-mobile-menu"
                aria-expanded={mobileNavOpen}
                aria-controls="app-mobile-nav"
                aria-label="Open menu"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="size-5 text-zinc-700 dark:text-zinc-200" aria-hidden />
              </Button>
              <AppHeaderGreeting session={session} />
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden h-8 gap-1 px-2 text-xs sm:inline-flex sm:h-9 sm:px-2.5 sm:text-sm"
                onClick={startGuidedTour}
              >
                <Map className="size-3.5 shrink-0" aria-hidden />
                Guided tour
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="sm:hidden"
                aria-label="Guided tour"
                onClick={startGuidedTour}
              >
                <Map className="size-4" aria-hidden />
              </Button>
              <ReportProblemControl />
              <Link
                href="/"
                className="hidden text-sm text-zinc-500 hover:text-zinc-900 sm:inline dark:hover:text-zinc-50"
              >
                Home
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          <AppHeaderTicker />
          {showIntroHint ? <AppOnboardingIntroHint onStartTour={startGuidedTour} /> : null}
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <AppGuidedTour open={guidedTourOpen} onClose={() => setGuidedTourOpen(false)} />
    </div>
  );
}
