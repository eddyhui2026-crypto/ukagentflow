import { getSql } from "@/lib/db/neon";

export type VendorPortalProperty = {
  address: string;
  postcode: string;
};

export type VendorPortalFeedbackRow = {
  id: string;
  viewing_date: string;
  submitted_at: Date | string;
  reply_lag_days: number;
  rating: number;
  interest_level: string;
  price_opinion: string;
  wants_second_viewing: boolean;
  buyer_position: string | null;
  has_aip: boolean | null;
  property_highlights: string;
  negative_feedback_tags: string;
  liked_text: string | null;
  disliked_text: string | null;
  comment: string | null;
};

export async function getVendorPortalProperty(
  vendorPortalToken: string,
): Promise<VendorPortalProperty | null> {
  const t = vendorPortalToken?.trim();
  if (!t) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT address, postcode
    FROM properties
    WHERE vendor_portal_token = ${t}
    LIMIT 1
  `;
  const row = rows[0] as VendorPortalProperty | undefined;
  return row ?? null;
}

export async function listVendorPortalFeedback(
  vendorPortalToken: string,
): Promise<VendorPortalFeedbackRow[]> {
  const t = vendorPortalToken?.trim();
  if (!t) return [];
  const sql = getSql();
  const rows = await sql`
    SELECT
      f.id,
      v.viewing_date::text AS viewing_date,
      f.submitted_at,
      GREATEST(
        0,
        (
          (f.submitted_at AT TIME ZONE 'Europe/London')::date - v.viewing_date
        )::integer
      ) AS reply_lag_days,
      f.rating,
      f.interest_level::text AS interest_level,
      f.price_opinion::text AS price_opinion,
      f.wants_second_viewing,
      f.buyer_position::text AS buyer_position,
      f.has_aip,
      f.property_highlights,
      f.negative_feedback_tags,
      f.liked_text,
      f.disliked_text,
      f.comment
    FROM properties p
    INNER JOIN viewings v ON v.property_id = p.id
    INNER JOIN feedback f ON f.viewing_id = v.id
    WHERE p.vendor_portal_token = ${t}
    ORDER BY (f.interest_level = 'hot') DESC, f.submitted_at DESC
  `;
  return rows as VendorPortalFeedbackRow[];
}
