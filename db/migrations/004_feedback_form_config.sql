-- Per-company copy for the public buyer feedback page (JSON).

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS feedback_form_config jsonb;
