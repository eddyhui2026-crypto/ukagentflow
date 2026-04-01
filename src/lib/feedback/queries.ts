import { getSql } from "@/lib/db/neon";
import {
  mergeFeedbackFormCopy,
  parseFeedbackFormConfigFromDb,
  type FeedbackFormCopyResolved,
} from "@/lib/feedback/form-config";
import {
  mergeLettingsFeedbackFormCopy,
  parseLettingsFeedbackFormConfigFromDb,
  type LettingsFeedbackFormCopyResolved,
} from "@/lib/feedback/lettings-form-config";
import { FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING } from "@/lib/feedback/token-policy";

export type ListingType = "sale" | "letting";

export type FeedbackContext = {
  viewing_id: string;
  buyer_id: string;
  buyer_name: string;
  property_address: string;
  property_postcode: string;
  /** Listing photo when set (https URL). */
  property_hero_image_url: string | null;
  listing_type: ListingType;
  viewing_date: string;
  link_expired: boolean;
  token_invalidated_at: Date | string | null;
  already_submitted: boolean;
  /** Sales listing copy (always merged; used when listing_type is sale). */
  saleFormCopy: FeedbackFormCopyResolved;
  /** Lettings listing copy (always merged; used when listing_type is letting). */
  lettingsFormCopy: LettingsFeedbackFormCopyResolved;
};

export async function getFeedbackContextByToken(
  token: string,
): Promise<FeedbackContext | null> {
  const t = token?.trim();
  if (!t) {
    return null;
  }

  const sql = getSql();
  const rows = await sql`
    SELECT
      vb.viewing_id,
      vb.buyer_id,
      vb.token_invalidated_at,
      v.viewing_date::text AS viewing_date,
      (
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/London')::date >
        v.viewing_date + ${FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING}::integer
      ) AS link_expired,
      b.name AS buyer_name,
      p.address AS property_address,
      p.postcode AS property_postcode,
      p.hero_image_url AS property_hero_image_url,
      p.listing_type::text AS listing_type,
      (f.id IS NOT NULL) AS already_submitted,
      c.feedback_form_config AS feedback_form_config,
      c.lettings_feedback_form_config AS lettings_feedback_form_config
    FROM viewing_buyers vb
    INNER JOIN viewings v ON v.id = vb.viewing_id
    INNER JOIN properties p ON p.id = v.property_id
    INNER JOIN companies c ON c.id = p.company_id
    INNER JOIN buyers b ON b.id = vb.buyer_id
    LEFT JOIN feedback f ON f.viewing_id = vb.viewing_id AND f.buyer_id = vb.buyer_id
    WHERE vb.feedback_token = ${t}
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        viewing_id: string;
        buyer_id: string;
        buyer_name: string;
        property_address: string;
        property_postcode: string;
        property_hero_image_url: string | null;
        listing_type: string;
        viewing_date: string;
        link_expired: boolean;
        token_invalidated_at: Date | string | null;
        already_submitted: boolean;
        feedback_form_config: unknown;
        lettings_feedback_form_config: unknown;
      }
    | undefined;

  if (!row) {
    return null;
  }

  const saleFormCopy = mergeFeedbackFormCopy(
    parseFeedbackFormConfigFromDb(row.feedback_form_config),
  );
  const lettingsFormCopy = mergeLettingsFeedbackFormCopy(
    parseLettingsFeedbackFormConfigFromDb(row.lettings_feedback_form_config),
  );
  const lt = row.listing_type === "letting" ? "letting" : "sale";

  return {
    viewing_id: row.viewing_id,
    buyer_id: row.buyer_id,
    buyer_name: row.buyer_name,
    property_address: row.property_address,
    property_postcode: row.property_postcode,
    property_hero_image_url: row.property_hero_image_url ?? null,
    listing_type: lt,
    viewing_date: row.viewing_date,
    link_expired: Boolean(row.link_expired),
    token_invalidated_at: row.token_invalidated_at,
    already_submitted: Boolean(row.already_submitted),
    saleFormCopy,
    lettingsFormCopy,
  };
}

export async function getPropertyIdForViewing(viewingId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT property_id FROM viewings WHERE id = ${viewingId} LIMIT 1
  `;
  const r = rows[0] as { property_id: string } | undefined;
  return r?.property_id ?? null;
}

export type PropertyFeedbackRow = {
  id: string;
  viewing_date: string;
  buyer_name: string;
  listing_type: ListingType;
  rating: number;
  interest_level: string;
  price_opinion: string;
  liked_text: string | null;
  disliked_text: string | null;
  wants_second_viewing: boolean;
  comment: string | null;
  submitted_at: Date | string;
  reply_lag_days: number;
  agent_follow_up: string;
  buyer_position: string | null;
  has_aip: boolean | null;
  property_highlights: string;
  negative_feedback_tags: string;
  target_move_in_date: string | null;
  occupant_count: string | null;
  has_pets: boolean | null;
  pets_detail: string | null;
  household_income_band: string | null;
};

export async function listFeedbackForProperty(
  propertyId: string,
  companyId: string,
): Promise<PropertyFeedbackRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      f.id,
      v.viewing_date::text AS viewing_date,
      b.name AS buyer_name,
      f.listing_type::text AS listing_type,
      f.rating,
      f.interest_level::text AS interest_level,
      f.price_opinion::text AS price_opinion,
      f.liked_text,
      f.disliked_text,
      f.wants_second_viewing,
      f.comment,
      f.submitted_at,
      GREATEST(
        0,
        (
          (f.submitted_at AT TIME ZONE 'Europe/London')::date - v.viewing_date
        )::integer
      ) AS reply_lag_days,
      f.agent_follow_up::text AS agent_follow_up,
      f.buyer_position::text AS buyer_position,
      f.has_aip,
      f.property_highlights,
      f.negative_feedback_tags,
      f.target_move_in_date::text AS target_move_in_date,
      f.occupant_count,
      f.has_pets,
      f.pets_detail,
      f.household_income_band
    FROM feedback f
    INNER JOIN viewings v ON v.id = f.viewing_id
    INNER JOIN properties p ON p.id = v.property_id
    INNER JOIN buyers b ON b.id = f.buyer_id
    WHERE v.property_id = ${propertyId}
      AND p.company_id = ${companyId}
    ORDER BY (f.interest_level = 'hot') DESC, f.submitted_at DESC
  `;
  return rows as PropertyFeedbackRow[];
}
