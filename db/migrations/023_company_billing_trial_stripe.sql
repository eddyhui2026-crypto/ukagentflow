-- Billing: 14-day trial anchors + Stripe ids (trial_end in Checkout matches trial_ends_at)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text;

-- Backfill from created_at for existing workspaces
UPDATE companies
SET trial_started_at = COALESCE(trial_started_at, created_at),
    trial_ends_at = COALESCE(trial_ends_at, created_at + interval '14 days')
WHERE trial_started_at IS NULL OR trial_ends_at IS NULL;

ALTER TABLE companies ALTER COLUMN trial_started_at SET NOT NULL;
ALTER TABLE companies ALTER COLUMN trial_ends_at SET NOT NULL;

COMMENT ON COLUMN companies.trial_started_at IS 'Workspace trial start (registration); aligns with Stripe when customer checks out mid-trial';
COMMENT ON COLUMN companies.trial_ends_at IS 'First charge must not occur before this instant; pass as subscription trial_end in Stripe Checkout';
COMMENT ON COLUMN companies.stripe_customer_id IS 'Stripe Customer id (cus_...)';
COMMENT ON COLUMN companies.stripe_subscription_id IS 'Stripe Subscription id (sub_...)';
COMMENT ON COLUMN companies.subscription_status IS 'Mirror of Stripe subscription.status e.g. trialing, active, past_due, canceled';
