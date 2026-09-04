-- Gorevlere aciklama alani ekleniyor
-- Supabase SQL Editor'de calistir.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description text DEFAULT '';
