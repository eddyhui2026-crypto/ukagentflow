"use server";

import { getSql } from "@/lib/db/neon";
import {
  parseHighlightsFromFormData,
  parseNegativesFromFormData,
  storeHighlights,
  storeNegatives,
} from "@/lib/feedback/extended-fields";
import { getFeedbackContextByToken, getPropertyIdForViewing } from "@/lib/feedback/queries";
import { consumeFeedbackSubmitAttempt } from "@/lib/feedback/submit-rate-limit";
import { getRequestClientIp } from "@/lib/http/client-ip";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FeedbackFormState = { error?: string } | undefined;

const INTEREST = new Set(["hot", "warm", "cold"]);
const PRICE = new Set(["too_high", "fair", "good_value"]);
const BUYER_POSITION = new Set([
  "first_time_buyer",
  "chain_free",
  "cash_buyer",
  "other",
]);

export async function submitFeedbackAction(
  _prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const token = String(formData.get("feedback_token") ?? "").trim();
  if (!token) {
    return { error: "Invalid link." };
  }

  const ip = await getRequestClientIp();
  const ctxPre = await getFeedbackContextByToken(token);
  const rl = await consumeFeedbackSubmitAttempt(ip, token, {
    tokenCountsTowardLimit: !!ctxPre,
  });
  if (!rl.ok) {
    return { error: rl.message };
  }

  const ctx = ctxPre;
  if (!ctx) {
    return { error: "This feedback link is not valid." };
  }
  if (ctx.token_invalidated_at) {
    return { error: "This link is no longer active. Ask your agent for a new one." };
  }
  if (ctx.link_expired) {
    return { error: "This feedback link has expired. Ask your agent if you still need to respond." };
  }
  if (ctx.already_submitted) {
    return { error: "You have already submitted feedback for this viewing." };
  }
  if (ctx.listing_type !== "sale") {
    return { error: "This link is for a rental listing — use the letting feedback form." };
  }

  const ratingRaw = formData.get("rating");
  const interest = String(formData.get("interest_level") ?? "").toLowerCase();
  const price = String(formData.get("price_opinion") ?? "").toLowerCase();
  const liked = String(formData.get("liked_text") ?? "").trim() || null;
  const disliked = String(formData.get("disliked_text") ?? "").trim() || null;
  const secondRaw = String(formData.get("wants_second_viewing") ?? "");

  const rating =
    typeof ratingRaw === "string"
      ? Number.parseInt(ratingRaw, 10)
      : Number(ratingRaw);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a rating from 1 to 5." };
  }
  if (!INTEREST.has(interest)) {
    return { error: "Please choose how interested you are." };
  }
  if (!PRICE.has(price)) {
    return { error: "Please choose what you think about the price." };
  }
  if (secondRaw !== "yes" && secondRaw !== "no") {
    return { error: "Please say if you would like a second viewing." };
  }
  const wantsSecond = secondRaw === "yes";

  const positionRaw = String(formData.get("buyer_position") ?? "").trim();
  const buyerPosition =
    !positionRaw || positionRaw === "unspecified"
      ? null
      : BUYER_POSITION.has(positionRaw)
        ? positionRaw
        : null;
  if (positionRaw && positionRaw !== "unspecified" && !buyerPosition) {
    return { error: "Please choose a valid buying position, or “Prefer not to say”." };
  }

  const aipRaw = String(formData.get("has_aip") ?? "unspecified").trim();
  let hasAip: boolean | null = null;
  if (aipRaw === "yes") hasAip = true;
  else if (aipRaw === "no") hasAip = false;
  else if (aipRaw && aipRaw !== "unspecified") {
    return { error: "Please say if you have a mortgage agreement in principle, or choose “Prefer not to say”." };
  }

  const highlightsStored = storeHighlights(parseHighlightsFromFormData(formData));
  const negativesStored = storeNegatives(parseNegativesFromFormData(formData));

  const sql = getSql();

  try {
    await sql`
      INSERT INTO feedback (
        viewing_id,
        buyer_id,
        rating,
        interest_level,
        price_opinion,
        liked_text,
        disliked_text,
        wants_second_viewing,
        buyer_position,
        has_aip,
        property_highlights,
        negative_feedback_tags,
        listing_type,
        target_move_in_date,
        occupant_count,
        has_pets,
        pets_detail,
        household_income_band
      )
      VALUES (
        ${ctx.viewing_id},
        ${ctx.buyer_id},
        ${rating},
        ${interest}::interest_level,
        ${price}::price_opinion,
        ${liked},
        ${disliked},
        ${wantsSecond},
        ${buyerPosition}::buyer_position,
        ${hasAip},
        ${highlightsStored},
        ${negativesStored},
        'sale'::listing_type,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      )
    `;
  } catch {
    return {
      error: "Could not save feedback. It may already have been submitted.",
    };
  }

  const propertyId = await getPropertyIdForViewing(ctx.viewing_id);
  if (propertyId) {
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/dashboard");
  }

  redirect(`/feedback/${encodeURIComponent(token)}/submitted`);
}
