import { getSql } from "@/lib/db/neon";

/**
 * On each successful sign-in: shift last_login_at → prior_sign_in_at, then set last_login_at = now().
 * Returns the new prior_sign_in_at (the sign-in instant before this session), or null on first-ever login.
 */
export async function readThenTouchUserLastLoginAt(userId: string): Promise<Date | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE users
    SET
      prior_sign_in_at = last_login_at,
      last_login_at = now()
    WHERE id = ${userId}
    RETURNING prior_sign_in_at
  `;
  const row = rows[0] as { prior_sign_in_at: Date | string | null } | undefined;
  const prev = row?.prior_sign_in_at;
  if (prev == null) return null;
  return prev instanceof Date ? prev : new Date(prev);
}

/**
 * Baseline for “new feedback” badges and dashboard rows.
 * Uses prior_sign_in_at (snapshot before this sign-in) when set; otherwise falls back to
 * last_login_at so users who only closed the tab (or had prior NULL after a DB migration) still get a cutoff.
 */
export async function getUserFeedbackNewSinceBaseline(userId: string): Promise<Date | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT COALESCE(prior_sign_in_at, last_login_at) AS baseline
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as { baseline: Date | string | null } | undefined;
  const v = row?.baseline;
  if (v == null) return null;
  return v instanceof Date ? v : new Date(v);
}
