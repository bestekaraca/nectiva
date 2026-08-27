-- Rakip / pazar notlari icin tablo
-- Supabase SQL Editor'de calistir.

CREATE TABLE IF NOT EXISTS market_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own market notes" ON market_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
