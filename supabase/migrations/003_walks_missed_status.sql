-- Add MISSED to walks.status; keep app convention (lowercase) matching existing values.
ALTER TABLE walks DROP CONSTRAINT IF EXISTS walks_status_check;

ALTER TABLE walks ADD CONSTRAINT walks_status_check
  CHECK (status IN ('scheduled', 'in_progress', 'done', 'cancelled', 'missed'));
