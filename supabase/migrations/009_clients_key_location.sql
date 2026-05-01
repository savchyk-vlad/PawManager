-- Move key location from dog -> client (owner)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS key_location TEXT NOT NULL DEFAULT '';

-- Optional index if you end up searching by it later
-- CREATE INDEX IF NOT EXISTS clients_key_location_idx ON clients (key_location);

