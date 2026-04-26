-- ─────────────────────────────────────────────
-- Clients
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  price_per_walk  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON clients
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Dogs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  breed         TEXT NOT NULL DEFAULT '',
  age           INTEGER NOT NULL DEFAULT 0,
  weight        NUMERIC(6, 1) NOT NULL DEFAULT 0,
  emoji         TEXT NOT NULL DEFAULT '🐕',
  vet           TEXT NOT NULL DEFAULT '',
  vet_phone     TEXT NOT NULL DEFAULT '',
  medical       TEXT NOT NULL DEFAULT '',
  key_location  TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON dogs
  FOR ALL
  USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  )
  WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- Dog traits
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dog_traits (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id  UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  label   TEXT NOT NULL,
  type    TEXT NOT NULL CHECK (type IN ('positive', 'warning'))
);

ALTER TABLE dog_traits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON dog_traits
  FOR ALL
  USING (
    dog_id IN (
      SELECT d.id FROM dogs d
      JOIN clients c ON d.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    dog_id IN (
      SELECT d.id FROM dogs d
      JOIN clients c ON d.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients (user_id);
CREATE INDEX IF NOT EXISTS dogs_client_id_idx ON dogs (client_id);
CREATE INDEX IF NOT EXISTS dog_traits_dog_id_idx ON dog_traits (dog_id);
