-- Marketing modulu icin yeni tablolar
-- Supabase SQL Editor'de calistir.

-- Icerik uretim takibi (sunum, one-pager, post, brosur, kartvizit vb.)
CREATE TABLE IF NOT EXISTS marketing_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  product text DEFAULT '',
  content_type text DEFAULT 'diger', -- sunum | one_pager | post | brosur | kartvizit | diger
  status text DEFAULT 'yapilacak',   -- yapilacak | devam | tamamlandi
  due_date date,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Kampanya / kanal calismasi (LinkedIn, Mailing, GA, Etkinlik vb.) ve sonuc metrigi
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  channel text DEFAULT 'diger', -- linkedin | mailing | google_analytics | etkinlik | diger
  product text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  description text DEFAULT '',
  metric_label text DEFAULT '',
  metric_value numeric,
  goal_value numeric,
  created_at timestamptz DEFAULT now()
);

-- Mail marketing gonderim kaydi (firma bazli, kac kere gonderildigini saymak icin)
CREATE TABLE IF NOT EXISTS marketing_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  campaign text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Gorevlere kategori ekleniyor (genel / marketing ayrimi icin)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category text DEFAULT 'genel';

ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own marketing content" ON marketing_content
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own marketing campaigns" ON marketing_campaigns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own marketing emails" ON marketing_emails
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
