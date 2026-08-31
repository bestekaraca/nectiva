-- Sozlesme suresi, toplam sozlesme bedeli ve yillik kazanc alanlari
-- Supabase SQL Editor'de calistir.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS contract_years numeric DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS total_contract_value numeric DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS annual_value numeric DEFAULT 0;
