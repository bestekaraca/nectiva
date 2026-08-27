-- Yillik satis hedefi takibi icin yeni tablolar
-- Supabase SQL Editor'de calistir.

CREATE TABLE IF NOT EXISTS sales_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  note text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sales goals" ON sales_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sale entries" ON sale_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Senin yillik hedefini simdiden ekliyor: 200.000 EUR, 11 Mayis 2025 - 11 Mayis 2026
INSERT INTO sales_goals (user_id, target_amount, currency, start_date, end_date)
SELECT id, 200000, 'EUR', '2025-05-11', '2026-05-11'
FROM auth.users WHERE email = 'karacabeste@gmail.com';
