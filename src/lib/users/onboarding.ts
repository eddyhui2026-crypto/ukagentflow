import { getSql } from "@/lib/db/neon";

export async function getUserOnboardingIntroDismissed(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT app_onboarding_intro_dismissed_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as { app_onboarding_intro_dismissed_at: Date | string | null } | undefined;
  return row?.app_onboarding_intro_dismissed_at != null;
}

export async function setUserOnboardingIntroDismissed(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET app_onboarding_intro_dismissed_at = COALESCE(app_onboarding_intro_dismissed_at, now())
    WHERE id = ${userId}
  `;
}
