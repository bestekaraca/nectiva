-- Kampanya hedef tablosu: ay bazli, serbest metrik + hedef metni + elle girilen gerceklesen
-- Supabase SQL Editor'de calistir.

CREATE TABLE IF NOT EXISTS monthly_scorecard_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  label text NOT NULL,
  target_text text DEFAULT '',
  actual_value numeric DEFAULT 0,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE monthly_scorecard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scorecard items" ON monthly_scorecard_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
