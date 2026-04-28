-- Optional per-walk rate (USD). When NULL, UI and billing use clients.price_per_walk.
ALTER TABLE walks ADD COLUMN IF NOT EXISTS price_per_walk_override NUMERIC;
