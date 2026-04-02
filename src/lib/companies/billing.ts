import { getSql } from "@/lib/db/neon";

export type CompanyBillingRow = {
  trial_started_at: Date | string;
  trial_ends_at: Date | string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  plan: string;
};

export async function getCompanyBilling(companyId: string): Promise<CompanyBillingRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      trial_started_at,
      trial_ends_at,
      stripe_customer_id,
      stripe_subscription_id,
      subscription_status,
      plan
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  return (rows[0] as CompanyBillingRow | undefined) ?? null;
}

export async function updateCompanyStripeBilling(params: {
  companyId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: string;
}): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET
      stripe_customer_id = ${params.stripeCustomerId},
      stripe_subscription_id = ${params.stripeSubscriptionId},
      subscription_status = ${params.subscriptionStatus},
      plan = CASE
        WHEN ${params.subscriptionStatus} = 'active' THEN 'active'
        WHEN ${params.subscriptionStatus} = 'trialing' THEN 'trialing'
        ELSE plan
      END
    WHERE id = ${params.companyId}
  `;
}

export async function updateCompanySubscriptionStatusByStripeSub(
  stripeSubscriptionId: string,
  subscriptionStatus: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET
      subscription_status = ${subscriptionStatus},
      plan = CASE
        WHEN ${subscriptionStatus} = 'active' THEN 'active'
        WHEN ${subscriptionStatus} = 'trialing' THEN 'trialing'
        WHEN ${subscriptionStatus} IN ('canceled', 'incomplete_expired') THEN 'free'
        ELSE plan
      END
    WHERE stripe_subscription_id = ${stripeSubscriptionId}
  `;
}
