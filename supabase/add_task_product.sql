-- Gorevlere urun etiketi ekleniyor (RedFlag, SOBE vb. ile filtrelemek icin)
-- Supabase SQL Editor'de calistir.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS product text DEFAULT '';
