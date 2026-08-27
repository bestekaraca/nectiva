-- LinkedIn Marketing Strategy (RedFlag Control Tower) icin esnek veri tablosu
-- Her satir bir sekmeye (sheet_key) ait, alanlari JSON (data) olarak tutuluyor.
-- Supabase SQL Editor'de calistir.

CREATE TABLE IF NOT EXISTS linkedin_strategy_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_key text NOT NULL,
  row_index int DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_strategy_user_sheet
  ON linkedin_strategy_rows (user_id, sheet_key, row_index);

ALTER TABLE linkedin_strategy_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own linkedin strategy rows" ON linkedin_strategy_rows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
