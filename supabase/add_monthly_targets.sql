-- Aylik hedefler (ay + urun bazli: arama/mail/toplanti sayisal hedefleri)
-- Supabase SQL Editor'de calistir.

CREATE TABLE IF NOT EXISTS monthly_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL, -- her zaman ayin 1'i, orn 2026-09-01
  product text NOT NULL DEFAULT '', -- bos = Genel (urunsuz/toplam)
  target_calls int DEFAULT 0,
  target_emails int DEFAULT 0,
  target_meetings int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, month, product)
);

ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own monthly targets" ON monthly_targets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
