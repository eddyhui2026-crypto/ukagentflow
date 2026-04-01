-- Optional image URLs for feedback invite emails (https only in app validation)

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS hero_image_url text;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS brand_logo_url text;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_photo_url text;

COMMENT ON COLUMN properties.hero_image_url IS 'HTTPS URL of one listing image; shown on buyer invite emails';
COMMENT ON COLUMN companies.brand_logo_url IS 'HTTPS URL of agency logo for invite emails';
COMMENT ON COLUMN users.profile_photo_url IS 'HTTPS URL of agent headshot for invite emails';
