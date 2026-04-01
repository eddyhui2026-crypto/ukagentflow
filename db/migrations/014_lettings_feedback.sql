-- Rental (letting) listings + tenant feedback fields

CREATE TYPE listing_type AS ENUM ('sale', 'letting');

ALTER TABLE properties
  ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'sale';

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS lettings_feedback_form_config jsonb;

ALTER TYPE price_opinion ADD VALUE IF NOT EXISTS 'great_value';
ALTER TYPE price_opinion ADD VALUE IF NOT EXISTS 'slightly_high';

ALTER TABLE feedback
  ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'sale',
  ADD COLUMN target_move_in_date date NULL,
  ADD COLUMN occupant_count text NULL,
  ADD COLUMN has_pets boolean NULL,
  ADD COLUMN pets_detail text NULL,
  ADD COLUMN household_income_band text NULL;

COMMENT ON COLUMN properties.listing_type IS 'sale = buyer feedback form; letting = tenant / lettings feedback form';
COMMENT ON COLUMN feedback.listing_type IS 'Copied from property at submit time';
COMMENT ON COLUMN feedback.target_move_in_date IS 'Lettings: tenant target move-in';
COMMENT ON COLUMN feedback.occupant_count IS 'Lettings: 1|2|3|4_plus';
COMMENT ON COLUMN feedback.has_pets IS 'Lettings: null = unspecified';
COMMENT ON COLUMN feedback.pets_detail IS 'Lettings: when has_pets true';
COMMENT ON COLUMN feedback.household_income_band IS 'Lettings: 25k_plus|35k_plus|50k_plus|unspecified';
