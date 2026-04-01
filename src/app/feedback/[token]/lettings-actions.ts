"use server";

import { getSql } from "@/lib/db/neon";
import {
  parseLettingsHighlightsFromFormData,
  parseLettingsNegativesFromFormData,
  storeLettingsHighlights,
  storeLettingsNegatives,
} from "@/lib/feedback/lettings-extended-fields";
import { getFeedbackContextByToken, getPropertyIdForViewing } from "@/lib/feedback/queries";
import { consumeFeedbackSubmitAttempt } from "@/lib/feedback/submit-rate-limit";
import { getRequestClientIp } from "@/lib/http/client-ip";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LettingsFeedbackFormState = { error?: string } | undefined;

const INTEREST = new Set(["hot", "warm", "cold"]);
const LETTINGS_RENT = new Set(["great_value", "fair", "slightly_high", "too_high"]);
const OCCUPANTS = new Set(["1", "2", "3", "4_plus"]);
const INCOME = new Set(["25k_plus", "35k_plus", "50k_plus", "unspecified"]);

function parseOptionalDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  return s;
}

export async function submitLettingsFeedbackAction(
  _prev: LettingsFeedbackFormState,
  formData: FormData,
): Promise<LettingsFeedbackFormState> {
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
  if (ctx.listing_type !== "letting") {
    return { error: "This link is not for a rental listing." };
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

  const ratingRaw = formData.get("rating");
  const interest = String(formData.get("interest_level") ?? "").toLowerCase();
  const rent = String(formData.get("rent_opinion") ?? "").toLowerCase();
  const comment = String(formData.get("comment") ?? "").trim() || null;
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
  if (!LETTINGS_RENT.has(rent)) {
    return { error: "Please choose what you think about the rent." };
  }
  if (secondRaw !== "yes" && secondRaw !== "no") {
    return { error: "Please say if you would like to start the application process." };
  }
  const wantsApply = secondRaw === "yes";

  const moveIn = parseOptionalDate(String(formData.get("target_move_in_date") ?? ""));
  if (String(formData.get("target_move_in_date") ?? "").trim() && !moveIn) {
    return { error: "Please enter a valid move-in date, or clear the field." };
  }

  const occRaw = String(formData.get("occupant_count") ?? "").trim();
  const occupantCount =
    !occRaw || !OCCUPANTS.has(occRaw) ? null : occRaw;

  const petsRaw = String(formData.get("has_pets") ?? "unspecified").trim();
  let hasPets: boolean | null = null;
  if (petsRaw === "yes") hasPets = true;
  else if (petsRaw === "no") hasPets = false;
  else if (petsRaw === "unspecified") hasPets = null;
  else {
    return { error: "Please choose a pets option, or prefer not to say." };
  }

  const petsDetail =
    hasPets === true ? String(formData.get("pets_detail") ?? "").trim() || null : null;

  const incomeRaw = String(formData.get("household_income_band") ?? "unspecified").trim();
  const incomeBand = INCOME.has(incomeRaw) ? incomeRaw : "unspecified";
  const householdIncomeBand = incomeBand === "unspecified" ? null : incomeBand;

  const highlightsStored = storeLettingsHighlights(parseLettingsHighlightsFromFormData(formData));
  const negativesStored = storeLettingsNegatives(parseLettingsNegativesFromFormData(formData));

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
        household_income_band,
        comment
      )
      VALUES (
        ${ctx.viewing_id},
        ${ctx.buyer_id},
        ${rating},
        ${interest}::interest_level,
        ${rent}::price_opinion,
        NULL,
        NULL,
        ${wantsApply},
        NULL,
        NULL,
        ${highlightsStored},
        ${negativesStored},
        'letting'::listing_type,
        ${moveIn},
        ${occupantCount},
        ${hasPets},
        ${petsDetail},
        ${householdIncomeBand},
        ${comment}
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
