-- Persist prior sign-in on each login so dashboard can show “new feedback since last visit”
-- without relying on JWT custom fields (which may not round-trip reliably in Auth.js v5).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS prior_sign_in_at timestamptz;

COMMENT ON COLUMN users.prior_sign_in_at IS 'Previous last_login_at snapshot at sign-in; feedback after this time is “new” until next login';
