-- Bir firmaya birden fazla kisi eklenebilmesi icin (Boyner'de A ve B kisisi ayni kartta)
-- Supabase SQL Editor'de calistir.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacts jsonb DEFAULT '[]'::jsonb;
