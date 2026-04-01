/**
 * Operational rules for buyer feedback links (no per-company override yet).
 *
 * - Time expiry: link stops accepting submissions when Europe/London "today" is
 *   strictly after viewing_date + FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING calendar days.
 * - Manual revoke: viewing_buyers.token_invalidated_at (DB / future admin UI).
 * - One response: enforced by UNIQUE(viewing_id, buyer_id) on feedback.
 */

export const FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING = 90;

/** Max POST / server-action attempts per rolling hour (separate buckets). */
export const FEEDBACK_SUBMIT_MAX_PER_IP_PER_HOUR = Number(
  process.env.FEEDBACK_SUBMIT_MAX_PER_IP_PER_HOUR ?? "60",
);
export const FEEDBACK_SUBMIT_MAX_PER_TOKEN_PER_HOUR = Number(
  process.env.FEEDBACK_SUBMIT_MAX_PER_TOKEN_PER_HOUR ?? "15",
);

export const FEEDBACK_RESEND_MAX_PER_VIEWING_BUYER_PER_HOUR = Number(
  process.env.FEEDBACK_RESEND_MAX_PER_VIEWING_BUYER_PER_HOUR ?? "8",
);
