ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS dogs_client_id_not_deleted_idx
ON dogs (client_id, is_deleted);
