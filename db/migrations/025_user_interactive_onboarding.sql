-- First-session interactive walkthrough (sample data + completion flag).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS app_interactive_onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS app_interactive_onboarding_sample_property_id uuid REFERENCES properties (id) ON DELETE SET NULL;

COMMENT ON COLUMN users.app_interactive_onboarding_completed_at IS
  'Set when the agent finishes or skips the first-run interactive onboarding wizard.';
COMMENT ON COLUMN users.app_interactive_onboarding_sample_property_id IS
  'Demo instruction created by the wizard; optional delete from Done step.';

CREATE INDEX IF NOT EXISTS users_interactive_onboarding_sample_property_idx
  ON users (app_interactive_onboarding_sample_property_id)
  WHERE app_interactive_onboarding_sample_property_id IS NOT NULL;
