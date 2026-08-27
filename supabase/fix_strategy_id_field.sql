-- Daha once "id" anahtari ile aktarilmis Excel ID numaralarini
-- yeni "no" anahtarina tasiyor (veri kaybi olmadan duzeltme).
-- Supabase SQL Editor'de calistir.

UPDATE linkedin_strategy_rows
SET data = data || jsonb_build_object('no', data->>'id')
WHERE sheet_key IN ('master_roadmap', 'campaign_setup', 'insight_tag')
  AND data ? 'id';
