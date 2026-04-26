-- Walks
CREATE TABLE IF NOT EXISTS walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'done', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  actual_duration_minutes INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON walks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Walk dogs
CREATE TABLE IF NOT EXISTS walk_dogs (
  walk_id UUID NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (walk_id, dog_id)
);

ALTER TABLE walk_dogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON walk_dogs
  FOR ALL
  USING (
    walk_id IN (SELECT id FROM walks WHERE user_id = auth.uid())
    AND dog_id IN (
      SELECT d.id
      FROM dogs d
      JOIN clients c ON d.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    walk_id IN (SELECT id FROM walks WHERE user_id = auth.uid())
    AND dog_id IN (
      SELECT d.id
      FROM dogs d
      JOIN clients c ON d.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS walks_user_id_idx ON walks (user_id);
CREATE INDEX IF NOT EXISTS walks_client_id_idx ON walks (client_id);
CREATE INDEX IF NOT EXISTS walks_scheduled_at_idx ON walks (scheduled_at);
CREATE INDEX IF NOT EXISTS walk_dogs_walk_id_idx ON walk_dogs (walk_id);
CREATE INDEX IF NOT EXISTS walk_dogs_dog_id_idx ON walk_dogs (dog_id);
