import { getSql } from "@/lib/db/neon";
import { FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING } from "@/lib/feedback/token-policy";

export type QuickClaimResult =
  | { ok: true; feedback_token: string }
  | { ok: false; reason: "not_found" | "no_match" | "already_submitted" | "revoked" | "expired" };

/**
 * Buyer scans property QR, enters email — find latest viewing row for this property without feedback.
 */
export async function findQuickFeedbackTokenForEmail(
  buyerQrToken: string,
  email: string,
): Promise<QuickClaimResult> {
  const token = buyerQrToken?.trim();
  const em = email?.trim().toLowerCase();
  if (!token || !em) {
    return { ok: false, reason: "not_found" };
  }

  const sql = getSql();

  const rows = await sql`
    SELECT
      vb.feedback_token,
      vb.token_invalidated_at,
      v.viewing_date,
      (f.id IS NOT NULL) AS has_feedback,
      (
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/London')::date >
        v.viewing_date + ${FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING}::integer
      ) AS link_expired
    FROM properties prop
    INNER JOIN viewings v ON v.property_id = prop.id
    INNER JOIN viewing_buyers vb ON vb.viewing_id = v.id
    INNER JOIN buyers b ON b.id = vb.buyer_id
    LEFT JOIN feedback f ON f.viewing_id = vb.viewing_id AND f.buyer_id = vb.buyer_id
    WHERE prop.buyer_qr_token = ${token}
      AND lower(trim(b.email)) = ${em}
    ORDER BY v.viewing_date DESC NULLS LAST, v.created_at DESC, vb.created_at DESC
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        feedback_token: string;
        token_invalidated_at: Date | string | null;
        has_feedback: boolean;
        link_expired: boolean;
      }
    | undefined;

  if (!row) {
    return { ok: false, reason: "no_match" };
  }
  if (row.token_invalidated_at) {
    return { ok: false, reason: "revoked" };
  }
  if (row.link_expired) {
    return { ok: false, reason: "expired" };
  }
  if (row.has_feedback) {
    return { ok: false, reason: "already_submitted" };
  }

  return { ok: true, feedback_token: row.feedback_token };
}
