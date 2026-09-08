-- Aylik strateji notu (serbest metin, ay basina bir kayit)
-- Supabase SQL Editor'de calistir.

CREATE TABLE IF NOT EXISTS monthly_plan_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  note text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, month)
);

ALTER TABLE monthly_plan_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own monthly plan notes" ON monthly_plan_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
