-- Per-company templates for buyer feedback invite emails (Resend).

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS feedback_invite_subject_template text,
  ADD COLUMN IF NOT EXISTS feedback_invite_body_template text;
