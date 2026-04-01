-- Custom footer shown at the bottom of public buyer/tenant forms (Settings-editable).
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS public_footer_template text,
  ADD COLUMN IF NOT EXISTS public_footer_show_agent_photo boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN companies.public_footer_template IS 'Plain text; placeholders: {{agentName}}, {{companyName}}, {{propertyLine}}';
COMMENT ON COLUMN companies.public_footer_show_agent_photo IS 'When true, public forms may show listing agent profile photo in footer (where agent is known)';
