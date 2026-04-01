import { getSql } from "@/lib/db/neon";
import { FEEDBACK_SUBMIT_MAX_PER_IP_PER_HOUR } from "@/lib/feedback/token-policy";

const TOKEN_MAX_PER_HOUR = 30;

function ipBucket(ip: string) {
  return `prequal_submit:ip:${ip}`;
}

function tokenBucket(token: string) {
  return `prequal_submit:tok:${token}`;
}

/** Rate limit pre-qual form posts (reuses feedback_submit_rate_events bucket naming). */
export async function consumePrequalSubmitAttempt(
  ip: string,
  token: string,
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

  const tokRows = await sql`
    SELECT COUNT(*)::int AS n
    FROM feedback_submit_rate_events
    WHERE bucket = ${tokenBucket(token)}
      AND created_at > now() - interval '1 hour'
  `;
  const tokCount = (tokRows[0] as { n: number } | undefined)?.n ?? 0;
  if (tokCount >= TOKEN_MAX_PER_HOUR) {
    return { ok: false, message: "Too many submissions on this link. Try again later." };
  }

  await sql`
    INSERT INTO feedback_submit_rate_events (bucket)
    VALUES (${ipBucket(ip)})
  `;
  await sql`
    INSERT INTO feedback_submit_rate_events (bucket)
    VALUES (${tokenBucket(token)})
  `;

  return { ok: true };
}
