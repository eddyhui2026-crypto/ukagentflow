-- One-time hint: "Guided tour" button exists (dismissed after first acknowledgement or starting tour)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS app_onboarding_intro_dismissed_at timestamptz;

COMMENT ON COLUMN users.app_onboarding_intro_dismissed_at IS
  'Set when user dismisses first-session guided-tour hint or starts the tour';
