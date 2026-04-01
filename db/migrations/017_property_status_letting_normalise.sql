-- Historic: some to-let rows were saved with status "sold" from the old form; align with letting vocabulary.
UPDATE properties
SET status = 'let'
WHERE listing_type = 'letting'::listing_type AND status = 'sold';

COMMENT ON COLUMN properties.status IS
  'Pipeline: for sale — active | stc | sold | withdrawn; to let — active | let_agreed | let | withdrawn';
