-- Minimal (Apple/Airbnb-style) buyer invite email preferences

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS invite_show_property_photo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS invite_use_system_footer boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN companies.invite_show_property_photo IS 'When false, invite email property card has no photo (text-only dashed card)';
COMMENT ON COLUMN companies.invite_use_system_footer IS 'When false, omit built-in GDPR one-liner in invite footer';
