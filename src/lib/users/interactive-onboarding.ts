import { getSql } from "@/lib/db/neon";

export async function getUserInteractiveOnboardingCompleted(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT app_interactive_onboarding_completed_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as { app_interactive_onboarding_completed_at: Date | string | null } | undefined;
  return row?.app_interactive_onboarding_completed_at != null;
}

export async function getUserInteractiveOnboardingSamplePropertyId(
  userId: string,
): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT app_interactive_onboarding_sample_property_id
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as { app_interactive_onboarding_sample_property_id: string | null } | undefined;
  return row?.app_interactive_onboarding_sample_property_id ?? null;
}

export async function setUserInteractiveOnboardingCompleted(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET app_interactive_onboarding_completed_at = COALESCE(app_interactive_onboarding_completed_at, now())
    WHERE id = ${userId}
  `;
}

export async function setUserInteractiveOnboardingSamplePropertyId(
  userId: string,
  propertyId: string | null,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET app_interactive_onboarding_sample_property_id = ${propertyId}
    WHERE id = ${userId}
  `;
}
