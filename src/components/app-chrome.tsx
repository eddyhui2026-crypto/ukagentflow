"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { ReportProblemControl } from "@/components/report-problem-control";
import { signOutAction } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";

export function AppChrome({
  session,
  sidebarRecent24hCount = 0,
  children,
}: {
  session: Session;
  /** Feedback + pre-viewing submissions in the last 24h (live listings) — Dashboard nav badge */
  sidebarRecent24hCount?: number;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900 sm:gap-3 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="shrink-0 md:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="app-mobile-nav"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5 text-zinc-700 dark:text-zinc-200" aria-hidden />
            </Button>
            <div className="min-w-0 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                {session.user?.name}
              </span>
              <span className="mx-1 text-zinc-300 dark:text-zinc-600 sm:mx-2">·</span>
              <span className="hidden truncate text-zinc-500 sm:inline">{session.user?.email}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
