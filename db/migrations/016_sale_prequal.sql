-- Pre-viewing buyer checks (for sale listings): separate token + storage from letting prequal.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS sale_prequal_share_token text;

UPDATE properties
SET sale_prequal_share_token = replace(gen_random_uuid()::text, '-', '')
  || replace(gen_random_uuid()::text, '-', '')
WHERE sale_prequal_share_token IS NULL;

ALTER TABLE properties
  ALTER COLUMN sale_prequal_share_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS properties_sale_prequal_share_token_uidx
  ON properties (sale_prequal_share_token);

CREATE TABLE sale_prequal_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  buying_position text NOT NULL,
  funding_type text NOT NULL,
  mortgage_dip_status text NOT NULL,
  solicitor_status text NOT NULL,
  target_purchase_band text NOT NULL,
  additional_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, email)
);

CREATE INDEX sale_prequal_submissions_property_submitted_idx
  ON sale_prequal_submissions (property_id, submitted_at DESC);

COMMENT ON TABLE sale_prequal_submissions IS 'Buyer pre-viewing checks (chain, funding, DIP, solicitor); one row per property+email (upsert on resubmit)';
