-- Read-only vendor portal + property-scoped QR entry for buyers (email claim).

ALTER TABLE properties
  ADD COLUMN vendor_portal_token text,
  ADD COLUMN buyer_qr_token text;

UPDATE properties
SET
  vendor_portal_token = replace(gen_random_uuid()::text, '-', '')
    || replace(gen_random_uuid()::text, '-', ''),
  buyer_qr_token = replace(gen_random_uuid()::text, '-', '')
    || replace(gen_random_uuid()::text, '-', '')
WHERE vendor_portal_token IS NULL;

ALTER TABLE properties
  ALTER COLUMN vendor_portal_token SET NOT NULL,
  ALTER COLUMN buyer_qr_token SET NOT NULL;

CREATE UNIQUE INDEX properties_vendor_portal_token_uidx ON properties (vendor_portal_token);
CREATE UNIQUE INDEX properties_buyer_qr_token_uidx ON properties (buyer_qr_token);
