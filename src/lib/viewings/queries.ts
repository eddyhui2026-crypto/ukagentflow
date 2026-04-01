import { getSql } from "@/lib/db/neon";
import { FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING } from "@/lib/feedback/token-policy";

export type ViewingListRow = {
  id: string;
  viewing_date: string;
  created_at: Date | string;
  buyer_count: number;
  emails_sent_count: number;
  invite_emails_via_app: boolean;
};

export async function listViewingsForProperty(
  propertyId: string,
  companyId: string,
): Promise<ViewingListRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      v.id,
      v.viewing_date::text AS viewing_date,
      v.created_at,
      COALESCE(
        (SELECT COUNT(*)::int FROM viewing_buyers vb WHERE vb.viewing_id = v.id),
        0
      ) AS buyer_count,
      COALESCE(
        (
          SELECT COUNT(*)::int
          FROM viewing_buyers vb
          WHERE vb.viewing_id = v.id AND vb.email_sent = true
        ),
        0
      ) AS emails_sent_count,
      v.invite_emails_via_app AS invite_emails_via_app
    FROM viewings v
    INNER JOIN properties p ON p.id = v.property_id
    WHERE v.property_id = ${propertyId}
      AND p.company_id = ${companyId}
    ORDER BY v.viewing_date DESC NULLS LAST, v.created_at DESC
  `;
  return rows as ViewingListRow[];
}

export type ViewingBuyerInviteRow = {
  id: string;
  viewing_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  feedback_token: string;
  email_sent: boolean;
  feedback_invite_scheduled_at: Date | string | null;
  token_invalidated_at: Date | string | null;
  invite_link_expired: boolean;
};

export async function listViewingBuyerInvitesForProperty(
  propertyId: string,
  companyId: string,
): Promise<ViewingBuyerInviteRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      vb.id,
      v.id AS viewing_id,
      b.name AS buyer_name,
      b.email AS buyer_email,
      b.phone AS buyer_phone,
      vb.feedback_token,
      vb.email_sent,
      vb.feedback_invite_scheduled_at AS feedback_invite_scheduled_at,
      vb.token_invalidated_at AS token_invalidated_at,
      (
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/London')::date >
        v.viewing_date + ${FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING}::integer
      ) AS invite_link_expired
    FROM viewings v
    INNER JOIN properties p ON p.id = v.property_id
    INNER JOIN viewing_buyers vb ON vb.viewing_id = v.id
    INNER JOIN buyers b ON b.id = vb.buyer_id
    WHERE v.property_id = ${propertyId}
      AND p.company_id = ${companyId}
    ORDER BY v.viewing_date DESC NULLS LAST, v.created_at DESC, b.name ASC
  `;
  return rows as ViewingBuyerInviteRow[];
}
