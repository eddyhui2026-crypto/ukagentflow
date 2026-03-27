-- How feedback invites were sent for this viewing (app email vs agent copies link).
ALTER TABLE viewings
  ADD COLUMN IF NOT EXISTS invite_emails_via_app boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN viewings.invite_emails_via_app IS
  'If true, UKAgentFlow attempts Resend; if false, agent shares links manually.';
