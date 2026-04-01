import Link from "next/link";
import type { Session } from "next-auth";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { ReportProblemControl } from "@/components/report-problem-control";
import { signOutAction } from "@/app/(app)/actions";

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
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Suspense
        fallback={
          <aside className="w-52 shrink-0 border-r border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/50" />
        }
      >
        <AppSidebar sidebarRecent24hCount={sidebarRecent24hCount} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="min-w-0 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="truncate">{session.user?.name}</span>
            <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
            <span className="truncate text-zinc-500">{session.user?.email}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ReportProblemControl />
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
              Home
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
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
