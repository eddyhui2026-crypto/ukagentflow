-- When UKAgentFlow should send the automated feedback invite (after the viewing).

ALTER TABLE viewing_buyers
  ADD COLUMN IF NOT EXISTS feedback_invite_scheduled_at timestamptz;

COMMENT ON COLUMN viewing_buyers.feedback_invite_scheduled_at IS
  'App email mode: send at this time (typically 9:00 day after viewing, Europe/London). Null = manual copy-only.';

-- Rows created before scheduling: any still-unsent app invites trigger on next cron run.
UPDATE viewing_buyers vb
SET feedback_invite_scheduled_at = now()
FROM viewings v
WHERE vb.viewing_id = v.id
  AND v.invite_emails_via_app = true
  AND vb.email_sent = false
  AND vb.feedback_invite_scheduled_at IS NULL;
