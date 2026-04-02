'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
} from 'lucide-react';
import { AgentFollowUpSelect } from '@/components/agent-follow-up-select';
import { DeleteFeedbackButton } from '@/components/delete-feedback-button';
import { ContactOutreachLinks } from '@/components/contact-outreach-links';
import { FeedbackDetailDrawerTrigger } from '@/components/feedback-detail-drawer';
import { FeedbackEmptyState } from '@/components/feedback-empty-state';
import type {
  RecentFeedbackRow,
  RecentLettingPrequalDashboardRow,
  RecentSalePrequalDashboardRow,
} from '@/lib/dashboard/queries';
import type { AgentFollowUp } from '@/lib/feedback/agent-follow-up';
import { handleMailtoAnchorClick } from '@/lib/mailto-open';
import { cn } from '@/lib/utils';

function formatDateTime(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatViewDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatInterest(label: string | null | undefined) {
  if (!label) return "—";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function saleBuyingShort(v: string) {
  switch (v) {
    case 'ftb':
      return 'FTB';
    case 'no_dependent_sale':
      return 'No dep. sale';
    case 'sale_on_market':
      return 'On market';
    case 'sale_not_on_market':
      return 'Not listed';
    case 'sale_sold_stc':
      return 'STC / offer';
    case 'unspecified':
      return '—';
    default:
      return v;
  }
}

function saleFundingShort(v: string) {
  return v === 'cash' ? 'Cash' : v === 'mortgage' ? 'Mortgage' : v;
}

function lettingIncomeShort(v: string) {
  switch (v) {
    case '25k_plus':
      return '£25k+';
    case '35k_plus':
      return '£35k+';
    case '50k_plus':
      return '£50k+';
    case 'unspecified':
      return '—';
    default:
      return v;
  }
}

function lettingPetsShort(v: boolean | null) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '—';
}

/** Narrower min-widths on small viewports so less horizontal panning now the sidebar is off-canvas. */
const FEEDBACK_TABLE_MIN =
  'min-w-[640px] sm:min-w-[880px] lg:min-w-[1150px] xl:min-w-[1310px]';
const BODY_MAX_HEIGHT = 'max-h-[22rem] max-md:max-h-[min(70vh,28rem)]';
const PREQUAL_TABLE_MIN =
  'min-w-[520px] sm:min-w-[760px] lg:min-w-[960px] xl:min-w-[1040px]';
type View = 'feedback' | 'prequal';

/** `server` = API order (feedback: hot first, then time). */
type SubmittedSortMode = 'server' | 'submitted-desc' | 'submitted-asc';

/** Single active sort on the feedback table (one column at a time). */
type FeedbackTableSort =
  | { kind: 'server' }
  | { kind: 'submitted'; order: 'newest' | 'oldest' }
  | { kind: 'viewing'; order: 'newest' | 'oldest' }
  | { kind: 'rating'; order: 'high' | 'low' }
  | { kind: 'interest'; order: 'hot-first' | 'cold-first' };

type FeedbackSortColumn = 'submitted' | 'viewing' | 'rating' | 'interest';

function submittedAtMs(v: Date | string): number {
  return (typeof v === 'string' ? new Date(v) : v).getTime();
}

function interestRank(level: string): number {
  switch (level) {
    case 'hot':
      return 3;
    case 'warm':
      return 2;
    case 'cold':
      return 1;
    default:
      return 0;
  }
}

function cycleSubmittedSort(prev: SubmittedSortMode): SubmittedSortMode {
  if (prev === 'server') return 'submitted-desc';
  if (prev === 'submitted-desc') return 'submitted-asc';
  return 'server';
}

function cycleFeedbackTableSort(prev: FeedbackTableSort, column: FeedbackSortColumn): FeedbackTableSort {
  if (prev.kind !== column) {
    switch (column) {
      case 'submitted':
        return { kind: 'submitted', order: 'newest' };
      case 'viewing':
        return { kind: 'viewing', order: 'newest' };
      case 'rating':
        return { kind: 'rating', order: 'high' };
      case 'interest':
        return { kind: 'interest', order: 'hot-first' };
    }
  }
  switch (column) {
    case 'submitted':
      if (prev.kind !== 'submitted') return prev;
      return prev.order === 'newest' ? { kind: 'submitted', order: 'oldest' } : { kind: 'server' };
    case 'viewing':
      if (prev.kind !== 'viewing') return prev;
      return prev.order === 'newest' ? { kind: 'viewing', order: 'oldest' } : { kind: 'server' };
    case 'rating':
      if (prev.kind !== 'rating') return prev;
      return prev.order === 'high' ? { kind: 'rating', order: 'low' } : { kind: 'server' };
    case 'interest':
      if (prev.kind !== 'interest') return prev;
      return prev.order === 'hot-first' ? { kind: 'interest', order: 'cold-first' } : { kind: 'server' };
  }
}

function applyFeedbackSort(rows: RecentFeedbackRow[], sort: FeedbackTableSort): RecentFeedbackRow[] {
  if (sort.kind === 'server') return rows;
  const copy = [...rows];
  const tieBreakTimeDesc = (a: RecentFeedbackRow, b: RecentFeedbackRow) =>
    submittedAtMs(b.submitted_at) - submittedAtMs(a.submitted_at);

  switch (sort.kind) {
    case 'submitted': {
      const mul = sort.order === 'newest' ? -1 : 1;
      return copy.sort((a, b) => mul * (submittedAtMs(a.submitted_at) - submittedAtMs(b.submitted_at)));
    }
    case 'viewing': {
      const mul = sort.order === 'newest' ? -1 : 1;
      return copy.sort((a, b) => {
        const c = mul * a.viewing_date.localeCompare(b.viewing_date);
        return c !== 0 ? c : tieBreakTimeDesc(a, b);
      });
    }
    case 'rating': {
      const mul = sort.order === 'high' ? -1 : 1;
      return copy.sort((a, b) => {
        const c = mul * (a.rating - b.rating);
        return c !== 0 ? c : tieBreakTimeDesc(a, b);
      });
    }
    case 'interest': {
      return copy.sort((a, b) => {
        const diff =
          sort.order === 'hot-first'
            ? interestRank(b.interest_level) - interestRank(a.interest_level)
            : interestRank(a.interest_level) - interestRank(b.interest_level);
        return diff !== 0 ? diff : tieBreakTimeDesc(a, b);
      });
    }
  }
}

function sortPrequalRows<T extends { submitted_at: Date | string }>(rows: T[], mode: SubmittedSortMode): T[] {
  if (mode === 'server') return rows;
  const mul = mode === 'submitted-desc' ? -1 : 1;
  return [...rows].sort((a, b) => mul * (submittedAtMs(a.submitted_at) - submittedAtMs(b.submitted_at)));
}

function feedbackColumnSortTitle(sort: FeedbackTableSort, column: FeedbackSortColumn): string {
  if (sort.kind !== column) {
    switch (column) {
      case 'submitted':
        return 'Default order (hot interest first, then submission time). Click for newest submitted first';
      case 'viewing':
        return 'Default order. Click for newest viewing date first';
      case 'rating':
        return 'Default order. Click for highest rating first';
      case 'interest':
        return 'Default order. Click for Hot → Warm → Cold';
    }
  }
  switch (column) {
    case 'submitted':
      if (sort.kind !== 'submitted') return '';
      return sort.order === 'newest'
        ? 'Newest submitted first. Click for oldest first'
        : 'Oldest submitted first. Click for default order';
    case 'viewing':
      if (sort.kind !== 'viewing') return '';
      return sort.order === 'newest'
        ? 'Newest viewing date first. Click for oldest first'
        : 'Oldest viewing date first. Click for default order';
    case 'rating':
      if (sort.kind !== 'rating') return '';
      return sort.order === 'high'
        ? 'Highest rating first. Click for lowest first'
        : 'Lowest rating first. Click for default order';
    case 'interest':
      if (sort.kind !== 'interest') return '';
      return sort.order === 'hot-first'
        ? 'Hot first, then Warm, then Cold. Click for Cold first'
        : 'Cold first, then Warm, then Hot. Click for default order';
  }
}

function FeedbackSortColumnHeader({
  label,
  column,
  sort,
  onCycle,
  align = 'start',
}: {
  label: string;
  column: FeedbackSortColumn;
  sort: FeedbackTableSort;
  onCycle: () => void;
  align?: 'start' | 'center';
}) {
  const active = sort.kind === column;
  const Icon = (() => {
    if (!active) return ChevronsUpDown;
    switch (sort.kind) {
      case 'submitted':
        return sort.order === 'newest' ? ChevronDown : ChevronUp;
      case 'viewing':
        return sort.order === 'newest' ? ChevronDown : ChevronUp;
      case 'rating':
        return sort.order === 'high' ? ChevronDown : ChevronUp;
      case 'interest':
        return sort.order === 'hot-first' ? ChevronDown : ChevronUp;
      default:
        return ChevronsUpDown;
    }
  })();
  const title = feedbackColumnSortTitle(sort, column);

  return (
    <th
      className={cn(
        'whitespace-nowrap px-3 py-3',
        align === 'center' && 'text-center',
      )}
      scope="col"
    >
      <div className={cn('flex items-center gap-0.5', align === 'center' && 'justify-center')}>
        <span>{label}</span>
        <button
          type="button"
          onClick={onCycle}
          className={cn(
            '-m-0.5 rounded p-0.5 text-zinc-400 outline-none hover:bg-zinc-200 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500',
            active && 'text-zinc-700 dark:text-zinc-200',
          )}
          title={title}
          aria-label={title}
        >
          <Icon className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </th>
  );
}

function SubmittedColumnHeader({
  mode,
  onCycle,
}: {
  mode: SubmittedSortMode;
  onCycle: () => void;
}) {
  const Icon = mode === 'server' ? ChevronsUpDown : mode === 'submitted-desc' ? ChevronDown : ChevronUp;
  const title =
    mode === 'server'
      ? 'Default order (feedback: hot interest first). Click to sort by newest submitted'
      : mode === 'submitted-desc'
        ? 'Newest submitted first. Click for oldest first'
        : 'Oldest submitted first. Click for default order';
  return (
    <th className="whitespace-nowrap px-3 py-3" scope="col">
      <div className="flex items-center gap-0.5">
        <span>Submitted</span>
        <button
          type="button"
          onClick={onCycle}
          className={cn(
            '-m-0.5 rounded p-0.5 text-zinc-400 outline-none hover:bg-zinc-200 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500',
            mode !== 'server' && 'text-zinc-700 dark:text-zinc-200',
          )}
          title={title}
          aria-label={title}
        >
          <Icon className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </th>
  );
}

export function DashboardListingActivityPanel({
  title,
  feedbackDescription,
  prequalDescription,
  accent,
  feedbackRows,
  prequalRows,
  listing,
  feedbackEmptyTitle,
  feedbackEmptyDescription,
  prequalEmptyTitle,
  prequalEmptyDescription,
  ctaHref,
  ctaLabel,
  headerEnd,
  feedbackNewWithin24hCount = 0,
  prequalNewWithin24hCount = 0,
}: {
  title: string;
  feedbackDescription: string;
  prequalDescription: string;
  accent: 'sale' | 'letting';
  feedbackRows: RecentFeedbackRow[];
  prequalRows: RecentSalePrequalDashboardRow[] | RecentLettingPrequalDashboardRow[];
  listing: 'sale' | 'letting';
  feedbackEmptyTitle: string;
  feedbackEmptyDescription: string;
  prequalEmptyTitle: string;
  prequalEmptyDescription: string;
  ctaHref: string;
  ctaLabel: string;
  headerEnd?: ReactNode;
  /** Feedback submissions in the rolling 24h window (live listings). */
  feedbackNewWithin24hCount?: number;
  /** Pre-viewing submissions in the rolling 24h window (live listings). */
  prequalNewWithin24hCount?: number;
}) {
  const [view, setView] = useState<View>('feedback');
  const [feedbackTableSort, setFeedbackTableSort] = useState<FeedbackTableSort>({ kind: 'server' });
  const [prequalSubmittedSort, setPrequalSubmittedSort] = useState<SubmittedSortMode>('server');

  const displayFeedbackRows = useMemo(
    () => applyFeedbackSort(feedbackRows, feedbackTableSort),
    [feedbackRows, feedbackTableSort],
  );

  const sortedPrequalRows = useMemo(() => {
    if (listing === 'sale') {
      return sortPrequalRows(prequalRows as RecentSalePrequalDashboardRow[], prequalSubmittedSort);
    }
    return sortPrequalRows(prequalRows as RecentLettingPrequalDashboardRow[], prequalSubmittedSort);
  }, [listing, prequalRows, prequalSubmittedSort]);

  const ring =
    accent === 'sale'
      ? 'border-sky-200 dark:border-sky-900/60'
      : 'border-violet-200 dark:border-violet-900/60';

  const description = view === 'feedback' ? feedbackDescription : prequalDescription;

  return (
    <div className={cn('overflow-hidden rounded-lg border-2 bg-white dark:bg-zinc-900', ring)}>
      <div className="border-b border-zinc-200 px-3 py-3 sm:px-4 dark:border-zinc-800">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
            </div>
            {headerEnd ? <div className="shrink-0 w-full sm:w-auto">{headerEnd}</div> : null}
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label={`${title} activity type`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === 'feedback'}
              tabIndex={view === 'feedback' ? 0 : -1}
              onClick={() => setView('feedback')}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                view === 'feedback'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80',
              )}
            >
              <ChevronLeft className="size-4 opacity-70" aria-hidden />
              Feedback
              {feedbackNewWithin24hCount > 0 ? (
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  New
                </span>
              ) : null}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'prequal'}
              tabIndex={view === 'prequal' ? 0 : -1}
              onClick={() => setView('prequal')}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                view === 'prequal'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80',
              )}
            >
              Pre-viewing
              {prequalNewWithin24hCount > 0 ? (
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  New
                </span>
              ) : null}
              <ChevronRight className="size-4 opacity-70" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {view === 'feedback' ? (
        displayFeedbackRows.length === 0 ? (
          <div className="p-2">
            <FeedbackEmptyState
              title={feedbackEmptyTitle}
              description={feedbackEmptyDescription}
              ctaHref={ctaHref}
              ctaLabel={ctaLabel}
            />
          </div>
        ) : (
          <div className="-mx-0 overflow-x-auto overscroll-x-contain touch-pan-x">
            <div className={cn('overflow-y-auto', BODY_MAX_HEIGHT)}>
              <table className={cn('w-full text-left text-sm', FEEDBACK_TABLE_MIN)}>
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  <tr>
                    <th className="w-14 px-2 py-3">
                      <span className="sr-only">Property photo</span>
                    </th>
                    <FeedbackSortColumnHeader
                      label="Viewing"
                      column="viewing"
                      sort={feedbackTableSort}
                      onCycle={() => setFeedbackTableSort((s) => cycleFeedbackTableSort(s, 'viewing'))}
                    />
                    <FeedbackSortColumnHeader
                      label="Submitted"
                      column="submitted"
                      sort={feedbackTableSort}
                      onCycle={() => setFeedbackTableSort((s) => cycleFeedbackTableSort(s, 'submitted'))}
                    />
                    <th className="min-w-[10rem] px-3 py-3">Property</th>
                    <th className="min-w-[6.5rem] px-3 py-3">Buyer</th>
                    <th className="min-w-[12rem] px-3 py-3 sm:min-w-[16rem]">Contact</th>
                    <FeedbackSortColumnHeader
                      label="Rating"
                      column="rating"
                      sort={feedbackTableSort}
                      onCycle={() => setFeedbackTableSort((s) => cycleFeedbackTableSort(s, 'rating'))}
                      align="center"
                    />
                    <FeedbackSortColumnHeader
                      label="Interest"
                      column="interest"
                      sort={feedbackTableSort}
                      onCycle={() => setFeedbackTableSort((s) => cycleFeedbackTableSort(s, 'interest'))}
                    />
                    <th className="whitespace-nowrap px-3 py-3">Details</th>
                    <th className="w-[7.75rem] min-w-0 px-2 py-3">Follow-up</th>
                    <th className="w-12 px-1 py-3 text-right">
                      <span className="sr-only">Delete</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {displayFeedbackRows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="w-14 px-2 py-3 align-top">
                        {row.property_hero_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.property_hero_image_url}
                            alt=""
                            className="size-11 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                          />
                        ) : (
                          <span
                            className="block size-11 rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                            aria-hidden
                          />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatViewDate(row.viewing_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{formatDateTime(row.submitted_at)}</span>
                          {row.is_new_within_24h ? (
                            <span className="shrink-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                              New
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="max-w-[14rem] px-3 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        <Link href={`/properties/${row.property_id}`} className="hover:underline">
                          {row.property_address}
                          <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                            {row.property_postcode}
                          </span>
                        </Link>
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-3 text-zinc-700 dark:text-zinc-300">
                        {row.buyer_name}
                      </td>
                      <td className="min-w-[12rem] max-w-[20rem] px-3 py-3 align-top text-xs leading-snug sm:min-w-[16rem] sm:max-w-[22rem]">
                        <div className="flex flex-wrap gap-2">
                          <ContactOutreachLinks
                            email={row.buyer_email}
                            phone={row.buyer_phone}
                            className="pt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <a
                              href={`mailto:${row.buyer_email}`}
                              target="_top"
                              rel="noreferrer"
                              className="break-all font-medium text-blue-600 hover:underline dark:text-blue-400"
                              onClick={(e) => handleMailtoAnchorClick(e, row.buyer_email)}
                            >
                              {row.buyer_email}
                            </a>
                            {row.buyer_phone?.trim() ? (
                              <a
                                href={`tel:${row.buyer_phone.replace(/\s+/g, '')}`}
                                className="mt-1 block text-zinc-700 hover:underline dark:text-zinc-300"
                              >
                                {row.buyer_phone}
                              </a>
                            ) : (
                              <span className="mt-1 block text-zinc-400 dark:text-zinc-500">No phone</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="w-11 max-w-11 whitespace-nowrap px-1.5 py-3 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                        {row.rating}/5
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                              row.interest_level === 'hot' &&
                                'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
                              row.interest_level === 'warm' &&
                                'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
                              row.interest_level === 'cold' &&
                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                            )}
                          >
                            {formatInterest(row.interest_level)}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {row.price_opinion === 'too_high' ? (
                              <span className="inline-flex rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-900 dark:bg-orange-950 dark:text-orange-100">
                                Price
                              </span>
                            ) : null}
                            {row.wants_second_viewing ? (
                              <span className="inline-flex rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-900 dark:bg-sky-950 dark:text-sky-100">
                                2nd viewing
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[16rem] px-3 py-3 align-top sm:max-w-[18rem]">
                        <FeedbackDetailDrawerTrigger
                          subtitle={`${row.buyer_name} · ${row.property_postcode}`}
                          listingType={row.listing_type === 'letting' ? 'letting' : 'sale'}
                          rating={row.rating}
                          interestLevel={row.interest_level}
                          priceOpinion={row.price_opinion}
                          wantsSecondViewing={row.wants_second_viewing}
                          replyLagDays={row.reply_lag_days}
                          buyerPosition={row.buyer_position}
                          hasAip={row.has_aip}
                          propertyHighlights={row.property_highlights}
                          negativeFeedbackTags={row.negative_feedback_tags}
                          likedText={row.liked_text}
                          dislikedText={row.disliked_text}
                          comment={row.comment}
                          targetMoveInDate={row.target_move_in_date}
                          occupantCount={row.occupant_count}
                          hasPets={row.has_pets}
                          petsDetail={row.pets_detail}
                          householdIncomeBand={row.household_income_band}
                        />
                        <Link
                          href={`/properties/${row.property_id}?tab=feedback&feedback=${row.id}#feedback-${row.id}`}
                          className="mt-2 block text-[10px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          Open on property page
                        </Link>
                      </td>
                      <td className="w-[7.75rem] max-w-[7.75rem] px-2 py-3 align-top">
                        <AgentFollowUpSelect
                          compact
                          feedbackId={row.id}
                          value={row.agent_follow_up as AgentFollowUp}
                        />
                      </td>
                      <td className="w-12 px-1 py-3 align-top text-right">
                        <DeleteFeedbackButton
                          feedbackId={row.id}
                          buyerLabel={row.buyer_email}
                          compact
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : prequalRows.length === 0 ? (
        <div className="p-2">
          <FeedbackEmptyState
            title={prequalEmptyTitle}
            description={prequalEmptyDescription}
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
          />
        </div>
      ) : listing === 'sale' ? (
        <SalePrequalTable
          rows={sortedPrequalRows as RecentSalePrequalDashboardRow[]}
          submittedSort={prequalSubmittedSort}
          onCycleSubmittedSort={() => setPrequalSubmittedSort((s) => cycleSubmittedSort(s))}
        />
      ) : (
        <LettingPrequalTable
          rows={sortedPrequalRows as RecentLettingPrequalDashboardRow[]}
          submittedSort={prequalSubmittedSort}
          onCycleSubmittedSort={() => setPrequalSubmittedSort((s) => cycleSubmittedSort(s))}
        />
      )}
    </div>
  );
}

function SalePrequalTable({
  rows,
  submittedSort,
  onCycleSubmittedSort,
}: {
  rows: RecentSalePrequalDashboardRow[];
  submittedSort: SubmittedSortMode;
  onCycleSubmittedSort: () => void;
}) {
  return (
    <div className="-mx-0 overflow-x-auto overscroll-x-contain touch-pan-x">
      <div className={cn('overflow-y-auto', BODY_MAX_HEIGHT)}>
        <table className={cn('w-full text-left text-sm', PREQUAL_TABLE_MIN)}>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            <tr>
              <th className="w-14 px-2 py-3">
                <span className="sr-only">Photo</span>
              </th>
              <SubmittedColumnHeader mode={submittedSort} onCycle={onCycleSubmittedSort} />
              <th className="min-w-[10rem] px-3 py-3">Property</th>
              <th className="min-w-[6.5rem] px-3 py-3">Name</th>
              <th className="min-w-[12rem] px-3 py-3 sm:min-w-[16rem]">Contact</th>
              <th className="whitespace-nowrap px-3 py-3">Buying</th>
              <th className="whitespace-nowrap px-3 py-3">Funding</th>
              <th className="whitespace-nowrap px-3 py-3">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                <td className="w-14 px-2 py-3 align-top">
                  {row.property_hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.property_hero_image_url}
                      alt=""
                      className="size-11 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                  ) : (
                    <span
                      className="block size-11 rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                      aria-hidden
                    />
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{formatDateTime(row.submitted_at)}</span>
                    {row.is_new_within_24h ? (
                      <span className="shrink-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="max-w-[14rem] px-3 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <Link href={`/properties/${row.property_id}`} className="hover:underline">
                    {row.property_address}
                    <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                      {row.property_postcode}
                    </span>
                  </Link>
                </td>
                <td className="max-w-[10rem] truncate px-3 py-3 text-zinc-700 dark:text-zinc-300">
                  {row.name}
                </td>
                <td className="min-w-[12rem] max-w-[20rem] px-3 py-3 align-top text-xs leading-snug sm:min-w-[16rem] sm:max-w-[22rem]">
                  <div className="flex flex-wrap gap-2">
                    <ContactOutreachLinks email={row.email} phone={row.phone} className="pt-0.5" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={`mailto:${row.email}`}
                        target="_top"
                        rel="noreferrer"
                        className="break-all font-medium text-blue-600 hover:underline dark:text-blue-400"
                        onClick={(e) => handleMailtoAnchorClick(e, row.email)}
                      >
                        {row.email}
                      </a>
                      {row.phone?.trim() ? (
                        <a
                          href={`tel:${row.phone.replace(/\s+/g, '')}`}
                          className="mt-1 block text-zinc-700 hover:underline dark:text-zinc-300"
                        >
                          {row.phone}
                        </a>
                      ) : (
                        <span className="mt-1 block text-zinc-400 dark:text-zinc-500">No phone</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                  {saleBuyingShort(row.buying_position)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                  {saleFundingShort(row.funding_type)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 align-top">
                  <Link
                    href={`/properties/${row.property_id}`}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open property
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LettingPrequalTable({
  rows,
  submittedSort,
  onCycleSubmittedSort,
}: {
  rows: RecentLettingPrequalDashboardRow[];
  submittedSort: SubmittedSortMode;
  onCycleSubmittedSort: () => void;
}) {
  return (
    <div className="-mx-0 overflow-x-auto overscroll-x-contain touch-pan-x">
      <div className={cn('overflow-y-auto', BODY_MAX_HEIGHT)}>
        <table className={cn('w-full text-left text-sm', PREQUAL_TABLE_MIN)}>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            <tr>
              <th className="w-14 px-2 py-3">
                <span className="sr-only">Photo</span>
              </th>
              <SubmittedColumnHeader mode={submittedSort} onCycle={onCycleSubmittedSort} />
              <th className="min-w-[10rem] px-3 py-3">Property</th>
              <th className="min-w-[6.5rem] px-3 py-3">Name</th>
              <th className="min-w-[12rem] px-3 py-3 sm:min-w-[16rem]">Contact</th>
              <th className="whitespace-nowrap px-3 py-3">Income</th>
              <th className="whitespace-nowrap px-3 py-3">Pets</th>
              <th className="whitespace-nowrap px-3 py-3">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                <td className="w-14 px-2 py-3 align-top">
                  {row.property_hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.property_hero_image_url}
                      alt=""
                      className="size-11 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                  ) : (
                    <span
                      className="block size-11 rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                      aria-hidden
                    />
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{formatDateTime(row.submitted_at)}</span>
                    {row.is_new_within_24h ? (
                      <span className="shrink-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="max-w-[14rem] px-3 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <Link href={`/properties/${row.property_id}`} className="hover:underline">
                    {row.property_address}
                    <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                      {row.property_postcode}
                    </span>
                  </Link>
                </td>
                <td className="max-w-[10rem] truncate px-3 py-3 text-zinc-700 dark:text-zinc-300">
                  {row.name}
                </td>
                <td className="min-w-[12rem] max-w-[20rem] px-3 py-3 align-top text-xs leading-snug sm:min-w-[16rem] sm:max-w-[22rem]">
                  <div className="flex flex-wrap gap-2">
                    <ContactOutreachLinks email={row.email} phone={row.phone} className="pt-0.5" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={`mailto:${row.email}`}
                        target="_top"
                        rel="noreferrer"
                        className="break-all font-medium text-blue-600 hover:underline dark:text-blue-400"
                        onClick={(e) => handleMailtoAnchorClick(e, row.email)}
                      >
                        {row.email}
                      </a>
                      {row.phone?.trim() ? (
                        <a
                          href={`tel:${row.phone.replace(/\s+/g, '')}`}
                          className="mt-1 block text-zinc-700 hover:underline dark:text-zinc-300"
                        >
                          {row.phone}
                        </a>
                      ) : (
                        <span className="mt-1 block text-zinc-400 dark:text-zinc-500">No phone</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                  {lettingIncomeShort(row.annual_income_band)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                  {lettingPetsShort(row.has_pets)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 align-top">
                  <Link
                    href={`/properties/${row.property_id}`}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open property
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
