-- Track previous sign-in time for dashboard “new since last login” hints.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

COMMENT ON COLUMN users.last_login_at IS 'Set to now() after each successful sign-in; previous value drives dashboard new-feedback counts';
