import { AgentFollowUpSelect } from "@/components/agent-follow-up-select";
import { DeleteFeedbackButton } from "@/components/delete-feedback-button";
import { FeedbackDetailDrawerTrigger } from "@/components/feedback-detail-drawer";
import { FeedbackEmptyState } from "@/components/feedback-empty-state";
import { listFeedbackForProperty } from "@/lib/feedback/queries";
import type { AgentFollowUp } from "@/lib/feedback/agent-follow-up";
import {
  formatBuyerPosition,
  formatHasAip,
  highlightsToDisplayString,
  negativesToDisplayString,
} from "@/lib/feedback/extended-fields";
import {
  formatIncomeBand,
  formatOccupantCount,
  lettingsHighlightsToDisplayString,
  lettingsNegativesToDisplayString,
} from "@/lib/feedback/lettings-extended-fields";
import type { ListingType } from "@/lib/feedback/queries";
import { formatPriceOpinionVendor } from "@/lib/feedback/price-labels";
import { cn } from "@/lib/utils";

function formatViewDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatInterest(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function replyLagLabel(days: number) {
  if (days <= 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function formatLettingsTenantCell(row: {
  listing_type: ListingType;
  target_move_in_date: string | null;
  occupant_count: string | null;
  household_income_band: string | null;
}): string {
  if (row.listing_type !== "letting") return "";
  const bits: string[] = [];
  if (row.target_move_in_date) bits.push(`In: ${row.target_move_in_date}`);
  const occ = formatOccupantCount(row.occupant_count);
  if (occ !== "—") bits.push(`${occ} occ.`);
  const inc = formatIncomeBand(row.household_income_band);
  if (inc !== "—") bits.push(inc);
  return bits.join(" · ") || "—";
}

function formatLettingsPetsCell(row: {
  listing_type: ListingType;
  has_pets: boolean | null;
  pets_detail: string | null;
}): string {
  if (row.listing_type !== "letting") return "";
  if (row.has_pets === true) return row.pets_detail?.trim() || "Yes";
  if (row.has_pets === false) return "No";
  return "—";
}

function snippet(text: string | null, max = 72) {
  if (!text?.trim()) return "—";
  const s = text.trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

export async function PropertyFeedbackCard({
  propertyId,
  companyId,
  openFeedbackId = null,
}: {
  propertyId: string;
  companyId: string;
  /** When set (e.g. from ?feedback=), opens that row’s drawer on load. */
  openFeedbackId?: string | null;
}) {
  const rows = await listFeedbackForProperty(propertyId, companyId);

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Buyer &amp; tenant feedback
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Submissions from feedback links (for sale and to-let listings). Hot interest sorted to the
          top. <strong className="font-medium">Full feedback</strong> is beside each buyer email in the
          second column (after Leads). Use <strong className="font-medium">Status</strong> to track your
          follow-up.
        </p>
      </div>
      {rows.length === 0 ? (
        <FeedbackEmptyState
          title="Wait for your first feedback!"
          description="Add buyers to a viewing, then send invite links or copy email drafts from Viewings on this page."
          ctaHref={`/properties/${propertyId}/viewings/new`}
          ctaLabel="Schedule a viewing"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-3 py-3">Leads</th>
                <th className="min-w-[12rem] px-3 py-3">Buyer / contact</th>
                <th className="px-3 py-3">Submitted</th>
                <th className="px-3 py-3">Viewing</th>
                <th className="px-3 py-3">Lag</th>
                <th className="hidden px-3 py-3 lg:table-cell" title="Buyer position or tenant move-in / occupants / income">
                  Position / tenancy
                </th>
                <th className="hidden px-3 py-3 lg:table-cell" title="Mortgage AIP or pets">
                  AIP / pets
                </th>
                <th className="px-3 py-3 text-right">Rating</th>
                <th className="px-3 py-3">Interest</th>
                <th className="hidden px-3 py-3 md:table-cell">Price</th>
                <th className="hidden px-3 py-3 lg:table-cell">2nd / apply</th>
                <th className="px-3 py-3">Status</th>
                <th className="hidden max-w-[9rem] px-3 py-3 xl:table-cell">Highlights</th>
                <th className="hidden max-w-[9rem] px-3 py-3 xl:table-cell">Concerns</th>
                <th className="hidden max-w-[160px] px-3 py-3 xl:table-cell">Liked</th>
                <th className="hidden max-w-[160px] px-3 py-3 xl:table-cell">Disliked</th>
                <th className="hidden max-w-[180px] px-3 py-3 xl:table-cell">Comment</th>
                <th className="w-20 whitespace-nowrap px-2 py-3 text-right">
                  <span className="sr-only">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => {
                const lag = row.reply_lag_days;
                return (
                  <tr
                    key={row.id}
                    id={`feedback-${row.id}`}
                    className="scroll-mt-24 align-top hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.interest_level === "hot" ? (
                          <span className="inline-flex rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                            Hot
                          </span>
                        ) : null}
                        {row.price_opinion === "too_high" ? (
                          <span
                            className="inline-flex rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-900 dark:bg-orange-950 dark:text-orange-100"
                            title="Price: expensive vs asking"
                          >
                            Price
                          </span>
                        ) : null}
                        {row.wants_second_viewing ? (
                          <span
                            className="inline-flex rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-900 dark:bg-sky-950 dark:text-sky-100"
                            title={row.listing_type === "letting" ? "Wants to apply" : "Second viewing"}
                          >
                            {row.listing_type === "letting" ? "Apply" : "2nd"}
                          </span>
                        ) : null}
                        {row.interest_level !== "hot" &&
                        row.price_opinion !== "too_high" &&
                        !row.wants_second_viewing ? (
                          <span className="text-xs text-zinc-400">—</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="max-w-[14rem] min-w-[10.5rem] px-3 py-3 align-top text-zinc-900 dark:text-zinc-50">
                      <div className="font-medium">{row.buyer_name}</div>
                      <div className="mt-1.5 flex min-w-0 flex-col gap-1.5">
                        <a
                          href={`mailto:${row.buyer_email}`}
                          className="break-all text-xs font-normal text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {row.buyer_email}
                        </a>
                        <div className="min-w-0 max-w-full">
                          <FeedbackDetailDrawerTrigger
                            defaultOpen={openFeedbackId != null && row.id === openFeedbackId}
                            subtitle={`${row.buyer_name} · Viewing ${formatViewDate(row.viewing_date)}`}
                            replaceHrefOnClose={
                              openFeedbackId != null && row.id === openFeedbackId
                                ? `/properties/${propertyId}?tab=feedback`
                                : undefined
                            }
                            listingType={row.listing_type}
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
                            triggerClassName="mt-0.5 inline-flex"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatDateTime(row.submitted_at)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-zinc-700 dark:text-zinc-300">
                      {formatViewDate(row.viewing_date)}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-3 text-zinc-700 dark:text-zinc-300"
                      title="Calendar days after viewing (London)"
                    >
                      {replyLagLabel(lag)}
                    </td>
                    <td className="hidden max-w-[7rem] px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 lg:table-cell">
                      {row.listing_type === "letting"
                        ? formatLettingsTenantCell(row)
                        : formatBuyerPosition(row.buyer_position)}
                    </td>
                    <td className="hidden px-3 py-3 text-zinc-600 dark:text-zinc-400 lg:table-cell">
                      {row.listing_type === "letting"
                        ? formatLettingsPetsCell(row)
                        : formatHasAip(row.has_aip)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.rating}/5
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          row.interest_level === "hot" &&
                            "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
                          row.interest_level === "warm" &&
                            "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
                          row.interest_level === "cold" &&
                            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                        )}
                      >
                        {formatInterest(row.interest_level)}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-zinc-600 dark:text-zinc-400 md:table-cell">
                      {formatPriceOpinionVendor(row.price_opinion)}
                    </td>
                    <td className="hidden px-3 py-3 text-zinc-600 dark:text-zinc-400 lg:table-cell">
                      {row.wants_second_viewing ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <AgentFollowUpSelect
                        feedbackId={row.id}
                        value={row.agent_follow_up as AgentFollowUp}
                      />
                    </td>
                    <td
                      className="hidden max-w-[9rem] px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 xl:table-cell"
                      title={
                        row.listing_type === "letting"
                          ? lettingsHighlightsToDisplayString(row.property_highlights)
                          : highlightsToDisplayString(row.property_highlights)
                      }
                    >
                      {snippet(
                        row.listing_type === "letting"
                          ? lettingsHighlightsToDisplayString(row.property_highlights)
                          : highlightsToDisplayString(row.property_highlights),
                        48,
                      )}
                    </td>
                    <td
                      className="hidden max-w-[9rem] px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 xl:table-cell"
                      title={
                        row.listing_type === "letting"
                          ? lettingsNegativesToDisplayString(row.negative_feedback_tags)
                          : negativesToDisplayString(row.negative_feedback_tags)
                      }
                    >
                      {snippet(
                        row.listing_type === "letting"
                          ? lettingsNegativesToDisplayString(row.negative_feedback_tags)
                          : negativesToDisplayString(row.negative_feedback_tags),
                        48,
                      )}
                    </td>
                    <td
                      className="hidden max-w-[160px] px-3 py-3 text-zinc-600 dark:text-zinc-400 xl:table-cell"
                      title={row.liked_text ?? undefined}
                    >
                      {snippet(row.liked_text)}
                    </td>
                    <td
                      className="hidden max-w-[160px] px-3 py-3 text-zinc-600 dark:text-zinc-400 xl:table-cell"
                      title={row.disliked_text ?? undefined}
                    >
                      {snippet(row.disliked_text)}
                    </td>
                    <td
                      className="hidden max-w-[180px] px-3 py-3 text-zinc-600 dark:text-zinc-400 xl:table-cell"
                      title={row.comment ?? undefined}
                    >
                      {snippet(row.comment)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right align-top">
                      <DeleteFeedbackButton
                        feedbackId={row.id}
                        buyerLabel={row.buyer_email}
                        compact
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
