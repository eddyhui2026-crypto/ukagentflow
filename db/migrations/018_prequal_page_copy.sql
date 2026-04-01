-- Company-level copy for public pre-viewing pages (sale + to let).
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS sale_prequal_form_config jsonb,
  ADD COLUMN IF NOT EXISTS letting_prequal_form_config jsonb;
