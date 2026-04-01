-- Pre-viewing tenant qualification (per letting property, shared link, many submissions).

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS prequal_share_token text;

UPDATE properties
SET prequal_share_token = replace(gen_random_uuid()::text, '-', '')
  || replace(gen_random_uuid()::text, '-', '')
WHERE prequal_share_token IS NULL;

ALTER TABLE properties
  ALTER COLUMN prequal_share_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS properties_prequal_share_token_uidx
  ON properties (prequal_share_token);

CREATE TABLE letting_prequal_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  occupation text,
  annual_income_band text NOT NULL,
  has_pets boolean,
  pets_detail text,
  target_move_in_date date,
  visa_immigration_status text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, email)
);

CREATE INDEX letting_prequal_submissions_property_submitted_idx
  ON letting_prequal_submissions (property_id, submitted_at DESC);

COMMENT ON TABLE letting_prequal_submissions IS 'Tenant pre-viewing qualification; one row per property+email (latest resubmission updates via upsert)';
