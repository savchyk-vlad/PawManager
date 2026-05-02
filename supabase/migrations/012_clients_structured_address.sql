-- Replace single-line clients.address with structured mailing-style fields.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS address_line1 TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_line2 TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_city TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_state TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_postal TEXT NOT NULL DEFAULT '';

UPDATE clients
SET address_line1 = trim(address)
WHERE trim(coalesce(address, '')) <> ''
  AND trim(coalesce(address_line1, '')) = '';

ALTER TABLE clients DROP COLUMN IF EXISTS address;
