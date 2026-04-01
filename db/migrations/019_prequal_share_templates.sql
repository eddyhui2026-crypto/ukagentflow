-- Custom WhatsApp / email copy for pre-viewing share buttons (property page & vendor card).
-- NULL = use built-in defaults in application code.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS sale_prequal_share_whatsapp_template text,
  ADD COLUMN IF NOT EXISTS sale_prequal_share_email_subject_template text,
  ADD COLUMN IF NOT EXISTS sale_prequal_share_email_body_template text,
  ADD COLUMN IF NOT EXISTS letting_prequal_share_whatsapp_template text,
  ADD COLUMN IF NOT EXISTS letting_prequal_share_email_subject_template text,
  ADD COLUMN IF NOT EXISTS letting_prequal_share_email_body_template text;

COMMENT ON COLUMN companies.sale_prequal_share_whatsapp_template IS 'Placeholders: {{propertyLine}}, {{prequalLink}}';
COMMENT ON COLUMN companies.sale_prequal_share_email_body_template IS 'Placeholders: {{propertyLine}}, {{prequalLink}}; subject template same vars';
