/** Calendar trial length shown on marketing and set at registration (must match Stripe trial_end logic). */
export const BILLING_TRIAL_DAYS = 14;

export function trialEndUnixSeconds(trialEndsAt: Date): number {
  return Math.floor(trialEndsAt.getTime() / 1000);
}

/** True if Stripe should still attach a subscription trial (first charge after workspace trial_ends_at). */
export function shouldUseStripeTrialSync(trialEndsAt: Date, now: Date = new Date()): boolean {
  const end = trialEndUnixSeconds(trialEndsAt);
  const nowSec = Math.floor(now.getTime() / 1000);
  return end > nowSec + 120;
}
