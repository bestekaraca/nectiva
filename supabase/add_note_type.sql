-- Notlara aktivite turu ekleniyor (arama/mail/toplanti/teklif/genel not)
-- Supabase SQL Editor'de calistir.

ALTER TABLE notes ADD COLUMN IF NOT EXISTS type text DEFAULT 'note';
