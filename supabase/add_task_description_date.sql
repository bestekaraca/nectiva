-- Aciklamanin eklendigi/guncellendigi tarih icin alan
-- Supabase SQL Editor'de calistir.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description_date date;
