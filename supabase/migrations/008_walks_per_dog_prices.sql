-- Per-dog billable rates for a walk (JSON object: dog_id -> numeric USD).
-- When non-null and non-empty, billing sums these amounts (one per unique dog on the walk).
-- Mutually exclusive with price_per_walk_override in app logic (both may exist in DB; app prefers per_dog_prices).
ALTER TABLE walks ADD COLUMN IF NOT EXISTS per_dog_prices JSONB;
