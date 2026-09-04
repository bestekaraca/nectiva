-- Mail marketing kaydinda, listede olmayan firmalar icin serbest metin alani
-- Supabase SQL Editor'de calistir.

ALTER TABLE marketing_emails ADD COLUMN IF NOT EXISTS company_text text;
