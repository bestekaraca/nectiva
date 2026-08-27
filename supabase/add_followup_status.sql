-- Takip durumu (Arandi/Takipte/Takip Edilecek) alani ekleniyor
-- Supabase SQL Editor'de calistir.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_status text DEFAULT 'takip_edilecek';
