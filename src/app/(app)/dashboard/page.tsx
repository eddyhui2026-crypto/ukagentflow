import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button-variants";
import { DashboardListingActivityPanel } from "./dashboard-listing-activity-panel";
import { DashboardRecent24hNotice } from "./dashboard-recent-24h-notice";
import { DashboardPanelSearch } from "./dashboard-panel-search";
import {
  countFeedbackSinceForCompany,
  countPrequalSinceForCompany,
  getDashboardStatsSplit,
  getDashboardWeekStatsSplit,
  listRecentFeedbackForCompany,
  listRecentLettingPrequalForCompany,
  listRecentSalePrequalForCompany,
  type RecentFeedbackListFilters,
  type RecentFeedbackRow,
  type RecentLettingPrequalDashboardRow,
  type RecentSalePrequalDashboardRow,
} from "@/lib/dashboard/queries";
import { dashboardRollingRecentSince } from "@/lib/dashboard/recent-window";
import { cn } from "@/lib/utils";

const FEEDBACK_EACH_LIMIT = 35;

function MergedStatCard({
  label,
  saleWeek,
  lettingWeek,
  saleAll,
  lettingAll,
}: {
  label: string;
  saleWeek: number;
  lettingWeek: number;
  saleAll: number;
  lettingAll: number;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300/90">
        This week · UK Mon start
      </p>
      <div className="mt-2 flex flex-wrap gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
            For sale
          </p>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{saleWeek}</p>
          <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{saleAll} all time</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            To let
          </p>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{lettingWeek}</p>
          <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{lettingAll} all time</p>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ dqs?: string; dql?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return null;
  }

  const companyId = session.user.companyId;
  const since24h = dashboardRollingRecentSince();

  const sp = await searchParams;
  const saleQ = sp.dqs?.trim();
  const lettingQ = sp.dql?.trim();
  const saleFilters: RecentFeedbackListFilters | undefined = saleQ ? { q: saleQ } : undefined;
  const lettingFilters: RecentFeedbackListFilters | undefined = lettingQ
    ? { q: lettingQ }
    : undefined;

  const [
    stats,
    weekStats,
    recentSaleRaw,
    recentLettingRaw,
    recentSalePrequalRaw,
    recentLettingPrequalRaw,
    newFeedback24h,
    newPrequal24h,
  ] = await Promise.all([
    getDashboardStatsSplit(companyId),
    getDashboardWeekStatsSplit(companyId),
    listRecentFeedbackForCompany(companyId, "sale", FEEDBACK_EACH_LIMIT, saleFilters),
    listRecentFeedbackForCompany(companyId, "letting", FEEDBACK_EACH_LIMIT, lettingFilters),
    listRecentSalePrequalForCompany(companyId, FEEDBACK_EACH_LIMIT, saleFilters),
    listRecentLettingPrequalForCompany(companyId, FEEDBACK_EACH_LIMIT, lettingFilters),
    countFeedbackSinceForCompany(companyId, since24h),
    countPrequalSinceForCompany(companyId, since24h),
  ]);

  const submittedAfter = (at: Date | string) =>
    (typeof at === "string" ? new Date(at) : at) > since24h;

  const tagNewFeedback = (rows: RecentFeedbackRow[]): RecentFeedbackRow[] =>
    rows.map((r) => ({
      ...r,
      is_new_within_24h: submittedAfter(r.submitted_at),
    }));

  const tagSalePrequal = (rows: RecentSalePrequalDashboardRow[]): RecentSalePrequalDashboardRow[] =>
    rows.map((r) => ({
      ...r,
      is_new_within_24h: submittedAfter(r.submitted_at),
    }));

  const tagLettingPrequal = (rows: RecentLettingPrequalDashboardRow[]): RecentLettingPrequalDashboardRow[] =>
    rows.map((r) => ({
      ...r,
      is_new_within_24h: submittedAfter(r.submitted_at),
    }));

  const recentSale = tagNewFeedback(recentSaleRaw);
  const recentLetting = tagNewFeedback(recentLettingRaw);
  const recentSalePrequal = tagSalePrequal(recentSalePrequalRaw);
  const recentLettingPrequal = tagLettingPrequal(recentLettingPrequalRaw);

  const saleStats = stats.sale;
  const letStats = stats.letting;
  const saleWeek = weekStats.sale;
  const letWeek = weekStats.letting;

  const searchFallback = (
    <div className="h-9 min-w-[10rem] max-w-[18rem] animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
  );

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Sales and lettings are shown separately below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/properties?listing=sale"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900",
                "dark:border-zinc-300 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900",
              )}
            >
              For sale listings
            </Link>
            <Link
              href="/properties?listing=letting"
              className={cn(buttonVariants({ variant: "outline", size: "default" }))}
            >
              To let listings
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Overview</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            For sale vs to let. <strong className="font-medium text-zinc-600 dark:text-zinc-400">Large numbers</strong>{" "}
            are this <strong className="font-medium text-zinc-600 dark:text-zinc-400">UK week</strong> (from Monday
            00:00 London); the smaller line is <strong className="font-medium text-zinc-600 dark:text-zinc-400">all time</strong>{" "}
            in your workspace. <strong className="font-medium text-zinc-600 dark:text-zinc-400">Properties</strong> (week) = new
            instructions added; <strong className="font-medium text-zinc-600 dark:text-zinc-400">Viewings</strong> (week) =
            viewings whose <strong className="font-medium text-zinc-600 dark:text-zinc-400">date</strong> falls this week.{" "}
            <strong className="font-medium text-zinc-600 dark:text-zinc-400">Hot-interest</strong> (week) = distinct
            people who submitted <strong className="font-medium text-zinc-600 dark:text-zinc-400">hot</strong> feedback this week.{" "}
            <strong className="font-medium text-zinc-600 dark:text-zinc-400">Pre-viewing</strong> counts submissions on live
            instructions (hidden when Sold, Let, or Withdrawn), same as the activity tables below.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <MergedStatCard
              label="Properties"
              saleWeek={saleWeek.property_count}
              lettingWeek={letWeek.property_count}
              saleAll={saleStats.property_count}
              lettingAll={letStats.property_count}
            />
            <MergedStatCard
              label="Viewings"
              saleWeek={saleWeek.viewing_count}
              lettingWeek={letWeek.viewing_count}
              saleAll={saleStats.viewing_count}
              lettingAll={letStats.viewing_count}
            />
            <MergedStatCard
              label="Feedback received"
              saleWeek={saleWeek.feedback_count}
              lettingWeek={letWeek.feedback_count}
              saleAll={saleStats.feedback_count}
              lettingAll={letStats.feedback_count}
            />
            <MergedStatCard
              label="Pre-viewing received"
              saleWeek={saleWeek.prequal_count}
              lettingWeek={letWeek.prequal_count}
              saleAll={saleStats.prequal_count}
              lettingAll={letStats.prequal_count}
            />
            <MergedStatCard
              label="Hot-interest"
              saleWeek={saleWeek.hot_leads_count}
              lettingWeek={letWeek.hot_leads_count}
              saleAll={saleStats.hot_leads_count}
              lettingAll={letStats.hot_leads_count}
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent activity</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Use <strong className="font-medium">Feedback</strong> / <strong className="font-medium">Pre-viewing</strong>{" "}
            in each panel to switch tables. Feedback lists one row per submission after a viewing; pre-viewing lists
            form submissions from your share links. <strong className="font-medium">New</strong> means submitted in the
            rolling <strong className="font-medium">last 24 hours</strong> (server time when you load the page). Rows are{" "}
            <strong className="font-medium">hidden here</strong> when the instruction is{" "}
            <strong className="font-medium">Sold</strong>, <strong className="font-medium">Let</strong>, or{" "}
            <strong className="font-medium">Withdrawn</strong> — change status on the property to archive;{" "}
            <strong className="font-medium">STC</strong> / <strong className="font-medium">Let agreed</strong> still
            show until you complete or withdraw.
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            Up to {FEEDBACK_EACH_LIMIT} rows per list. In <strong className="font-medium">Feedback</strong>, click the
            arrows next to <strong className="font-medium">Viewing</strong>,{" "}
            <strong className="font-medium">Submitted</strong>, <strong className="font-medium">Rating</strong>, or{" "}
            <strong className="font-medium">Interest</strong> to sort (Interest: Hot first on the first click; default
            order is hot interest then submission time). Pre-viewing tables still sort on{" "}
            <strong className="font-medium">Submitted</strong> only. Each panel search filters{" "}
            <strong className="font-medium">Feedback</strong> and{" "}
            <strong className="font-medium">Pre-viewing</strong> (name, email, phone, address, postcode). Updates shortly
            after you stop typing. Scroll inside the panel;
            on narrow screens scroll sideways (~1040–1270px table width).
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            <strong className="font-medium text-zinc-600 dark:text-zinc-400">Tip:</strong> closing the browser tab does
            not sign you out — you stay logged in. The sidebar count shows feedback and pre-viewing from the{" "}
            <strong className="font-medium">last 24 hours</strong>. Use <strong className="font-medium">Sign out</strong>{" "}
            on shared devices.
          </p>
          <DashboardRecent24hNotice
            feedbackSale={newFeedback24h.sale}
            feedbackLetting={newFeedback24h.letting}
            prequalSale={newPrequal24h.sale}
            prequalLetting={newPrequal24h.letting}
          />

          <div className="mt-4 space-y-6">
            <DashboardListingActivityPanel
              title="For sale"
              feedbackDescription="Latest buyer feedback on sales instructions."
              prequalDescription="Latest pre-viewing checks submitted on live for-sale instructions."
              accent="sale"
              feedbackRows={recentSale}
              prequalRows={recentSalePrequal}
              listing="sale"
              feedbackNewWithin24hCount={newFeedback24h.sale}
              prequalNewWithin24hCount={newPrequal24h.sale}
              feedbackEmptyTitle="No sales feedback yet"
              feedbackEmptyDescription="Add a for-sale property, log viewings, then invite buyers — responses will appear here."
              prequalEmptyTitle="No sales pre-viewing yet"
              prequalEmptyDescription="Open a for-sale property and share the pre-viewing link — submissions will appear here."
              ctaHref="/properties?listing=sale"
              ctaLabel="Go to for sale"
              headerEnd={
                <Suspense fallback={searchFallback}>
                  <DashboardPanelSearch
                    param="dqs"
                    placeholder="Search name, email, phone, address…"
                  />
                </Suspense>
              }
            />
            <DashboardListingActivityPanel
              title="To let"
              feedbackDescription="Latest viewer feedback on rental instructions."
              prequalDescription="Latest tenant pre-viewing forms on live rental instructions."
              accent="letting"
              feedbackRows={recentLetting}
              prequalRows={recentLettingPrequal}
              listing="letting"
              feedbackNewWithin24hCount={newFeedback24h.letting}
              prequalNewWithin24hCount={newPrequal24h.letting}
              feedbackEmptyTitle="No letting feedback yet"
              feedbackEmptyDescription="Add a to-let property and schedule viewings — tenant feedback will show here."
              prequalEmptyTitle="No letting pre-viewing yet"
              prequalEmptyDescription="Open a to-let property and share the pre-viewing link — submissions will appear here."
              ctaHref="/properties?listing=letting"
              ctaLabel="Go to to let"
              headerEnd={
                <Suspense fallback={searchFallback}>
                  <DashboardPanelSearch
                    param="dql"
                    placeholder="Search name, email, phone, address…"
                  />
                </Suspense>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}