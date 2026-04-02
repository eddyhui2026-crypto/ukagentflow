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
import { formatPriceOpinionVendor } from "@/lib/feedback/price-labels";
import type { ListingType } from "@/lib/feedback/queries";
import { cn } from "@/lib/utils";

function formatInterest(label: string) {
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "—";
}

function replyLagLabel(days: number) {
  if (days <= 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function lettingsPetsLine(
  hasPets: boolean | null,
  petsDetail: string | null,
): string {
  if (hasPets === true) return petsDetail?.trim() || "Yes";
  if (hasPets === false) return "No";
  return "—";
}

function lettingsTenantLine(
  targetMoveIn: string | null,
  occupantCount: string | null,
  incomeBand: string | null,
): string {
  const bits: string[] = [];
  if (targetMoveIn) bits.push(`Move-in: ${targetMoveIn}`);
  const occ = formatOccupantCount(occupantCount);
  if (occ !== "—") bits.push(`${occ} occupants`);
  const inc = formatIncomeBand(incomeBand);
  if (inc !== "—") bits.push(inc);
  return bits.join(" · ") || "—";
}

export function FeedbackFullDetail({
  listingType,
  rating,
  interestLevel,
  priceOpinion,
  wantsSecondViewing,
  replyLagDays,
  buyerPosition,
  hasAip,
  propertyHighlights,
  negativeFeedbackTags,
  likedText,
  dislikedText,
  comment,
  targetMoveInDate,
  occupantCount,
  hasPets,
  petsDetail,
  householdIncomeBand,
  className,
}: {
  listingType: ListingType;
  rating: number;
  interestLevel: string;
  priceOpinion: string;
  wantsSecondViewing: boolean;
  replyLagDays: number;
  buyerPosition: string | null;
  hasAip: boolean | null;
  propertyHighlights: string;
  negativeFeedbackTags: string;
  likedText: string | null;
  dislikedText: string | null;
  comment: string | null;
  targetMoveInDate: string | null;
  occupantCount: string | null;
  hasPets: boolean | null;
  petsDetail: string | null;
  householdIncomeBand: string | null;
  className?: string;
}) {
  const isLet = listingType === "letting";
  const hl = isLet
    ? lettingsHighlightsToDisplayString(propertyHighlights)
    : highlightsToDisplayString(propertyHighlights);
  const neg = isLet
    ? lettingsNegativesToDisplayString(negativeFeedbackTags)
    : negativesToDisplayString(negativeFeedbackTags);

  const row = (label: string, value: string) => (
    <div className="grid gap-0.5 border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-800/80">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="text-xs text-zinc-800 dark:text-zinc-200">{value}</dd>
    </div>
  );

  const textBlock = (label: string, value: string | null) => (
    <div className="grid gap-0.5 border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-800/80">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap break-words text-xs text-zinc-800 dark:text-zinc-200">
        {value?.trim() ? value.trim() : "—"}
      </dd>
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-md border border-zinc-200 bg-zinc-50/80 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900/50",
        className,
      )}
    >
      <dl>
        {row("Rating", `${rating}/5`)}
        {row("Interest", formatInterest(interestLevel))}
        {row("Price vs asking", formatPriceOpinionVendor(priceOpinion))}
        {row(
          isLet ? "Wants to apply" : "Second viewing",
          wantsSecondViewing ? "Yes" : "No",
        )}
        {row("Reply lag (vs viewing)", replyLagLabel(replyLagDays))}
        {isLet
          ? row(
              "Tenancy / household",
              lettingsTenantLine(
                targetMoveInDate,
                occupantCount,
                householdIncomeBand,
              ),
            )
          : row("Buying position", formatBuyerPosition(buyerPosition))}
        {isLet
          ? row("Pets", lettingsPetsLine(hasPets, petsDetail))
          : row("Mortgage AIP", formatHasAip(hasAip))}
        {row(isLet ? "Liked (rental)" : "Highlights", hl)}
        {row(isLet ? "Concerns (rental)" : "Concerns", neg)}
        {textBlock("Liked (free text)", likedText)}
        {textBlock("Disliked (free text)", dislikedText)}
        {textBlock("Comment", comment)}
      </dl>
    </div>
  );
}
