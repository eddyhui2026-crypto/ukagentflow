import { getSql } from "@/lib/db/neon";

/**
 * Default: 09:00 Europe/London on the calendar day after the viewing date (DATE column).
 */
export async function feedbackInviteScheduledAtForViewingDate(
  viewingDateYmd: string,
): Promise<Date | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT make_timestamptz(
      EXTRACT(YEAR FROM (${viewingDateYmd}::date + interval '1 day'))::int,
      EXTRACT(MONTH FROM (${viewingDateYmd}::date + interval '1 day'))::int,
      EXTRACT(DAY FROM (${viewingDateYmd}::date + interval '1 day'))::int,
      9, 0, 0,
      'Europe/London'
    ) AS t
  `;
  const row = rows[0] as { t: Date } | undefined;
  return row?.t ?? null;
}
