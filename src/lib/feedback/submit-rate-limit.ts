import { getSql } from "@/lib/db/neon";
import {
  FEEDBACK_RESEND_MAX_PER_VIEWING_BUYER_PER_HOUR,
  FEEDBACK_SUBMIT_MAX_PER_IP_PER_HOUR,
  FEEDBACK_SUBMIT_MAX_PER_TOKEN_PER_HOUR,
} from "@/lib/feedback/token-policy";

function ipBucket(ip: string) {
  return `fb_submit:ip:${ip}`;
}

function tokenBucket(token: string) {
  return `fb_submit:tok:${token}`;
}

export function resendInviteBucket(viewingBuyerId: string) {
  return `fb_resend_inv:vb:${viewingBuyerId}`;
}

/**
 * Call once per feedback form submission attempt, after you know whether the token
 * exists in the database ({@code tokenCountsTowardLimit} === !!row).
 */
export async function consumeFeedbackSubmitAttempt(
  ip: string,
  token: string,
  options: { tokenCountsTowardLimit: boolean },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sql = getSql();

  const ipRows = await sql`
    SELECT COUNT(*)::int AS n
    FROM feedback_submit_rate_events
    WHERE bucket = ${ipBucket(ip)}
      AND created_at > now() - interval '1 hour'
  `;
  const ipCount = (ipRows[0] as { n: number } | undefined)?.n ?? 0;
  if (ipCount >= FEEDBACK_SUBMIT_MAX_PER_IP_PER_HOUR) {
    return { ok: false, message: "Too many requests. Try again in a little while." };
  }

  if (options.tokenCountsTowardLimit) {
    const tokRows = await sql`
      SELECT COUNT(*)::int AS n
      FROM feedback_submit_rate_events
      WHERE bucket = ${tokenBucket(token)}
        AND created_at > now() - interval '1 hour'
    `;
    const tokCount = (tokRows[0] as { n: number } | undefined)?.n ?? 0;
    if (tokCount >= FEEDBACK_SUBMIT_MAX_PER_TOKEN_PER_HOUR) {
      return { ok: false, message: "Too many attempts for this link. Try again later." };
    }
  }

  await sql`
    INSERT INTO feedback_submit_rate_events (bucket)
    VALUES (${ipBucket(ip)})
  `;
  if (options.tokenCountsTowardLimit) {
    await sql`
      INSERT INTO feedback_submit_rate_events (bucket)
      VALUES (${tokenBucket(token)})
    `;
  }

  return { ok: true };
}

export async function assertResendInviteAllowed(
  viewingBuyerId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM feedback_submit_rate_events
    WHERE bucket = ${resendInviteBucket(viewingBuyerId)}
      AND created_at > now() - interval '1 hour'
  `;
  const n = (rows[0] as { n: number } | undefined)?.n ?? 0;
  if (n >= FEEDBACK_RESEND_MAX_PER_VIEWING_BUYER_PER_HOUR) {
    return {
      ok: false,
      message: "Too many resend attempts for this buyer. Try again later or use copy draft.",
    };
  }
  return { ok: true };
}

export async function recordResendInviteEvent(viewingBuyerId: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO feedback_submit_rate_events (bucket)
    VALUES (${resendInviteBucket(viewingBuyerId)})
  `;
}
